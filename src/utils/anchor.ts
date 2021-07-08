export const anchor = (text: string, module: string): string => {
	const method = text
		.toLowerCase()
		.replace(/ |`|\[|\]|\)/g, '')
		.replace(/\.|\(|,|:/g, '_');

	return `${module}_${method}`;
};
