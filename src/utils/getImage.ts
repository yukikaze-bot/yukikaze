import { resolveAttachment } from './resolveAttachment';
import type { Message } from 'discord.js';

export const getImage = (message: Message): string | null => {
	const attachment = resolveAttachment(message);

	return attachment ? attachment.proxyURL || attachment.url : null;
};
