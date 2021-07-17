import { CommandDeniedPayload, Event, UserError } from '@sapphire/framework';
import { translate } from '@utils/translate';
import type { Events } from '@utils/Events';

export class CommandDeniedEvent extends Event<Events.CommandDenied> {
	public async run(error: UserError, { message, command }: CommandDeniedPayload) {
		if (Reflect.get(Object(error.context), 'silent')) return;

		const identifier = translate(error.identifier);

		return message.error(await message.resolveKey(identifier, { message, command, ...(error.context as any) }));
	}
}
