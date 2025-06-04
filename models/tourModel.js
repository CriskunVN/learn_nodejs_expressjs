const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel'); // Assuming you have a user model
const tourSchema = new mongoose.Schema(
  {
    //the name of the tour
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true, // this will make sure that the name is unique
      trim: true, // this will remove the spaces from the start and end of the string
      minlength: [10, 'A tour name must have more or equal then 10 characters'],
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      // validate: [validator.isAlpha, 'Errooo looix con me no roi'],
    },
    // this will be used to create a slug from the name
    slug: String,

    // duration of the tour in days
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    // maximum group size
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    // difficulty of the tour
    difficulty: {
      type: String,
      required: [true, 'A tour must have a group size'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy , medium , difficult',
      },
    },
    // ratings of the tour
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be above 1.0'],
      max: [5, 'A rating must be below 5.0'],
    },
    // number of ratings
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    // price of the tour
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    // price discount of the tour
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      default: false,
      type: Boolean,
    },
    // this is for the start location of the tour
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], // this will make sure that the type is Point
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
      description: String,
    },
    // this is for the locations of the tour
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'], // this will make sure that the type is Point
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: Array,
  },
  // this is virtuals options
  {
    toJSON: { virtuals: true }, // this will make sure that the virtuals are included in the JSON output
    toObject: { virtuals: true }, // this will make sure that the virtuals are included in the object output
  },
);
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE : runs before .save and .create MONGOOSE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE:

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  next();
});

// Aggregate Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
