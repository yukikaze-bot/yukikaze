import { ExtendedArgument, ExtendedArgumentContext, ExtendedArgumentOptions } from '@sapphire/framework';
import { fetchAvatar } from '@utils/user/fetchAvatar';
import { getAttachment } from '@utils/getAttachment';
import { ApplyOptions } from '@sapphire/decorators';
import { ImageNotFound } from '@keys/Arguments';
import { Image, loadImage } from 'canvas';
import type { User } from 'discord.js';

@ApplyOptions<ExtendedArgumentOptions<'userName'>>({ baseArgument: 'userName' })
export class ImageArgument extends ExtendedArgument<'userName', Image> {
	public async handle(user: User, context: ExtendedArgumentContext) {
		try {
			const attachment = await getAttachment(context.message);

			if (attachment) {
				const image = await loadImage(attachment);

				return this.ok(image);
			}

			return this.ok(await fetchAvatar(user));
		} catch {
			return this.error({ parameter: context.parameter, identifier: ImageNotFound, context });
		}
	}
}
