const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const signToken = (user) => {
    return jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

const createSendToken = (statusCode, res, user) => {
    const token = signToken(user);

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'prod',
        sameSite: 'Lax',
        maxAge: 3 * 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(statusCode).json(user);
}

const signup = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    const isExsist = await User.findOne({username});

    if(isExsist) {
        return next(new AppError('user exsists!', 401));
    }

    const user = await User.create({username, password});

    user.password = undefined;

    res.status(201).json(user);
});

const login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    const user = await User.findOne({username, password});

    if(!user) {
        return next(new AppError('user cant be found!', 404));
    }

    user.password = undefined;

    createSendToken(200, res, user);
});

module.exports = { signup, login };