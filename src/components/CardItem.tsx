import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card } from '../types/database'
import { cardSortableId } from '../lib/reorder'

type CardItemProps = {
	card: Card
	onOpen: (card: Card) => void
}

export function CardItem({ card, onOpen }: CardItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({
			id: cardSortableId(card.id),
			data: {
				type: 'card',
				cardId: card.id,
				listId: card.list_id,
			},
		})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	return (
		<article ref={setNodeRef} style={style} className="kanban-card">
			<button
				type="button"
				className="kanban-card__drag"
				aria-label={`Drag card ${card.title}`}
				{...attributes}
				{...listeners}
			>
				⋮⋮
			</button>
			<button type="button" className="kanban-card__open" onClick={() => onOpen(card)}>
				<span className="kanban-card__title">{card.title}</span>
				{(card.attachment_count ?? 0) > 0 ? (
					<span className="kanban-card__badge" title="Has attachments">
						📎 {card.attachment_count}
					</span>
				) : null}
			</button>
		</article>
	)
}
