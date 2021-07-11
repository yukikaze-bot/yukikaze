import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { GithubDesc, GithubExtended } from '@keys/Search';
import { ApplyOptions } from '@sapphire/decorators';
import type { User } from '#types/Github';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: GithubDesc,
	extendedHelp: GithubExtended,
	aliases: ['gh'],
	delay: 10000,
	limit: 2,
	subCommands: ['user'],
	permissions: Permissions.FLAGS.EMBED_LINKS
})
export class GithubCommand extends YukikazeCommand {
	public async user(message: Message, args: YukikazeCommand.Args) {
		let user = (await args.pickResult('string')).value;

		message.channel.startTyping();

		if (!user) {
			const handler = new MessagePrompter(args.t('search:github.user.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel as TextChannel, message.author)) as Message;

			user = res.content;
		}

		try {
			const { user: data } = await this.context.client.gh<User>(
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
			console.log(data);

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

			message.channel.stopTyping();
			return message.reply({ embeds: [embed] });
		} catch (e) {
			console.error(e);

			message.channel.stopTyping();
			return message.reply(args.t('search:github.user.noResults'));
		}
	}
}
