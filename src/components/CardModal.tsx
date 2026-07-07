import { useEffect, useState } from 'react'
import type { Card } from '../types/database'
import { Checklist } from './Checklist'

type CardModalProps = {
	boardId: string
	card: Card | null
	onClose: () => void
	onSave: (updates: { id: string; title: string; description: string }) => Promise<unknown>
	onDelete: (id: string) => Promise<unknown>
}

export function CardModal({ boardId, card, onClose, onSave, onDelete }: CardModalProps) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (card) {
			setTitle(card.title)
			setDescription(card.description)
		}
	}, [card])

	if (!card) {
		return null
	}

	const handleSave = async () => {
		setSaving(true)
		await onSave({ id: card.id, title: title.trim() || card.title, description })
		setSaving(false)
		onClose()
	}

	return (
		<div className="modal-backdrop" onClick={onClose} role="presentation">
			<div
				className="modal"
				onClick={(event) => event.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="card-modal-title"
			>
				<header className="modal__header">
					<h2 id="card-modal-title">Card details</h2>
					<button type="button" className="btn btn--ghost" onClick={onClose}>
						Close
					</button>
				</header>

				<label className="field">
					<span>Title</span>
					<input
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
					/>
				</label>

				<label className="field">
					<span>Description</span>
					<textarea
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						rows={5}
					/>
				</label>

				<Checklist boardId={boardId} cardId={card.id} />

				<footer className="modal__footer">
					<button
						type="button"
						className="btn btn--danger"
						onClick={() => void onDelete(card.id).then(onClose)}
					>
						Delete card
					</button>
					<button
						type="button"
						className="btn btn--primary"
						onClick={() => void handleSave()}
						disabled={saving}
					>
						{saving ? 'Saving…' : 'Save'}
					</button>
				</footer>
			</div>
		</div>
	)
}
