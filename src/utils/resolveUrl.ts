const re = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}(:[0-9]{1,5})?(\/.*)?$/gm;

export const resolveUrl = (url: string): string | null => {
	const matched = url.match(re);

	if (!matched) return null;
	if (!/^(https?:\/\/)/i.test(matched[0])) url = `http://${url}`;

	return matched[0];
};
