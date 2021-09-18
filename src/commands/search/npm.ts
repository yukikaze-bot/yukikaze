import { Message, Permissions, MessageEmbed } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { drawStats, getInfo } from '@utils/bundlephobia';
import { NPMDesc, NPMExtended } from '@keys/Search';
import { ApplyOptions } from '@sapphire/decorators';
import { shorten } from '@utils/shorten';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: NPMDesc,
	extendedHelp: NPMExtended,
	aliases: ['npmjs'],
	delay: 10000,
	limit: 2,
	permissions: Permissions.FLAGS.EMBED_LINKS,
	strategyOptions: {
		flags: ['dark', 'light', 'wide']
	}
})
export class NPMCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const name = (await args.pickResult('string')).value;
		const wide = args.getFlags('wide');
		const theme = args.getFlags('dark') ? 'dark' : args.getFlags('light') ? 'light' : 'dark';

		if (!name) return message.reply(args.t('missingArgs', { name: 'name' }));

		try {
			let image: Buffer | null = null;
			const data = await getInfo(name).catch(() => (image = null));

			if (data) image = await drawStats(data.name, data.version, data.size, data.gzip, theme, wide);

			let deps: string[] | null = null;
			const { collected } = await this.context.client.npm.api.package.packageInfo(name);

			if (collected.metadata.dependencies) deps = Object.keys(collected.metadata.dependencies);

			const embed = new MessageEmbed()
				.setTitle(collected.metadata.name)
				.setDescription(collected.metadata.description)
				.setAuthor(collected.metadata.publisher.username)
				.setURL(collected.metadata.links.npm)
				.setFooter('Last updated at')
				.setTimestamp(collected.metadata.date as any)
				.addField('License', collected.metadata.license, true)
				.addField('Version', collected.metadata.version, true)
				.addField('Has Tests', collected.metadata.hasTestScript ? 'Yes' : 'No', true)
				.setColor('RANDOM');

			if (deps) embed.addField('Dependencies', shorten(deps.join(', '), 1024));

			if (image) message.reply({ embeds: [embed.setImage('attachment://npm.png')], files: [{ attachment: image, name: 'npm.png' }] });
			else message.reply({ embeds: [embed] });

			return;
		} catch (e) {
			console.error(e);
			return message.reply(args.t('search:npm.noResults'));
		}
	}
}
