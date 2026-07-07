import { useDroppable } from '@dnd-kit/core'
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, type FormEvent } from 'react'
import type { Card, List } from '../types/database'
import { cardSortableId, listSortableId } from '../lib/reorder'
import { CardItem } from './CardItem'

type BoardColumnProps = {
	list: List & { cards: Card[] }
	onAddCard: (listId: string, title: string) => Promise<unknown>
	onRenameList: (listId: string, title: string) => Promise<unknown>
	onDeleteList: (listId: string) => Promise<unknown>
	onOpenCard: (card: Card) => void
}

export function BoardColumn({
	list,
	onAddCard,
	onRenameList,
	onDeleteList,
	onOpenCard,
}: BoardColumnProps) {
	const [cardTitle, setCardTitle] = useState('')
	const [isEditingTitle, setIsEditingTitle] = useState(false)
	const [listTitle, setListTitle] = useState(list.title)

	const {
		attributes,
		listeners,
		setNodeRef: setSortableRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: listSortableId(list.id),
		data: {
			type: 'list',
			listId: list.id,
		},
	})

	const { setNodeRef: setDroppableRef } = useDroppable({
		id: listSortableId(list.id),
		data: {
			type: 'list',
			listId: list.id,
		},
	})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : 1,
	}

	const handleAddCard = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const title = cardTitle.trim()

		if (!title) {
			return
		}

		await onAddCard(list.id, title)
		setCardTitle('')
	}

	const saveListTitle = async () => {
		const title = listTitle.trim()

		if (!title) {
			setListTitle(list.title)
			setIsEditingTitle(false)
			return
		}

		await onRenameList(list.id, title)
		setIsEditingTitle(false)
	}

	return (
		<section
			ref={(node) => {
				setSortableRef(node)
				setDroppableRef(node)
			}}
			style={style}
			className="kanban-column"
		>
			<header className="kanban-column__header">
				<button
					type="button"
					className="kanban-column__drag"
					aria-label={`Drag list ${list.title}`}
					{...attributes}
					{...listeners}
				>
					⋮⋮
				</button>
				{isEditingTitle ? (
					<input
						className="kanban-column__title-input"
						value={listTitle}
						onChange={(event) => setListTitle(event.target.value)}
						onBlur={() => void saveListTitle()}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								void saveListTitle()
							}
						}}
						autoFocus
					/>
				) : (
					<button
						type="button"
						className="kanban-column__title"
						onClick={() => setIsEditingTitle(true)}
					>
						{list.title}
					</button>
				)}
				<button
					type="button"
					className="btn btn--ghost btn--small"
					onClick={() => void onDeleteList(list.id)}
				>
					Delete
				</button>
			</header>

			<SortableContext
				items={list.cards.map((card) => cardSortableId(card.id))}
				strategy={verticalListSortingStrategy}
			>
				<div className="kanban-column__cards">
					{list.cards.map((card) => (
						<CardItem key={card.id} card={card} onOpen={onOpenCard} />
					))}
				</div>
			</SortableContext>

			<form className="kanban-column__add" onSubmit={(event) => void handleAddCard(event)}>
				<input
					type="text"
					value={cardTitle}
					onChange={(event) => setCardTitle(event.target.value)}
					placeholder="Add a card"
					aria-label={`Add card to ${list.title}`}
				/>
				<button type="submit" className="btn btn--primary btn--small">
					Add
				</button>
			</form>
		</section>
	)
}
