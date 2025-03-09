const express = require('express');
const {
  getAllTours,
  createTour,
  getTourById,
  updateTourById,
  deleteTourById,
  checkID,
  checkBody,
} = require('../controller/tourController');
//Router
const router = express.Router();

router.param('id', checkID);

router.route('/').get(getAllTours).post(checkBody, createTour);

router
  .route('/:id')
  .get(getTourById)
  .patch(updateTourById)
  .delete(deleteTourById);

module.exports = router;
