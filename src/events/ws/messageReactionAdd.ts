import { GatewayDispatchEvents, GatewayMessageReactionAddDispatch } from 'discord-api-types/v8';
import type { LLRCData } from '@structures/external/LongLivingReactionCollector';
import { isTextBasedChannel } from '@utils/isTextBasedChannel';
import { TextChannel, Permissions } from 'discord.js';
import { Events, EventOptions } from '@utils/Events';
import { ApplyOptions } from '@sapphire/decorators';
import { resolveEmoji } from '@utils/resolveEmoji';
import { Event } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: GatewayDispatchEvents.MessageReactionAdd, emitter: 'ws' })
export class WSMessageReactionAddEvent extends Event {
	public run(raw: GatewayMessageReactionAddDispatch['d']) {
		const channel = this.context.client.channels.cache.get(raw.channel_id) as TextChannel | undefined;

		if (!channel || !isTextBasedChannel(channel) || !channel.permissionsFor(this.context.client.user!)?.has(Permissions.FLAGS.SEND_MESSAGES))
			return;

		const data: LLRCData = {
			channel,
			emoji: {
				animated: raw.emoji.animated ?? false,
				id: raw.emoji.id,
				managed: raw.emoji.managed ?? null,
				name: raw.emoji.name,
				requireColons: raw.emoji.require_colons ?? null,
				roles: raw.emoji.roles || null,
				// eslint-disable-next-line @typescript-eslint/dot-notation
				user: (raw.emoji.user && this.context.client.users['_add'](raw.emoji.user)) ?? { id: raw.user_id }
			},
			guild: channel.guild,
			messageID: raw.message_id,
			userID: raw.user_id
		};

		for (const llrc of this.context.client.llrCollectors) llrc.send(data);

		const emoji = resolveEmoji(data.emoji);

		if (emoji === null) return;

		this.context.client.emit(Events.RawReactionAdd, data, emoji);
	}
}
