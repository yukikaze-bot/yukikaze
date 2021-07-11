import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { stringify } from '@favware/querystring';

export const screenshot = async (url: string, width = 1980, height = 1080, full = false): Promise<Buffer> => {
	const fullPage = full ? 'yes' : 'no';
	const query = stringify(
		{
			url,
			width,
			height,
			full: fullPage
		},
		{ includeQuestion: true }
	);

	const data = await fetch(`${process.env.SCREENSHOT_URL}${query}`, FetchResultTypes.Buffer);

	return data;
};
