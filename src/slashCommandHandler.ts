import fs from 'fs';
import path from 'path';
import { getLogger } from 'log4js';
import type { Client } from 'discord.js';

import type { BotSlashCommand } from '../types/types';

const slashCommandStore: BotSlashCommand[] = [];

export const loadSlashCommands = async (client: Client) => {
  const logger = getLogger();

  const dirName = path.resolve(__dirname, 'slashCommands');
  logger.info(`Scanning for files with slash command in '${dirName}''`);
  const commandFiles = fs.readdirSync(dirName).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of commandFiles) {
    logger.info(`Found slash command file '${file}'`);
    const filePath = path.resolve(dirName, file);
    const module = await import(filePath);

    logger.info(`Loading command ${JSON.stringify(module.default)}`);
    slashCommandStore.push(module.default);
  }
};

export const getSlashCommands: () => BotSlashCommand[] = () => slashCommandStore;
