import { imageExtension } from './Constants';
import type { Message } from 'discord.js';

export interface ImageAttachment {
	url: string;
	proxyURL: string;
	height: number;
	width: number;
}

export const resolveAttachment = (message: Message): ImageAttachment | null => {
	if (message.attachments.size) {
		const attachment = message.attachments.find((att) => imageExtension.test(att.url));

		if (attachment)
			return {
				url: attachment.url,
				proxyURL: attachment.proxyURL,
				height: attachment.height!,
				width: attachment.width!
			};
	}

	for (const embed of message.embeds) {
		if (embed.type === 'image')
			return {
				url: embed.thumbnail!.url,
				proxyURL: embed.thumbnail!.proxyURL!,
				height: embed.thumbnail!.height!,
				width: embed.thumbnail!.width!
			};

		if (embed.image)
			return {
				url: embed.image.url,
				proxyURL: embed.image.proxyURL!,
				height: embed.image.height!,
				width: embed.image.width!
			};
	}

	return null;
};
