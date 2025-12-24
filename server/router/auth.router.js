const express = require('express');
const { signup, login, getMe, logout } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.get('/me', protect, getMe);
authRouter.post('/logout', logout);

module.exports = authRouter;