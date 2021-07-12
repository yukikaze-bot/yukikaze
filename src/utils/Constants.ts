import { TwemojiRegex } from '@sapphire/discord-utilities';

export const enum Constants {
	DOWNLOAD_URL = 'https://yukikaze.tech/download',
	TAURI_URL = 'https://tauri.studio',
	NODE_URL = 'https://nodejs.org'
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

export const enum RequestTypes {
	START_TIMER = 1,
	STOP_TIMER = 2,
	RESET_TIMER = 3,
	REMAINING_TIMER = 4
}

export const kRegExpUnicodeBoxNumber = /^\d\u20E3$/;
export const kRegExpFormattedCustomEmoji = /<a?:\w{2,32}:\d{17,18}>/;
export const kRegExpParsedCustomEmoji = /a?:\w{2,32}:\d{17,18}/;
export const kRegExpTwemoji = new RegExp(TwemojiRegex, '');
