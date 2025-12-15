const sendErrorDev = (err, res) => {
    return res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        err
    });
}

const sendErrorProd = (err, res) => {
    return res.status(err.statusCode).json({
        message: err.message,
        statusCode: err.statusCode
    })
}

const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'dev') {
        sendErrorDev(err, res);
    } else {
        sendErrorProd(err, res);
    }
};

module.exports = globalErrorHandler;