import { YukikazeCommand } from '@structures/YukikazeCommand';
import { CharcoalDesc, CharcoalExtended } from '@keys/Image';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { getAttachment } from '@utils/getAttachment';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, Permissions } from 'discord.js';
import { toBuffer } from '@utils/canvas/toBuffer';
import gm from 'gm';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Image Manipulation',
	description: CharcoalDesc,
	extendedHelp: CharcoalExtended,
	aliases: ['coal'],
	delay: 10000,
	limit: 1,
	permissions: Permissions.FLAGS.ATTACH_FILES
})
export class CharcoalCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		try {
			message.channel.startTyping();

			const user = (await args.pickResult('userName')).value;
			const avatar =
				user?.displayAvatarURL({ format: 'png', size: 4096 }) ??
				(await getAttachment(message)) ??
				message.author.displayAvatarURL({ format: 'png', size: 4096 });
			const buffer = await fetch<Buffer>(avatar, FetchResultTypes.Buffer);
			const state = gm(buffer).charcoal(1).setFormat('png');

			message.channel.stopTyping();
			return message.reply({ files: [{ attachment: await toBuffer(state), name: 'charcoal.png' }] });
		} catch {
			message.channel.stopTyping();
			return message.reply(args.t('image:invalid'));
		}
	}
}
