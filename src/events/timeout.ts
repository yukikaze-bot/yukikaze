import type { Events, EventOptions } from '@utils/Events';
import { ApplyOptions } from '@sapphire/decorators';
import type { TextChannel } from 'discord.js';
import { Event } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ emitter: 'timers' })
export class TimeoutEvent extends Event<Events.Timeout> {
	public async run(id: string) {
		try {
			const [channelId, userId] = id.split('-');
			const channel = (await this.context.client.channels.fetch(channelId as `${bigint}`)) as TextChannel;
			const data = await this.context.client.db.timer.findUnique({ where: { id } });
			const message = await channel.messages.fetch(data!.message as `${bigint}`);
			const guild = await this.context.client.db.guild.findUnique({ where: { id: channel.guild?.id } });
			const t = this.context.client.i18n.fetchT(guild?.lang ?? 'en-US');

			message.reply({
				content: t('reminder:remind.done', { user: `<@${userId}>`, title: data!.title }),
				allowedMentions: {
					parse: ['users']
				}
			});
			await this.context.client.db.timer.delete({ where: { id } });
		} catch {}
	}
}
