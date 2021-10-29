import log4js from 'log4js';
import { Client, Intents } from 'discord.js';
import type { Message } from 'discord.js';

import { registerCommands } from './pong';
import { readEnv } from './helpers';

//Read env variables from .env
export const { token, guildId, clientId, enableDebug } = readEnv();

//Configure logger
const loggerConfiguration = {
  appenders: {
    out: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '[%[%p%]]%[ %d{dd/MM/yyy hh:mm:ss} (%f{2})%] %m%n',
      },
    },
  },
  categories: { default: { appenders: ['out'], level: 'warning', enableCallStack: true } },
};
if (enableDebug === 'true') loggerConfiguration.categories.default.level = 'trace';
log4js.configure(loggerConfiguration);
const logger = log4js.getLogger();
logger.level = process.env.LOGGER_LEVEL ?? 'warning';
logger.info('testing');

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

registerCommands(readEnv());
client.login(token);