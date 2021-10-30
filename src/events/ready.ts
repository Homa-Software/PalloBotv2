import { getLogger } from 'log4js';
import type { BotEvent } from '../../types/types';

const ready: BotEvent = {
  name: 'ready',
  once: true,
  run: () => {
    const logger = getLogger();
    logger.info('Bot is ready!');
  },
};

export default ready;
