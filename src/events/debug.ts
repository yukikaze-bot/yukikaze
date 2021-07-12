import type { Events } from '@utils/Events';
import { Event } from '@sapphire/framework';

export class DebugEvent extends Event<Events.Debug> {
	public run(data: string) {
		this.context.client.logger.debug(data);
	}
}
