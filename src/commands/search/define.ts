import { Message, MessageEmbed, Permissions, MessageSelectMenu, SelectMenuInteraction, TextChannel } from 'discord.js';
import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { DefineDesc, DefineExtended } from '@keys/Search';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { ApplyOptions } from '@sapphire/decorators';
import { shorten } from '@utils/shorten';
import capitalize from 'capitalize';

interface Item<T = string> {
	name: T;
	meaning: {
		[key: string]: {
			definition: string;
			example: string;
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
		let word = (await args.restResult('string')).value;

		if (!word) {
			const handler = new MessagePrompter(args.t('search:define.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel as TextChannel, message.author)) as Message;

			word = res.content;
		}

		try {
			const data = (
				await fetch<Item<typeof word>[]>(
					`${process.env.DICTIONARY_URL}?define=${encodeURIComponent(word.toLowerCase())}`,
					FetchResultTypes.JSON
				)
			)[0];
			const originalMeans = Object.keys(data.meaning);
			const select = new MessageSelectMenu()
				.setCustomId('select-define')
				.setPlaceholder('Definitions')
				.addOptions(
					originalMeans.map((mean) => ({
						label: shorten(`${capitalize(word!)} (${capitalize(mean)})`, 25),
						description: shorten(data.meaning[mean][0].definition, 50),
						value: mean
					}))
				);

			const msg = await message.channel.send({ content: args.t('search:define.choose'), components: [[select]] });
			const filter = (i: SelectMenuInteraction) => i.customId === 'select-define' && i.user.id === message.author.id;
			const collector = message.channel.createMessageComponentCollector({ filter, time: 30000 });

			collector.on('collect', (i) => {
				const meaning = data.meaning[i.values.join()][0];
				const embed = new MessageEmbed()
					.setTitle(capitalize(word!))
					.setDescription(meaning.definition)
					.addField('Example', capitalize(meaning.example))
					.setColor('RANDOM');

				if (meaning.synonyms) embed.addField('Synonyms', meaning.synonyms.map((m) => capitalize(m)).join(', '));

				msg.edit({ content: '\u200b', embeds: [embed], components: [[select]] });
			});
			collector.on('end', () => {
				msg.edit({ content: 'This interaction has ended.', components: [] });
			});

			return;
		} catch {
			return message.reply(args.t('search:define.noResults'));
		}
	}
}
