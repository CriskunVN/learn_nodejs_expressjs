// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating cannot be empty'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    // Reference to the tour being reviewed
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    // Reference to the user who wrote the review
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true }, // this will make sure that the virtuals are included in the JSON output
    toObject: { virtuals: true }, // this will make sure that the virtuals are included in the object output
  },
);

// middle pre hook to prevent duplicate reviews for the same user
reviewSchema.pre(/^find/, function (next) {
  //   this.populate([
  //     { path: 'user', select: 'name photo' },
  //     { path: 'tour', select: 'name' },
  //   ]);

  this.populate([{ path: 'user', select: 'name photo' }]);
  next();
});

reviewSchema.pre('save', function (next) {
  next();
});

// middleware to prevent a user from reviewing the same tour multiple times
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0, // default value if no reviews exist
      ratingsAverage: 4.5, // default value if no reviews exist
    });
  }
};

reviewSchema.post('save', function () {
  // this points to the current review
  this.constructor.calcAverageRatings(this.tour);
});

// findOneAndUpdate and findOneAndDelete are not affected by the post save hook
// so we need to use pre and post hooks for them
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // this will store the current review
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // this points to the current review
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
