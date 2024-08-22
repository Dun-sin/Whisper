const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    _id: {
      type: String,
    },
    email: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unknown'],
    },
    age: {
      type: Number,
    },
    username: {
      type: String,
      default: 'Anonymous',
    },
    aboutMe: {
      type: String,
    },
    settings: {
      type: Object,
    },
    profileImage: {
      type: String,
    },
    loginId: {
      type: String,
      required: true,
    },
    currentChat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
    },
    blockedUsers: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    virtuals: {
      emailOrLoginId: {
        get() {
          return this.email || this.loginId;
        },
      },
      optimizedVersion: {
        get() {
          return {
            id: this._id.toString(),
            email: this.email || null,
            gender: this.gender,
            age: this.age,
            username: this.username,
            aboutMe: this.aboutMe || null,
            settings: this.settings || {},
            profileImage: this.profileImage || null,
            loginId: this.loginId,
            emailOrLoginId: this.emailOrLoginId,
            socketConnections: [],
            socketIds: [],
            currentChatId: this.currentChat?._id?.toString() || null,
            chatIds: [],
            blockedUsers: []
          };
        },
      },
    },
  }
);

UserSchema.index({ loginId: 1, email: 1 }, { unique: true, sparse: true });

module.exports = model('User', UserSchema);
