import {
	DndContext,
	DragOverlay,
	closestCorners,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useMemo, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { BoardColumn } from '../components/BoardColumn'
import { CardModal } from '../components/CardModal'
import { useCreateCard, useDeleteCard, useReorderCards, useUpdateCard } from '../hooks/useCards'
import {
	useBoard,
	useCreateList,
	useDeleteList,
	useReorderLists,
	useUpdateList,
} from '../hooks/useLists'
import {
	listSortableId,
	parseCardId,
	parseListId,
} from '../lib/reorder'
import type { BoardWithLists, Card } from '../types/database'

function buildCardMoves(board: BoardWithLists) {
	const moves: { cardId: string; listId: string; position: number }[] = []

	for (const list of board.lists) {
		list.cards.forEach((card, index) => {
			moves.push({
				cardId: card.id,
				listId: list.id,
				position: index,
			})
		})
	}

	return moves
}

export function BoardPage() {
	const { boardId = '' } = useParams()
	const { data: board, isLoading, error, refetch } = useBoard(boardId)
	const createList = useCreateList(boardId)
	const updateList = useUpdateList(boardId)
	const deleteList = useDeleteList(boardId)
	const reorderLists = useReorderLists(boardId)
	const createCard = useCreateCard(boardId)
	const updateCard = useUpdateCard(boardId)
	const deleteCard = useDeleteCard(boardId)
	const reorderCards = useReorderCards(boardId)

	const [newListTitle, setNewListTitle] = useState('')
	const [activeCard, setActiveCard] = useState<Card | null>(null)
	const [selectedCard, setSelectedCard] = useState<Card | null>(null)
	const [localBoard, setLocalBoard] = useState<BoardWithLists | null>(null)

	const boardState = localBoard ?? board ?? null

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	)

	const listIds = useMemo(
		() => (boardState?.lists ?? []).map((list) => listSortableId(list.id)),
		[boardState?.lists],
	)

	const handleAddList = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const title = newListTitle.trim()

		if (!title) {
			return
		}

		await createList.mutateAsync(title)
		setNewListTitle('')
	}

	const handleDragStart = (event: DragStartEvent) => {
		const cardId = parseCardId(event.active.id)

		if (cardId && boardState) {
			const card = boardState.lists
				.flatMap((list) => list.cards)
				.find((item) => item.id === cardId)

			if (card) {
				setActiveCard(card)
			}
		}
	}

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event

		if (!over || !boardState) {
			return
		}

		const activeCardId = parseCardId(active.id)
		const overListId = parseListId(over.id) ?? parseListId(String(over.data.current?.listId ?? ''))
		const overCardId = parseCardId(over.id)

		if (!activeCardId) {
			return
		}

		const sourceListIndex = boardState.lists.findIndex((list) =>
			list.cards.some((card) => card.id === activeCardId),
		)

		if (sourceListIndex === -1) {
			return
		}

		let targetListIndex = -1
		let targetCardIndex = -1

		if (overListId) {
			targetListIndex = boardState.lists.findIndex((list) => list.id === overListId)
			targetCardIndex = boardState.lists[targetListIndex]?.cards.length ?? 0
		} else if (overCardId) {
			targetListIndex = boardState.lists.findIndex((list) =>
				list.cards.some((card) => card.id === overCardId),
			)
			targetCardIndex = boardState.lists[targetListIndex]?.cards.findIndex(
				(card) => card.id === overCardId,
			) ?? -1
		}

		if (targetListIndex === -1) {
			return
		}

		const nextBoard: BoardWithLists = {
			...boardState,
			lists: boardState.lists.map((list) => ({
				...list,
				cards: [...list.cards],
			})),
		}

		const sourceList = nextBoard.lists[sourceListIndex]
		const targetList = nextBoard.lists[targetListIndex]
		const sourceCardIndex = sourceList.cards.findIndex((card) => card.id === activeCardId)
		const [movedCard] = sourceList.cards.splice(sourceCardIndex, 1)

		if (!movedCard) {
			return
		}

		movedCard.list_id = targetList.id

		if (overCardId && targetCardIndex >= 0) {
			targetList.cards.splice(targetCardIndex, 0, movedCard)
		} else {
			targetList.cards.push(movedCard)
		}

		setLocalBoard(nextBoard)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		setActiveCard(null)

		if (!over || !boardState) {
			setLocalBoard(null)
			return
		}

		const activeListId = parseListId(active.id)
		const overListId = parseListId(over.id)

		if (activeListId && overListId) {
			const oldIndex = boardState.lists.findIndex((list) => list.id === activeListId)
			const newIndex = boardState.lists.findIndex((list) => list.id === overListId)

			if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
				const reorderedLists = arrayMove(boardState.lists, oldIndex, newIndex)
				void reorderLists
					.mutateAsync(reorderedLists.map((list) => list.id))
					.finally(() => setLocalBoard(null))
				return
			}

			setLocalBoard(null)
			return
		}

		const activeCardId = parseCardId(active.id)

		if (activeCardId) {
			const moves = buildCardMoves(boardState)
			void reorderCards.mutateAsync(moves).finally(() => setLocalBoard(null))
			return
		}

		setLocalBoard(null)
	}

	return (
		<>
			{isLoading && !boardState ? (
				<div className="page-status page-status--loading">
					<p>Loading board…</p>
				</div>
			) : null}
			{error && !boardState ? (
				<div className="page-status page-status--error">
					<p className="form-error">Failed to load board.</p>
					<button type="button" className="btn btn--primary" onClick={() => void refetch()}>
						Try again
					</button>
				</div>
			) : null}

			{boardState ? (
				<>
					{boardState.loadWarnings?.length ? (
						<div className="page-status page-status--error board-warning">
							<p className="form-error">{boardState.loadWarnings.join(' ')}</p>
							<button type="button" className="btn btn--primary btn--small" onClick={() => void refetch()}>
								Reload cards
							</button>
						</div>
					) : null}

					<form className="inline-form board-toolbar" onSubmit={(event) => void handleAddList(event)}>
						<input
							type="text"
							value={newListTitle}
							onChange={(event) => setNewListTitle(event.target.value)}
							placeholder="New list title"
							aria-label="New list title"
						/>
						<button type="submit" className="btn btn--primary">
							Add list
						</button>
					</form>

					{boardState.lists.length === 0 ? (
						<p className="muted board-empty">
							This board has no lists yet. Add one above, or create a new board to get
							To Do / Doing / Done automatically.
						</p>
					) : null}

					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragStart={handleDragStart}
						onDragOver={handleDragOver}
						onDragEnd={handleDragEnd}
					>
						<SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
							<div className="kanban-board">
								{boardState.lists.map((list) => (
									<BoardColumn
										key={list.id}
										list={list}
										onAddCard={(listId, title) => createCard.mutateAsync({ listId, title })}
										onRenameList={(listId, title) =>
											updateList.mutateAsync({ id: listId, title })
										}
										onDeleteList={(listId) => deleteList.mutateAsync(listId)}
										onOpenCard={setSelectedCard}
									/>
								))}
							</div>
						</SortableContext>

						<DragOverlay>
							{activeCard ? (
								<article className="kanban-card kanban-card--overlay">{activeCard.title}</article>
							) : null}
						</DragOverlay>
					</DndContext>
				</>
			) : null}

			<CardModal
				boardId={boardId}
				card={selectedCard}
				onClose={() => setSelectedCard(null)}
				onSave={(updates) => updateCard.mutateAsync(updates)}
				onDelete={(id) => deleteCard.mutateAsync(id)}
			/>
		</>
	)
}
