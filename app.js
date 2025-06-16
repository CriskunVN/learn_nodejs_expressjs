const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const GlobalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { whitelist } = require('validator');

const app = express();

// 1. GLOBAL MIDDLEWARE

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  // max limit : 100 request in an hour
  max: 100,
  windowms: 60 * 60 * 1000, // time limit => 1 hour = 60 minutes * 60 second * 1000 ms
  message: 'Too many request from this IP , please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
      'priceDiscount',
    ],
  }),
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`Request URL: ${req.requestTime}`);
  next();
});

// 3. ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't found URL: ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`Can't found URL: ${req.originalUrl} on this server`, 404));
});

//Global Error Handling Middleware
app.use(GlobalErrorHandler);

module.exports = app;
