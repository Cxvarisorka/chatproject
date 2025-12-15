const express = require('express');
const { sendMessage, getMessages } = require('../controllers/message.controller');
const protect = require('../middleware/auth.middleware');

const messageRouter = express.Router();

messageRouter.post('/', protect, sendMessage);
messageRouter.get('/:chatId', protect, getMessages);

module.exports = messageRouter;
