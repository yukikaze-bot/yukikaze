import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { request, gql } from 'graphql-request';
import { NarutoDesc } from '@keys/Anime';

const query = (name: string) => gql`
	{
		characters(filter: { name: "${name}" }) {
			results {
				name
      			avatarSrc
      			description
      			rank
      			village
				notableQuotes
				age
			}
		}
	}
`;

@ApplyOptions<YukikazeCommand.Options>({
	cooldown: 3,
	description: NarutoDesc,
	usage: '<character>',
	examples: ['!y naruto Uchiha Sasuke'],
	c: 'Anime'
})
export class NarutoCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		let char = (await args.restResult('string')).value;

		if (!char) {
			const handler = new MessagePrompter(args.t('anime:naruto.prompt'), MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			char = res.content;
		}

		const data = await request<Record<string, any>>('https://narutoql.com/graphql', query(char));

		if (!data.characters.results.length) return message.reply(args.t('anime:naruto.unknown'));

		const character = data.characters.results[0];
		const embed = new MessageEmbed()
			.setTitle(character.name)
			.setThumbnail(character.avatarSrc)
			.setDescription(this.context.client.converter.turndown(character.description))
			.addField('Age', String(character.age ?? 'Unknown'), true)
			.setFooter('Powered by narutoql.com')
			.setColor('RANDOM');

		if (character.rank.length) embed.addField('Rank', character.rank);
		if (character.village.length) embed.addField('Village', character.village, true);
		if (character.notableQuotes.length) embed.addField('Quotes', character.notableQuotes);

		return message.reply({ embeds: [embed] });
	}
}
