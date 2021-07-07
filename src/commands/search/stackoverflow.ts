import { MessagePrompter, MessagePrompterStrategies, PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Message, MessageEmbed, Permissions, MessagePayload, TextChannel } from 'discord.js';
import { StackoverflowDesc, StackoverflowExtended } from '@keys/Search';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { ApplyOptions } from '@sapphire/decorators';
import { stringify } from '@favware/querystring';
import capitalize from 'capitalize';
import numbro from 'numbro';

interface Result {
	items: Record<string, any>[];
}

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: StackoverflowDesc,
	extendedHelp: StackoverflowExtended,
	aliases: ['stack'],
	delay: 2,
	limit: 15000,
	permissions: [Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.MANAGE_MESSAGES],
	preconditions: ['GuildOnly']
})
export class StackoverflowCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		let q = (await args.restResult('string')).value;

		if (!q) {
			const handler = new MessagePrompter(args.t('search:stackoverflow.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel as TextChannel, message.author)) as Message;

			q = res.content;
		}

		const query = stringify(
			{
				q,
				page: 10,
				pagesize: 10,
				order: 'asc',
				sort: 'relevance',
				answers: 1,
				site: 'stackoverflow',
				key: process.env.STACKOVERFLOW_KEY
			},
			{ includeQuestion: true }
		);
		const { items } = await fetch<Result>(`https://api.stackexchange.com/2.2/search/advanced${query}`, FetchResultTypes.JSON);

		if (!items.length) return message.reply(args.t('search:stackoverflow.noResults'));

		return new PaginatedMessage({
			pages: items.map(
				(item) => (index, pages) =>
					new MessagePayload(message.channel, {
						embeds: [
							new MessageEmbed()
								.setAuthor(item.owner.display_name, item.owner.profile_image, item.owner.link)
								.setTitle(this.context.client.converter.turndown(item.title))
								.setURL(item.link)
								.setTimestamp(new Date(item.creation_date))
								.addField('Answered', item.is_answered ? 'Yes' : 'No', true)
								.addField('Views', numbro(item.view_count).format({ thousandSeparated: true }), true)
								.addField('Score', String(item.score), true)
								.addField('Tags', item.tags.map((t: string) => capitalize(t)).join(', '))
								.setColor('RANDOM')
								.setFooter(`Page ${index + 1} / ${pages.length}`)
						]
					})
			)
		}).run(message.author, message.channel as TextChannel);
	}
}
