import { getAttachment } from '@utils/getAttachment';
import { loadImage, Image } from 'canvas';
import type { Message } from 'discord.js';

export const getImage = async (message: Message): Promise<Image | null> => {
	const attachment = await getAttachment(message);

	return attachment ? loadImage(attachment) : null;
};
