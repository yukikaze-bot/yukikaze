import { YukikazeCommand } from '@structures/YukikazeCommand';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';
import { TagDesc, TagExtended } from '@keys/Tags';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Tags',
	description: TagDesc,
	extendedHelp: TagExtended,
	aliases: ['t'],
	preconditions: ['GuildOnly'],
	subCommands: [
		'show',
		'create',
		'del',
		'edit',
		'info',
		'list',
		{ input: 'show', default: true },
		{ input: 'add', output: 'create' },
		{ input: 'delete', output: 'del' },
		{ input: 'modify', output: 'edit' }
	]
})
export class TagCommand extends YukikazeCommand {
	public async show(message: Message, args: YukikazeCommand.Args) {
		const name = (await args.restResult('string')).value;

		if (!name) return message.error(args.t('missingArgs', { name: 'name' }));

		const data = await this.context.client.db.tag.findUnique({
			where: {
				name_guildID: {
					name,
					guildID: message.guild?.id!
				}
			}
		});

		if (!data) return message.error(args.t('tags:doesntExist'));

		return message.reply({
			content: data.content,
			allowedMentions: {
				parse: []
			}
		});
	}

	public async create(message: Message, args: YukikazeCommand.Args) {
		const name = (await args.pickResult('string')).value;
		const content = (await args.restResult('string')).value;

		if (!name) return message.error(args.t('missingArgs', { name: 'name' }));
		if (!content) return message.error(args.t('missingArgs', { name: 'content' }));

		const exists = await this.context.client.db.tag.findUnique({
			where: {
				name_guildID: {
					name,
					guildID: message.guild?.id!
				}
			}
		});

		if (exists) return message.error(args.t('tags:alreadyExists'));

		await this.context.client.db.tag.create({
			data: {
				guildID: message.guild?.id!,
				ownerID: message.author.id,
				ownerName: message.author.tag,
				content,
				name
			}
		});

		return message.success(args.t('tags:create.success', { name }));
	}

	public async del(message: Message, args: YukikazeCommand.Args) {
		const name = (await args.restResult('string')).value;

		if (!name) return message.error(args.t('missingArgs', { name: 'name' }));

		const data = await this.context.client.db.tag.findUnique({ where: { name_guildID: { name, guildID: message.guild?.id! } } });

		if (!data) return message.error(args.t('tags:doesntExist'));

		const owner = await this.context.client.users.fetch(data.ownerID as `${bigint}`);

		if (message.author.id !== owner.id) return message.error(args.t('tags:del.perms'));

		await this.context.client.db.tag.delete({ where: { name_guildID: { name, guildID: message.guild?.id! } } });

		return message.success(args.t('tags:del.success', { name }));
	}

	public async edit(message: Message, args: YukikazeCommand.Args) {
		const name = (await args.pickResult('string')).value;
		const content = (await args.restResult('string')).value;

		if (!name) return message.error(args.t('missingArgs', { name: 'name' }));
		if (!content) return message.error(args.t('missingArgs', { name: 'content' }));

		const data = await this.context.client.db.tag.findUnique({
			where: {
				name_guildID: {
					name,
					guildID: message.guild?.id!
				}
			}
		});

		if (!data) return message.error(args.t('tags:doesntExist'));

		const owner = await this.context.client.users.fetch(data.ownerID as `${bigint}`);

		if (message.author.id !== owner.id) return message.error(args.t('tags:edit.perms'));

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

		return message.success(args.t('tags:edit.success', { name, content }));
	}

	public async info(message: Message, args: YukikazeCommand.Args) {
		const name = (await args.restResult('string')).value;

		if (!name) return message.error(args.t('missingArgs', { name: 'name' }));

		const data = await this.context.client.db.tag.findUnique({ where: { name_guildID: { name, guildID: message.guild?.id! } } });

		if (!data) return message.error(args.t('tags:doesntExist'));

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
		const tags = await this.context.client.db.tag.findMany({ where: { guildID: message.guild!.id } });
		let content = '';

		for (const tag of tags) {
			const user = await this.context.client.users.fetch(tag.ownerID as `${bigint}`);

			content += `**\`${tag.name}\`** - \`${user.tag}\`\n`;
		}

		message.reply(`Tags for __**${message.guild?.name}**__\n\n${content || args.t('tags:noTags')}`);
	}
}
