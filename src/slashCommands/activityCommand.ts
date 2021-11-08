import { getAverageColor } from 'fast-average-color-node';
import fetch from 'node-fetch';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import type { HexColorString } from 'discord.js';
import type { BotSlashCommand } from '../../types/types';

import { BotClient } from '../client';
import { discordPlaceholderAvatar } from '../helpers';
import { getLogger } from 'log4js';

const runCommand = async (interaction: CommandInteraction) => {
  const userAvatarUrl = interaction.user.avatarURL() ?? discordPlaceholderAvatar;

  const response = await fetch(userAvatarUrl);
  const image = await response.buffer();

  const averageColor = await getAverageColor(image);
  const hexValue = averageColor.hex as HexColorString;

  const embed = new MessageEmbed().setColor(hexValue).setTitle('Activity');
  await interaction.reply({ embeds: [embed] });
};

const activityComamnd: BotSlashCommand = {
  data: new SlashCommandBuilder().setName('activity').setDescription('Shows user activity'),
  run: runCommand,
};

export default activityComamnd;
