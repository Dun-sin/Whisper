const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const Chat = require('./ChatModel');

const ActiveUserSchema = new Schema(
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
                        loginId: this.loginId,
                        emailOrLoginId: this.emailOrLoginId,
                        socketConnections: [],
                        socketIds: [],
                        currentChatId:
                            this.currentChat?._id?.toString() || null,
                        chatIds: [],
                    };
                },
            },
        },
    }
);

module.exports = model('ActiveUser', ActiveUserSchema);
