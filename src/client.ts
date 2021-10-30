import path from 'path';
import fs from 'fs';
import { Client, Collection } from 'discord.js';
import { getLogger } from 'log4js';
import { readEnv } from './helpers';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import type { SlashCommandBuilder } from '@discordjs/builders';

import type { BotSlashCommand, BotEvent } from '../types/types';

type CreationParams = {
  token: string;
  clientId: string;
  guildId: string;
};

export class BotClient extends Client {
  private static _instance: BotClient | null = null;

  private static _intents: number[] = [];
  private _token: string = '';
  private _clientId: string = '';
  private _guildId: string = '';

  private commands = new Collection<string, BotSlashCommand>();
  private events = new Collection<string, BotEvent>();
  public logger = getLogger();

  /**
   * Constructs new BotClient object, this class is a singleton and only
   * one instance of this class can exist at once
   * @param params object of type CreationParams
   */
  private constructor(params: CreationParams) {
    super({ intents: BotClient._intents });
    this.logger.info('Creating new BotClient instance');

    ({ token: this._token, clientId: this._clientId, guildId: this._guildId } = params);
    this.loadEvents();
    this.loadSlashCommands();
  }

  /**
   * Loads and registers slash command to discord API
   */
  private async loadSlashCommands() {
    const logger = this.logger;

    //Reading files from slashCommands/*
    const dirName = path.resolve(__dirname, 'slashCommands');
    logger.info(`Scanning for files with slash command in '${dirName}''`);
    const commandFiles = fs.readdirSync(dirName).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    //Resolve each file with slash command
    for (const file of commandFiles) {
      logger.info(`Found slash command file '${file}'`);
      const filePath = path.resolve(dirName, file);

      //Importing file as a module
      const module = await import(filePath);

      logger.info(`Loading command ${JSON.stringify(module.default, null, 2)}`);
      this.commands.set(module.default.data.name, module.default);
    }

    //Construct SlashCommand objects
    const commands: SlashCommandBuilder[] = [];
    this.commands.forEach((command) => {
      commands.push(command.data);
    });

    const rest = new REST({ version: '9' }).setToken(this._token);

    //Register Guild Slash commands
    try {
      logger.info(`Registering following commands for guildId:${this._guildId}\n${JSON.stringify(commands, null, 2)}`);
      await rest.put(Routes.applicationGuildCommands(this._clientId, this._guildId), { body: commands });
      logger.info('Successfully registered guild slash commands.');
    } catch (error) {
      logger.error(`Could not register guild slash comamnds ${error}`);
    }

    //TODO register global slash commands

    //Interaction Handler
    this.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      logger.info(`Dispaching slashcommand '${interaction.commandName} in guild '${interaction.guildId}'`);
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
  }

  private async loadEvents() {
    const logger = this.logger;

    //Reading files from events/*
    const dirName = path.resolve(__dirname, 'events');
    logger.info(`Scanning for files with events in '${dirName}''`);
    const eventFiles = fs.readdirSync(dirName).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
      logger.info(`Found event file '${file}'`);
      const filePath = path.resolve(dirName, file);

      const module = await import(filePath);
      const eventData: BotEvent = module.default;
      const eventName = eventData.name;

      logger.info(`Loading event ${JSON.stringify(eventData, null, 2)}`);

      this.events.set(eventName, eventData);

      if (eventData.once) {
        this.once(eventData.name, (...args) => eventData.run(...args));
      } else {
        this.on(eventData.name, (...args) => eventData.run(...args));
      }
    }
  }

  public override login() {
    return super.login(this._token);
  }

  /**
   * Interface to get BotClient instance and create singleton if it doesn't exists
   * @returns BotClient instance
   */
  public static getClient(): BotClient {
    if (BotClient._instance === null) {
      BotClient._instance = new BotClient(readEnv());

      return BotClient._instance;
    }
    return BotClient._instance;
  }

  /**
   * Setter for BotClient discord api intents
   * @param intents array of intents to be passed to discord API
   */
  public static setIntents(intents: number[]): void {
    BotClient._intents = intents;
  }

  /**
   * Discord token getter
   * @returns discord secret token
   */
  public getToken(): string {
    return this._token;
  }

  public getClientId(): string {
    return this._clientId;
  }

  public getGuildId(): string {
    return this._guildId;
  }
}
