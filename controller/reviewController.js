const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// This controller being used when route is nested under a tour route /tour/:tourId/reviews
exports.getAllReviews = factory.getAll(Review);

// This controller being used when route is nested under a tour route /tour/:tourId/reviews/:id

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

// Using factory functions for delete operations
exports.deleteReview = factory.deleteOne(Review);
