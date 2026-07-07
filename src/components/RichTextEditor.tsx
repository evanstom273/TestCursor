import { forwardRef, useEffect, useImperativeHandle } from 'react'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'

export type RichTextEditorHandle = {
	getJSON: () => JSONContent
	getHTML: () => string
	getMarkdown: () => string
}

type RichTextEditorProps = {
	content: JSONContent
	onChange?: (content: JSONContent) => void
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
	function RichTextEditor({ content, onChange }, ref) {
		const editor = useEditor({
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						rel: 'noopener noreferrer',
						target: '_blank',
					},
				}),
				Placeholder.configure({
					placeholder: 'Write notes, docs, or details…',
				}),
				Markdown.configure({
					html: false,
					transformPastedText: true,
					transformCopiedText: true,
				}),
			],
			content,
			onUpdate: ({ editor: activeEditor }) => {
				onChange?.(activeEditor.getJSON())
			},
			editorProps: {
				attributes: {
					class: 'rich-text-editor__content',
				},
			},
		})

		useEffect(() => {
			if (!editor) {
				return
			}

			const current = JSON.stringify(editor.getJSON())
			const incoming = JSON.stringify(content)

			if (current !== incoming) {
				editor.commands.setContent(content, { emitUpdate: false })
			}
		}, [content, editor])

		useImperativeHandle(
			ref,
			() => ({
				getJSON: () => editor?.getJSON() ?? { type: 'doc', content: [] },
				getHTML: () => editor?.getHTML() ?? '',
				getMarkdown: () => {
					if (!editor) {
						return ''
					}

					const storage = editor.storage as {
						markdown?: { getMarkdown?: () => string }
					}

					return storage.markdown?.getMarkdown?.() ?? editor.getText()
				},
			}),
			[editor],
		)

		if (!editor) {
			return <div className="rich-text-editor rich-text-editor--loading">Loading editor…</div>
		}

		return (
			<div className="rich-text-editor">
				<div className="rich-text-editor__toolbar">
					<button
						type="button"
						className={editor.isActive('bold') ? 'is-active' : undefined}
						onClick={() => editor.chain().focus().toggleBold().run()}
					>
						B
					</button>
					<button
						type="button"
						className={editor.isActive('italic') ? 'is-active' : undefined}
						onClick={() => editor.chain().focus().toggleItalic().run()}
					>
						I
					</button>
					<button
						type="button"
						className={editor.isActive('bulletList') ? 'is-active' : undefined}
						onClick={() => editor.chain().focus().toggleBulletList().run()}
					>
						List
					</button>
					<button
						type="button"
						className={editor.isActive('orderedList') ? 'is-active' : undefined}
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
					>
						1.
					</button>
					<button
						type="button"
						onClick={() => {
							const url = window.prompt('Link URL')

							if (!url) {
								return
							}

							editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
						}}
					>
						Link
					</button>
				</div>
				<EditorContent editor={editor} />
			</div>
		)
	},
)
