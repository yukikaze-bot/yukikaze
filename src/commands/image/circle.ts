import { YukikazeCommand } from '@structures/YukikazeCommand';
import { CircleDesc, CircleExtended } from '@keys/Image';
import { fetchAvatar } from '@utils/user/fetchAvatar';
import { ApplyOptions } from '@sapphire/decorators';
import { getImage } from '@utils/canvas/getImage';
import { Message, Permissions } from 'discord.js';
import { createCanvas } from 'canvas';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Image Manipulation',
	description: CircleDesc,
	extendedHelp: CircleExtended,
	aliases: ['round'],
	permissions: Permissions.FLAGS.ATTACH_FILES,
	delay: 10000,
	limit: 1
})
export class CircleCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		try {
			const data = (await args.pickResult('image')).value ?? (await getImage(message)) ?? (await fetchAvatar(message.author));
			const dimensions = data.width <= data.height ? data.width : data.height;
			const canvas = createCanvas(dimensions, dimensions);
			const ctx = canvas.getContext('2d');

			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, 0, Math.PI * 2);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(data, canvas.width / 2 - data.width / 2, canvas.height / 2 - data.height / 2);

			return message.image(canvas.toBuffer());
		} catch {
			return message.error(args.t('image:invalid'));
		}
	}
}
