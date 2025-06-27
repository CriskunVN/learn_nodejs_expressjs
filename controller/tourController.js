const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// this function is used to filter the tours based on the query parameters
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// This function is used to get all tours
exports.getAllTours = factory.getAll(Tour);

// This function is used to get a tour by id by using the factory function
exports.getTourById = factory.getOne(Tour, { path: 'reviews' });

// This function is used to create a new tour by using the factory function
exports.createTour = factory.createOne(Tour);

// This function is used to update a tour by id by using the factory function
exports.updateTourById = factory.updateOne(Tour);

// This function is used to delete a tour by id by using the factory function
exports.deleteTourById = factory.deleteOne(Tour);

// This function is used to get tour stats
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'difficult' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

// This function is used to get monthly plan
// It will return the number of tours that start in each month of the year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.query.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          // $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'success',
    size: plan.length,
    data: {
      plan,
    },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within?distance=233&center=34,111745,-118.113491&unit=mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // Convert distance to radians

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const tour = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [
          [lng, lat], // Note: MongoDB uses lng, lat order
          radius, // Convert distance to radians
        ],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    result: tour.length,
    data: {
      data: tour,
    },
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // Convert meters to miles or kilometers
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400,
      ),
    );
  }

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier, // Convert meters to miles or kilometers
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distance,
    },
  });
});
