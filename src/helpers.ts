import { config } from 'dotenv';
import { getLogger } from 'log4js';

import type { EnvVars } from '../types/types';

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
