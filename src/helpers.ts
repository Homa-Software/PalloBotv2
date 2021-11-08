import { config } from 'dotenv';
import { getLogger } from 'log4js';
import { BotClient } from './client';
import type { Message } from 'discord.js';

import type { EnvVars, MessageInfo } from '../types/types';

export const discordPlaceholderAvatar = 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png';

export const readEnv: () => EnvVars = () => {
  config();
  const logger = getLogger();
  const clientId = process.env.CLIENT_ID ?? '';
  const guildId = process.env.GUILD_ID ?? '';
  const token = process.env.DISCORD_TOKEN ?? '';
  const enableDebug = process.env.ENABLE_DEBUG ?? 'false';
  const mongoUser = process.env.MONGODB_USER ?? '';
  const mongoPass = process.env.MONGODB_PASS ?? '';
  const mongoUrl = process.env.MONGODB_URL ?? '';

  const all: EnvVars = {
    token,
    guildId,
    clientId,
    enableDebug,
    mongoUser,
    mongoPass,
    mongoUrl,
  };

  Object.entries(all).forEach(([key, value]: [string, string]) => {
    if (!value) {
      logger.fatal(`${key.toUpperCase()} is not specified in enviroment exitting`);
      process.exit(-1);
    }
  });
  return all;
};

export const retriveMessageInfo = (message: Message): MessageInfo => {
  const client = BotClient.getClient();

  const userId = message.author.id;
  const { channelId } = message;

  const isBot = message.author.bot;

  const guildId = message.guildId ? message.guildId : undefined;

  const isOwnMessage = userId === (client.user?.id ?? '');
  const isDirectMessage = message.guildId === null;
  const isGuildMessage = message.guildId === null;

  const channelName = guildId ? client.guilds.cache.get(guildId)?.channels.cache.get(channelId)?.name : undefined;

  const userName = client.users.cache.get(userId)?.username ?? '';
  const guildName = guildId ? client.guilds.cache.get(guildId)?.name : undefined;

  return {
    isOwnMessage,
    isBot,
    isDirectMessage,
    isGuildMessage,
    userId,
    channelId,
    channelName,
    userName,
    guildName,
    guildId,
  };
};

export const setThrottle = (delay: number, fn: Function): Function => {
  const logger = getLogger();
  let lastCall = 0;
  const wrapperFunc = (...args: unknown[]) => {
    const now = new Date().getTime();
    logger.debug(`Now: ${now} lastcall: ${lastCall}`);
    logger.debug(now - lastCall);
    if (now - lastCall < delay) {
      logger.info(`Throttling function call ${fn.name}`);
      return;
    }
    logger.info(`Executing function call ${fn.name}`);
    lastCall = now;
    return fn(...args);
  };

  return wrapperFunc;
};
