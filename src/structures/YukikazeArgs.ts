import { Args, CommandContext, isOk, Result, UserError } from '@sapphire/framework';
import type { YukikazeCommand } from './YukikazeCommand';
import type { Args as LexureArgs } from 'lexure';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';

export class YukikazeArgs extends Args {
	public readonly t: TFunction;

	public constructor(message: Message, command: YukikazeCommand, parser: LexureArgs, context: CommandContext, t: TFunction) {
		super(message, command, parser, context);

		this.t = t;
	}

	public nextSplitResult({ delimiter = ',', times = Infinity }: YukikazeArgs.NextSplitOptions = {}): Result<string[], UserError> {
		if (this.parser.finished) return this.missingArguments();

		const values: string[] = [];
		const parts = this.parser
			.many()
			.reduce((acc, token) => `${acc}${token.value}${token.trailing}`, '')
			.split(delimiter);

		for (const part of parts) {
			const trimmed = part.trim();

			if (trimmed.length === 0) continue;

			values.push(trimmed);

			if (values.length === times) break;
		}

		return values.length > 0 ? Args.ok(values) : this.missingArguments();
	}

	public nextSplit(options?: YukikazeArgs.NextSplitOptions) {
		const result = this.nextSplitResult(options);

		if (isOk(result)) return result.value;

		throw result.error;
	}
}

export interface YukikazeArgs {
	command: YukikazeCommand;
}

export namespace YukikazeArgs {
	export interface NextSplitOptions {
		delimiter?: string;
		times?: number;
	}
}

declare module '@sapphire/framework' {
	export interface Args {
		t: TFunction;
	}
}
