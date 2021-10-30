import fs from 'fs';
import path from 'path';
import { getLogger } from 'log4js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import type { Client } from 'discord.js';
import type { SlashCommandBuilder } from '@discordjs/builders';

import { readEnv } from './helpers';
import type { BotSlashCommand } from '../types/types';

const slashCommandStore: BotSlashCommand[] = [];

const registerCommands = async () => {
  const logger = getLogger();
  const { token, clientId, guildId } = readEnv();

  const commands: SlashCommandBuilder[] = [];
  slashCommandStore.forEach((command) => {
    commands.push(command.data);
  });

  const rest = new REST({ version: '9' }).setToken(token);

  //Register Guild Slash commands
  try {
    logger.info(`Registering following commands for guildId:${guildId}\n${JSON.stringify(commands, null, 2)}`);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    logger.info('Successfully registered guild slash commands.');
  } catch (error) {
    logger.error(`Could not register guild slash comamnds ${error}`);
  }

  //TODO register global slash commands
};

export const loadSlashCommands = async (client: Client) => {
  const logger = getLogger();

  //reading files from slashCommands/*
  const dirName = path.resolve(__dirname, 'slashCommands');
  logger.info(`Scanning for files with slash command in '${dirName}''`);
  const commandFiles = fs.readdirSync(dirName).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of commandFiles) {
    logger.info(`Found slash command file '${file}'`);
    const filePath = path.resolve(dirName, file);

    //Importing file as a module
    const module = await import(filePath);

    logger.info(`Loading command ${JSON.stringify(module.default, null, 2)}`);
    slashCommandStore.push(module.default);
  }

  await registerCommands();

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = slashCommandStore.find((command) => command.data.name === interaction.commandName);
    if (!command) return;

    try {
      await command.run(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `There was an error while executing  command '${command.data.name}'`,
        ephemeral: true,
      });
    }
  });
};

export const getSlashCommands: () => BotSlashCommand[] = () => slashCommandStore;
