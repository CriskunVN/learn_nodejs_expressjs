const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// name , email , password , passwordConfirm , photo , role , active
const userSchema = new mongoose.Schema({
  // the name of the user
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  // the email of the user
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  // the password of the user
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    select: false, // do not show password in query results
  },
  // the password confirm of the user
  passwordConfirm: {
    type: String,
    required: [true, 'A user must have a passwordConfirm'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },
  // the password change date of the user
  passwordChangeAt: {
    type: Date,
    default: Date.now(),
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  // the password reset token of the user
  passwordResetToken: String,
  // the password reset expires date of the user
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // do not show active in query results
  },
});

// document middleware: runs before .save() and .create()
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // remove passwordConfirm
  next();
});

// instance method to check if the password is changed after the token was issued
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangeAt = Date.now() - 1000; // to make sure the passwordChangeAt is before the token issued at
  next();
});

// query middleware: runs before .find() and .findOne()
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }); // exclude all inactive users
  next();
});

// check password login with hashed password in the database
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if the password is changed after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp; // false means NOT changed
  }
  return false;
};

// create password reset token
userSchema.methods.createPasswordResetToken = function () {
  // create random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // set expire time for the token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
