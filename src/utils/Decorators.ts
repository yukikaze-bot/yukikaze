import { ApiRequest, ApiResponse, HttpCodes } from '@sapphire/plugin-api';
import { RateLimitManager } from '@structures/ratelimit/RateLimitManager';
import { createMethodDecorator } from '@sapphire/decorators';

export interface Inhibitor {
	(...args: any[]): boolean | Promise<boolean>;
}

export interface Fallback {
	(...args: any[]): unknown;
}

export const createFunctionInhibitor = (inhibitor: Inhibitor, fallback: Fallback = (): void => undefined): MethodDecorator =>
	createMethodDecorator((_, __, descriptor) => {
		const method = descriptor.value;

		if (!method) throw new Error('Missing a [[value]].');
		if (typeof method !== 'function') throw new Error('Not a function.');

		descriptor.value = async function descriptorValue(this: (...args: any[]) => any, ...args: any[]) {
			const canRun = await inhibitor(...args);

			return canRun ? method.call(this, ...args) : fallback.call(this, ...args);
		} as unknown as undefined;
	});

export const authenticated = () =>
	createFunctionInhibitor(
		(request: ApiRequest) => Boolean(request.auth?.token),
		(_: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized)
	);

export const ratelimit = (bucket: number, cooldown: number, auth = false) => {
	const manager = new RateLimitManager(cooldown, bucket);
	const xRateLimitLimit = bucket;

	return createFunctionInhibitor(
		(request: ApiRequest, response: ApiResponse) => {
			const id = (auth ? request.auth!.id : request.headers['x-forwarded-for'] || request.socket.remoteAddress) as string;
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());

			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());

				return false;
			}

			try {
				bucket.consume();
			} catch {}

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.remaining.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_: ApiRequest, response: ApiResponse) => response.error(HttpCodes.TooManyRequests)
	);
};
