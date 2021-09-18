import type { Readable } from 'stream';

export const streamToBuffer = async (stream: Readable) => {
	const chunks = [];

	for await (const chunk of stream) chunks.push(chunk);

	return Buffer.concat(chunks);
};
