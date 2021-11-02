import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import type { BotSlashCommand } from '../../types/types';

import { BotClient } from '../client';

const helpEventHandler = async (interaction: CommandInteraction) => {
  const client = BotClient.getClient();
  const helpEmbed: MessageEmbed = new MessageEmbed()
    .setColor('#ff2600')
    .setTitle('Help')
    .setThumbnail(client.user?.avatarURL() || 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png');

  const commandStore = client.commands;

  for (const [, commandData] of commandStore) {
    const commandName = `\`/${commandData.data.name}\``;
    const commandDesctiption = commandData.data.description;
    helpEmbed.addField(commandName, commandDesctiption, true);
  }

  await interaction.reply({ embeds: [helpEmbed] });
};

const helpCommand: BotSlashCommand = {
  data: new SlashCommandBuilder().setName('help').setDescription('Shows help'),
  run: helpEventHandler,
};

export default helpCommand;
