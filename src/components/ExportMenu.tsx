import { downloadTextFile } from '../lib/cardContent'
import type { RichTextEditorHandle } from './RichTextEditor'

type ExportMenuProps = {
	title: string
	editorRef: React.RefObject<RichTextEditorHandle | null>
}

export function ExportMenu({ title, editorRef }: ExportMenuProps) {
	const exportMarkdown = () => {
		const markdown = editorRef.current?.getMarkdown() ?? ''
		const safeTitle = title.trim() || 'card'
		downloadTextFile(`${safeTitle}.md`, markdown, 'text/markdown')
	}

	const exportPdf = () => {
		const html = editorRef.current?.getHTML() ?? ''
		const printRoot = document.getElementById('card-export-print-root')

		if (!printRoot) {
			return
		}

		printRoot.innerHTML = `
			<h1>${escapeHtml(title.trim() || 'Card')}</h1>
			<div class="export-print-body">${html}</div>
		`

		window.print()
	}

	return (
		<div className="export-menu">
			<span className="export-menu__label">Export</span>
			<button type="button" className="btn btn--ghost btn--small" onClick={exportMarkdown}>
				Markdown
			</button>
			<button type="button" className="btn btn--ghost btn--small" onClick={exportPdf}>
				PDF
			</button>
		</div>
	)
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}
