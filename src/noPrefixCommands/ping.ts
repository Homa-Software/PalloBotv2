import type { BotNoPrefixCommand } from '../../types/types';

const ping: BotNoPrefixCommand = {
  name: 'ping',
  run: async (message) => {
    await message.reply('Pong!');
  },
};

export default ping;
