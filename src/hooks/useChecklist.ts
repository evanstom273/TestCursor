import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { ChecklistItem } from '../types/database'

export function useChecklistItems(cardId: string | null) {
	return useQuery({
		queryKey: ['checklist', cardId],
		enabled: Boolean(cardId),
		retry: 2,
		queryFn: async (): Promise<ChecklistItem[]> => {
			const { data, error } = await supabase
				.from('checklist_items')
				.select('*')
				.eq('card_id', cardId)
				.order('position', { ascending: true })

			if (error) {
				throw error
			}

			return data ?? []
		},
	})
}

export function useCreateChecklistItem(boardId: string, cardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (text: string) => {
			const { data: existingItems, error: itemsError } = await supabase
				.from('checklist_items')
				.select('position')
				.eq('card_id', cardId)
				.order('position', { ascending: false })
				.limit(1)

			if (itemsError) {
				throw itemsError
			}

			const nextPosition = existingItems?.[0]?.position ?? -1

			const { data, error } = await supabase
				.from('checklist_items')
				.insert({
					card_id: cardId,
					text,
					completed: false,
					position: nextPosition + 1,
				})
				.select()
				.single()

			if (error) {
				throw error
			}

			return data as ChecklistItem
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['checklist', cardId] })
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useUpdateChecklistItem(boardId: string, cardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({
			id,
			text,
			completed,
		}: {
			id: string
			text?: string
			completed?: boolean
		}) => {
			const updates: Partial<Pick<ChecklistItem, 'text' | 'completed'>> = {}

			if (text !== undefined) {
				updates.text = text
			}

			if (completed !== undefined) {
				updates.completed = completed
			}

			const { data, error } = await supabase
				.from('checklist_items')
				.update(updates)
				.eq('id', id)
				.select()
				.single()

			if (error) {
				throw error
			}

			return data as ChecklistItem
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['checklist', cardId] })
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useDeleteChecklistItem(boardId: string, cardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from('checklist_items').delete().eq('id', id)

			if (error) {
				throw error
			}
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['checklist', cardId] })
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useReorderChecklistItems(boardId: string, cardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (orderedItemIds: string[]) => {
			const updates = orderedItemIds.map((id, index) =>
				supabase.from('checklist_items').update({ position: index }).eq('id', id),
			)

			const results = await Promise.all(updates)
			const failed = results.find((result) => result.error)

			if (failed?.error) {
				throw failed.error
			}
		},
		onMutate: async (orderedItemIds) => {
			await queryClient.cancelQueries({ queryKey: ['checklist', cardId] })
			const previous = queryClient.getQueryData<ChecklistItem[]>(['checklist', cardId])

			if (previous) {
				const itemMap = new Map(previous.map((item) => [item.id, item]))
				const reordered = orderedItemIds
					.map((id, index) => {
						const item = itemMap.get(id)
						return item ? { ...item, position: index } : null
					})
					.filter((item): item is ChecklistItem => item !== null)

				queryClient.setQueryData(['checklist', cardId], reordered)
			}

			return { previous }
		},
		onError: (_error, _variables, context) => {
			if (context?.previous) {
				queryClient.setQueryData(['checklist', cardId], context.previous)
			}
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ['checklist', cardId] })
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}
