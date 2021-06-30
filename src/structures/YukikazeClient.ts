import { SapphireClient, SapphireClientOptions, LogLevel } from '@sapphire/framework';
import { Intents, PermissionResolvable, Guild, Message, User } from 'discord.js';
import type { LanguageHelpDisplayOptions } from './LanguageHelp';
import type { I18nContext } from '@sapphire/plugin-i18next';
import { ApolloServer, gql } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import type { CustomGet } from '#types/i18n';
import type { Image } from 'canvas';
import Turndown from 'turndown';
import { join } from 'path';

declare module '@sapphire/framework' {
	interface SapphireClient {
		converter: Turndown;
		db: PrismaClient;

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
	}
}

export class YukikazeClient extends SapphireClient {
	public readonly db = new PrismaClient();
	public readonly converter = new Turndown();
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
			}
		});
	}

	public async login(token = process.env.DISCORD_TOKEN) {
		await this.db.$connect();
		await this._startGql();

		return super.login(token);
	}

	public readonly fetchLanguage = async (context: I18nContext): Promise<string> => {
		if (!context.guild) return 'en-US';

		const guild = await this.db.guild.findUnique({ where: { id: (context.guild as Guild).id } });

		return guild?.lang ?? 'en-US';
	};

	public readonly fetchPrefix = async (message: Message): Promise<string> => {
		if (!message.guild) return '!y';

		const guild = await this.db.guild.findUnique({ where: { id: message.guild.id } });

		return guild?.prefix ?? '!y';
	};

	private async _startGql() {
		const server = new ApolloServer({
			typeDefs: gql`
				type Query {
					guilds: String!
					users: String!
					commands: String!
					channels: String!
				}
			`,
			resolvers: {
				Query: {
					guilds: () => this.guilds.cache.size,
					users: () => this.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
					commands: () => this.stores.get('commands').size,
					channels: () => this.channels.cache.size
				}
			}
		});
		const app = await server.listen({ port: Number(process.env.PORT) });

		this.logger.info(`GraphQL Server started at ${app.url}`);
	}
}
