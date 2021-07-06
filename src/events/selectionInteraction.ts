import type { SelectionInteractionController } from '@duxcore/interactive-discord';
import type { YukikazeClient } from '@structures/YukikazeClient';
import { Event, EventOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import type { Events } from '@utils/Events';
import type { EventEmitter } from 'events';

// @ts-ignore We need intellisense for the events.
interface Options extends EventOptions {
	emitter?: EventEmitter | keyof YukikazeClient;
}

@ApplyOptions<Options>({ emitter: 'interactions' })
export class SelectionInteractionEvent extends Event<Events.SelectionInteraction> {
	public run(interaction: SelectionInteractionController) {
		if (!interaction.isHandled) interaction.respond({ isPrivate: true, content: 'This interaction has ended.' });
	}
}
