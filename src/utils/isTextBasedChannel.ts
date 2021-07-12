import type { Channel } from 'discord.js';

export const isTextBasedChannel = (channel: Channel) => channel.type === 'GUILD_STORE' || channel.type === 'GUILD_NEWS';
