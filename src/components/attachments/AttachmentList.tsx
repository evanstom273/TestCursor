import type { CardAttachmentWithUrl } from '../../types/database'
import { AttachmentPreview } from './AttachmentPreview'

type AttachmentListProps = {
	attachments: CardAttachmentWithUrl[]
	isLoading: boolean
	onDelete: (attachment: CardAttachmentWithUrl) => void
}

export function AttachmentList({ attachments, isLoading, onDelete }: AttachmentListProps) {
	if (isLoading) {
		return <p className="muted">Loading attachments…</p>
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
