import { fetch, FetchResultTypes } from '@sapphire/fetch';
import imageRule from 'metascraper-image';
import type { Message } from 'discord.js';
import metascraper from 'metascraper';
import isImage from 'valid-image-url';

const scraper = metascraper([imageRule()]);
const urlRe = /(https?):\/\/([\w-]+(\.[\\w-]+)*\.([a-z]+))(([\w.,@?^=%&amp;:\/~+#()!-]*)([\w@?^=%&amp;\/~+#()!-]))?/gi;
const re = /\.(jpe?g|png|gif|jfif|bmp)$/i;

export const getAttachment = async (message: Message): Promise<string | null> => {
	const attachment = message.attachments.first();
	const matched = message.content.match(urlRe);

	if (matched) {
		const html = await fetch(matched[0], FetchResultTypes.Text);
		const { image } = await scraper({ html, url: matched[0] });
		const valid = await isImage(image);

		if (valid) return image;

		const url = await isImage(matched[0]);

		if (url) return matched[0];
	}

	if (message.reference) {
		const msg = await message.fetchReference();
		const attach = msg.attachments.first();

		if (attach && re.test(attach.url)) return attach.url;
	}

	if (attachment && re.test(attachment.url)) return attachment.url;

	return null;
};
