import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { PokemonDesc, PokemonExtended } from '@keys/Search';
import type { Query } from '@favware/graphql-pokemon';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { request, gql } from 'graphql-request';
import capitalize from 'capitalize';

type GraphQLPokemonResponse<K extends keyof Omit<Query, '__typename'>> = Record<K, Omit<Query[K], '__typename'>>;

const query = (name: string) => gql`
	{
		getPokemonDetailsByName(pokemon: ${name.toLowerCase()}, reverse: true, take: 1) {
			num
			types
			height
			weight
			flavorTexts {
				game
				flavor
			}
			sprite
			smogonTier
			smogonPage
			abilities {
				first
			}
		}
	}
`;

@ApplyOptions<YukikazeCommand.Options>({
	limit: 2,
	delay: 10000,
	description: PokemonDesc,
	c: 'Search',
	extendedHelp: PokemonExtended,
	aliases: ['pkmn']
})
export class PokemonCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		let pkmn = (await args.restResult('string')).value;

		if (!pkmn) {
			const handler = new MessagePrompter(args.t('search:pokemon.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			pkmn = res.content;
		}

		try {
			const { getPokemonDetailsByName: data } = await request<GraphQLPokemonResponse<'getPokemonDetailsByName'>>(
				process.env.POKEMON_URL,
				query(pkmn)
			);
			const embed = new MessageEmbed()
				.setTitle(capitalize(pkmn))
				.setURL(data.smogonPage)
				.setDescription(data.flavorTexts[0].flavor)
				.setThumbnail(data.sprite)
				.addField('Number', String(data.num), true)
				.addField('Type', data.types.join(', '), true)
				.addField('Ability', data.abilities.first, true)
				.addField('Height', `${data.height}m`, true)
				.addField('Weight', `${data.weight}kg`, true)
				.addField('Tier', data.smogonTier, true)
				.setFooter('Powered by the GraphQL Pokemon API made by Favware')
				.setColor('RANDOM');

			return message.reply({ embeds: [embed] });
		} catch {
			return message.reply(args.t('search:pokemon.unknown'));
		}
	}
}
