import { messageActivityEventHandler } from '../activity';
import type { BotEvent } from '../../types/types';

const activityTracker: BotEvent = {
  name: 'messageCreate',
  once: false,
  run: messageActivityEventHandler,
};

export default activityTracker;
