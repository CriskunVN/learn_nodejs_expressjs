const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// this function is used to filter the tours based on the query parameters
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// This function is used to get all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
  // Execute Query

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  // .pagination();
  const tours = await features.query;

  // Send response to client
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

// This function is used to get a tour by id
exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

// This function is used to create a new tour
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

// This function is used to update a tour by id
exports.updateTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// This function is used to delete a tour by id
// This will not delete the tour from the database but will set the active field to false
exports.deleteTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndRemove(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: {},
  });
});

// This function is used to get tour stats
// It will return the number of tours, number of ratings, average rating, average price, minimum price, maximum price
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
