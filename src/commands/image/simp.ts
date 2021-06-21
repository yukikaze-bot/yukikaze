import { YukikazeCommand } from '@structures/YukikazeCommand';
import { centerImage } from '@utils/canvas/centerImage';
import { fetchAvatar } from '@utils/user/fetchAvatar';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, Permissions } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import { SimpDesc } from '@keys/Image';
import { join } from 'path';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Image Manipulation',
	description: SimpDesc,
	examples: ['!y simp @PopBot'],
	usage: '<user>',
	cooldown: 10,
	permissions: Permissions.FLAGS.ATTACH_FILES
})
export class SimpCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const data = (await args.pickResult('image')).value ?? (await fetchAvatar(message.author));
		const base = await loadImage(join(__dirname, '..', '..', '..', 'images', 'simp.png'));
		const canvas = createCanvas(data.width, data.height);
		const ctx = canvas.getContext('2d');

		ctx.drawImage(data, 0, 0);

		const { x, y, width, height } = centerImage(base, data);

		ctx.drawImage(base, x, y, width, height);

		return message.reply({ files: [{ attachment: canvas.toBuffer(), name: 'simp.png' }] });
	}
}
