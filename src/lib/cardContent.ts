import type { JSONContent } from '@tiptap/core'
import type { CardContentJson } from '../types/database'

export function isCardContentJson(value: unknown): value is CardContentJson {
	return value === null || (typeof value === 'object' && value !== null && !Array.isArray(value))
}

export function descriptionToContentJson(description: string): JSONContent {
	const trimmed = description.trim()

	if (!trimmed) {
		return { type: 'doc', content: [] }
	}

	return {
		type: 'doc',
		content: trimmed.split('\n').map((line) => ({
			type: 'paragraph',
			content: line ? [{ type: 'text', text: line }] : [],
		})),
	}
}

export function resolveCardContent(
	contentJson: CardContentJson,
	description: string,
): JSONContent {
	if (isCardContentJson(contentJson) && contentJson && 'type' in contentJson) {
		return contentJson as JSONContent
	}

	return descriptionToContentJson(description)
}

export function downloadTextFile(fileName: string, content: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = fileName
	anchor.click()
	URL.revokeObjectURL(url)
}
