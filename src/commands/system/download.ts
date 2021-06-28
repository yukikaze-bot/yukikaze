import { YukikazeCommand } from '@structures/YukikazeCommand';
import { DownloadDesc, DownloadExtended } from '@keys/System';
import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed, Message } from 'discord.js';
import { Constants } from '@utils/Constants';

@ApplyOptions<YukikazeCommand.Options>({
	c: 'System',
	description: DownloadDesc,
	extendedHelp: DownloadExtended,
	aliases: ['app']
})
export class DownloadCommand extends YukikazeCommand {
	public run(message: Message, args: YukikazeCommand.Args) {
		const embed = new MessageEmbed()
			.setDescription(args.t('system:download.embed.description', { link: Constants.DOWNLOAD_URL }))
			.setFooter(args.t('system:download.embed.footer', { link: Constants.TAURI_URL }))
			.setThumbnail(this.context.client.user!.displayAvatarURL())
			.setColor('RANDOM');

		return message.reply({ embeds: [embed] });
	}
}
