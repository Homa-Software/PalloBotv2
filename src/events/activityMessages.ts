import type { Message } from 'discord.js';

import { retriveMessageInfo } from '../helpers';
import { updateActivityMessages } from '../activity';
import type { BotEvent } from '../../types/types';

const activityTracker: BotEvent = {
  name: 'messageCreate',
  once: false,
  run: async (message: Message) => {
    const { isOwnMessage, isDirectMessage, isBot } = retriveMessageInfo(message);
    if (isOwnMessage || isDirectMessage || isBot) return;

    updateActivityMessages(message);
  },
};

export default activityTracker;
