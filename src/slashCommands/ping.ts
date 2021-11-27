import { SlashCommandBuilder } from '@discordjs/builders';
import type { BotSlashCommand } from '../../types/types';

const ping: BotSlashCommand<SlashCommandBuilder> = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
  run: async function (interaction) {
    await interaction.reply('Pong!');
  },
};

export default ping;
