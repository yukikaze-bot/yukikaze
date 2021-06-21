import { CommandDeniedPayload, Event, UserError, Events } from '@sapphire/framework';
import { translate } from '@utils/translate';

export class CommandDeniedEvent extends Event<Events.CommandDenied> {
	public async run(error: UserError, { message, command }: CommandDeniedPayload) {
		if (Reflect.get(Object(error.context), 'silent')) return;

		const identifier = translate(error.identifier);

		return message.reply(await message.resolveKey(identifier, { message, command, ...(error.context as any) }));
	}
}