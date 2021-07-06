import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { SelectionComponent, ComponentCluster } from '@duxcore/interactive-discord';
import { Message, MessageEmbed, Permissions } from 'discord.js';
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
	permissions: Permissions.FLAGS.EMBED_LINKS,
	preconditions: ['GuildOnly']
})
export class DefineCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		let word = (await args.restResult('string')).value;

		if (!word) {
			const handler = new MessagePrompter(args.t('search:define.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

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
			const selection = new SelectionComponent({
				placeholder: 'Meanings',
				options: originalMeans.map((mean) => ({
					label: `${capitalize(word!)} (${capitalize(mean)})`,
					description: shorten(data.meaning[mean][0].definition, 50),
					value: mean
				}))
			});
			const cluster = new ComponentCluster(selection);

			this.context.client.interactions.sendComponents({
				channel: message.channel,
				content: args.t('search:define.choose'),
				components: cluster
			});
			this.context.client.interactions.addSelectionListener(selection, (interaction) => {
				if (interaction.raw.member.user.id !== message.author.id)
					return interaction.respond({
						content: "You aren't part of this interaction...",
						isPrivate: true
					});

				const meaning = data.meaning[interaction.selections!.join()][0];
				const embed = new MessageEmbed()
					.setTitle(capitalize(word!))
					.setDescription(meaning.definition)
					.addField('Example', capitalize(meaning.example))
					.setColor('RANDOM');

				if (meaning.synonyms) embed.addField('Synonyms', meaning.synonyms.map((m) => capitalize(m)).join(', '));

				return interaction.respond({ shouldEdit: true, embeds: [embed], content: '\u200b' });
			});

			return;
		} catch {
			return message.reply(args.t('search:define.noResults'));
		}
	}
}
