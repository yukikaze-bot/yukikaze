import '@sapphire/plugin-i18next/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import '@skyra/editable-commands';
import 'reflect-metadata';
import './extensions';

import { YukikazeClient } from '@structures/YukikazeClient';
import dotenv from 'dotenv-flow';

dotenv.config();

const client = new YukikazeClient();

client.login();
