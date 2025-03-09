const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json/`)
);

exports.checkID = (req, res, next, val) => {
  console.log('Id : ', val);
  if (req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name and price',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getTourById = (req, res) => {
  const tour = tours.find((el) => el.id === req.params.id * 1);

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours: tours[req.params.id],
    },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json/`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTourById = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Update tour ',
    },
  });
};

exports.deleteTourById = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'Update tour ',
    },
  });
};
