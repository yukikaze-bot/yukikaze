import type { APIUser } from 'discord-api-types/v8';
import { api } from '@structures/external/Api';

export const fetchReactionUsers = async (channelID: string, messageID: string, reaction: string) => {
	const users = new Set<string>();
	let rawUsers: APIUser[] = [];

	do {
		rawUsers = await api()
			.channels(channelID)
			.messages(messageID)
			.reactions(reaction)
			.get<APIUser[]>({ query: { limit: 100, after: rawUsers.length ? rawUsers[rawUsers.length - 1].id : undefined } });

		for (const user of rawUsers) users.add(user.id);
	} while (rawUsers.length === 100);

	return users;
};
