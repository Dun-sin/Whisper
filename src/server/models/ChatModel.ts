import { Schema, Document, Model, model, PopulatedDoc,models } from 'mongoose';
import { ActiveUserSchemaDocument } from './ActiveUserModel';
import { MessageSchemaDocument } from './MessageModel';

interface ChatSchemaDocument extends Document {
  users: PopulatedDoc<ActiveUserSchemaDocument>[];
  messages: PopulatedDoc<MessageSchemaDocument>[];
  createdAt: Date;
  id: string;
  optimizedVersion: {
    id: string;
    userIds: Schema.Types.ObjectId[];
    messages: Record<string, any>;
    createdAt: number;
  };
}

const chatSchema = new Schema<ChatSchemaDocument>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ActiveUser',
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
  }
);

chatSchema.set('toJSON', {
  virtuals: true,
  transform(doc, objectToBeReturned) {
    objectToBeReturned.id = objectToBeReturned._id.toString();
  },
});

chatSchema.virtual('optimizedVersion').get(function (this: ChatSchemaDocument) {
  return {
    id: this.id,
    userIds: this.users.map(i => i.toString()),
    messages: {},
    createdAt: this.createdAt.getTime(),
  };
});

const Chat: Model<ChatSchemaDocument> = models.Chat || model('Chat', chatSchema);

export default Chat;
