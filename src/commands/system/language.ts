import { YukikazeCommand } from '@structures/YukikazeCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, Permissions } from 'discord.js';
import { LanguageDesc } from '@keys/System';

const availableLangs = ['en-US', 'fil-PH', 'de-DE', 'fr-FR', 'id-ID', 'ja-JP', 'ko-KR', 'zh-CN'];

@ApplyOptions<YukikazeCommand.Options>({
	description: LanguageDesc,
	usage: '[language]',
	examples: ['!y language', '!y language en-US'],
	c: 'System',
	aliases: ['lang']
})
export class LanguageCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const lang = (await args.restResult('string')).value;

		if (!message.guild) return message.reply(args.t('system:language.noGuild', { language: 'en-US' }));
		if (!lang)
			return message.reply(
				args.t('system:language.current', {
					guildName: message.guild.name,
					language: await this.context.client.fetchLanguage({ guild: message.guild })
				})
			);
		if (!message.member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return message.reply(args.t('system:language.missingPerms'));
		if (!availableLangs.includes(lang)) return message.reply(args.t('system:language.unknown', { langs: availableLangs.join(', ') }));

		const exists = await this.context.client.db.guild.findUnique({ where: { id: message.guild.id } });

		if (exists)
			await this.context.client.db.guild.update({
				where: {
					id: message.guild.id
				},
				data: {
					lang
				}
			});
		else
			await this.context.client.db.guild.create({
				data: {
					id: message.guild.id,
					prefix: (await this.context.client.fetchPrefix(message)) as string,
					lang
				}
			});

		return message.reply(args.t('system:language.set', { language: lang }));
	}
}
