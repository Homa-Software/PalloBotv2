import { SlashCommandBuilder } from '@discordjs/builders';
import type { BotSlashCommand } from '../../types/types';

const user: BotSlashCommand<SlashCommandBuilder> = {
  data: new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
  run: async function (interaction) {
    await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
  },
};

export default user;
