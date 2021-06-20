import { YukikazeCommand } from '@structures/YukikazeCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, Permissions } from 'discord.js';
import { PrefixDesc } from '@keys/System';

@ApplyOptions<YukikazeCommand.Options>({
	description: PrefixDesc,
	usage: '[prefix]',
	examples: ['!y prefix', '!y prefix >'],
	c: 'System',
	aliases: ['pref']
})
export class PrefixCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const prefix = (await args.restResult('string')).value;

		if (!message.guild) return message.reply(args.t('system:prefix.noGuild', { prefix: await this.context.client.fetchPrefix(message) }));
		if (!prefix)
			return message.reply(
				args.t('system:prefix.current', { guildName: message.guild.name, prefix: await this.context.client.fetchPrefix(message) })
			);
		if (!message.member?.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return message.reply(args.t('system:prefix.missingPerms'));

		const exists = await this.context.client.db.guild.findUnique({ where: { id: message.guild.id } });

		if (exists)
			await this.context.client.db.guild.update({
				where: {
					id: message.guild.id
				},
				data: {
					prefix
				}
			});
		else
			await this.context.client.db.guild.create({
				data: {
					id: message.guild.id,
					lang: await this.context.client.fetchLanguage({ guild: message.guild }),
					prefix
				}
			});

		return message.reply(args.t('system:prefix.set', { prefix }));
	}
}
