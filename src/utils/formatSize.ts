export const formatSize = (value: number) => {
	let unit: string;
	let size: number;

	if (Math.log10(value) < 3) {
		unit = 'B';
		size = value;
	} else if (Math.log10(value) < 6) {
		unit = 'kB';
		size = value / 1024;
	} else {
		unit = 'MB';
		size = value / 1024 / 1024;
	}

	return { unit, size };
};
