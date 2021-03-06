import { Message, MessageEmbed, MessagePayload, TextChannel, Permissions } from 'discord.js';
import { PaginatedMessage, MessagePage } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { AnimeDesc, AnimeExtended } from '@keys/Anime';
import { ApplyOptions } from '@sapphire/decorators';
import { request, gql } from 'graphql-request';
import capitalize from 'capitalize';
import numbro from 'numbro';

const query = (name: string) => gql`
	{
		searchAnimeByTitle(title: "${name}", first: 30) {
			nodes {
      			description
      			titles {
        			canonical
      			}
      			ageRating
      			status
      			averageRating
      			episodeCount
				favoritesCount
				season
      			bannerImage {
        			original {
          				url
        			}
      			}
      			posterImage {
        			original {
          				url
        			}
      			}
				sfw
    		}
		}
	}
`;

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Anime',
	description: AnimeDesc,
	extendedHelp: AnimeExtended,
	limit: 2,
	delay: 10000,
	preconditions: ['GuildOnly'],
	permissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.EMBED_LINKS]
})
export class AnimeCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const title = (await args.restResult('string')).value;

		if (!title) return message.error(args.t('missingArgs', { name: 'title' }));

		const { searchAnimeByTitle: data } = await request('https://kitsu.io/api/graphql', query(title));

		if (!data.nodes.length) {
			return message.error(args.t('anime:anime.unknown'));
		}

		return new PaginatedMessage({
			pages: data.nodes
				.filter((node: any) => node.sfw)
				.map(
					(node: any) => (index: number, pages: MessagePage[]) =>
						new MessagePayload(message.channel, {
							embeds: [
								new MessageEmbed()
									.setTitle(node.titles.canonical)
									.setDescription(node.description.en)
									.setImage(
										node.bannerImage.original.url === '/cover_images/original/missing.png' ? '' : node.bannerImage.original.url
									)
									.setThumbnail(node.posterImage.original.url)
									.addField('Rating', node.ageRating, true)
									.addField('Status', capitalize(node.status), true)
									.addField('Average Rating', `${node.averageRating}%`, true)
									.addField('Episodes', String(node.episodeCount), true)
									.addField('Favorites', numbro(node.favoritesCount).format({ thousandSeparated: true }), true)
									.addField('Season', capitalize(node.season ?? 'Unknown'), true)
									.setColor('RANDOM')
									.setFooter(`Page ${index + 1} / ${pages.length}`)
							]
						})
				)
		}).run(message.author, message.channel as TextChannel);
	}
}
