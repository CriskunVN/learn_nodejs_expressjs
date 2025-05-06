const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name , email , password , passwordConfirm , photo , role , active
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
  },
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
  photo: String,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // remove passwordConfirm
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
