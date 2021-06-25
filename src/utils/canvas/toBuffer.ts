import type { State } from 'gm';

export const toBuffer = (state: State): Promise<Buffer> =>
	new Promise((res, rej) => {
		state.toBuffer((err, buffer) => {
			if (err) rej(err);
			return res(buffer);
		});
	});
