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

export type Card = {
	id: string
	list_id: string
	title: string
	description: string
	position: number
}

export type ChecklistItem = {
	id: string
	card_id: string
	text: string
	completed: boolean
	position: number
}

export type BoardWithLists = Board & {
	lists: (List & { cards: Card[] })[]
}
