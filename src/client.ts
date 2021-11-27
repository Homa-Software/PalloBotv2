import path, { join } from 'path';
import fs, { statSync, readdirSync } from 'fs';
import { Client, Collection, Intents } from 'discord.js';
import { getLogger } from 'log4js';
import { readEnv } from './helpers';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import db from 'mongoose';
import type { SlashCommandBuilder } from '@discordjs/builders';
import { DisTube } from 'distube';

import type { BotSlashCommand, BotEvent, BotNoPrefixCommand } from '../types/types';
import { reportError } from './errorHandler/sentry';

type CreationParams = {
  token: string;
  clientId: string;
  guildId: string;
};

const isDirectory = (path: string) => statSync(path).isDirectory();
const getDirectories = (path: string) =>
  readdirSync(path)
    .map((name) => join(path, name))
    .filter(isDirectory);

const isFile = (path: string) => statSync(path).isFile();
const getFiles = (path: string) =>
  readdirSync(path)
    .map((name) => join(path, name))
    .filter(isFile);

const getFilesRecursively = (path: string): string[] => {
  const dirs = getDirectories(path);
  const files = dirs.flatMap((dir) => getFilesRecursively(dir)); // go through each directory   // map returns a 2d array (array of file arrays) so flatten
  return files.concat(getFiles(path));
};

const getCommandFiles = (directory: string): string[] => {
  return fs.readdirSync(directory).flatMap((file) => {
    const absolutePath = path.join(directory, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      return getCommandFiles(absolutePath);
    }
    return file;
  });
};

const getFilePathForModules = (dirName: string, file: string) => {
  if (fs.statSync(`${dirName}/${file}`).isFile()) {
    return path.resolve(dirName, file);
  }
  return file;
};

/**
 * Loads default export from all .js .ts files in given directory as a given generic type
 * @param dirname Directory name from which to load module data
 * @returns  Promise of given generic type
 */
const loadDataFromModules = async <T>(dirname: string): Promise<T[]> => {
  const logger = getLogger();
  const dirName = path.join('./', dirname);
  logger.info(`Loading modules from directory '${path.relative(path.resolve(__dirname, '..'), dirName)}'`);
  const commandFiles = getFilesRecursively(dirname).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
  const data: T[] = [];
  for (const file of commandFiles) {
    const filePath = getFilePathForModules(dirName, file);
    //Logger helpers
    const pathOfModule = path.relative(path.resolve(__dirname, '..'), filePath);
    //Importing file as a module
    const module = await import(filePath);
    //Sanity check if module defines default attribute
    if (Object.keys(module.default).length === 0) {
      logger.error(`Module '${pathOfModule}' could not be loaded beacause it does not define default export'`);
      continue;
    }
    const moduleData: T = module.default;
    logger.info(`Loaded following data from module '${pathOfModule}' \n ${JSON.stringify(moduleData, null, 2)}`);
    data.push(module.default);
  }

  return data;
};

export class BotClient extends Client {
  public logger = getLogger();

  private static _instance: BotClient | null = null;

  private static _intents: number[] = [];
  private _token: string = '';
  private _clientId: string = '';
  private _guildId: string = '';

  public readonly commands = new Collection<string, BotSlashCommand<SlashCommandBuilder>>();
  private events = new Collection<string, BotEvent>();
  private noPrefixCommands = new Collection<string, BotNoPrefixCommand>();

  /**
   * Constructs new BotClient object, this class is a singleton and only
   * one instance of this class can exist at once
   * @param params object of type CreationParams
   */
  private constructor(params: CreationParams) {
    super({ intents: BotClient._intents });
    this.logger.info('Creating new BotClient instance');

    ({ token: this._token, clientId: this._clientId, guildId: this._guildId } = params);

    this.initializeMongo().then(() => {
      this.loadEvents();
      this.loadSlashCommands();
      this.loadNoPrefixCommands();
    });
    BotClient.setIntents([Intents.FLAGS.GUILD_VOICE_STATES]);
  }

  static initializeDistube() {
    const distube = new DisTube(BotClient.getClient());
    distube.on('error', (_, error) => {
      reportError(error);
    });
    return distube;
  }

  private async initializeMongo() {
    const logger = this.logger;

    const { mongoPass, mongoUrl, mongoUser } = readEnv();

    try {
      logger.warn('Connecting to database');
      await db.connect(mongoUrl, {
        user: mongoUser,
        pass: mongoPass,
      });
      logger.warn('Database connection successful');
    } catch (error) {
      logger.fatal('Database connection failed!', error);
      process.exit(-1);
    }
  }

  /**
   * Loads and registers slash command to discord API
   */
  private async loadSlashCommands() {
    const logger = this.logger;

    logger.info(`Loading SlashCommands`);

    const commandsData: BotSlashCommand<SlashCommandBuilder>[] = await loadDataFromModules('slashCommands');
    const commands: SlashCommandBuilder[] = [];
    for (const command of commandsData) {
      logger.info(`Registering command '${command.data.name}'`);
      this.commands.set(command.data.name, command);
      commands.push(command.data);
    }

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

      logger.info(`Dispaching slashcommand '${interaction.commandName}' in guild '${interaction.guildId}'`);
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

  /**
   * Loads and register event handlers
   */
  private async loadEvents() {
    const logger = this.logger;
    logger.info(`Loading events`);

    const eventData: BotEvent[] = await loadDataFromModules('events');
    for (const event of eventData) {
      logger.info(`Loading event '${event.name}'`);
      this.events.set(event.name, event);

      if (event.once) {
        this.once(event.name, async (...args) => event.run(...args));
      } else {
        this.on(event.name, async (...args) => event.run(...args));
      }
    }
  }

  private async loadNoPrefixCommands() {
    const logger = this.logger;
    logger.info(`Loading no prefix commands`);

    const commandsData: BotNoPrefixCommand[] = await loadDataFromModules('noPrefixCommands');

    for (const command of commandsData) {
      this.noPrefixCommands.set(command.name, command);
    }

    this.on('messageCreate', async (message) => {
      const content = message.content.toLowerCase();
      this.noPrefixCommands.forEach(({ name, run }) => {
        if (content.includes(name.toLowerCase())) {
          logger.info(`Executing no prefix command '${name}' in guild '${message.guildId}'`);
          run(message);
        }
      });
    });
  }

  /**
   * Logins application to discord API
   * @returns Promise<string> discord secret token
   */
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

  /**
   * Client id getter
   * @returns client id
   */
  public getClientId(): string {
    return this._clientId;
  }

  /**
   * Guild id getter
   * @returns guild id
   */
  public getGuildId(): string {
    return this._guildId;
  }
}
