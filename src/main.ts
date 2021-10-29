import log4js from 'log4js';
import dotenv from 'dotenv';
import { Client, Intents } from 'discord.js';
import type { Message } from 'discord.js';

import { registerCommands } from './pong';

//Read env variables from .env
dotenv.config();

//Configure logger
export const logger = log4js.getLogger('BotLogger');
logger.level = process.env.LOGGER_LEVEL ?? 'warning';

//Discord client setup
const bot_intents = [
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
];

export const client = new Client({
  intents: bot_intents,
});

client.once('ready', () => logger.info('Bot is online'));
client.on('messageCreate', (msg: Message) => logger.trace(`MessageCreated: ${JSON.stringify(msg.toJSON())}`));

//Reading enviroment variables
export const clientId = process.env.CLIENT_ID ?? '';
export const guildId = process.env.GUILD_ID ?? '';
export const token = process.env.DISCORD_TOKEN ?? '';

Object.entries({ token, guildId, clientId }).forEach(([key, value]: [string, string]) => {
  if (!value) {
    logger.fatal(`${key.toUpperCase()} is not specified in enviroment exitting`);
    process.exit(-1);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong!');
  } else if (commandName === 'server') {
    await interaction.reply('Server info.');
  } else if (commandName === 'user') {
    await interaction.reply('User info.');
  }
});

registerCommands(token);
client.login(token);
