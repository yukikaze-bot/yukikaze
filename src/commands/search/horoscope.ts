import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { HoroscopeDesc, HoroscopeExtended } from '@keys/Search';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { request, gql } from 'graphql-request';
import type { Query } from '@skyra/saelem';
import capitalize from 'capitalize';
import { list } from '@utils/list';

type SaelemResponse<K extends keyof Omit<Query, '__typename'>> = Record<K, Omit<Query[K], '__typename'>>;

const horoscopes = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const query = (name: string) => gql`
	{
		getHoroscope(sunsign: ${name.toLowerCase()}) {
			prediction
 			intensity
 			keywords
 			mood
 			rating
 			date
		}
	}
`;

@ApplyOptions<YukikazeCommand.Options>({
	limit: 2,
	delay: 10000,
	description: HoroscopeDesc,
	c: 'Search',
	extendedHelp: HoroscopeExtended,
	aliases: ['horo'],
	permissions: Permissions.FLAGS.EMBED_LINKS
})
export class HoroscopeCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		let horo = (await args.restResult('string')).value;

		if (!horo) {
			const handler = new MessagePrompter(args.t('search:horoscope.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel as TextChannel, message.author)) as Message;

			horo = res.content;
		}

		try {
			const { getHoroscope: data } = await request<SaelemResponse<'getHoroscope'>>(process.env.SAELEM_URL, query(horo));
			const embed = new MessageEmbed()
				.setTitle(capitalize(horo))
				.setDescription(data.prediction)
				.addField('Intensity', data.intensity, true)
				.addField('Mood', data.mood, true)
				.addField('Rating', String(data.rating), true)
				.addField('Keywords', data.keywords.join(', '))
				.setTimestamp(data.date)
				.setFooter('Powered by Saelem Horoscope API')
				.setColor('RANDOM');

			return message.reply({ embeds: [embed] });
		} catch {
			return message.reply(args.t('search:horoscope.unknown', { list: list(horoscopes, 'or') }));
		}
	}
}
