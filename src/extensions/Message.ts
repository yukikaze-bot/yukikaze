import { I18nextImplemented, I18nextMessageImplementation, I18nextChannelImplementation } from '@sapphire/plugin-i18next';
import { errorEmbed, successEmbed, generalEmbed } from '@utils/Embed';
import { Structures } from 'discord.js';
import { v4 } from '@tomiocodes/uuid';

export class Message extends I18nextImplemented(Structures.get('Message') as any) {
	public fetchLanguage(): Promise<string> {
		return this._fetchLanguage(this.guild, this.channel, this.author);
	}

	public error(message: string): Promise<Message> {
		return this.reply({ embeds: [errorEmbed({ description: message })] });
	}

	public success(message: string): Promise<Message> {
		return this.reply({ embeds: [successEmbed({ description: message })] });
	}

	public image(image: Buffer): Promise<Message> {
		const name = `${v4()}.png`;

		return this.reply({ embeds: [generalEmbed({ image: { url: `attachment://${name}` } })], files: [{ attachment: image, name }] });
	}
}

declare module 'discord.js' {
	export interface Message extends I18nextMessageImplementation, I18nextChannelImplementation {
		fetchLanguage(): Promise<string>;
		error(message: string): Promise<Message>;
		success(message: string): Promise<Message>;
		image(image: Buffer): Promise<Message>;
	}
}

Structures.extend('Message', () => Message as any);
