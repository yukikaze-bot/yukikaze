import { Message, TextChannel, MessagePayload, MessageEmbed, Permissions } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { SauceDesc, SauceExtended } from '@keys/Search';
import { ApplyOptions } from '@sapphire/decorators';
import isValid from 'valid-image-url';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: SauceDesc,
	extendedHelp: SauceExtended,
	aliases: ['saucenao'],
	limit: 2,
	delay: 10000,
	nsfw: true,
	permissions: Permissions.FLAGS.MANAGE_MESSAGES
})
export class SauceCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const url = (await args.pickResult('string')).value;

		if (!url) return message.error(args.t('missingArgs', { name: 'url' }));

		message.channel.startTyping();

		try {
			const valid = await isValid(url);

			if (!valid) {
				message.channel.stopTyping();

				return message.error(args.t('search:sauce.invalid'));
			}

			const data = await this.context.client.saucenao(url);

			message.channel.stopTyping();

			return new PaginatedMessage({
				pages: data.map(
					(val) => (index, pages) =>
						new MessagePayload(message.channel, {
							embeds: [
								new MessageEmbed()
									.setImage(val.thumbnail)
									.setDescription(`[Link](${val.url})`)
									.setColor('RANDOM')
									.setFooter(`Page ${index + 1} / ${pages.length}`)
							]
						})
				)
			}).run(message.author, message.channel as TextChannel);
		} catch {
			message.channel.stopTyping();

			return message.error(args.t('search:sauce.noResults'));
		}
	}
}
