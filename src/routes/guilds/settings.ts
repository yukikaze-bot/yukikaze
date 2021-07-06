import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import { ApplyOptions } from '@sapphire/decorators';
import { authenticated } from '@utils/Decorators';
import { Permissions, Guild } from 'discord.js';

const availableLangs = ['en-US', 'fil-PH', 'de-DE', 'fr-FR', 'id-ID', 'ja-JP', 'ko-KR', 'zh-CN'];

@ApplyOptions<RouteOptions>({ route: 'guilds/:id/settings' })
export class SettingsRoute extends Route {
	@authenticated()
	public async [methods.PUT](req: ApiRequest, res: ApiResponse) {
		const guild = await this.context.client.guilds.fetch(req.params.id as `${bigint}`).catch(() => null);
		const body = req.body as Record<string, string>;

		if (guild === null) return res.notFound();

		const member = await guild.members.fetch(req.auth!.id as `${bigint}`).catch(() => null);

		if (member === null) return res.notFound();
		if (!member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) return res.forbidden();
		if (body.language && availableLangs.includes(body.language) && typeof body.language === 'string')
			await this.setLanguage(body.language, guild);
		if (body.prefix && typeof body.prefix === 'string') await this.updatePrefix(body.prefix, guild);

		return res.json({ success: true });
	}

	private async setLanguage(lang: string, guild: Guild) {
		const exists = await this.context.client.db.guild.findUnique({ where: { id: guild.id } });

		if (exists)
			await this.context.client.db.guild.update({
				where: {
					id: guild.id
				},
				data: {
					lang
				}
			});
		else
			await this.context.client.db.guild.create({
				data: {
					lang,
					prefix: '!y',
					id: guild.id
				}
			});
	}

	private async updatePrefix(prefix: string, guild: Guild) {
		const exists = await this.context.client.db.guild.findUnique({ where: { id: guild.id } });

		if (exists)
			await this.context.client.db.guild.update({
				where: {
					id: guild.id
				},
				data: {
					prefix
				}
			});
		else
			await this.context.client.db.guild.create({
				data: {
					prefix,
					id: guild.id,
					lang: await this.context.client.fetchLanguage({ guild })
				}
			});
	}
}
