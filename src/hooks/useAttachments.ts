import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import {
	ATTACHMENT_BUCKET,
	sanitizeFileName,
	validateAttachmentFile,
} from '../lib/attachmentLimits'
import type { CardAttachment, CardAttachmentWithUrl } from '../types/database'

const SIGNED_URL_TTL_SECONDS = 3600

async function attachSignedUrls(
	attachments: CardAttachment[],
): Promise<CardAttachmentWithUrl[]> {
	return Promise.all(
		attachments.map(async (attachment) => {
			const { data, error } = await supabase.storage
				.from(ATTACHMENT_BUCKET)
				.createSignedUrl(attachment.storage_path, SIGNED_URL_TTL_SECONDS)

			return {
				...attachment,
				signed_url: error ? null : data.signedUrl,
			}
		}),
	)
}

export function useAttachments(cardId: string | null) {
	return useQuery({
		queryKey: ['attachments', cardId],
		enabled: Boolean(cardId),
		queryFn: async (): Promise<CardAttachmentWithUrl[]> => {
			const { data, error } = await supabase
				.from('card_attachments')
				.select('*')
				.eq('card_id', cardId)
				.order('position', { ascending: true })

			if (error) {
				throw error
			}

			return attachSignedUrls(data ?? [])
		},
	})
}

export function useUploadAttachment(boardId: string, cardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (file: File) => {
			const validation = validateAttachmentFile(file)

			if (!validation.ok) {
				throw new Error(validation.error)
			}

			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (!user) {
				throw new Error('Not authenticated')
			}

			const { data: existingAttachments, error: listError } = await supabase
				.from('card_attachments')
				.select('position')
				.eq('card_id', cardId)
				.order('position', { ascending: false })
				.limit(1)

			if (listError) {
				throw listError
			}

			const attachmentId = crypto.randomUUID()
			const safeName = sanitizeFileName(file.name)
			const storagePath = `${user.id}/${cardId}/${attachmentId}-${safeName}`

			const { error: uploadError } = await supabase.storage
				.from(ATTACHMENT_BUCKET)
				.upload(storagePath, file, {
					contentType: file.type || 'application/octet-stream',
					upsert: false,
				})

			if (uploadError) {
				throw uploadError
			}

			const nextPosition = existingAttachments?.[0]?.position ?? -1

			const { data, error } = await supabase
				.from('card_attachments')
				.insert({
					id: attachmentId,
					card_id: cardId,
					file_name: file.name,
					storage_path: storagePath,
					mime_type: file.type || 'application/octet-stream',
					file_size: file.size,
					kind: validation.kind,
					position: nextPosition + 1,
				})
				.select()
				.single()

			if (error) {
				await supabase.storage.from(ATTACHMENT_BUCKET).remove([storagePath])
				throw error
			}

			const [withUrl] = await attachSignedUrls([data as CardAttachment])
			return withUrl
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['attachments', cardId] })
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}

export function useDeleteAttachment(boardId: string, cardId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (attachment: CardAttachment) => {
			const { error: storageError } = await supabase.storage
				.from(ATTACHMENT_BUCKET)
				.remove([attachment.storage_path])

			if (storageError) {
				throw storageError
			}

			const { error } = await supabase
				.from('card_attachments')
				.delete()
				.eq('id', attachment.id)

			if (error) {
				throw error
			}
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ['attachments', cardId] })
			void queryClient.invalidateQueries({ queryKey: ['board', boardId] })
		},
	})
}
