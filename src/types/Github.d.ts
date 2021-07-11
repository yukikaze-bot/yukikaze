export interface User {
	user: {
		avatarUrl: string;
		bio: string | null;
		company: string | null;
		createdAt: Date;
		email: string | null;
		location: string | null;
		login: string;
		name: string | null;
		url: string;
		websiteUrl: string | null;
		repositories: {
			totalCount: number;
		};
		gists: {
			totalCount: number;
		};
		followers: {
			totalCount: number;
		};
		following: {
			totalCount: number;
		};
		issues: {
			totalCount: number;
		};
		packages: {
			totalCount: number;
		};
		projects: {
			totalCount: number;
		};
		pullRequests: {
			totalCount: number;
		};
	};
}
