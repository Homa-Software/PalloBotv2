import type { CommandInteraction, Message, ClientEvents } from 'discord.js';
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
  name: keyof ClientEvents;
  once: boolean;
  run: Function;
};

export type BotNoPrefixCommand = {
  name: string;
  run: (arg0: Message) => Promise<void>;
};

export interface MessageInfo {
  isOwnMessage: boolean;
  isBot: boolean;
  isDirectMessage: boolean;
  isGuildMessage: boolean;
  userId: string;
  channelId: string;
  channelName?: string;
  userName: string;
  guildName?: string;
  guildId?: string;
}
