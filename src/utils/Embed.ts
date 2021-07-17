import { MessageEmbed, MessageEmbedOptions } from 'discord.js';

type CustomEmbed = Partial<Omit<MessageEmbedOptions, 'color'>> | MessageEmbed;

export const successEmbed = (embed: CustomEmbed): MessageEmbed => new MessageEmbed(embed).setColor('#90EE90');
export const errorEmbed = (embed: CustomEmbed): MessageEmbed => new MessageEmbed(embed).setColor('#DC143C');
export const generalEmbed = (embed: CustomEmbed): MessageEmbed => new MessageEmbed(embed).setColor('#5865f2');
