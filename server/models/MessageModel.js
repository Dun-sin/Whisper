const mongoose = require('mongoose');

const { model, Schema } = mongoose;

const MessageSchema = new Schema(
    {
        message: {
            type: String,
            required: true,
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
                    };
                },
            },
        },
    }
);

module.exports = model('Message', MessageSchema);
