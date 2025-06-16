const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');
const router = express.Router({
  mergeParams: true, // This allows us to access params from parent routes
});

router.route('/').get(reviewController.getAllReviews).post(
  authController.protect,
  authController.restrictTo('user'),
  reviewController.setTourUserIds, // Middleware to set tour and user IDs
  reviewController.createReview,
);

router.use(authController.protect); // Protect all routes after this middleware

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  );

module.exports = router;
