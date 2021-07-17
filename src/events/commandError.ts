import { Event, UserError, CommandErrorPayload } from '@sapphire/framework';
import { translate } from '@utils/translate';
import type { Events } from '@utils/Events';

export class CommandErrorEvent extends Event<Events.CommandError> {
	public run(error: Error, { message, args }: CommandErrorPayload) {
		if (typeof error === 'string') return message.error(error);
		if (error instanceof UserError) return message.error(args.t(translate(error.identifier), error.context as any));

		return undefined;
	}
}
