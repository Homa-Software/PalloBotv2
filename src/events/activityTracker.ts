import { getLogger } from 'log4js';
import type { Message } from 'discord.js';
import { BotClient } from '../client';
import { retriveMessageInfo, setThrottle } from '../helpers';
import { ActivityGuildModel } from '../../schema/activity';
import type { BotEvent, MessageInfo } from '../../types/types';

const logger = getLogger();
const client = BotClient.getClient();

const activityTracker: BotEvent = {
  name: 'messageCreate',
  once: false,
  run: async (message: Message) => {
    const messageInfo = retriveMessageInfo(message);
    const { isOwnMessage, isDirectMessage, userId, userName, guildName, channelId, channelName, guildId } = messageInfo;
    if (isOwnMessage || isDirectMessage) return;

    updateActivity(message, messageInfo);
  },
};

const updateActivity = setThrottle(2000, (message: Message, messageInfo: MessageInfo) => {
  const { isOwnMessage, isDirectMessage, userId, userName, guildName, channelId, channelName, guildId } = messageInfo;
  logger.debug(`ACTIVITY INFO
Registering activity of 
user '${userId}' '${userName}' 
in guild '${guildId}'  '${guildName}'
channel '${channelId}' ${channelName}`);
});

export default activityTracker;
