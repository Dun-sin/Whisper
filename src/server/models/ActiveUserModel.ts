import { Schema, Document, Model, model, Types, models } from 'mongoose';
import { Socket } from 'socket.io';

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
    socketConnections: Socket[];
    socketIds: string[];
    currentRoomId: string | null;
    rooms: string[];
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
    currentRoomId: this.currentChat?.toString() || null,
    rooms: [],
  };
});

export const ActiveUserModel: Model<ActiveUserSchemaDocument> =
  models.ActiveUser || model('ActiveUser', activeUserSchema);

export default ActiveUserModel;
