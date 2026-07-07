import type { AttachmentKind } from '../types/database'

export const ATTACHMENT_BUCKET = 'card-attachments'

const LIMITS: Record<AttachmentKind, number> = {
	image: 5 * 1024 * 1024,
	document: 10 * 1024 * 1024,
	audio: 20 * 1024 * 1024,
	video: 50 * 1024 * 1024,
	other: 10 * 1024 * 1024,
}

export function inferAttachmentKind(mimeType: string): AttachmentKind {
	if (mimeType.startsWith('image/')) {
		return 'image'
	}

	if (mimeType.startsWith('audio/')) {
		return 'audio'
	}

	if (mimeType.startsWith('video/')) {
		return 'video'
	}

	if (
		mimeType.startsWith('text/') ||
		mimeType === 'application/pdf' ||
		mimeType.includes('document') ||
		mimeType.includes('word') ||
		mimeType.includes('sheet') ||
		mimeType === 'application/json'
	) {
		return 'document'
	}

	return 'other'
}

export function validateAttachmentFile(file: File): { ok: true; kind: AttachmentKind } | { ok: false; error: string } {
	const kind = inferAttachmentKind(file.type || 'application/octet-stream')
	const maxBytes = LIMITS[kind]

	if (file.size > maxBytes) {
		const maxMb = Math.round(maxBytes / (1024 * 1024))
		return {
			ok: false,
			error: `${kind} files must be ${maxMb} MB or smaller.`,
		}
	}

	return { ok: true, kind }
}

export function sanitizeFileName(fileName: string): string {
	return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) {
		return `${bytes} B`
	}

	if (bytes < 1024 * 1024) {
		return `${(bytes / 1024).toFixed(1)} KB`
	}

	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
