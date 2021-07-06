import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<RouteOptions>({ route: 'stats' })
export class StatsRoute extends Route {
	public async [methods.GET](_: ApiRequest, res: ApiResponse) {
		const { client } = this.context;
		const guilds = (await client.guilds.fetch()).size;
		const users = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
		const commands = client.stores.get('commands').size;
		const channels = client.channels.cache.size;

		return res.json({ guilds, users, commands, channels });
	}
}
