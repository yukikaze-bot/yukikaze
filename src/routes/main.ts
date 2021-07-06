import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import { ApplyOptions } from '@sapphire/decorators';
import { authenticated } from '@utils/Decorators';

@ApplyOptions<RouteOptions>({ route: '' })
export class MainRoute extends Route {
	public [methods.GET](_: ApiRequest, res: ApiResponse) {
		res.json({ message: 'Hello, World!' });
	}

	@authenticated()
	public [methods.POST](_: ApiRequest, res: ApiResponse) {
		res.json({ message: 'Hello, World!' });
	}
}
