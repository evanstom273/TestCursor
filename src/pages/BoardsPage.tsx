import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import {
	useBoards,
	useCreateBoard,
	useDeleteBoard,
	useUpdateBoard,
} from '../hooks/useBoards'

export function BoardsPage() {
	const { data: boards = [], isLoading, error } = useBoards()
	const createBoard = useCreateBoard()
	const updateBoard = useUpdateBoard()
	const deleteBoard = useDeleteBoard()
	const [newTitle, setNewTitle] = useState('')
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editTitle, setEditTitle] = useState('')

	const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const title = newTitle.trim()

		if (!title) {
			return
		}

		await createBoard.mutateAsync(title)
		setNewTitle('')
	}

	const startEditing = (id: string, title: string) => {
		setEditingId(id)
		setEditTitle(title)
	}

	const saveEdit = async (id: string) => {
		const title = editTitle.trim()

		if (!title) {
			return
		}

		await updateBoard.mutateAsync({ id, title })
		setEditingId(null)
		setEditTitle('')
	}

	return (
		<AppLayout title="Your boards">
			<section className="boards-panel">
				<form className="inline-form" onSubmit={(event) => void handleCreate(event)}>
					<input
						type="text"
						value={newTitle}
						onChange={(event) => setNewTitle(event.target.value)}
						placeholder="New board title"
						aria-label="New board title"
					/>
					<button type="submit" className="btn btn--primary" disabled={createBoard.isPending}>
						Create board
					</button>
				</form>

				{isLoading ? <p className="muted">Loading boards…</p> : null}
				{error ? <p className="form-error">Failed to load boards.</p> : null}

				<ul className="board-list">
					{boards.map((board) => (
						<li key={board.id} className="board-list__item">
							{editingId === board.id ? (
								<div className="inline-form">
									<input
										type="text"
										value={editTitle}
										onChange={(event) => setEditTitle(event.target.value)}
										aria-label="Edit board title"
									/>
									<button
										type="button"
										className="btn btn--primary"
										onClick={() => void saveEdit(board.id)}
									>
										Save
									</button>
									<button
										type="button"
										className="btn btn--ghost"
										onClick={() => setEditingId(null)}
									>
										Cancel
									</button>
								</div>
							) : (
								<>
									<Link to={`/boards/${board.id}`} className="board-list__link">
										{board.title}
									</Link>
									<div className="board-list__actions">
										<button
											type="button"
											className="btn btn--ghost"
											onClick={() => startEditing(board.id, board.title)}
										>
											Rename
										</button>
										<button
											type="button"
											className="btn btn--danger"
											onClick={() => void deleteBoard.mutateAsync(board.id)}
										>
											Delete
										</button>
									</div>
								</>
							)}
						</li>
					))}
				</ul>

				{!isLoading && boards.length === 0 ? (
					<p className="muted">No boards yet. Create your first one above.</p>
				) : null}
			</section>
		</AppLayout>
	)
}
