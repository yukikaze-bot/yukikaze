import { ExtendedArgument, ExtendedArgumentContext, ExtendedArgumentOptions } from '@sapphire/framework';
import { fetchAvatar } from '@utils/user/fetchAvatar';
import { ApplyOptions } from '@sapphire/decorators';
import { ImageNotFound } from '@keys/Arguments';
import type { User } from 'discord.js';
import type { Image } from 'canvas';

@ApplyOptions<ExtendedArgumentOptions<'userName'>>({ baseArgument: 'userName' })
export class ImageArgument extends ExtendedArgument<'userName', Image> {
	public async handle(user: User, context: ExtendedArgumentContext) {
		try {
			return this.ok(await fetchAvatar(user));
		} catch {
			return this.error({ parameter: context.parameter, identifier: ImageNotFound, context });
		}
	}
}
