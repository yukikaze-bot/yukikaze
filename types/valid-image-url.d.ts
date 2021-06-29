declare module 'valid-image-url' {
	const validImageUrl: (url: string) => Promise<boolean>;

	export = validImageUrl;
}
