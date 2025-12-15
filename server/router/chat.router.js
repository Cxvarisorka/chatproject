const express = require('express');
const { createChat, getMyChats, searchUsers } = require('../controllers/chat.controller');
const protect = require('../middleware/auth.middleware');

const chatRouter = express.Router();

chatRouter.get('/users', protect, searchUsers);
chatRouter.get('/', protect, getMyChats);
chatRouter.post('/', protect, createChat);

module.exports = chatRouter;