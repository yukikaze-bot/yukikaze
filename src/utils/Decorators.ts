import { isDMChannel, isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { SubCommandGuildOnly, Permissions as Perms } from '@keys/Preconditions';
import { UserError, ArgType, Result, Awaited } from '@sapphire/framework';
import { ApiRequest, ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { RateLimitManager } from '@structures/ratelimit/RateLimitManager';
import { PermissionResolvable, Permissions, Message } from 'discord.js';
import { createMethodDecorator } from '@sapphire/decorators';
import type { YukikazeArgs } from '@structures/YukikazeArgs';
import { resolveArgument } from './resolveArgument';

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}

export const createFunctionInhibitor = (inhibitor: Inhibitor, fallback: Fallback = (): void => undefined): MethodDecorator =>
	createMethodDecorator((_, __, descriptor) => {
		const method = descriptor.value;

		if (!method) throw new Error('Missing a [[value]].');
		if (typeof method !== 'function') throw new Error('Not a function.');

		descriptor.value = async function descriptorValue(this: (...args: any[]) => any, ...args: any[]) {
			const canRun = await inhibitor(...args);

			return canRun ? method.call(this, ...args) : fallback.call(this, ...args);
		} as unknown as undefined;
	});

export const authenticated = () =>
	createFunctionInhibitor(
		(request: ApiRequest) => Boolean(request.auth?.token),
		(_: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized)
	);

export const ratelimit = (bucket: number, cooldown: number, auth = false) => {
	const manager = new RateLimitManager(cooldown, bucket);
	const xRateLimitLimit = bucket;

	return createFunctionInhibitor(
		(request: ApiRequest, response: ApiResponse) => {
			const id = (auth ? request.auth!.id : request.headers['x-forwarded-for'] || request.socket.remoteAddress) as string;
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());

			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());

				return false;
			}

			try {
				bucket.consume();
			} catch {}

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.remaining.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_: ApiRequest, response: ApiResponse) => response.error(HttpCodes.TooManyRequests)
	);
};

const serverOnlyPermissions = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);

export const requiresPermissions = (...permissionsResolvable: PermissionResolvable[]): MethodDecorator => {
	const resolved = new Permissions(permissionsResolvable);

	return createFunctionInhibitor((message: Message, _: YukikazeArgs) => {
		if (isDMChannel(message.channel) && resolved.has(serverOnlyPermissions)) throw new UserError({ identifier: SubCommandGuildOnly });
		if (isGuildBasedChannel(message.channel)) {
			const missingPermissions = message.channel.permissionsFor(message.guild!.me!)!.missing(resolved);

			if (missingPermissions.length) throw new UserError({ identifier: Perms, context: { missing: missingPermissions } });
		}

		return true;
	});
};

export type MatchType = 'flag' | 'option' | 'peek' | 'pick' | 'repeat' | 'rest';

export interface BaseArgumentOption {
	name: string;
	match: MatchType;
	type?: Array<keyof ArgType> | keyof ArgType;
	flags?: string[];
	validate?: (message: Message, resolved: unknown) => Awaited<boolean>;
	default?: unknown | ((message: Message) => unknown);
	required?: boolean;
	message?: string;
}

export interface TextArgumentOption extends BaseArgumentOption {
	match: Exclude<MatchType, 'flag' | 'option'>;
	flags?: never;
}

export interface RequiredArgumentOption extends BaseArgumentOption {
	required: true;
	message: string;
}

export interface FaculativeArgumentOption extends BaseArgumentOption {
	required?: false;
	message?: never;
}

export interface FlagArgumentOption extends BaseArgumentOption {
	match: 'flag';
	flags: string[];
	type?: never;
	required?: never;
	message?: never;
	default?: boolean | ((message: Message) => boolean);
}

export interface OptionArgumentOption extends BaseArgumentOption {
	match: 'option';
	flags: string[];
}

export type ArgumentOption =
	| (TextArgumentOption & FaculativeArgumentOption)
	| (TextArgumentOption & RequiredArgumentOption)
	| FlagArgumentOption
	| (OptionArgumentOption & FaculativeArgumentOption)
	| (OptionArgumentOption & RequiredArgumentOption);

export type ResolverCallback<T = unknown> = (input: keyof ArgType) => Promise<Result<T, UserError>>;

export const Args =
	(...options: ArgumentOption[]): MethodDecorator =>
	(_, __, descriptor: PropertyDescriptor): PropertyDescriptor => {
		const originalMethod = descriptor.value;

		descriptor.value = async function value(message: Message, args: YukikazeArgs): Promise<void> {
			const resolvedArguments: Record<string, unknown> = {};

			for (const option of options) {
				if (option.match === 'flag') {
					resolvedArguments[option.name] = args.getFlags(...option.flags);

					continue;
				}

				if (option.match === 'option') {
					const value = args.getOption(...option.flags);
					const resolver: ResolverCallback = async (input = 'string') => {
						const argument = message.client.stores.get('arguments').get(input);

						return argument!.run(value!, {
							args,
							argument: argument!,
							message,
							command: args.command,
							commandContext: args.commandContext
						});
					};
					const result = await resolveArgument(option, message, resolver);

					if (result.success) resolvedArguments[option.name] = result.value;
					else if (result.error) return;

					continue;
				}

				const method: `${TextArgumentOption['match']}Result` = `${option.match}Result`;
				const resolver = args[method].bind(args) as ResolverCallback;
				const result = await resolveArgument(option, message, resolver);

				if (result.success) resolvedArguments[option.name] = result.value;
				else if (result.error) return;
			}

			args.start();
			Reflect.apply(originalMethod, this, [message, resolvedArguments, args]);
		};

		return descriptor;
	};
