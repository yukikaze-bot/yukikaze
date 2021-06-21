import { Cooldown, Permissions, DMOnly, GuildOnly, NSFW } from '@keys/Preconditions';
import { Identifiers } from '@sapphire/framework';

export const translate = (identifier: string) => {
	switch (identifier) {
		case Identifiers.PreconditionCooldown:
			return Cooldown;
		case Identifiers.PreconditionPermissions:
			return Permissions;
		case Identifiers.PreconditionDMOnly:
			return DMOnly;
		case Identifiers.PreconditionGuildOnly:
			return GuildOnly;
		case Identifiers.PreconditionNSFW:
			return NSFW;
		default:
			return identifier;
	}
};
