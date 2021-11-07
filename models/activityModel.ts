import { Schema, model } from 'mongoose';

export interface ActivityType {
  _id: string;
  guildId: string;
  userId: string;
  userName: string;
  sendMessages: number;
  xp: number;
  voiceSeconds: number;
}

const ActivitySchema = new Schema<ActivityType>({
  _id: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  sendMessages: {
    type: Number,
    required: true,
    default: 0,
  },
  xp: {
    type: Number,
    required: true,
    default: 0,
  },
  voiceSeconds: {
    type: Number,
    required: true,
    default: 0,
  },
});

export const ActivityModel = model('activity', ActivitySchema);
