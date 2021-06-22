import { Awaited, CommandContext, PermissionsPrecondition, PieceContext, PreconditionEntryResolvable } from '@sapphire/framework';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';
import type { LanguageHelpDisplayOptions } from './LanguageHelp';
import type { Message, PermissionResolvable } from 'discord.js';
import { YukikazeArgs } from './YukikazeArgs';
import type { CustomGet } from '#types/i18n';
import * as lexure from 'lexure';
import { sep } from 'path';

export abstract class YukikazeCommand extends SubCommandPluginCommand<YukikazeCommand.Args, YukikazeCommand> {
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly c: string;
	public readonly fullCategory: readonly string[];
	public readonly description: CustomGet<string, string>;
	public readonly extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;

	public constructor(context: PieceContext, options: YukikazeCommand.Options) {
		super(context, YukikazeCommand.resolvePreConditions(context, options));

		this.guarded = options.guarded ?? false;
		this.hidden = options.hidden ?? false;
		this.extendedHelp = options.extendedHelp;
		this.c = options.c;
		this.description = options.description;

		const paths = context.path.split(sep);

		this.fullCategory = paths.slice(paths.indexOf('commands') + 1, -1);
	}

	public get category(): string {
		return this.fullCategory.length > 0 ? this.fullCategory[0] : 'General';
	}

	public get subCategory(): string {
		return this.fullCategory.length > 1 ? this.fullCategory[1] : 'General';
	}

	public async preParse(message: Message, parameters: string, context: CommandContext) {
		const parser = new lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new lexure.Args(parser.parse());

		return new YukikazeArgs(message, this, args, context, await message.fetchT());
	}

	public run(message: Message, args: YukikazeCommand.Args, context: YukikazeCommand.Context): Awaited<unknown> {
		if (!this.subCommands) throw new Error(`The command ${this.name} does not have a 'run' method.`);

		return this.subCommands.run({ message, args, context, command: this });
	}

	protected static resolvePreConditions(_: PieceContext, options: YukikazeCommand.Options): YukikazeCommand.Options {
		options.generateDashLessAliases ??= true;

		const preconditions = (options.preconditions ??= []) as PreconditionEntryResolvable[];

		if (options.nsfw) preconditions.push('NSFW');
		if (options.permissions) preconditions.push(new PermissionsPrecondition(options.permissions));
		if (options.limit && options.delay) preconditions.push({ name: 'Cooldown', context: { limit: options.limit, delay: options.delay } });

		return options;
	}
}

export namespace YukikazeCommand {
	export type Args = YukikazeArgs;
	export type Context = CommandContext;

	export interface Options extends SubCommandPluginCommand.Options {
		c: string;
		limit?: number;
		delay?: number;
		guarded?: boolean;
		hidden?: boolean;
		nsfw?: boolean;
		permissions?: PermissionResolvable;
		description: CustomGet<string, string>;
		extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;
	}
}
