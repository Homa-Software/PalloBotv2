import log4js from 'log4js';
import { Client, Intents } from 'discord.js';

import { BotClient } from './client';
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
const bot_intents = [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS];
BotClient.setIntents(bot_intents);

const client = BotClient.getClient();
client.login();
