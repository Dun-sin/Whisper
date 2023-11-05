import { Schema, Document, Model, model } from 'mongoose';

interface UserSchemaDocument extends Document {
  _id: string;
  email: string;
  gender: 'Male' | 'Female' | 'Unknown';
  age: number | null;
  username: string;
  aboutMe: string | undefined;
  settings: Record<string, any> | undefined;
}

const userSchema = new Schema<UserSchemaDocument>({
  _id: String,
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
    required: false,
    default: 'Unknown',
  },
  age: {
    type: Number,
    required: false,
    default: null,
  },
  username: {
    type: String,
    required: false,
    default: 'Anonymous',
  },
  aboutMe: {
    type: String,
    required: false,
  },
  settings: {
    type: Object,
    required: false,
  },
});

userSchema.index({ email: 1 }, { unique: true });

export const UserModel: Model<UserSchemaDocument> = model('User', userSchema);
