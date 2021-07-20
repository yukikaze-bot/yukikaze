import { YukikazeCommand } from '@structures/YukikazeCommand';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { EmbossDesc, EmbossExtended } from '@keys/Image';
import { getAttachment } from '@utils/getAttachment';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, Permissions } from 'discord.js';
import { toBuffer } from '@utils/canvas/toBuffer';
import gm from 'gm';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Image Manipulation',
	description: EmbossDesc,
	extendedHelp: EmbossExtended,
	delay: 10000,
	limit: 1,
	permissions: Permissions.FLAGS.ATTACH_FILES
})
export class CharcoalCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		try {
			const user = (await args.pickResult('userName')).value;
			const avatar =
				user?.displayAvatarURL({ format: 'png', size: 4096 }) ??
				(await getAttachment(message)) ??
				message.author.displayAvatarURL({ format: 'png', size: 4096 });
			const buffer = await fetch(avatar, FetchResultTypes.Buffer);
			const state = gm(buffer).emboss().setFormat('png');

			return message.image(await toBuffer(state));
		} catch {
			return message.error(args.t('image:invalid'));
		}
	}
}
