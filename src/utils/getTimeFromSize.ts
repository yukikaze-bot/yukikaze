import { DownloadSpeed } from './Constants';

export const getTimeFromSize = (size: number) => ({
	threeG: size / 1024 / DownloadSpeed.THREE_G,
	fourG: size / 1024 / DownloadSpeed.FOUR_G
});
