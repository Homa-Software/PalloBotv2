import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

import type { BotSlashCommand } from '../../../types/types';
import { BotClient } from '../../client';

const distubePlayEventHandler = async (interaction: CommandInteraction) => {
  const distube = BotClient.initializeDistube();
  try {
    console.log(interaction);
  } catch (e) {
    await interaction.reply(`Nie udało się odtworzyć muzyki gdyż ${e}`);
  }
};

const distubePlayCommand: BotSlashCommand<Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>> = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Komenda odtworzy muzyke')
    .addStringOption((option) =>
      option.setName('Podaj nazwę piosenki').setDescription('Nazwa piosenki do odtworzenia').setRequired(true),
    ),
  run: distubePlayEventHandler,
};

export default distubePlayCommand;
