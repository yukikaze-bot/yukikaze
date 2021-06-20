import { Message, MessageEmbed, APIMessage, TextChannel, Permissions } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import type { CommandStore } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { HelpDesc } from '@keys/Info';

@ApplyOptions<YukikazeCommand.Options>({
	description: HelpDesc,
	usage: '[command]',
	examples: ['!y help', '!y help naruto'],
	c: 'Information',
	preconditions: ['GuildOnly']
})
export class NarutoCommand extends YukikazeCommand {
	private _commands!: CommandStore;

	public async run(message: Message, args: YukikazeCommand.Args) {
		const commandName = (await args.pickResult('string')).value ?? null;

		if (!commandName) {
			if (!(message.channel as TextChannel).permissionsFor(message.guild?.me!).has(Permissions.FLAGS.MANAGE_MESSAGES))
				return message.reply(args.t('info:help.missingPerms'));

			return this.menu(message);
		}

		this._commands = this.context.client.stores.get('commands');

		const command =
			this._commands.get(commandName.toLowerCase()) ?? this._commands.find((command) => command.aliases.includes(commandName.toLowerCase()));

		if (!command) return message.reply(args.t('info:help.unknown'));

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setDescription(args.t(command.description))
			.addField('Examples', command.examples.join('\n'));

		if (command.aliases.length) embed.addField('Aliases', command.aliases.map((alias) => `\`${alias}\``).join(' '));
		if (command.usage) embed.addField('Usage', `\`${command.usage}\``);
		if (command.subCommands) embed.addField('Sub Commands', (command.subCommands as any).entries.map((sc: any) => `\`${sc.input}\``).join(' '));

		return message.reply({ embeds: [embed] });
	}

	private async menu(message: Message) {
		const categories = new Set<string>();

		this._commands = this.context.client.stores.get('commands');

		for (const [, command] of this._commands) categories.add(command.c);

		return new PaginatedMessage({
			pages: [...categories.values()].map(
				(category) => (index, pages) =>
					new APIMessage(message.channel, {
						embeds: [
							new MessageEmbed()
								.setColor('RANDOM')
								.setTitle(category)
								.setDescription(
									this._commands
										.filter((c) => c.c === category)
										.map((cmd) => `\`${cmd.name}\``)
										.join(' ')
								)
								.setFooter(`Page ${index + 1} / ${pages.length}`)
						]
					})
			)
		}).run(message.author, message.channel as TextChannel);
	}
}
