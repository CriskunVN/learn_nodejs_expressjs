const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // Build Query
    //1.A Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1.B Advanced Filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // <=> '$lt or $gt or $gte or $lte'

    let query = Tour.find(JSON.parse(queryStr));

    //2. Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);

      // document of Mongoose
      //Model.find().sort("price ratingsAverage")
    } else {
      query = query.sort('-createAt');
    }

    // Execute Query
    const tours = await query;

    // Send response to client
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours: tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      massage: 'data not found',
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent to server',
    });
  }
};

exports.updateTourById = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {}
};

exports.deleteTourById = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndRemove(req.params.id);

    res.status(204).json({
      status: 'success',
      data: {},
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      massage: 'Data not found',
    });
  }
};
