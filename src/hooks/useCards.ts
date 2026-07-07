import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { BoardWithLists, Card, CardContentJson } from '../types/database'

export function useCreateCard(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ listId, title }: { listId: string; title: string }) => {
			const { data: existingCards, error: cardsError } = await supabase
				.from('cards')
				.select('position')
				.eq('list_id', listId)
				.order('position', { ascending: false })
				.limit(1)

			if (cardsError) {
				throw cardsError
			}

			const nextPosition = existingCards?.[0]?.position ?? -1

			const { data, error } = await supabase
				.from('cards')
				.insert({
					list_id: listId,
					title,
					description: '',
					position: nextPosition + 1,
				})
				.select()
				.single()

			if (error) {
				throw error
			}

			return data as Card
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useUpdateCard(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			title,
			description,
			content_json,
		}: {
			id: string
			title?: string
			description?: string
			content_json?: CardContentJson
		}) => {
			const updates: Partial<Pick<Card, 'title' | 'description' | 'content_json'>> = {}

			if (title !== undefined) {
				updates.title = title
			}

			if (description !== undefined) {
				updates.description = description
			}

			if (content_json !== undefined) {
				updates.content_json = content_json
			}

			const { data, error } = await supabase
				.from('cards')
				.update(updates)
				.eq('id', id)
				.select()
				.single()

			if (error) {
				throw error
			}

			return data as Card
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useDeleteCard(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from('cards').delete().eq('id', id)

			if (error) {
				throw error
			}
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

type CardMove = {
	cardId: string
	listId: string
	position: number
}

export function useReorderCards(boardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (moves: CardMove[]) => {
			const updates = moves.map(({ cardId, listId, position }) =>
				supabase
					.from('cards')
					.update({ list_id: listId, position })
					.eq('id', cardId),
			)

			const results = await Promise.all(updates)
			const failed = results.find((result) => result.error)

			if (failed?.error) {
				throw failed.error
			}
		},
		onMutate: async (moves) => {
			await queryClient.cancelQueries({ queryKey: ['board', boardId] })
			const previous = queryClient.getQueryData<BoardWithLists>(['board', boardId])

			if (previous) {
				const moveMap = new Map(moves.map((move) => [move.cardId, move]))
				const movedCards = previous.lists.flatMap((list) => list.cards)
				const updatedCards = movedCards.map((card) => {
					const move = moveMap.get(card.id)
					return move
						? { ...card, list_id: move.listId, position: move.position }
						: card
				})

				queryClient.setQueryData<BoardWithLists>(['board', boardId], {
					...previous,
					lists: previous.lists.map((list) => ({
						...list,
						cards: updatedCards
							.filter((card) => card.list_id === list.id)
							.sort((a, b) => a.position - b.position),
					})),
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
