import mongoose, { Schema, Model } from 'mongoose';

export interface IPicture {
  type: 'url' | 'uploaded';
  data: string;
  filename?: string;
}

const PictureSchema = new Schema<IPicture>({
  type: {
    type: String,
    enum: ['url', 'uploaded'],
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: false,
  },
}, { _id: false });

export interface IXmasUser {
  _id?: string;
  phone: string;
  loggedAt?: Date;
  title: string;
  context: string;
  extra_note: string;
  pictures: IPicture[];
  created_at: Date;
  deleted: boolean;
}

const XmasUserSchema = new Schema<IXmasUser>({
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\+976 \d{8}$/.test(v);
      },
      message: 'Phone must be in format: +976 XXXXXXXX'
    }
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
    type: [PictureSchema],
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