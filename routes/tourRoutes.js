const express = require('express');
const {
  getAllTours,
  createTour,
  getTourById,
  updateTourById,
  aliasTopTours,
  deleteTourById,
  getTourStats,
} = require('../controller/tourController');
//Router
const router = express.Router();

router.route('/tour-stats').get(getTourStats);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/').get(getAllTours).post(createTour);

router
  .route('/:id')
  .get(getTourById)
  .patch(updateTourById)
  .delete(deleteTourById);

module.exports = router;
