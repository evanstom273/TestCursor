import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
	useBoards,
	useCreateBoard,
	useDeleteBoard,
	useUpdateBoard,
} from '../hooks/useBoards'

export function BoardsPage() {
	const navigate = useNavigate()
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

		const board = await createBoard.mutateAsync(title)
		setNewTitle('')
		navigate(`/boards/${board.id}`)
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
		<section className="boards-panel">
				<p className="boards-panel__intro muted">
					Create a board, then open it to add lists and cards.
				</p>

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
								<div className="inline-form board-list__edit">
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
									<Link to={`/boards/${board.id}`} className="board-list__main">
										<span className="board-list__title">{board.title}</span>
										<span className="board-list__hint">Open board</span>
									</Link>
									<div className="board-list__actions">
										<Link to={`/boards/${board.id}`} className="btn btn--primary btn--small">
											Open
										</Link>
										<button
											type="button"
											className="btn btn--ghost btn--small"
											onClick={(event) => {
												event.preventDefault()
												startEditing(board.id, board.title)
											}}
										>
											Rename
										</button>
										<button
											type="button"
											className="btn btn--danger btn--small"
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
	)
}
