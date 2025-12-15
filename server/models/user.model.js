const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        minLength: 5,
        maxLength: 10,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 6,
        required: true,
        select: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;