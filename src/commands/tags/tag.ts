import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { Message, MessageEmbed, TextChannel, Permissions } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { TagDesc, TagExtended } from '@keys/Tags';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Tags',
	description: TagDesc,
	extendedHelp: TagExtended,
	aliases: ['t'],
	preconditions: ['GuildOnly'],
	subCommands: ['show', 'create', 'del', 'edit', 'info', 'list']
})
export class TagCommand extends YukikazeCommand {
	public async show(message: Message, args: YukikazeCommand.Args) {
		let name = (await args.restResult('string')).value;

		if (!name) {
			const handler = new MessagePrompter(args.t('tags:prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			name = res.content;
		}

		const data = await this.context.client.db.tag.findUnique({
			where: {
				name_guildID: {
					name,
					guildID: message.guild?.id!
				}
			}
		});

		if (!data) return message.reply(args.t('tags:doesntExist'));

		return message.reply({
			content: data.content,
			allowedMentions: {
				parse: []
			}
		});
	}

	public async create(message: Message, args: YukikazeCommand.Args) {
		let name = (await args.pickResult('string')).value;
		let content = (await args.restResult('string')).value;

		if (!name) {
			const handler = new MessagePrompter(args.t('tags:create.prompt.name')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			name = res.content;
		}

		if (!content) {
			const handler = new MessagePrompter(args.t('tags:create.prompt.content')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			content = res.content;
		}

		const exists = await this.context.client.db.tag.findUnique({
			where: {
				name_guildID: {
					name,
					guildID: message.guild?.id!
				}
			}
		});

		if (exists) return message.reply(args.t('tags:alreadyExists'));

		await this.context.client.db.tag.create({
			data: {
				guildID: message.guild?.id!,
				ownerID: message.author.id,
				ownerName: message.author.tag,
				content,
				name
			}
		});

		return message.reply(args.t('tags:create.success', { name }));
	}

	public async del(message: Message, args: YukikazeCommand.Args) {
		let name = (await args.restResult('string')).value;

		if (!name) {
			const handler = new MessagePrompter(args.t('tags:del.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			name = res.content;
		}

		const data = await this.context.client.db.tag.findUnique({ where: { name_guildID: { name, guildID: message.guild?.id! } } });

		if (!data) return message.reply(args.t('tags:doesntExist'));
		if (
			!(message.channel as TextChannel).permissionsFor(message.member!).has(Permissions.FLAGS.MANAGE_MESSAGES) ||
			message.author.id !== data.ownerID
		)
			return message.reply(args.t('tags:del.perms'));

		await this.context.client.db.tag.delete({ where: { name_guildID: { name, guildID: message.guild?.id! } } });

		return message.reply(args.t('tags:del.success', { name }));
	}

	public async edit(message: Message, args: YukikazeCommand.Args) {
		let name = (await args.pickResult('string')).value;
		let content = (await args.restResult('string')).value;

		if (!name) {
			const handler = new MessagePrompter(args.t('tags:edit.prompt.name')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			name = res.content;
		}

		if (!content) {
			const handler = new MessagePrompter(args.t('tags:edit.prompt.content')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			content = res.content;
		}

		const data = await this.context.client.db.tag.findUnique({
			where: {
				name_guildID: {
					name,
					guildID: message.guild?.id!
				}
			}
		});

		if (!data) return message.reply(args.t('tags:doesntExist'));
		if (
			!(message.channel as TextChannel).permissionsFor(message.member!).has(Permissions.FLAGS.MANAGE_MESSAGES) ||
			message.author.id !== data.ownerID
		)
			return message.reply(args.t('tags:edit.perms'));

		await this.context.client.db.tag.update({
			where: {
				name_guildID: {
					name,
					guildID: message.guild?.id!
				}
			},
			data: {
				content
			}
		});

		return message.reply(args.t('tags:edit.success', { name, content }));
	}

	public async info(message: Message, args: YukikazeCommand.Args) {
		let name = (await args.restResult('string')).value;

		if (!name) {
			const handler = new MessagePrompter(args.t('tags:info')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel, message.author)) as Message;

			name = res.content;
		}

		const data = await this.context.client.db.tag.findUnique({ where: { name_guildID: { name, guildID: message.guild?.id! } } });

		if (!data) return message.reply(args.t('tags:doesntExist'));

		const owner = await this.context.client.users.fetch(data.ownerID as `${bigint}`);
		const embed = new MessageEmbed()
			.setTitle(`**Tag __${data.name}__**`)
			.setThumbnail(owner.displayAvatarURL({ dynamic: true }))
			.setDescription(data.content)
			.setTimestamp(data.createdAt)
			.setColor('RANDOM');

		return message.reply({ embeds: [embed] });
	}

	public async list(message: Message, args: YukikazeCommand.Args) {
		const tags = await this.context.client.db.tag.findMany();
		let content = '';

		for (const tag of tags) {
			const user = await this.context.client.users.fetch(tag.ownerID as `${bigint}`);

			content += `**\`${tag.name}\`** - \`${user.tag}\`\n`;
		}

		message.reply(`Tags for __**${message.guild?.name}**__\n\n${content || args.t('tags:noTags')}`);
	}
}
