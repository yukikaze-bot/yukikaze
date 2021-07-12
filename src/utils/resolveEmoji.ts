import { kRegExpFormattedCustomEmoji, kRegExpParsedCustomEmoji, kRegExpTwemoji, kRegExpUnicodeBoxNumber } from './Constants';

export interface EmojiObjectPartial {
	name: string | null;
	id: string | null;
}

export interface EmojiObject extends EmojiObjectPartial {
	animated?: boolean;
}

export const resolveEmoji = (emoji: string | EmojiObject): string | null => {
	if (typeof emoji === 'string') {
		if (kRegExpFormattedCustomEmoji.test(emoji)) return emoji.slice(1, -1);
		if (kRegExpParsedCustomEmoji.test(emoji)) return emoji;
		if (kRegExpUnicodeBoxNumber.test(emoji)) return encodeURIComponent(emoji);
		if (kRegExpTwemoji.test(emoji)) return encodeURIComponent(emoji);

		return null;
	}

	return emoji.name
		? emoji.id
			? `${emoji.animated ? 'a' : ''}:${emoji.name.replace(/~\d+/, '')}:${emoji.id}`
			: encodeURIComponent(emoji.name)
		: emoji.id;
};
