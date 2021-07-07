import type { Message, PartialMessage } from 'discord.js';
import { Event } from '@sapphire/framework';
import { Events } from '@utils/Events';

export class MessageUpdateEvent extends Event<Events.MessageUpdate> {
	public async run(old: Message | PartialMessage, message: Message | PartialMessage) {
		if (old.partial) old = await old.fetch();
		if (message.partial) message = await message.fetch();
		if (old.content === message.content) return;
		if (message.webhookId) return;
		if (message.system) return;
		if (message.author.bot) return;

		this.context.client.emit(Events.PreMessageParsed, message);
	}
}
