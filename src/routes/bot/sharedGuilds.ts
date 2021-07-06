import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import { ApplyOptions } from '@sapphire/decorators';
import { authenticated } from '@utils/Decorators';
import { Permissions } from 'discord.js';

@ApplyOptions<RouteOptions>({ route: 'bot/shared-guilds' })
export class SharedGuildsRoute extends Route {
	@authenticated()
	public async [methods.GET](req: ApiRequest, res: ApiResponse) {
		const { guilds } = await this.context.server.auth!.fetchData(req.auth!.token);

		return res.json(
			guilds!
				.filter((g) => {
					const guild = this.context.client.guilds.cache.get(g.id);

					guild?.members.fetch();

					if (!guild) return false;
					if (!guild.members.cache.has(this.context.client.user!.id)) return false;

					return true;
				})
				.map((g) => {
					const userPerms = new Permissions(BigInt(g.permissions));

					return {
						name: g.name,
						id: g.id,
						icon: g.icon ? (this.context.client['rest'] as any).cdn.Icon(g.id, g.icon, 'png', 512, true) : null,
						canManage: userPerms.has(Permissions.FLAGS.MANAGE_GUILD)
					};
				})
		);
	}
}
