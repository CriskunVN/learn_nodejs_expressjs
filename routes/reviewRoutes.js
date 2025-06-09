const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');
const router = express.Router({
  mergeParams: true, // This allows us to access params from parent routes
});

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

router.route('/:id').get(reviewController.getReviewById);

module.exports = router;
