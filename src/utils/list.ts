export const list = <T extends string>(arr: T[], conj = 'and'): string => {
	const len = arr.length;

	if (len === 1) return arr[0];

	return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ', ' : ''}${conj} ` : ''}${arr.slice(-1)}`;
};
