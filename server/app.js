const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { default: mongoose } = require('mongoose');
const cookieParser = require('cookie-parser');
const authRouter = require('./router/auth.router');
const chatRouter = require('./router/chat.router');
const messageRouter = require('./router/message.router');
const globalErrorHandler = require('./controllers/error.controller');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Attach io to req for controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

app.use(globalErrorHandler);

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
    });

    socket.on('leaveChat', (chatId) => {
        socket.leave(chatId);
    });

    socket.on('typing', (chatId) => {
        socket.to(chatId).emit('userTyping', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(3000, () => {
            console.log('Server is listening port 3000');
        });
        console.log('Connected to DB');
    });
