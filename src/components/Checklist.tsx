import {
	DndContext,
	closestCenter,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, type FormEvent } from 'react'
import type { ChecklistItem } from '../types/database'
import {
	checklistSortableId,
	parseChecklistId,
} from '../lib/reorder'
import {
	useChecklistItems,
	useCreateChecklistItem,
	useDeleteChecklistItem,
	useReorderChecklistItems,
	useUpdateChecklistItem,
} from '../hooks/useChecklist'

type ChecklistProps = {
	boardId: string
	cardId: string
}

function ChecklistRow({
	item,
	onToggle,
	onDelete,
}: {
	item: ChecklistItem
	onToggle: (id: string, completed: boolean) => void
	onDelete: (id: string) => void
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({
			id: checklistSortableId(item.id),
			data: { type: 'checklist', itemId: item.id },
		})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	return (
		<li ref={setNodeRef} style={style} className="checklist-item">
			<button
				type="button"
				className="checklist-item__drag"
				aria-label={`Drag checklist item ${item.text}`}
				{...attributes}
				{...listeners}
			>
				⋮⋮
			</button>
			<label className="checklist-item__label">
				<input
					type="checkbox"
					checked={item.completed}
					onChange={(event) => onToggle(item.id, event.target.checked)}
				/>
				<span className={item.completed ? 'checklist-item__text--done' : undefined}>
					{item.text}
				</span>
			</label>
			<button
				type="button"
				className="btn btn--ghost btn--small"
				onClick={() => onDelete(item.id)}
			>
				Delete
			</button>
		</li>
	)
}

export function Checklist({ boardId, cardId }: ChecklistProps) {
	const { data: items = [], isLoading } = useChecklistItems(cardId)
	const createItem = useCreateChecklistItem(boardId, cardId)
	const updateItem = useUpdateChecklistItem(boardId, cardId)
	const deleteItem = useDeleteChecklistItem(boardId, cardId)
	const reorderItemsMutation = useReorderChecklistItems(boardId, cardId)
	const [newText, setNewText] = useState('')

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	)

	const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const text = newText.trim()

		if (!text) {
			return
		}

		await createItem.mutateAsync(text)
		setNewText('')
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over || active.id === over.id) {
			return
		}

		const activeId = parseChecklistId(active.id)
		const overId = parseChecklistId(over.id)

		if (!activeId || !overId) {
			return
		}

		const oldIndex = items.findIndex((item) => item.id === activeId)
		const newIndex = items.findIndex((item) => item.id === overId)

		if (oldIndex === -1 || newIndex === -1) {
			return
		}

		const reordered = arrayMove(items, oldIndex, newIndex)
		void reorderItemsMutation.mutateAsync(reordered.map((item) => item.id))
	}

	return (
		<section className="checklist">
			<h3>Checklist</h3>
			{isLoading ? <p className="muted">Loading checklist…</p> : null}

			<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
				<SortableContext
					items={items.map((item) => checklistSortableId(item.id))}
					strategy={verticalListSortingStrategy}
				>
					<ul className="checklist-list">
						{items.map((item) => (
							<ChecklistRow
								key={item.id}
								item={item}
								onToggle={(id, completed) =>
									void updateItem.mutateAsync({ id, completed })
								}
								onDelete={(id) => void deleteItem.mutateAsync(id)}
							/>
						))}
					</ul>
				</SortableContext>
			</DndContext>

			<form className="inline-form" onSubmit={(event) => void handleAdd(event)}>
				<input
					type="text"
					value={newText}
					onChange={(event) => setNewText(event.target.value)}
					placeholder="Add checklist item"
					aria-label="Add checklist item"
				/>
				<button type="submit" className="btn btn--primary btn--small">
					Add
				</button>
			</form>
		</section>
	)
}
