import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import { ApplyOptions } from '@sapphire/decorators';
import { authenticated } from '@utils/Decorators';
import { Permissions } from 'discord.js';

@ApplyOptions<RouteOptions>({ route: 'guilds/:id' })
export class GuildRoute extends Route {
	@authenticated()
	public async [methods.GET](req: ApiRequest, res: ApiResponse) {
		const guild = await this.context.client.guilds.fetch(req.params.id as `${bigint}`).catch(() => null);

		if (guild === null) return res.notFound();

		const member = await guild.members.fetch(req.auth!.id as `${bigint}`).catch(() => null);

		if (member === null) return res.notFound();
		if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return res.forbidden();

		return res.json({
			id: guild.id,
			name: guild.name,
			memberCount: guild.memberCount,
			owner: guild.ownerID,
			icon: guild.iconURL({ dynamic: true, size: 512 }) ?? 'https://cdn.discordapp.com/embed/avatars/4.png'
		});
	}
}
