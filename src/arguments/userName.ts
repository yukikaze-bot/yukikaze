import { SnowflakeRegex, UserOrMemberMentionRegex } from '@sapphire/discord.js-utilities';
import { Argument, ArgumentContext, Identifiers } from '@sapphire/framework';
import type { GuildMessage } from '#types/Discord';
import { User as UserArg } from '@keys/Arguments';
import type { User } from 'discord.js';

export class UserNameArgument extends Argument<User> {
	public async run(parameter: string, context: ArgumentContext<User>) {
		const message = context.message as GuildMessage;

		if (!message.guild) return this.user.run(parameter, context);

		const user = await this.resolveUser(message, parameter);

		if (user) return this.ok(user);
		if (user === null) return this.error({ parameter, identifier: Identifiers.ArgumentUser, context });

		const result = await this.fetchMember(message, parameter);

		if (result) return this.ok(result.user);

		return this.error({ parameter, identifier: UserArg, context });
	}

	private get user() {
		return this.store.get('user') as Argument<User>;
	}

	private async resolveUser(message: GuildMessage, argument: string) {
		const result = UserOrMemberMentionRegex.exec(argument) ?? SnowflakeRegex.exec(argument);

		if (result === null) return undefined;

		try {
			return message.client.users.fetch(result[1] as `${bigint}`);
		} catch {
			return null;
		}
	}

	private async fetchMember(message: GuildMessage, query: string) {
		try {
			const results = await message.guild.members.fetch({ query });

			return results.first() ?? null;
		} catch {
			return null;
		}
	}
}
