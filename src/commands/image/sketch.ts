import { YukikazeCommand } from '@structures/YukikazeCommand';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { SketchDesc, SketchExtended } from '@keys/Image';
import { getAttachment } from '@utils/getAttachment';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, Permissions } from 'discord.js';
import { toBuffer } from '@utils/canvas/toBuffer';
import { subClass } from 'gm';

const gm = subClass({ imageMagick: true });

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Image Manipulation',
	description: SketchDesc,
	extendedHelp: SketchExtended,
	delay: 10000,
	limit: 1,
	permissions: Permissions.FLAGS.ATTACH_FILES
})
export class SketchCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		try {
			const user = (await args.pickResult('userName')).value;
			const avatar =
				user?.displayAvatarURL({ format: 'png', size: 4096 }) ??
				(await getAttachment(message)) ??
				message.author.displayAvatarURL({ format: 'png', size: 4096 });
			const buffer = await fetch(avatar, FetchResultTypes.Buffer);
			const state = gm(buffer).colorspace('gray').out('-sketch').out('0x20+120').setFormat('png');

			return message.image(await toBuffer(state));
		} catch (e) {
			console.error(e);
			return message.error(args.t('image:invalid'));
		}
	}
}
