import { Argument, ArgumentContext } from '@sapphire/framework';
import { resolveUrl } from '@utils/resolveUrl';
import { Url } from '@keys/Arguments';

export class UrlArgument extends Argument<string> {
	public run(parameter: string, context: ArgumentContext) {
		const parsed = resolveUrl(parameter);

		if (parsed === null) return this.error({ parameter, identifier: Url, context });

		return this.ok(parsed);
	}
}
