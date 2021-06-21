import type { DMChannel, Message, GuildMember, Guild, TextChannel, NewsChannel } from 'discord.js';

export interface GuildMessage extends Message {
	readonly guild: Guild;
	readonly member: GuildMember;
	channel: TextChannel | NewsChannel;
}
