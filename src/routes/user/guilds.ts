import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import { ApplyOptions } from '@sapphire/decorators';
import { authenticated } from '@utils/Decorators';
import { Permissions } from 'discord.js';

@ApplyOptions<RouteOptions>({ route: 'user/guilds' })
export class UserGuildsRoute extends Route {
	@authenticated()
	public async [methods.GET](req: ApiRequest, res: ApiResponse) {
		const { guilds } = await this.context.server.auth!.fetchData(req.auth!.token);

		return res.json(
			guilds!.map((g) => {
				const guild = this.context.client.guilds.cache.get(g.id);
				const perms = new Permissions(BigInt(g.permissions));

				guild?.members.fetch();

				return {
					name: g.name,
					id: g.id,
					icon: g.icon
						? (this.context.client['rest'] as any).cdn.Icon(g.id, g.icon, 'png', 512, true)
						: 'https://cdn.discordapp.com/embed/avatars/4.png',
					hasBot: guild?.members.cache.has(this.context.client.user!.id) ?? null,
					canManage: perms.has(Permissions.FLAGS.MANAGE_GUILD)
				};
			})
		);
	}
}
