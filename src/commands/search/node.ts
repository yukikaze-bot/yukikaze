import { bold, hideLinkEmbed, hyperlink, underscore } from '@discordjs/builders';
import { Message, MessageEmbed, Permissions, Collection } from 'discord.js';
import { YukikazeCommand } from '@structures/YukikazeCommand';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { NodeDesc, NodeExtended } from '@keys/Search';
import { ApplyOptions } from '@sapphire/decorators';
import type { NodeDocs } from '#types/NodeDocs';
import { Constants } from '@utils/Constants';
import { findRec } from '@utils/findRec';
import { anchor } from '@utils/anchor';
import Turndown from 'turndown';

const cache = new Collection<string, NodeDocs>();
const td = new Turndown({ codeBlockStyle: 'fenced' });

@ApplyOptions<YukikazeCommand.Options>({
	c: 'Search',
	description: NodeDesc,
	extendedHelp: NodeExtended,
	aliases: ['node.js', 'nodejs'],
	delay: 10000,
	limit: 2,
	permissions: Permissions.FLAGS.EMBED_LINKS
})
export class NodeCommand extends YukikazeCommand {
	public async run(message: Message, args: YukikazeCommand.Args) {
		const query = (await args.restResult('string')).value;

		if (!query) {
			return message.error(args.t('missingArgs', { name: 'query' }));
		}

		const url = `${Constants.NODE_URL}/dist/latest-v16.x/docs/api/all.json`;
		let allNodeData = cache.get(url);

		if (!allNodeData) {
			const data = await fetch<NodeDocs>(url, FetchResultTypes.JSON);

			cache.set(url, data);
			allNodeData = data;
		}

		const queryParts = query.split(/#|\.|\s/);
		const altQuery = queryParts[queryParts.length - 1];
		const result =
			findRec(allNodeData, query, 'class') ??
			findRec(allNodeData, query, 'classMethod') ??
			findRec(allNodeData, query, 'method') ??
			findRec(allNodeData, query, 'event') ??
			findRec(allNodeData, altQuery, 'class') ??
			findRec(allNodeData, altQuery, 'method') ??
			findRec(allNodeData, altQuery, 'event') ??
			findRec(allNodeData, altQuery, 'classMethod') ??
			findRec(allNodeData, query, 'module') ??
			findRec(allNodeData, altQuery, 'module');

		if (!result) {
			return message.error(args.t('search:node.noResults'));
		}

		const moduleURL = `${Constants.NODE_URL}/docs/latest-v16.x/api/${result.module}`;
		const fullURL = `${moduleURL}.html${result.type === 'module' ? '' : `#${anchor(result.textRaw, result.module)}`}`;
		const intro = td.turndown(result.desc ?? 'no intro').split('\n\n')[0];
		const parts: string[] = [];
		const linkReplaceRegex = /\[(.+?)\]\((.+?)\)/g;
		const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;

		parts.push(
			intro.replace(linkReplaceRegex, hyperlink('$1', hideLinkEmbed(`${Constants.NODE_URL}/$2`))).replace(boldCodeBlockRegex, bold('`$1`'))
		);

		const embed = new MessageEmbed()
			.setDescription(`${underscore(hyperlink(bold(result.textRaw as string), hideLinkEmbed(fullURL)))}\n${parts.join('\n')}`)
			.setColor('#68A063');

		return message.reply({ embeds: [embed] });
	}
}
