import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBoards, useCreateBoard } from '../hooks/useBoards'

export function HomePage() {
	const navigate = useNavigate()
	const { data: boards = [], isLoading, error, refetch } = useBoards()
	const createBoard = useCreateBoard()
	const [newTitle, setNewTitle] = useState('')
	const recentBoards = boards.slice(0, 5)

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

	return (
		<section className="home-page">
			<div className="home-hero">
				<h2>Welcome back</h2>
				<p className="muted">
					{boards.length === 0
						? 'Create your first board to get started.'
						: `You have ${boards.length} board${boards.length === 1 ? '' : 's'}.`}
				</p>
			</div>

			<form className="inline-form home-create" onSubmit={(event) => void handleCreate(event)}>
				<input
					type="text"
					value={newTitle}
					onChange={(event) => setNewTitle(event.target.value)}
					placeholder="Quick create board"
					aria-label="Quick create board"
				/>
				<button type="submit" className="btn btn--primary" disabled={createBoard.isPending}>
					Create board
				</button>
			</form>

			<div className="home-actions">
				<Link to="/boards" className="btn btn--ghost">
					View all boards
				</Link>
			</div>

			<section className="home-recent">
				<h3>Recent boards</h3>
				{isLoading && boards.length === 0 ? <p className="muted">Loading…</p> : null}
				{error && boards.length === 0 ? (
					<div className="page-status page-status--error">
						<p className="form-error">Failed to load boards.</p>
						<button type="button" className="btn btn--primary btn--small" onClick={() => void refetch()}>
							Try again
						</button>
					</div>
				) : null}
				{!isLoading && !error && recentBoards.length === 0 ? (
					<p className="muted">No boards yet.</p>
				) : (
					<ul className="board-list home-recent__list">
						{recentBoards.map((board) => (
							<li key={board.id} className="board-list__item">
								<Link to={`/boards/${board.id}`} className="board-list__main">
									<span className="board-list__title">
										{board.title.trim() || 'Untitled board'}
									</span>
									<span className="board-list__hint">Open board</span>
								</Link>
								<div className="board-list__actions">
									<Link to={`/boards/${board.id}`} className="btn btn--primary btn--small">
										Open
									</Link>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</section>
	)
}
