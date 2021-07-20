import type { ArgumentOption, ResolverCallback } from './Decorators';
import { Result, UserError, ok, err } from '@sapphire/framework';
import type { Message } from 'discord.js';

export const resolveArgument = async <T = unknown>(
	option: ArgumentOption,
	message: Message,
	resolver: ResolverCallback<T>
): Promise<Result<T, Error>> => {
	const types = [option.type].flat();
	let arg: Result<T, UserError>;
	let i = 0;

	do arg = await resolver(types[i++]!);
	while (typeof arg.error !== 'undefined' && i < types.length);

	const isValid = arg.success && ((await option.validate?.(message, arg.value)) ?? true);

	if (isValid) return ok<T>(arg.value!);
	if (option.required) {
		await message.error(option.message);

		return err(new Error('Required parameter(s).'));
	}

	const value = typeof option.default === 'function' ? await option.default(message) : option.default;

	return ok(value ?? null);
};
