const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controller/userController');

const authController = require('../controller/authController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require('../controller/authController');

const router = express.Router();

// authentication
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

// users
router.route('/').get(authController.protect, getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
