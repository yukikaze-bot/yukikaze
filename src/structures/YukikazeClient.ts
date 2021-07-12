import type { LongLivingReactionCollector } from './external/LongLivingReactionCollector';
import { SapphireClient, SapphireClientOptions, LogLevel } from '@sapphire/framework';
import { Intents, PermissionResolvable, Guild, Message, User } from 'discord.js';
import type { LanguageHelpDisplayOptions } from './LanguageHelp';
import type { I18nContext } from '@sapphire/plugin-i18next';
import { PrismaClient } from '@prisma/client';
import type { CustomGet } from '#types/i18n';
import { graphql } from '@octokit/graphql';
import type { Image } from 'canvas';
import { Timers } from './Timers';
import Turndown from 'turndown';
import { join } from 'path';

declare module '@sapphire/framework' {
	interface SapphireClient {
		converter: Turndown;
		db: PrismaClient;
		gh: typeof graphql;
		timers: Timers;
		llrCollectors: Set<LongLivingReactionCollector>;

		fetchLanguage: (context: I18nContext) => Promise<string>;
	}

	interface Args {
		c: string;
		bucket?: number;
		cooldown?: number;
		guarded?: boolean;
		hidden?: boolean;
		nsfw?: boolean;
		permissions?: PermissionResolvable;
		extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;
		subCommands: any;
	}

	interface Command {
		c: string;
		bucket?: number;
		cooldown?: number;
		guarded?: boolean;
		hidden?: boolean;
		nsfw?: boolean;
		permissions?: PermissionResolvable;
		extendedHelp: CustomGet<string, LanguageHelpDisplayOptions>;
		subCommands: any;
	}

	interface ArgType {
		image: Image;
		userName: User;

		// @ts-ignore override
		url: string;
	}
}

declare module 'discord.js' {
	interface Client {
		converter: Turndown;
		db: PrismaClient;
		gh: typeof graphql;
		timers: Timers;
		llrCollectors: Set<LongLivingReactionCollector>;

		fetchLanguage: (context: I18nContext) => Promise<string>;
	}
}

export class YukikazeClient extends SapphireClient {
	public readonly db = new PrismaClient();
	public readonly converter = new Turndown();
	public readonly gh = graphql.defaults({ headers: { authorization: `token ${process.env.GITHUB_TOKEN}` } });
	public readonly timers = new Timers(process.env.REDIS_URL);
	public readonly llrCollectors = new Set<LongLivingReactionCollector>();
	public readonly owner: `${bigint}` = '566155739652030465';

	public constructor(options?: SapphireClientOptions) {
		super({
			...options,
			defaultPrefix: '!y',
			regexPrefix: /^(hey +)?yukikaze[,! ]/i,
			caseInsensitiveCommands: true,
			logger: {
				level: LogLevel.Trace
			},
			partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'],
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.DIRECT_MESSAGES,
				Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
			],
			presence: {
				activities: [
					{
						name: 'Yato-no-kami',
						type: 'COMPETING'
					}
				],
				status: 'online'
			},
			allowedMentions: {
				repliedUser: false,
				parse: ['roles', 'users']
			},
			i18n: {
				defaultNS: 'global',
				defaultMissingKey: 'missing',
				defaultLanguageDirectory: join(__dirname, '..', 'languages'),
				i18next: (_: string[], languages: string[]) => ({
					supportedLngs: languages,
					preload: languages,
					returnObjects: true,
					returnEmptyString: false,
					returnNull: false,
					load: 'all',
					lng: 'en-US',
					fallbackLng: 'en-US',
					initImmediate: false
				})
			},
			api: {
				listenOptions: {
					port: Number(process.env.PORT)
				},
				auth: {
					id: '855428383574589460',
					secret: process.env.CLIENT_SECRET,
					scopes: ['identify', 'guilds'],
					redirect: 'https://yukikaze.tech/oauth/callback',
					domainOverwrite: 'yukikaze.tech'
				},
				prefix: '/',
				origin: 'https://yukikaze.tech'
			}
		});
	}

	public async login(token = process.env.DISCORD_TOKEN) {
		await this.db.$connect();

		return super.login(token);
	}

	public getEnv(key: string, type?: EnvMethods.Int): number;
	public getEnv(key: string, type?: EnvMethods.String): string;
	public getEnv(key: string, type?: EnvMethods): number | string {
		if (typeof type === 'undefined') type = EnvMethods.String;

		const res = process.env[key];

		switch (type) {
			case EnvMethods.String:
				return String(res);
			case EnvMethods.Int:
				return Number(res);
			default:
				throw new Error('Unknown type.');
		}
	}

	public readonly fetchLanguage = async (context?: I18nContext): Promise<string> => {
		if (!context?.guild) return 'en-US';

		const guild = await this.db.guild.findUnique({ where: { id: (context.guild as Guild).id } });

		return guild?.lang ?? 'en-US';
	};

	public readonly fetchPrefix = async (message: Message): Promise<string> => {
		if (!message.guild) return '!y';

		const guild = await this.db.guild.findUnique({ where: { id: message.guild.id } });

		return guild?.prefix ?? '!y';
	};
}

export const enum EnvMethods {
	String = 'string',
	Int = 'integer'
}
