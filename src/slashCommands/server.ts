import { SlashCommandBuilder } from '@discordjs/builders';
import type { BotSlashCommand } from '../../types/types';

const server: BotSlashCommand<SlashCommandBuilder> = {
  data: new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  run: async function (interaction) {
    await interaction.reply(
      `Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`,
    );
  },
};

export default server;
