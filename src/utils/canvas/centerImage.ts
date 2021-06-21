import type { Image } from 'canvas';

interface CenterImageData {
	x: number;
	y: number;
	width: number;
	height: number;
}

export const centerImage = (base: Image, data: Image): CenterImageData => {
	const dataRatio = data.width / data.height;
	const baseRatio = base.width / base.height;
	let { width, height } = data;
	let x = 0;
	let y = 0;

	if (baseRatio < dataRatio) {
		height = data.height;
		width = base.height * (height / base.height);
		x = (data.width - width) / 2;
		y = 0;
	} else if (baseRatio > dataRatio) {
		width = data.width;
		height = base.height * (width / base.width);
		x = 0;
		y = (data.height - height) / 2;
	}

	return { x, y, width, height };
};
