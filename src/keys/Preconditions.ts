import { FT, T } from '#types/i18n';

export const Cooldown = FT<{ remaining: number }, string>('preconditions:cooldown');
export const DMOnly = T<string>('preconditions:dmOnly');
export const GuildOnly = T<string>('preconditions:guildOnly');
export const NSFW = T<string>('preconditions:nsfw');
export const Permissions = FT<{ missing: string[] }, string>('preconditions:permissions');
