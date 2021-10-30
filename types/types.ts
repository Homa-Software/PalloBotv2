import type { CommandInteraction, Message } from 'discord.js';
import type { SlashCommandBuilder } from '@discordjs/builders';

export type EnvVars = {
  token: string;
  guildId: string;
  clientId: string;
  enableDebug: string;
  mongoUser: string;
  mongoPass: string;
  mongoUrl: string;
};

export type BotSlashCommand = {
  data: SlashCommandBuilder;
  run: (arg0: CommandInteraction) => Promise<void>;
};

export type BotEvent = {
  name: string;
  once: boolean;
  run: <T>(...params: T[]) => Promise<void>;
};

export type BotNoPrefixCommand = {
  name: string;
  run: (arg0: Message) => Promise<void>;
};
