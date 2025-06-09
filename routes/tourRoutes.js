const express = require('express');
const {
  getAllTours,
  createTour,
  getTourById,
  updateTourById,
  aliasTopTours,
  deleteTourById,
  getTourStats,
  getMonthlyPlan,
} = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRoutes = require('../routes/reviewRoutes');
//Router
const router = express.Router();

// Nested Routes for Reviews
// POST tour/:id/reviews
// GET tour/:id/reviews
router.use('/:tourId/reviews', reviewRoutes); // Mounting the review routes on the tour routes

router.route('/tour-stats').get(getTourStats); // route for get tour stats

router.route('/monthly-plan/:year').get(getMonthlyPlan); // route for get monthly plan

router.route('/top-5-cheap').get(aliasTopTours, getAllTours); // route for get top 5 cheap tours

router.route('/').get(getAllTours).post(createTour); // route for get all tours and create tour

router.route('/:id').get(getTourById).patch(updateTourById).delete(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'), // restrict to admin and lead-guide
  deleteTourById,
); // route for get tour by id, update tour by id and delete tour by id

module.exports = router;
