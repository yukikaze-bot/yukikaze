import { YukikazeCommand } from '@structures/YukikazeCommand';
import { centerImage } from '@utils/canvas/centerImage';
import { fetchAvatar } from '@utils/user/fetchAvatar';
import { SimpDesc, SimpExtended } from '@keys/Image';
import { ApplyOptions } from '@sapphire/decorators';
import { getImage } from '@utils/canvas/getImage';
import { Message, Permissions } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import { join } from 'path';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Image Manipulation',
	description: SimpDesc,
	extendedHelp: SimpExtended,
	permissions: Permissions.FLAGS.ATTACH_FILES,
	limit: 1,
	delay: 10000
})
export class SimpCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		try {
			const data = (await args.pickResult('image')).value ?? (await getImage(message)) ?? (await fetchAvatar(message.author));
			const base = await loadImage(join(__dirname, '..', '..', '..', 'images', 'simp.png'));
			const canvas = createCanvas(data.width, data.height);
			const ctx = canvas.getContext('2d');

			ctx.drawImage(data, 0, 0);

			const { x, y, width, height } = centerImage(base, data);

			ctx.drawImage(base, x, y, width, height);

			return message.image(canvas.toBuffer());
		} catch {
			return message.error(args.t('image:invalid'));
		}
	}
}
