import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { stringify } from '@favware/querystring';

export const screenshot = async (url: string, width = 1980, height = 1080): Promise<Buffer> => {
	const query = stringify(
		{
			url,
			width,
			height
		},
		{ includeQuestion: true }
	);

	const data = await fetch(`${process.env.SCREENSHOT_URL}/api${query}`, FetchResultTypes.Buffer);

	return data;
};
