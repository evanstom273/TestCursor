import { isNativeApp, isMobileViewport } from './platform'

export async function capturePhotoFile(): Promise<File | null> {
	if (!isNativeApp() && !isMobileViewport()) {
		return null
	}

	if (!isNativeApp()) {
		return null
	}

	const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
	const photo = await Camera.getPhoto({
		resultType: CameraResultType.DataUrl,
		source: CameraSource.Camera,
		quality: 90,
	})

	if (!photo.dataUrl) {
		return null
	}

	const response = await fetch(photo.dataUrl)
	const blob = await response.blob()
	const extension = photo.format ?? 'jpeg'

	return new File([blob], `photo-${Date.now()}.${extension}`, {
		type: blob.type || `image/${extension}`,
	})
}

export function canUseCameraCapture(): boolean {
	return isNativeApp()
}
