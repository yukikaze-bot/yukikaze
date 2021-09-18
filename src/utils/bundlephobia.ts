import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { getTimeFromSize } from './getTimeFromSize';
import { streamToBuffer } from './streamToBuffer';
import type { registerFont } from 'canvas';
import { formatSize } from './formatSize';
import { formatTime } from './formatTime';
import type { Readable } from 'stream';
import { fabric } from 'fabric';
import { join } from 'path';

declare module 'fabric' {
	namespace fabric {
		const nodeCanvas: { registerFont: typeof registerFont };

		interface StaticCanvas {
			createPNGStream(): Readable;
		}
	}
}

fabric.nodeCanvas.registerFont(join(__dirname, '..', '..', 'fonts', 'sourceCodePro.ttf'), { family: 'Source Code Pro' });
fabric.nodeCanvas.registerFont(join(__dirname, '..', '..', 'fonts', 'sfCompactText.ttf'), { family: 'SF Compact Text' });

export const drawStats = (name: string, version: string, min: number, gzip: number, theme: 'dark' | 'light' = 'dark', wide = false) => {
	const lightTheme = {
		backgroundColor: '#fff',
		separatorColor: '#e7e7e7',
		seperatorOpacity: 1,
		nameColor: '#000',
		versionColor: '#979797',
		versionOpacity: 1,
		numberColor: '#333',
		numberOpacity: 1,
		unitColor: '#7d828c',
		unitOpacity: 1,
		labelColor: '#54575c',
		labelOpacity: 1
	};
	const darkTheme = {
		backgroundColor: '#182330',
		separatorColor: '#fff',
		seperatorOpacity: 0.12,
		nameColor: '#fff',
		versionColor: '#fff',
		versionOpacity: 0.6,
		numberColor: '#fff',
		numberOpacity: 0.8,
		unitColor: '#eseeff',
		unitOpacity: 0.5,
		labelColor: '#fff',
		labelOpacity: 0.55
	};
	const width = 624;
	const height = 350;
	const pad = 5;
	const wideBy = 25;
	const selectedTheme = theme === 'light' ? lightTheme : darkTheme;

	// @ts-ignore Fabric
	fabric.devicePixelRatio = 1.5;

	const canvas = new fabric.StaticCanvas(null, {
		backgroundColor: selectedTheme.backgroundColor,
		width: wide ? width + wideBy : width,
		height
	});
	const x0 = wide ? wideBy / 2 : 0;
	const seperatorOptions = {
		stroke: selectedTheme.separatorColor,
		strokeWidth: 0.5,
		opacity: selectedTheme.seperatorOpacity
	};
	const lineTopHorizontal = new fabric.Line([x0, 91, width, 91], seperatorOptions);
	const lineCenterVertical = new fabric.Line([x0, 91 + (height - 91) / 2, width, 91 + (height - 91) / 2], seperatorOptions);
	const lineCenterHorizontal = new fabric.Line([x0, 91 + (height - 91) / 2, width, 91 + (height - 91) / 2], seperatorOptions);
	const packageNameText = new fabric.Text(name, {
		fontFamily: 'Source Code Pro',
		fontSize: 45,
		fill: selectedTheme.nameColor,
		opacity: 0.8,
		top: 19
	});
	const packageAtText = new fabric.Text('@', {
		fontFamily: 'Source Code Pro',
		fontSize: 35,
		fill: '#91d396',
		left: packageNameText.width! + pad * 2,
		top: 24
	});
	const packageVersionText = new fabric.Text(version, {
		fontFamily: 'Source Code Pro',
		fontSize: 35,
		fill: selectedTheme.versionColor,
		opacity: selectedTheme.versionOpacity,
		// eslint-disable-next-line no-implicit-coercion
		left: packageNameText.width! + packageAtText.width! + +pad * 4
	});

	packageVersionText.top = packageNameText.top! + (packageNameText.height! - packageVersionText.height!) / 2 + pad / 2;

	const packageNameGroup = new fabric.Group([packageNameText, packageAtText, packageVersionText], { selectable: false });

	const createStatGroup = (number: string, unit: string, label: string, opts?: fabric.IGroupOptions) => {
		const numberText = new fabric.Text(number.toString(), {
			fontFamily: 'SF Compact Text',
			fontSize: 55,
			fill: selectedTheme.numberColor,
			fontWeight: 'bold',
			opacity: selectedTheme.numberOpacity
		});
		const unitText = new fabric.Text(unit, {
			fontFamily: 'SF Compact Text',
			fontSize: 35,
			fill: selectedTheme.unitColor,
			fontWeight: 'bold',
			opacity: selectedTheme.unitOpacity,
			left: numberText.width! + pad / 2
		});

		unitText.top = numberText.top! + numberText.height! - unitText.height! - pad;

		const labelText = new fabric.Text(label, {
			fontFamily: 'SF Compact Text',
			fontSize: 25,
			fontWeight: 100,
			fill: selectedTheme.labelColor,
			opacity: selectedTheme.labelOpacity,
			top: numberText.height,
			left: (numberText.width! + unitText.width!) / 2,
			originX: 'center'
		});

		return new fabric.Group([numberText, unitText, labelText], opts);
	};

	const minSize = formatSize(min);
	const gzipSize = formatSize(gzip);
	const times = getTimeFromSize(gzip);
	const threeGTime = formatTime(times.threeG);
	const fourGTime = formatTime(times.fourG);
	const minGroup = createStatGroup(minSize.size.toFixed(2), minSize.unit, 'minified', {
		originX: 'center',
		top: 106,
		left: width / 4
	});
	const gzipGroup = createStatGroup(gzipSize.size.toFixed(2), gzipSize.unit, 'gzipped', {
		originX: 'center',
		top: 106,
		left: width * (3 / 4)
	});
	const threeGGroup = createStatGroup(
		threeGTime.unit === 'ms' ? threeGTime.size.toString() : threeGTime.size.toFixed(1),
		threeGTime.unit,
		'slow 3G',
		{
			originX: 'center',
			top: 235,
			left: width / 4
		}
	);
	const fourGGroup = createStatGroup(
		fourGTime.unit === 'ms' ? fourGTime.size.toString() : fourGTime.size.toFixed(1),
		fourGTime.unit,
		'emerging 4G',
		{
			originX: 'center',
			top: 235,
			left: width * (3 / 4)
		}
	);

	canvas.add(lineTopHorizontal, lineCenterVertical, lineCenterHorizontal, packageNameGroup, minGroup, gzipGroup, threeGGroup, fourGGroup);
	packageNameGroup.centerH();
	canvas.renderAll();

	return streamToBuffer(canvas.createPNGStream());
};

export const getInfo = async (name: string): Promise<Data> => {
	const data = await fetch<Data>(`https://bundlephobia.com/api/size?package=${name}`, FetchResultTypes.JSON);

	return data;
};

export interface Data {
	name: string;
	version: string;
	size: number;
	gzip: number;
}
