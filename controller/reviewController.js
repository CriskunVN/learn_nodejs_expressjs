const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// This controller being used when route is nested under a tour route /tour/:tourId/reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  // If the request is coming from a tour, we want to filter reviews by that tour
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews: reviews,
    },
  });
});

// This controller being used when route is nested under a tour route /tour/:tourId/reviews/:id
exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: review,
    },
  });
});

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

// Using factory functions for delete operations
exports.deleteReview = factory.deleteOne(Review);
