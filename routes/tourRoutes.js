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
  getToursWithin,
  getDistance,
} = require('../controller/tourController');
const authController = require('../controller/authController');
const reviewRoutes = require('../routes/reviewRoutes');
const Tour = require('../models/tourModel');
//Router
const router = express.Router();

// Nested Routes for Reviews
// POST tour/:id/reviews
// GET tour/:id/reviews
router.use('/:tourId/reviews', reviewRoutes); // Mounting the review routes on the tour routes

router.route('/tour-stats').get(getTourStats); // route for get tour stats

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan,
  ); // route for get monthly plan

router.route('/top-5-cheap').get(aliasTopTours, getAllTours); // route for get top 5 cheap tours

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin); // route for get tours within a certain distance from a point

router.route('/distances/:latlng/unit/:unit').get(getDistance);

router
  .route('/')
  .get(getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    createTour,
  ); // route for get all tours and create tour

router.route('/:id').get(getTourById).patch(updateTourById).delete(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'), // restrict to admin and lead-guide
  deleteTourById,
); // route for get tour by id, update tour by id and delete tour by id

module.exports = router;
