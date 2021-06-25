import { YukikazeCommand } from '@structures/YukikazeCommand';
import { OilPaintDesc, OilPaintExtended } from '@keys/Image';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
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
		message.channel.startTyping();

		const user = (await args.pickResult('userName')).value;
		const avatar = user?.displayAvatarURL({ format: 'png', size: 4096 }) ?? message.author.displayAvatarURL({ format: 'png', size: 4096 });
		const buffer = await fetch<Buffer>(avatar, FetchResultTypes.Buffer);
		const state = gm(buffer).paint(5).setFormat('png');

		message.channel.stopTyping();
		return message.reply({ files: [{ attachment: await toBuffer(state), name: 'oil-painting.png' }] });
	}
}
