declare module 'sherlockjs' {
	export const parse: (phrase: string) => {
		eventTitle: string | null;
		startDate: Date | null;
		endDate: Date | null;
		isAllDay: boolean;
		validated: boolean;
	};
}
