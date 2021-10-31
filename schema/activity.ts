import mongoose from 'mongoose';

export interface ActivityChildUsersType {
  _id: string;
  userName: string;
  sendMessages: number;
  xp: number;
  voiceSeconds: number;
}

const ActivityChildUsersSchema = new mongoose.Schema<ActivityChildUsersType>({
  _id: {
    type: String,
    require: true,
  },
  userName: {
    type: String,
    required: true,
  },
  sendMessages: {
    type: Number,
    require: true,
  },
  xp: {
    type: Number,
    require: true,
  },
  voiceSeconds: {
    type: Number,
    required: true,
  },
});

interface ActivityType {
  _id: string;
  guildName: string;
  users: ActivityChildUsersType[];
}

const ActivityGuildSchema = new mongoose.Schema<ActivityType>({
  _id: {
    type: String,
    required: true,
  },
  guildName: {
    type: String,
    required: true,
  },
  users: [ActivityChildUsersSchema],
});

export const ActivityGuildModel = mongoose.model('activity', ActivityGuildSchema);
