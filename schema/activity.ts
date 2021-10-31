import mongoose from 'mongoose';

interface ActivityChildUsersType extends mongoose.Document {
  _id: string;
  sendMessages: number;
  xp: number;
  voiceSeconds: number;
}

interface ActivityType extends mongoose.Document {
  _id: string;
  users: mongoose.Types.DocumentArray<ActivityChildUsersType>;
}

const ActivityGuildSchema = new mongoose.Schema<ActivityType>({
  _id: {
    type: String,
    required: true,
  },
  users: [
    {
      sendMessages: {
        type: Number,
        require: true,
      },
      userId: {
        type: String,
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
    },
  ],
});

export const ActivityGuildModel = mongoose.model('activity', ActivityGuildSchema);
