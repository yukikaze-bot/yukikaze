import { ScreenshotDesc, ScreenshotExtended } from '@keys/Search';
import { Message, TextChannel, Permissions } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { ApplyOptions } from '@sapphire/decorators';
import { screenshot } from '@utils/screenshot';
import { isRedirect } from '@utils/isRedirect';
import { generalEmbed } from '@utils/Embed';
import { parse } from 'url';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: ScreenshotDesc,
	extendedHelp: ScreenshotExtended,
	aliases: ['ss', 'capture'],
	delay: 30000,
	limit: 1,
	permissions: Permissions.FLAGS.ATTACH_FILES,
	strategyOptions: {
		options: ['width', 'height'],
		flags: ['full']
	}
})
export class ScreenshotCommand extends YukikazeCommand {
	private nsfwList!: string[] | null;

	public async run(message: Message, args: YukikazeCommand.Args) {
		const url = (await args.pickResult('url')).value as unknown as string;
		const width = args.getOption('width') ?? 1920;
		const height = args.getOption('height') ?? 1080;
		const full = args.getFlags('full');

		message.channel.startTyping();

		if (!url) {
			message.channel.stopTyping();

			return message.error(args.t('missingArgs', { name: 'url' }));
		}

		try {
			if (!this.nsfwList) await this.fetchNsfwList();

			const parsedUrl = parse(url);
			const redirect = await isRedirect(url);
			const isNsfw = message.channel instanceof TextChannel ? message.channel.nsfw : false;
			let shot: Buffer;

			if (this.nsfwList!.some((url) => parsedUrl.host === url) && !isNsfw) {
				message.channel.stopTyping();

				return message.error(args.t('search:screenshot.nsfw'));
			}

			if (redirect) {
				const parsed = parse(redirect);

				if (this.nsfwList!.some((url) => parsed.host === url) && !isNsfw) {
					message.channel.stopTyping();

					return message.error(args.t('search:screenshot.nsfw'));
				}

				shot = await screenshot(redirect, Number(width), Number(height), full);
			} else shot = await screenshot(url, Number(width), Number(height), full);

			message.channel.stopTyping();

			return message.reply({
				files: [{ attachment: shot, name: 'screenshot.png' }],
				embeds: [generalEmbed({ image: { url: 'attachment://screenshot.png' } })]
			});
		} catch (e) {
			message.channel.stopTyping();
			console.error(e);

			return message.error(args.t('search:screenshot.invalid')!);
		}
	}

	private async fetchNsfwList() {
		if (this.nsfwList) return this.nsfwList;

		const text = await fetch('https://blocklistproject.github.io/Lists/alt-version/porn-nl.txt', FetchResultTypes.Text);

		this.nsfwList = text
			.split('\n')
			.filter((site) => site && !site.startsWith('#'))
			.map((site) => site.replace(/^(0.0.0.0 )/, ''));

		return this.nsfwList;
	}
}
