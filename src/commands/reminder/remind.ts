import { MessagePrompter, MessagePrompterStrategies } from '@sapphire/discord.js-utilities';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { RemindDesc, RemindExtended } from '@keys/Reminder';
import type { Message, TextChannel } from 'discord.js';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ApplyOptions } from '@sapphire/decorators';
import duration from 'dayjs/plugin/duration';
import { shorten } from '@utils/shorten';
import { parse } from 'sherlockjs';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);
dayjs.extend(duration);

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Reminder',
	description: RemindDesc,
	extendedHelp: RemindExtended,
	aliases: ['timer', 'remind-me', 'reminder'],
	preconditions: ['GuildOnly']
})
export class RemindCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		let time = (await args.restResult('string')).value;

		if (!time) {
			const handler = new MessagePrompter(args.t('reminder:remind.prompt')!, MessagePrompterStrategies.Message);
			const res = (await handler.run(message.channel as TextChannel, message.author)) as Message;

			time = res.content;
		}

		try {
			const exists = await this.context.client.db.timer.findUnique({ where: { id: `${message.channel.id}-${message.author.id}` } });

			if (exists) return message.reply(args.t('reminder:remind.exists'));

			const parsed = parse(time);

			if (!parsed.startDate) return message.reply(args.t('reminder:remind.invalid'));

			const timeMs = parsed.startDate.getTime() - Date.now();
			const display = dayjs().add(timeMs, 'ms').fromNow();
			const title = parsed.eventTitle ? shorten(parsed.eventTitle, 500) : args.t('something');
			const id = `${message.channel.id}-${message.author.id}`;
			const sec = ~~(timeMs / 1000) + 1;

			await this.context.client.db.timer.create({
				data: {
					id,
					title,
					date: parsed.startDate,
					message: message.id
				}
			});
			await this.context.client.timers.start(id, sec);

			return message.reply({
				content: `Okay, I will be reminding you of **"${title}"** ${display}.`,
				allowedMentions: {
					parse: ['users']
				}
			});
		} catch {
			return message.reply(args.t('reminder:remind.invalid'));
		}
	}
}
