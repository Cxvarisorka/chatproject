const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const catchAsync = require("../utils/catchAsync");

const createChat = catchAsync(async (req, res) => {
    const { title, members } = req.body;

    const chat = await Chat.create({
        title,
        members: [...members, req.user._id],
        createdBy: req.user._id
    });

    res.status(201).json(chat);
});

const getMyChats = catchAsync(async (req, res) => {
    const chats = await Chat.find({ members: req.user._id })
        .populate('members', 'username');

    res.status(200).json(chats);
});

const searchUsers = catchAsync(async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
        return res.status(200).json([]);
    }

    const users = await User.find({
        username: { $regex: q, $options: 'i' },
        _id: { $ne: req.user._id }
    }).select('username').limit(10);

    res.status(200).json(users);
});

module.exports = { createChat, getMyChats, searchUsers };
