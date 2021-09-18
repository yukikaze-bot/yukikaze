import { Message, MessageEmbed, MessageSelectMenu, SelectMenuInteraction, MessageActionRow } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { LanguageHelp } from '@structures/LanguageHelp';
import type { CommandStore } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { HelpDesc, HelpExtended } from '@keys/Info';
import { HelpTitles } from '@keys/Bot';
import { v4 } from '@tomiocodes/uuid';

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

		if (!commandName) return this.menu(message);

		this._commands = this.context.client.stores.get('commands');

		const command =
			this._commands.get(commandName.toLowerCase()) ?? this._commands.find((command) => command.aliases.includes(commandName.toLowerCase()));

		if (!command) return message.error(args.t('info:help.unknown'));

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

		const id = v4();
		const select = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId(id)
				.setPlaceholder('Categories')
				.addOptions(
					[...categories.values()].map((cat) => ({
						label: cat,
						value: cat
					}))
				)
		);
		const msg = await message.reply({ content: 'Choose one of the categories below!', components: [select] });
		const filter = (i: SelectMenuInteraction) => i.customId === id && i.user.id === message.author.id;
		const collector = message.channel.createMessageComponentCollector({ filter, idle: 180000 });

		collector.on('collect', (i) => {
			if (!i.isSelectMenu()) return;

			const cat = i.values.join();
			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(cat)
				.setDescription(
					this._commands
						.filter((c) => c.c === cat)
						.map((cmd) => `\`${cmd.name}\``)
						.join(' ')
				);

			i.deferUpdate();

			msg.edit({ content: null, embeds: [embed] });
		});

		collector.on('end', () => {
			msg.edit({ content: 'This interaction has ended.', components: [] });
		});
	}
}
