import type { CommandInteraction } from 'discord.js';
import type { SlashCommandBuilder } from '@discordjs/builders';

export type EnvVars = {
  token: string;
  guildId: string;
  clientId: string;
  enableDebug: string;
};

export type BotSlashCommand = {
  data: SlashCommandBuilder;
  run: (arg0: CommandInteraction) => void;
};
