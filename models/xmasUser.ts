import mongoose, { Schema, Model } from 'mongoose';

export interface IXmasUser {
  _id?: string;
  phone: string;
  loggedAt?: Date;
  title: string;
  context: string;
  extra_note: string;
  pictures: string[];
  created_at: Date;
  deleted: boolean;
}

const XmasUserSchema = new Schema<IXmasUser>({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  loggedAt: {
    type: Date,
    default: null,
  },
  title: {
    type: String,
    required: true,
  },
  context: {
    type: String,
    required: true,
  },
  extra_note: {
    type: String,
    default: '',
  },
  pictures: {
    type: [String],
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

const XmasUser: Model<IXmasUser> =
  mongoose.models.XmasUser || mongoose.model<IXmasUser>('XmasUser', XmasUserSchema, 'xmas_users');

export default XmasUser;