const User = require("../models/user.model");
const AppError = require("../utils/AppError");
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        // 1. Check if jwt exists in cookies
        const cookie = req.cookies?.jwt;

        if (!cookie) {
            return next(new AppError("you are not logged in!", 401));
        }

        // 2. Verify jwt
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);


        if (!decoded || !decoded.userId) {
            return next(new AppError("invalid token!", 401));
        }

        // 3. Find user by ID and exclude sensitive fields
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new AppError("user cant be found!", 404));
        }

        // 4. Attach user to request object
        req.user = user;

        // 5. Move to next middleware or controller
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);

        // Handle jwt expiration separately
        if (error.name === "jwtExpiredError") {
            return next(new AppError("თქვენი ავტორიზაციის დრო ამოიწურა, გთხოთ გაიაროთ თავიდან!", 401));
        }

        return next(new AppError("თქვენ არ ხართ ავტორიზირებული!", 401));
    }
};

module.exports = protect;