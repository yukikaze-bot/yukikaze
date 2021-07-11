import { DeleteRemindDesc, DeleteRemindExtended } from '@keys/Reminder';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Reminder',
	description: DeleteRemindDesc,
	extendedHelp: DeleteRemindExtended,
	aliases: ['del-reminder', 'del-remind', 'dr'],
	preconditions: ['GuildOnly']
})
export class DeleteRemindCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const exists = await this.context.client.db.timer.findUnique({ where: { id: `${message.channel.id}-${message.author.id}` } });
		const id = `${message.channel.id}-${message.author.id}`;

		if (!exists) return message.reply(args.t('reminder:deleteRemind.doesntExist'));

		await this.context.client.db.timer.delete({ where: { id } });
		await this.context.client.timers.stop(id);

		return message.reply(args.t('reminder:deleteRemind.deleted'));
	}
}
