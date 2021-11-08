import { getLogger } from 'log4js';
import mongoose from 'mongoose';
import type { Message } from 'discord.js';

import { retriveMessageInfo } from './helpers';
import { ActivityModel } from '../models/activityModel';
import type { ActivityType } from '../models/activityModel';

//Logger to be used in this module
const logger = getLogger();

/**
 * Updates and writes to database user activity score, this function does not prevent spam messages
 * @param message message that invoked activity update
 * @returns Promise<void>
 */
const updateActivityMessagesNoCheck = async (message: Message) => {
  const messageInfoObject = retriveMessageInfo(message);
  const { userId, userName, channelId, channelName } = messageInfoObject;

  //At this point it is guarenteed that context is guild message but we need to tell that to typescript
  const guildId = messageInfoObject.guildId ?? '';
  const guildName = messageInfoObject.guildName ?? '';

  logger.debug(`ACTIVITY INFO
    Registering activity of 
    user '${userId}' '${userName}' 
    in guild '${guildId}'  '${guildName}'
    channel '${channelId}' '${channelName}'`);

  const query: mongoose.FilterQuery<ActivityType> = {
    _id: guildId + ':' + userId,
  };
  const update: mongoose.UpdateQuery<ActivityType> = {
    $inc: { sendMessages: 1, xp: 10 },
  };
  const options: mongoose.QueryOptions = {
    runValidators: true,
    new: true,
  };
  const updateResult = await ActivityModel.findOneAndUpdate(query, update, options);

  if (!updateResult) {
    await new ActivityModel({
      _id: guildId + ':' + userId,
      userId,
      guildId,
      userName,
      sendMessages: 1,
      xp: 10,
    }).save();
  }
};

/**
 * Closure that updates and writes to database user activity score
 * @param message message that invoked activity update
 * @returns Promise<void>
 */
export const updateActivityMessages = (() => {
  interface UserContext {
    userId: string;
    guildId: string;
    channelId: string;
    timestamp: number;
  }

  const contexes: UserContext[] = [];

  return async (message: Message) => {
    const timeout = 2000;

    const findUserContext = (context: UserContext): UserContext | undefined => {
      return contexes.find((el) => {
        const checks: boolean[] = [
          el.channelId === context.channelId,
          el.guildId === context.guildId,
          el.userId === context.userId,
        ];

        return checks.every((el) => el === true);
      });
    };

    const messageInfo = retriveMessageInfo(message);
    const guildId = messageInfo.guildId ?? '';
    const { userId, channelId } = messageInfo;
    const timestamp = new Date().getTime();

    const userInteraction: UserContext = { guildId, userId, channelId, timestamp };

    const timeNow = new Date().getTime();
    const registered = findUserContext(userInteraction);

    if (!registered) {
      contexes.push(userInteraction);
      logger.info(`Registering and executing activity update`);
      await updateActivityMessagesNoCheck(message);
      return;
    }

    if (timeNow - registered.timestamp < timeout) {
      logger.info(`Throttling activity update`);
      return;
    }
    logger.info(`Executing activity update`);
    registered.timestamp = timeNow;
    await updateActivityMessagesNoCheck(message);
    return;
  };
})();

type LevelInfo = {
  currentLevel: number;
  levelFill: number;
  nextLevelXp: number;
};
/**
 * Given the xp amount this function returns the correct level information for the user
 * @param xp xp used for the level info calculations
 * @returns LevelInfo object that represents mapping from xp to user printable data
 */
const xpToLevelInfoMapping = (xp: number): LevelInfo => {
  const multiplier = 2.2;
  /*
  Math stuff
  
  our sequence: {100, 220, 484}
  q = 2,2 - multiplayer
  n - the level
  
  a1 = 100
  A(N) - user xp: exp
  exp = a1*q^(n-1)
  n = logq(exp/a1)+1
  */
  const expression = Math.log(xp / 100) / Math.log(multiplier) + 1;
  const levelRaw = expression < 0 ? 0 : expression;
  const currentLevel = Math.floor(levelRaw);

  const currLevelXp = currentLevel === 0 ? 0 : 100 * Math.pow(multiplier, currentLevel - 1);
  const nextLevelXp = 100 * Math.pow(multiplier, currentLevel);

  const levelFill = Math.round(((xp - currLevelXp) / (nextLevelXp - currLevelXp)) * 100) / 100;

  return { currentLevel, levelFill, nextLevelXp };
};

type UserActivityOverview = {
  userName: string;
  userId: string;
  sendMessages: number;
} & LevelInfo;

export const getActivityOverviewForUser = async (
  guildId: string,
  userId: string,
): Promise<UserActivityOverview | undefined> => {
  const queryResult = await ActivityModel.findOne({ _id: guildId + ':' + userId });

  if (!queryResult) {
    logger.error(`Query for userId: ${userId} in guildId: ${guildId} failed!`);
    return undefined;
  }

  const { userName, xp, sendMessages } = queryResult;
  const { currentLevel, levelFill, nextLevelXp } = xpToLevelInfoMapping(xp);

  return { userName, userId, currentLevel, levelFill, nextLevelXp, sendMessages };
};
