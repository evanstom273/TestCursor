import { useRef, useState, type DragEvent } from 'react'
import { canUseCameraCapture, capturePhotoFile } from '../../lib/camera'

type AttachmentUploaderProps = {
	onUpload: (file: File) => Promise<void>
	isUploading: boolean
}

export function AttachmentUploader({ onUpload, isUploading }: AttachmentUploaderProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [dragActive, setDragActive] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleFiles = async (files: FileList | null) => {
		if (!files || files.length === 0) {
			return
		}

		setError(null)

		try {
			for (const file of Array.from(files)) {
				await onUpload(file)
			}
		} catch (uploadError) {
			setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
		} finally {
			if (inputRef.current) {
				inputRef.current.value = ''
			}
		}
	}

	const handleCameraCapture = async () => {
		setError(null)

		try {
			const file = await capturePhotoFile()

			if (!file) {
				setError('Camera capture is only available in the Android app.')
				return
			}

			await onUpload(file)
		} catch (captureError) {
			setError(captureError instanceof Error ? captureError.message : 'Camera capture failed.')
		}
	}

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		setDragActive(false)
		void handleFiles(event.dataTransfer.files)
	}

	return (
		<div className="attachment-uploader">
			<div
				className={`attachment-uploader__dropzone${dragActive ? ' attachment-uploader__dropzone--active' : ''}`}
				onDragOver={(event) => {
					event.preventDefault()
					setDragActive(true)
				}}
				onDragLeave={() => setDragActive(false)}
				onDrop={handleDrop}
			>
				<p>Drop files here or choose from your device.</p>
				<p className="attachment-uploader__limits muted">
					Images 5MB · Docs 10MB · Audio 20MB · Video 50MB
				</p>
				<div className="attachment-uploader__actions">
					<button
						type="button"
						className="btn btn--primary btn--small"
						disabled={isUploading}
						onClick={() => inputRef.current?.click()}
					>
						{isUploading ? 'Uploading…' : 'Choose files'}
					</button>
					{canUseCameraCapture() ? (
						<button
							type="button"
							className="btn btn--ghost btn--small"
							disabled={isUploading}
							onClick={() => void handleCameraCapture()}
						>
							Take photo
						</button>
					) : null}
				</div>
				<input
					ref={inputRef}
					type="file"
					multiple
					accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md,.json,.zip"
					className="attachment-uploader__input"
					onChange={(event) => void handleFiles(event.target.files)}
				/>
			</div>
			{error ? <p className="form-error">{error}</p> : null}
		</div>
	)
}
