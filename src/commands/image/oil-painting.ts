import { YukikazeCommand } from '@structures/YukikazeCommand';
import { OilPaintDesc, OilPaintExtended } from '@keys/Image';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { getAttachment } from '@utils/getAttachment';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, Permissions } from 'discord.js';
import { toBuffer } from '@utils/canvas/toBuffer';
import gm from 'gm';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Image Manipulation',
	description: OilPaintDesc,
	extendedHelp: OilPaintExtended,
	aliases: ['oil', 'oil-paint'],
	delay: 10000,
	limit: 1,
	permissions: Permissions.FLAGS.ATTACH_FILES
})
export class OilPaintingCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		try {
			const user = (await args.pickResult('userName')).value;
			const avatar =
				user?.displayAvatarURL({ format: 'png', size: 4096 }) ??
				(await getAttachment(message)) ??
				message.author.displayAvatarURL({ format: 'png', size: 4096 });
			const buffer = await fetch(avatar, FetchResultTypes.Buffer);
			const state = gm(buffer).paint(5).setFormat('png');

			return message.image(await toBuffer(state));
		} catch {
			return message.error('You provided an invalid image url.');
		}
	}
}
