import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { BoardWithLists, Card, List } from '../types/database'

const CARD_SELECT =
	'id, list_id, title, description, position, content_json'

async function fetchBoardCards(listIds: string[]): Promise<{
	cards: Card[]
	loadWarnings?: string[]
}> {
	const { data: cardData, error: cardsError } = await supabase
		.from('cards')
		.select(CARD_SELECT)
		.in('list_id', listIds)
		.order('position', { ascending: true })

	if (!cardsError) {
		return { cards: (cardData ?? []) as Card[] }
	}

	const { data: fallbackCards, error: fallbackError } = await supabase
		.from('cards')
		.select('id, list_id, title, description, position')
		.in('list_id', listIds)
		.order('position', { ascending: true })

	if (!fallbackError) {
		return {
			cards: (fallbackCards ?? []) as Card[],
			loadWarnings: ['Rich text metadata unavailable. Run migration 002 in Supabase.'],
		}
	}

	return {
		cards: [],
		loadWarnings: [`Cards failed to load: ${fallbackError.message}`],
	}
}

export function useBoard(boardId: string | undefined) {
	return useQuery({
		queryKey: ['board', boardId],
		enabled: Boolean(boardId),
		retry: 3,
		retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
		refetchOnReconnect: true,
		placeholderData: keepPreviousData,
		queryFn: async (): Promise<BoardWithLists> => {
			const { data: board, error: boardError } = await supabase
				.from('boards')
				.select('*')
				.eq('id', boardId)
				.single()

			if (boardError) {
				throw boardError
			}

			const { data: lists, error: listsError } = await supabase
				.from('lists')
				.select('*')
				.eq('board_id', boardId)
				.order('position', { ascending: true })

			if (listsError) {
				throw listsError
			}

			const listIds = (lists ?? []).map((list) => list.id)

			let cards: Card[] = []
			let loadWarnings: string[] | undefined

			if (listIds.length > 0) {
				const cardResult = await fetchBoardCards(listIds)
				cards = cardResult.cards
				loadWarnings = cardResult.loadWarnings
			}

			if (cards.length > 0) {
				const cardIds = cards.map((card) => card.id)
				const { data: attachmentRows, error: attachmentError } = await supabase
					.from('card_attachments')
					.select('card_id')
					.in('card_id', cardIds)

				if (!attachmentError) {
					const countMap = new Map<string, number>()

					for (const row of attachmentRows ?? []) {
						countMap.set(row.card_id, (countMap.get(row.card_id) ?? 0) + 1)
					}

					cards = cards.map((card) => ({
						...card,
						attachment_count: countMap.get(card.id) ?? 0,
					}))
				}
			}

			return {
				...board,
				lists: (lists ?? []).map((list: List) => ({
					...list,
					cards: cards.filter((card) => card.list_id === list.id),
				})),
				loadWarnings,
			}
		},
	})
}

export function useCreateList(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (title: string) => {
			const { data: existingLists, error: listsError } = await supabase
				.from('lists')
				.select('position')
				.eq('board_id', boardId)
				.order('position', { ascending: false })
				.limit(1)

			if (listsError) {
				throw listsError
			}

			const nextPosition = existingLists?.[0]?.position ?? -1

			const { data, error } = await supabase
				.from('lists')
				.insert({
					board_id: boardId,
					title,
					position: nextPosition + 1,
				})
				.select()
				.single()

			if (error) {
				throw error
			}

			return data as List
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useUpdateList(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, title }: { id: string; title: string }) => {
			const { data, error } = await supabase
				.from('lists')
				.update({ title })
				.eq('id', id)
				.select()
				.single()

			if (error) {
				throw error
			}

			return data as List
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useDeleteList(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from('lists').delete().eq('id', id)

			if (error) {
				throw error
			}
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useReorderLists(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (orderedListIds: string[]) => {
			const updates = orderedListIds.map((id, index) =>
				supabase.from('lists').update({ position: index }).eq('id', id),
			)

			const results = await Promise.all(updates)
			const failed = results.find((result) => result.error)

			if (failed?.error) {
				throw failed.error
			}
		},
		onMutate: async (orderedListIds) => {
			await queryClient.cancelQueries({ queryKey: ['board', boardId] })
			const previous = queryClient.getQueryData<BoardWithLists>(['board', boardId])

			if (previous) {
				const listMap = new Map(previous.lists.map((list) => [list.id, list]))
				const reorderedLists = orderedListIds
					.map((id, index) => {
						const list = listMap.get(id)
						return list ? { ...list, position: index } : null
					})
					.filter((list): list is BoardWithLists['lists'][number] => list !== null)

				queryClient.setQueryData<BoardWithLists>(['board', boardId], {
					...previous,
					lists: reorderedLists,
				})
			}

			return { previous }
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(['board', boardId], context.previous)
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}
