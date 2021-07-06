import type { Guild } from 'discord.js';

export interface FlattenedGuild {
	id: `${bigint}`;
	icon: string | null;
	name: string;
}

export const flattenGuild = (guild: Guild): FlattenedGuild => ({
	id: guild.id,
	icon: guild.iconURL({ size: 512, format: 'png' }),
	name: guild.name
});
