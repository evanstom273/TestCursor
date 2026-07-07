import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Board } from '../types/database'

export function useBoards() {
	return useQuery({
		queryKey: ['boards'],
		queryFn: async (): Promise<Board[]> => {
			const { data, error } = await supabase
				.from('boards')
				.select('*')
				.order('created_at', { ascending: false })

			if (error) {
				throw error
			}

			return data
		},
	})
}

export function useCreateBoard() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (title: string) => {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (!user) {
				throw new Error('Not authenticated')
			}

			const { data, error } = await supabase
				.from('boards')
				.insert({ title, user_id: user.id })
				.select()
				.single()

			if (error) {
				throw error
			}

			const { error: listsError } = await supabase.from('lists').insert([
				{ board_id: data.id, title: 'To Do', position: 0 },
				{ board_id: data.id, title: 'Doing', position: 1 },
				{ board_id: data.id, title: 'Done', position: 2 },
			])

			if (listsError) {
				throw listsError
			}

			return data as Board
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['boards'] })
		},
	})
}

export function useUpdateBoard() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ id, title }: { id: string; title: string }) => {
			const { data, error } = await supabase
				.from('boards')
				.update({ title })
				.eq('id', id)
				.select()
				.single()

			if (error) {
				throw error
			}

			return data as Board
		},
		onSuccess: (board) => {
			void queryClient.invalidateQueries({ queryKey: ['boards'] })
			void queryClient.invalidateQueries({ queryKey: ['board', board.id] })
		},
	})
}

export function useDeleteBoard() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from('boards').delete().eq('id', id)

			if (error) {
				throw error
			}
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['boards'] })
		},
	})
}
