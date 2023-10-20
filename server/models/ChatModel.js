const mongoose = require('mongoose');
const Message = require('./MessageModel');

const { model, Schema } = mongoose;

const ChatSchema = new Schema(
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
    virtuals: {
      optimizedVersion: {
        get() {
          return {
            id: this._id.toString(),
            userIds: [],
            messages: {},
            createdAt: this.createdAt.getTime(),
          };
        },
      },
    },
  }
);

module.exports = model('Chat', ChatSchema);
