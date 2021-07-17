import { Message, MessageEmbed, Permissions } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { NarutoDesc, NarutoExtended } from '@keys/Anime';
import { ApplyOptions } from '@sapphire/decorators';
import { request, gql } from 'graphql-request';

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
	limit: 2,
	delay: 10000,
	description: NarutoDesc,
	extendedHelp: NarutoExtended,
	c: 'Anime',
	permissions: Permissions.FLAGS.EMBED_LINKS
})
export class NarutoCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const char = (await args.restResult('string')).value;

		message.channel.startTyping();

		if (!char) return message.error(args.t('missingArgs', { name: 'character' }));

		const data = await request<Record<string, any>>('https://narutoql.com/graphql', query(char));

		if (!data.characters.results.length) {
			message.channel.stopTyping();

			return message.error(args.t('anime:naruto.unknown'));
		}

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

		message.channel.stopTyping();

		return message.reply({ embeds: [embed] });
	}
}
