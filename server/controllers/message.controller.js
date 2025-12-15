const Message = require("../models/message.model");
const catchAsync = require("../utils/catchAsync");

const sendMessage = catchAsync(async (req, res) => {
    const { chatId, message } = req.body;

    const msg = await Message.create({
        chatId,
        message,
        senderId: req.user._id
    });

    const populated = await msg.populate("senderId", "username");

    // Emit to all users in the chat room
    req.io.to(chatId).emit("newMessage", populated);

    res.status(201).json(populated);
});

const getMessages = catchAsync(async (req, res) => {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
        .populate("senderId", "username")
        .sort({ createdAt: 1 });

    res.status(200).json(messages);
});

module.exports = { sendMessage, getMessages };
