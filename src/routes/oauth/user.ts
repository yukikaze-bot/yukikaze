import { ApiRequest, ApiResponse, HttpCodes, methods, MimeTypes, Route, RouteOptions } from '@sapphire/plugin-api';
import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v8';
import { authenticated, ratelimit } from '@utils/Decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@utils/Constants';
import { stringify } from 'querystring';

@ApplyOptions<RouteOptions>({ route: 'oauth/user' })
export class OAuthUserRoute extends Route {
	@authenticated()
	@ratelimit(2, Time.Minute * 5, true)
	public async [methods.POST](req: ApiRequest, res: ApiResponse) {
		const requestBody = req.body as Record<string, string>;

		if (typeof requestBody.action !== 'string') return res.badRequest();
		if (requestBody.action === 'SYNC_USER') {
			if (!req.auth) return res.error(HttpCodes.Unauthorized);

			const auth = this.context.server.auth!;
			let authToken = req.auth.token;

			if (Date.now() + Time.Day >= req.auth.expires) {
				const body = await this.refreshToken(req.auth.id, req.auth.refresh);

				if (body !== null) {
					const authentication = auth.encrypt({
						id: req.auth.id,
						token: body.access_token,
						refresh: body.refresh_token,
						expires: Date.now() + body.expires_in * 1000
					});

					res.cookies.add(auth.cookie, authentication, { maxAge: body.expires_in });

					authToken = body.access_token;
				}
			}

			try {
				return res.json(await auth.fetchData(authToken));
			} catch (err) {
				this.context.client.logger.fatal(err);

				return res.error(HttpCodes.InternalServerError);
			}
		}

		return res.error(HttpCodes.BadRequest);
	}

	private async refreshToken(id: string, refreshToken: string) {
		const { client, server } = this.context;

		try {
			client.logger.debug(`Refreshing Token for ${id}.`);

			return await fetch<RESTPostOAuth2AccessTokenResult>(
				'https://discord.com/api/v8/oauth2/token',
				{
					method: 'POST',
					body: stringify({
						client_id: server.auth!.id,
						client_secret: server.auth!.secret,
						grant_type: 'refresh_token',
						refresh_token: refreshToken,
						redirect_uri: server.auth!.redirect,
						scope: server.auth!.scopes
					}),
					headers: {
						'Content-Type': MimeTypes.ApplicationFormUrlEncoded
					}
				},
				FetchResultTypes.JSON
			);
		} catch (err) {
			client.logger.fatal(err);

			return null;
		}
	}
}
