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

export const enum DownloadSpeed {
	THREE_G = 400,
	FOUR_G = 7000
}

export const kRegExpUnicodeBoxNumber = /^\d\u20E3$/;
export const kRegExpFormattedCustomEmoji = /<a?:\w{2,32}:\d{17,18}>/;
export const kRegExpParsedCustomEmoji = /a?:\w{2,32}:\d{17,18}/;
export const kRegExpTwemoji = new RegExp(TwemojiRegex, '');
export const imageExtension = /\.(bmp|jpe?g|png|gif|webp)$/i;

export const kColors = [
	0xffe3af, 0xffe0a5, 0xffdd9c, 0xffdb92, 0xffd889, 0xffd57f, 0xffd275, 0xffcf6b, 0xffcc61, 0xffca57, 0xffc74c, 0xffc440, 0xffc133, 0xffbe23,
	0xffbb09
];
export const kMaxColors = kColors.length - 1;
