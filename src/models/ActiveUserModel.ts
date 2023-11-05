import { Schema, Document, Model, model, Types } from 'mongoose';

export interface ActiveUserSchemaDocument extends Document {
  email: string | null;
  loginId: string;
  currentChat: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  optimizedVersion: {
    id: string;
    email: string | null;
    loginId: string;
    socketConnections: any[];
    socketIds: any[];
    currentChatId: string | null;
    chatIds: any[];
  };
}

const activeUserSchema = new Schema<ActiveUserSchemaDocument>(
  {
    email: {
      type: Schema.Types.Mixed,
      default: null,
    },
    loginId: {
      type: String,
      required: true,
    },
    currentChat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
  },
  {
    timestamps: true,
  }
);

activeUserSchema.virtual('optimizedVersion').get(function (
  this: ActiveUserSchemaDocument
) {
  return {
    id: this.id,
    email: this.email || null,
    loginId: this.loginId,
    socketConnections: [],
    socketIds: [],
    currentChatId: this.currentChat?.toString() || null,
    chatIds: [],
  };
});

export const ActiveUserModel: Model<ActiveUserSchemaDocument> = model(
  'ActiveUser',
  activeUserSchema
);

export default ActiveUserModel;
