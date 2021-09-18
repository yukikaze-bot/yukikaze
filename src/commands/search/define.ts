import { Message, MessageEmbed, Permissions, MessageSelectMenu, SelectMenuInteraction, MessageActionRow } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { DefineDesc, DefineExtended } from '@keys/Search';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { ApplyOptions } from '@sapphire/decorators';
import { errorEmbed } from '@utils/Embed';
import { shorten } from '@utils/shorten';
import { v4 } from '@tomiocodes/uuid';
import capitalize from 'capitalize';

interface Item<T = string> {
	name: T;
	meaning: {
		[key: string]: {
			definition: string;
			example?: string;
			synonyms?: string[];
		}[];
	};
}

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: DefineDesc,
	extendedHelp: DefineExtended,
	aliases: ['dictionary', 'meaning'],
	delay: 10000,
	limit: 2,
	permissions: Permissions.FLAGS.EMBED_LINKS
})
export class DefineCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const word = (await args.restResult('string')).value;

		if (!word) {
			return message.error(args.t('missingArgs', { name: 'word' }));
		}

		try {
			const data = (
				await fetch<Item<typeof word>[]>(
					`${process.env.DICTIONARY_URL}?define=${encodeURIComponent(word.toLowerCase())}`,
					FetchResultTypes.JSON
				)
			)[0];
			const originalMeans = Object.keys(data.meaning);
			const id = v4();
			const select = new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId(id)
					.setPlaceholder('Definitions')
					.addOptions(
						originalMeans.map((mean) => ({
							label: capitalize(mean),
							description: shorten(data.meaning[mean][0].definition ?? data.meaning[mean][1].definition, 50),
							value: mean,
							emoji: 'ℹ️'
						}))
					)
			);

			const msg = await message.reply({ content: args.t('search:define.choose'), components: [select] });
			const filter = (i: SelectMenuInteraction) => i.customId === id && i.user.id === message.author.id;
			const collector = message.channel.createMessageComponentCollector({ filter, idle: 180000 });

			collector.on('collect', (i) => {
				if (!i.isSelectMenu()) return;

				const meaning = data.meaning[i.values.join()][0];
				const embed = new MessageEmbed()
					.setTitle(capitalize(word!))
					.setDescription(meaning.definition ?? data.meaning[i.values.join()][1].definition)
					.setColor('RANDOM');

				if (meaning.synonyms) embed.addField('Synonyms', meaning.synonyms.map((m) => capitalize(m)).join(', '));
				if (meaning.example) embed.addField('Example', capitalize(meaning.example));

				i.deferUpdate();

				msg.edit({ content: null, embeds: [embed] });
			});
			collector.on('end', () => {
				msg.edit({ content: 'This interaction has ended.', components: [] });
			});

			return;
		} catch (e) {
			console.error(e);

			return message.reply({ embeds: [errorEmbed({ description: args.t('search:define.noResults')! })] });
		}
	}
}
