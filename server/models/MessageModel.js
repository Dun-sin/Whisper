const mongoose = require('mongoose');

const { model, Schema } = mongoose;

const MessageSchema = new Schema(
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
      type: Array,
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
      type: Schema.Types.ObjectId
    }
  },
  {
    timestamps: true,
    virtuals: {
      optimizedVersion: {
        get() {
          return {
            id: this._id.toString(),
            message: this.message,
            time: this.createdAt.getTime(),
            type: this.type,
            senderId: '',
            isEdited: this.isEdited,
            containsBadword: this.containsBadword,
            oldMessages: this.oldMessages,
            isRead: this.isRead,
            replyTo: this.replyTo?.toString() || null
          };
        },
      },
    },
  }
);

module.exports = model('Message', MessageSchema);
