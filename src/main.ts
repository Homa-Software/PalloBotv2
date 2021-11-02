import log4js from 'log4js';
import { Intents } from 'discord.js';

import { BotClient } from './client';
import { readEnv } from './helpers';
import { genearteActivityOverviewForUser } from './activity';

//Read env variables from .env
const { enableDebug, mongoPass, mongoUrl, mongoUser } = readEnv();

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

//Discord client setup
const bot_intents = [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES];
BotClient.setIntents(bot_intents);

const client = BotClient.getClient();
client.login();

genearteActivityOverviewForUser('', '');
