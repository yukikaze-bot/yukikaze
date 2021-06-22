import { Message, MessageEmbed, APIMessage, TextChannel, Permissions } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { LanguageHelp } from '@structures/LanguageHelp';
import type { CommandStore } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { HelpDesc, HelpExtended } from '@keys/Info';
import { HelpTitles } from '@keys/Bot';

@ApplyOptions<YukikazeCommand.Options>({
	description: HelpDesc,
	extendedHelp: HelpExtended,
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

		let prefix = await this.context.client.fetchPrefix(message);

		if (prefix === '!y') prefix = '!y ';

		const builderData = args.t(HelpTitles) as any;
		const builder = new LanguageHelp()
			.setUsages(builderData.usages)
			.setAliases(builderData.aliases)
			.setExtendedHelp(builderData.extendedHelp)
			.setExplainedUsage(builderData.explainedUsage)
			.setExamples(builderData.examples)
			.setPossibleFormats(builderData.possibleFormats)
			.setReminder(builderData.reminders);
		const extendedHelpData = args.t(command.extendedHelp, { replace: { prefix }, postProcess: 'helpUsagePostProcessor' });
		const extendedHelp = builder.display(
			command.name,
			command.aliases.length ? command.aliases.join(', ') : 'None',
			extendedHelpData as any,
			prefix as string
		);
		const data = args.t('info:help.data', {
			footerName: command.name,
			titleDescription: args.t(command.description)
		}) as any;
		const embed = new MessageEmbed().setColor('RANDOM').setDescription(extendedHelp).setFooter(data.footer).setTitle(data.title);

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
