import { formatFileSize } from '../../lib/attachmentLimits'
import type { CardAttachmentWithUrl } from '../../types/database'

type AttachmentPreviewProps = {
	attachment: CardAttachmentWithUrl
	onDelete: () => void
}

export function AttachmentPreview({ attachment, onDelete }: AttachmentPreviewProps) {
	const url = attachment.signed_url

	return (
		<li className="attachment-item">
			<div className="attachment-item__preview">
				{attachment.kind === 'image' && url ? (
					<a href={url} target="_blank" rel="noopener noreferrer">
						<img src={url} alt={attachment.file_name} className="attachment-item__image" />
					</a>
				) : null}

				{attachment.kind === 'audio' && url ? (
					<audio controls preload="metadata" src={url} className="attachment-item__media">
						Audio not supported.
					</audio>
				) : null}

				{attachment.kind === 'video' && url ? (
					<video controls preload="metadata" src={url} className="attachment-item__media">
						Video not supported.
					</video>
				) : null}

				{(attachment.kind === 'document' || attachment.kind === 'other') && (
					<div className="attachment-item__file">
						<span className="attachment-item__file-icon">📄</span>
						<span className="attachment-item__file-name">{attachment.file_name}</span>
					</div>
				)}
			</div>

			<div className="attachment-item__meta">
				<span>{formatFileSize(attachment.file_size)}</span>
				{url ? (
					<a href={url} target="_blank" rel="noopener noreferrer" download={attachment.file_name}>
						Download
					</a>
				) : (
					<span className="muted">Link unavailable</span>
				)}
				<button type="button" className="btn btn--ghost btn--small" onClick={onDelete}>
					Delete
				</button>
			</div>
		</li>
	)
}
