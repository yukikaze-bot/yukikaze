import type { User, ImageSize } from 'discord.js';
import { Image, loadImage } from 'canvas';

export const fetchAvatar = async (user: User, size: ImageSize = 512): Promise<Image> => {
	const url = user.avatar ? user.avatarURL({ format: 'png', size })! : user.defaultAvatarURL;

	return loadImage(url);
};
