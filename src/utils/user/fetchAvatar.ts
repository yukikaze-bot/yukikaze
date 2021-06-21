import type { User, ImageSize } from 'discord.js';
import { Image, loadImage } from 'canvas';

export const fetchAvatar = async (user: User, size: ImageSize = 512): Promise<Image> => {
	const url = user.displayAvatarURL({ format: 'png', size });

	return loadImage(url);
};
