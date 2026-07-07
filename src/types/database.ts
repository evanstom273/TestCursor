export type AttachmentKind = 'image' | 'document' | 'audio' | 'video' | 'other'

export type Board = {
	id: string
	user_id: string
	title: string
	created_at: string
}

export type List = {
	id: string
	board_id: string
	title: string
	position: number
}

export type CardContentJson = Record<string, unknown> | null

export type Card = {
	id: string
	list_id: string
	title: string
	description: string
	content_json: CardContentJson
	position: number
	attachment_count?: number
}

export type ChecklistItem = {
	id: string
	card_id: string
	text: string
	completed: boolean
	position: number
}

export type CardAttachment = {
	id: string
	card_id: string
	file_name: string
	storage_path: string
	mime_type: string
	file_size: number
	kind: AttachmentKind
	position: number
	created_at: string
}

export type CardAttachmentWithUrl = CardAttachment & {
	signed_url: string | null
}

export type BoardWithLists = Board & {
	lists: (List & { cards: Card[] })[]
	loadWarnings?: string[]
}
