import { yellowBright, greenBright } from 'colorette';
import { prompt } from '@yukikaze-bot/prompt';
import { stripIndents } from 'common-tags';
import { writeFile } from 'fs/promises';

const baseDir = new URL('../.env', import.meta.url);

console.log(greenBright('Yukikaze Bot Setup'));

const token = prompt(yellowBright('What is the bot token?'), { hide: true });
const db = prompt(yellowBright('What is the postgres db url?'));
const secret = prompt(yellowBright('What is the client secret?'), { hide: true });
const port = prompt(yellowBright('What is the port?'));
const env = stripIndents`
    # The environment variables for the yukikaze bot!
    DISCORD_TOKEN="${token}"
    DATABASE_URL="${db}"
    CLIENT_SECRET="${secret}"
	PORT="${port}"
	\n
`;

await writeFile(baseDir, env);

console.log(greenBright('Setup Complete!'));
