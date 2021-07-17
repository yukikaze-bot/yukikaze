export interface User {
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
}

export interface Search {
	nodes: {
		name: string;
		createdAt: Date;
		description: string | null;
		forks: {
			totalCount: number;
		};
		isFork: boolean;
		issues: {
			totalCount: number;
		};
		licenseInfo: {
			name: string;
		} | null;
		pullRequests: {
			totalCount: number;
		};
		url: string;
		stargazerCount: number;
		watchers: {
			totalCount: number;
		};
		owner: {
			avatarUrl: string;
			login: string;
			url: string;
		};
	}[];
}
