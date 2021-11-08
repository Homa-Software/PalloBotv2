import { getAverageColor } from 'fast-average-color-node';
import fetch from 'node-fetch';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import type { HexColorString, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import type { BotSlashCommand } from '../../types/types';

import { discordPlaceholderAvatar } from '../helpers';
import { getActivityOverviewForUser } from '../activity';
import { getLogger } from 'log4js';

const logger = getLogger();

const runCommand = async (interaction: CommandInteraction) => {
  //Setting embed color to match user avatar
  const userAvatarUrl = interaction.user.avatarURL() ?? discordPlaceholderAvatar;
  const response = await fetch(userAvatarUrl);
  const image = await response.buffer();
  const averageColor = await getAverageColor(image);
  const hexColorValue = averageColor.hex as HexColorString;

  const userId = interaction.user.id;
  const guildId = interaction.guildId;

  const activityData = await getActivityOverviewForUser(guildId, userId);

  //Handle when user is not found in database
  if (!activityData) {
    interaction.reply('No activity records are available for this user');
    return;
  }

  const nickName = interaction.guild?.members.cache.get(interaction.user.id)?.displayName ?? interaction.user.username;

  const embed: MessageEmbed | MessageEmbedOptions = {
    title: 'Activity Overview',
    description: `For user **${nickName}**`,
    color: hexColorValue,
    thumbnail: {
      url: userAvatarUrl,
    },
    fields: [
      { name: '\u200B', value: '\u200B', inline: false },
      { name: 'Messages send', value: activityData.sendMessages.toString(), inline: true },
      { name: 'Current level', value: activityData.currentLevel.toString(), inline: true },
      { name: 'LevelProgress', value: `${activityData.levelFill * 10}%`, inline: false },
    ],
    timestamp: new Date(),
  };

  await interaction.reply({ embeds: [embed] });
};

const activityComamnd: BotSlashCommand = {
  data: new SlashCommandBuilder().setName('activity').setDescription('Shows user activity'),
  run: runCommand,
};

export default activityComamnd;
