const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true // automatically adds createdAt and updatedAt
    }
);

module.exports = mongoose.model('Message', messageSchema);
