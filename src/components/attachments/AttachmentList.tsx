import type { CardAttachmentWithUrl } from '../../types/database'
import { AttachmentPreview } from './AttachmentPreview'

type AttachmentListProps = {
	attachments: CardAttachmentWithUrl[]
	isLoading: boolean
	error?: Error | null
	onRetry?: () => void
	onDelete: (attachment: CardAttachmentWithUrl) => void
}

export function AttachmentList({
	attachments,
	isLoading,
	error,
	onRetry,
	onDelete,
}: AttachmentListProps) {
	if (isLoading && attachments.length === 0) {
		return <p className="muted">Loading attachments…</p>
	}

	if (error && attachments.length === 0) {
		return (
			<div className="page-status page-status--error">
				<p className="form-error">Failed to load attachments.</p>
				{onRetry ? (
					<button type="button" className="btn btn--primary btn--small" onClick={onRetry}>
						Try again
					</button>
				) : null}
			</div>
		)
	}

	if (attachments.length === 0) {
		return <p className="muted">No attachments yet.</p>
	}

	return (
		<ul className="attachment-list">
			{attachments.map((attachment) => (
				<AttachmentPreview
					key={attachment.id}
					attachment={attachment}
					onDelete={() => onDelete(attachment)}
				/>
			))}
		</ul>
	)
}
