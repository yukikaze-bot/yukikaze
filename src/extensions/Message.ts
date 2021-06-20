import { I18nextImplemented, I18nextMessageImplementation, I18nextChannelImplementation } from '@sapphire/plugin-i18next';
import { Structures } from 'discord.js';

export class Message extends I18nextImplemented(Structures.get('Message') as any) {
	public fetchLanguage(): Promise<string> {
		return this._fetchLanguage(this.guild, this.channel, this.author);
	}
}

declare module 'discord.js' {
	export interface Message extends I18nextMessageImplementation, I18nextChannelImplementation {
		fetchLanguage(): Promise<string>;
	}
}

Structures.extend('Message', () => Message as any);
