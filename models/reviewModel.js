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

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
