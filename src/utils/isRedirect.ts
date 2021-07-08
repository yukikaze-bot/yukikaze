import fetch from 'node-fetch';

export const isRedirect = async (url: string): Promise<string | null> => {
	const res = await fetch(url);

	if (!res.redirected) return null;

	return res.url;
};
