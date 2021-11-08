import type { Message } from 'discord.js';

import { updateActivityMessages } from '../activity';
import { retriveMessageInfo } from '../helpers';
import type { BotEvent } from '../../types/types';

/**
 * Event handler
 * @param message message that triggered event handler
 * @returns Promise<void>
 */
const messageActivityEventHandler = async (message: Message) => {
  const { isOwnMessage, isDirectMessage, isBot } = retriveMessageInfo(message);
  if (isOwnMessage || isDirectMessage || isBot) return;

  updateActivityMessages(message);
};

const activityTracker: BotEvent = {
  name: 'messageCreate',
  once: false,
  run: messageActivityEventHandler,
};

export default activityTracker;
