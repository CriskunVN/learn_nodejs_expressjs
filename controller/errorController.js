const AppError = require('../utils/appError.js');

// This function is used to handle the errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// This function is used to handle the duplicate fields error
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: '${err.keyValue.name}'. Please use another value!`;
  return new AppError(message, 400);
};

// This function is used to handle the validation error
const handleValidationErrorDB = (err) => {
  const value = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Invalid input data. ${value}`;
  return new AppError(message, 400);
};

// This function is used to handle the JWT error
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

// This function is used to handle the JWT expired error
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// This function is used to send the error in development mode
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// This function is used to send the error in production mode
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    //1. Log error
    console.error('ERROR 💥', err);
    //2. Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

// this middleware is used to handle the errors
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
