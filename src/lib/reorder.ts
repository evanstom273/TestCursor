export function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
	const next = [...items]
	const [moved] = next.splice(fromIndex, 1)
	next.splice(toIndex, 0, moved)
	return next
}

export function parseListId(id: string | number): string | null {
	const value = String(id)
	return value.startsWith('list-') ? value.slice(5) : null
}

export function parseCardId(id: string | number): string | null {
	const value = String(id)
	return value.startsWith('card-') ? value.slice(5) : null
}

export function listSortableId(listId: string): string {
	return `list-${listId}`
}

export function cardSortableId(cardId: string): string {
	return `card-${cardId}`
}

export function checklistSortableId(itemId: string): string {
	return `checklist-${itemId}`
}

export function parseChecklistId(id: string | number): string | null {
	const value = String(id)
	return value.startsWith('checklist-') ? value.slice(10) : null
}
