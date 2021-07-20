import { Message, MessageEmbed, Permissions, MessagePayload, TextChannel } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { GithubDesc, GithubExtended } from '@keys/Search';
import { requiresPermissions } from '@utils/Decorators';
import { ApplyOptions } from '@sapphire/decorators';
import type { User, Search } from '#types/Github';

interface Response<T> {
	[key: string]: T;
}

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: GithubDesc,
	extendedHelp: GithubExtended,
	aliases: ['gh'],
	delay: 10000,
	limit: 2,
	subCommands: ['user', 'search'],
	permissions: Permissions.FLAGS.EMBED_LINKS
})
export class GithubCommand extends YukikazeCommand {
	public async user(message: Message, args: YukikazeCommand.Args) {
		const user = (await args.pickResult('string')).value;

		if (!user) {
			return message.error(args.t('missingArgs', { name: 'user' }));
		}

		try {
			const { user: data } = await this.context.client.gh<Response<User>>(
				`
					{
						user(login: "${user}") {
							avatarUrl
    						bio
    						company
    						createdAt
    						email
    						location
    						login
    						name
    						url
    						websiteUrl
							repositories {
								totalCount
							}
							gists {
								totalCount
							}
							followers {
								totalCount
							}
							following {
								totalCount
							}
							issues {
								totalCount
							}
							packages {
								totalCount
							}
							projects {
								totalCount
							}
							pullRequests {
								totalCount
							}
						}
					}
			`
			);
			const embed = new MessageEmbed()
				.setTitle(`${data.login} ${data.name ? `(${data.name})` : ''}`)
				.setThumbnail(data.avatarUrl)
				.setURL(data.url)
				.setFooter('Created at')
				.setTimestamp(data.createdAt)
				.setColor('RANDOM')
				.addField('Repositories', String(data.repositories.totalCount), true)
				.addField('Gists', String(data.gists.totalCount), true)
				.addField('Followers', String(data.followers.totalCount), true)
				.addField('Following', String(data.following.totalCount), true)
				.addField('Issues', String(data.issues.totalCount), true)
				.addField('Packages', String(data.packages.totalCount), true)
				.addField('Projects', String(data.projects.totalCount), true)
				.addField('Pull Requests', String(data.pullRequests.totalCount), true);

			if (data.bio) embed.setDescription(data.bio);
			if (data.company) embed.addField('Company', data.company, true);
			if (data.email) embed.addField('Email', data.email, true);
			if (data.location) embed.addField('Location', data.location, true);

			return message.reply({ embeds: [embed] });
		} catch {
			return message.error(args.t('search:github.user.noResults'));
		}
	}

	@requiresPermissions(Permissions.FLAGS.MANAGE_MESSAGES)
	public async search(message: Message, args: YukikazeCommand.Args) {
		const query = (await args.restResult('string')).value;

		if (!query) {
			return message.error(args.t('missingArgs', { name: 'query' }));
		}

		const { search: data } = await this.context.client.gh<Response<Search>>(`
				{
					search(first: 50, query: "${query}", type: REPOSITORY) {
						nodes {
							... on Repository {
								name
								createdAt
								description
								forks {
							  		totalCount
								}
								isFork
								issues {
							  		totalCount
								}
								licenseInfo {
							  		name
								}
								pullRequests {
							  		totalCount
								}
								url
								stargazerCount
								watchers {
							  		totalCount
								}
								owner {
									avatarUrl
									login
									url
								}
							}
						}
					}
				}
			`);

		if (!data.nodes.length) {
			return message.error(args.t('search:github.search.noResults'));
		}

		return new PaginatedMessage({
			pages: data.nodes.map((node) => (index, pages) => {
				const embed = new MessageEmbed()
					.setTitle(node.name)
					.setURL(node.url)
					.setAuthor(node.owner.login, node.owner.avatarUrl, node.owner.url)
					.setFooter(`Page ${index + 1} / ${pages.length} | Created at`)
					.setTimestamp(node.createdAt)
					.setImage(`https://opengraph.github.com/repo/${node.owner.login}/${node.name}`)
					.addField('Watchers', String(node.watchers.totalCount), true)
					.addField('Pull Requests', String(node.pullRequests.totalCount), true)
					.addField('Issues', String(node.issues.totalCount), true)
					.addField('Stars', String(node.stargazerCount), true)
					.addField('Fork', node.isFork ? 'Yes' : 'No', true)
					.setColor('RANDOM');

				if (node.licenseInfo) embed.addField('License', node.licenseInfo.name, true);
				if (node.description) embed.setDescription(node.description);

				return new MessagePayload(message.channel, { embeds: [embed] });
			})
		}).run(message.author, message.channel as TextChannel);
	}
}
