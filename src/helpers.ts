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

  const all: EnvVars = {
    token,
    guildId,
    clientId,
    enableDebug,
  };

  Object.entries(all).forEach(([key, value]: [string, string]) => {
    if (!value) {
      logger.fatal(`${key.toUpperCase()} is not specified in enviroment exitting`);
      process.exit(-1);
    }
  });
  return all;
};
