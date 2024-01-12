import { Schema, Document, Model, model, PopulatedDoc, models } from 'mongoose';
import { ActiveUserSchemaDocument } from './ActiveUserModel';

export interface MessageSchemaDocument extends Document {
  message: string;
  isEdited: boolean;
  containsBadword: boolean;
  oldMessages: string[];
  sender: PopulatedDoc<ActiveUserSchemaDocument>;
  type: string;
  isRead: boolean;
  replyTo: PopulatedDoc<MessageSchemaDocument>;
  createdAt: Date;
  id: string;
  optimizedVersion: {
    id: string;
    message: string;
    time: number;
    type: string;
    senderId: string;
    isEdited: boolean;
    containsBadword: boolean;
    oldMessages: string[];
    isRead: boolean;
    replyTo: string | null;
  };
}

const messageSchema = new Schema<MessageSchemaDocument>(
  {
    message: {
      type: String,
      required: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    containsBadword: {
      type: Boolean,
      default: false,
      required: true,
    },
    oldMessages: {
      type: [String],
      default: [],
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'ActiveUser',
    },
    type: {
      type: String,
      default: 'message',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: String,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.set('toJSON', {
  virtuals: true,
  transform(doc, objectToBeReturned) {
    objectToBeReturned.id = objectToBeReturned._id.toString();
  },
});

messageSchema.virtual('optimizedVersion').get(function (
  this: MessageSchemaDocument
) {
  return {
    id: this.id,
    message: this.message,
    time: this.createdAt.getTime(),
    type: this.type,
    senderId: this.sender.toString(),
    isEdited: this.isEdited,
    containsBadword: this.containsBadword,
    oldMessages: this.oldMessages,
    isRead: this.isRead,
    replyTo: this.replyTo?.toString() || null,
  };
});

const Message: Model<MessageSchemaDocument> =
  models.Message || model('Message', messageSchema);

export default Message;
