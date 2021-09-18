export const formatTime = (value: number) => {
	let unit: string;
	let size: number;

	if (value < 0.0005) {
		unit = 'μs';
		size = Math.round(value * 1000000);
	} else if (value < 0.5) {
		unit = 'ms';
		size = Math.round(value * 1000);
	} else {
		unit = 's';
		size = value;
	}

	return { unit, size };
};
