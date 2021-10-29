import { SlashCommandBuilder } from '@discordjs/builders';
import type { BotSlashCommand } from '../../types/types';

const ping: BotSlashCommand = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
  run: function (message) {},
};

export default ping;
