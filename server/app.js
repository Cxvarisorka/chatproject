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
const { ExpressPeerServer } = require('peer');

dotenv.config();

const app = express();
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
    debug: process.env.NODE_ENV !== 'prod',
    path: '/',
});
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
    }
});

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use('/peerjs', peerServer);

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

const onlineUsers = new Map();

// Socket.IO
io.on('connection', (socket) => {
    // User registration for voice calls
    socket.on('register', ({ userId, peerId }) => {
        onlineUsers.set(userId, { socketId: socket.id, peerId });
        socket.userId = userId;
    });

    // Voice call signaling
    socket.on('callUser', ({ to, from, callerName }) => {
        const targetUser = onlineUsers.get(to);
        const caller = onlineUsers.get(from);
        if (targetUser && caller) {
            io.to(targetUser.socketId).emit('incomingCall', {
                from,
                peerId: caller.peerId,
                callerName
            });
        }
    });

    socket.on('acceptCall', ({ to, peerId }) => {
        const caller = onlineUsers.get(to);
        if (caller) {
            io.to(caller.socketId).emit('callAccepted', { peerId });
        }
    });

    socket.on('endCall', ({ to }) => {
        const user = onlineUsers.get(to);
        if (user) {
            io.to(user.socketId).emit('callEnded');
        }
    });

    // Chat room management
    socket.on('joinChat', (chatId) => socket.join(chatId));
    socket.on('leaveChat', (chatId) => socket.leave(chatId));
    socket.on('typing', (chatId) => socket.to(chatId).emit('userTyping', socket.id));

    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
        }
    });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
        console.log('Connected to DB');
    });
