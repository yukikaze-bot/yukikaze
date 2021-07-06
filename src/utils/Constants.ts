export const enum Constants {
	DOWNLOAD_URL = 'https://yukikaze.tech/download',
	TAURI_URL = 'https://tauri.studio'
}

export const enum Time {
	Millisecond = 1,
	Second = 1000,
	Minute = 1000 * 60,
	Hour = 1000 * 60 * 60,
	Day = 1000 * 60 * 60 * 24,
	Month = 1000 * 60 * 60 * 24 * (365 / 12),
	Year = 1000 * 60 * 60 * 24 * 365
}
