import { useEffect, useRef, useState } from 'react'
import type { JSONContent } from '@tiptap/core'
import {
	useAttachments,
	useDeleteAttachment,
	useUploadAttachment,
} from '../hooks/useAttachments'
import { resolveCardContent } from '../lib/cardContent'
import type { Card, CardContentJson } from '../types/database'
import { AttachmentList } from './attachments/AttachmentList'
import { AttachmentUploader } from './attachments/AttachmentUploader'
import { Checklist } from './Checklist'
import { ErrorBoundary } from './ErrorBoundary'
import { ExportMenu } from './ExportMenu'
import { RichTextEditor, type RichTextEditorHandle } from './RichTextEditor'

type CardModalProps = {
	boardId: string
	card: Card | null
	onClose: () => void
	onSave: (updates: {
		id: string
		title: string
		description: string
		content_json: CardContentJson
	}) => Promise<unknown>
	onDelete: (id: string) => Promise<unknown>
}

export function CardModal({ boardId, card, onClose, onSave, onDelete }: CardModalProps) {
	const editorRef = useRef<RichTextEditorHandle>(null)
	const [title, setTitle] = useState('')
	const [contentJson, setContentJson] = useState<JSONContent>({ type: 'doc', content: [] })
	const [saving, setSaving] = useState(false)
	const [saveError, setSaveError] = useState<string | null>(null)

	const cardId = card?.id ?? null
	const {
		data: attachments = [],
		isLoading: attachmentsLoading,
		error: attachmentsError,
		refetch: refetchAttachments,
	} = useAttachments(cardId)
	const uploadAttachment = useUploadAttachment(boardId, cardId ?? '')
	const deleteAttachment = useDeleteAttachment(boardId, cardId ?? '')

	useEffect(() => {
		if (card) {
			setTitle(card.title)
			setContentJson(resolveCardContent(card.content_json, card.description))
			setSaveError(null)
		}
	}, [card])

	if (!card) {
		return null
	}

	const handleSave = async () => {
		setSaving(true)
		setSaveError(null)

		try {
			const json = editorRef.current?.getJSON() ?? contentJson
			const plainText = editorRef.current?.getMarkdown() ?? ''

			await onSave({
				id: card.id,
				title: title.trim() || card.title,
				description: plainText,
				content_json: json as CardContentJson,
			})
			onClose()
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : 'Failed to save card.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="modal-backdrop" onClick={onClose} role="presentation">
			<div
				className="modal modal--wide"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="card-modal-title"
			>
				<header className="modal__header">
					<h2 id="card-modal-title">Card details</h2>
					<button type="button" className="btn btn--ghost" onClick={onClose}>
						Close
					</button>
				</header>

				<label className="field">
					<span>Title</span>
					<input
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
					/>
				</label>

				<section className="modal-section">
					<div className="modal-section__header">
						<span>Document</span>
						<ExportMenu title={title} editorRef={editorRef} />
					</div>
					<ErrorBoundary
						fallback={(_error, retry) => (
							<div className="page-status page-status--error">
								<p className="form-error">The editor failed to load.</p>
								<button type="button" className="btn btn--primary" onClick={retry}>
									Try again
								</button>
							</div>
						)}
					>
						<RichTextEditor
							ref={editorRef}
							content={contentJson}
							onChange={setContentJson}
						/>
					</ErrorBoundary>
				</section>

				<section className="modal-section">
					<h3>Attachments</h3>
					<AttachmentUploader
						isUploading={uploadAttachment.isPending}
						onUpload={async (file) => {
							await uploadAttachment.mutateAsync(file)
						}}
					/>
					<AttachmentList
						attachments={attachments}
						isLoading={attachmentsLoading}
						error={attachmentsError}
						onRetry={() => void refetchAttachments()}
						onDelete={(attachment) => void deleteAttachment.mutateAsync(attachment)}
					/>
				</section>

				<Checklist boardId={boardId} cardId={card.id} />

				{saveError ? <p className="form-error">{saveError}</p> : null}

				<footer className="modal__footer">
					<button
						type="button"
						className="btn btn--danger"
						onClick={() => void onDelete(card.id).then(onClose)}
					>
						Delete card
					</button>
					<button
						type="button"
						className="btn btn--primary"
						onClick={() => void handleSave()}
						disabled={saving}
					>
						{saving ? 'Saving…' : 'Save'}
					</button>
				</footer>
			</div>
		</div>
	)
}
