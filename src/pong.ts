import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { getLogger } from 'log4js';

import type { EnvVars } from '../types/types';

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
  new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
].map((command) => command.toJSON());

export const registerCommands = async ({ token, clientId, guildId }: EnvVars) => {
  const logger = getLogger();

  const rest = new REST({ version: '9' }).setToken(token);
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    logger.info('Successfully registered application commands.');
  } catch (error) {
    logger.error(`Could not register slash comamnds ${error}`);
  }
};
