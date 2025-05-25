class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // Set the status to 'fail' for 4xx errors and 'error' for 5xx errors
    this.isOperational = true; // Indicate that this is an operational error

    // Capture the stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
