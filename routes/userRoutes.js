const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  updateMe,
  deleteMe,
} = require('../controller/userController');

const authController = require('../controller/authController');

const router = express.Router();

// authentication
router.post('/signup', authController.signup); // route for signup
router.post('/login', authController.login); // route for login
router.post('/forgotPassword', authController.forgotPassword); // route for forgot password
router.patch('/resetPassword/:token', authController.resetPassword); // route for reset password

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
); // route for update password

router.patch('/updateMe', authController.protect, updateMe); // route for update user data
router.delete('/deleteMe', authController.protect, deleteMe); // route for delete user

// users
router.route('/').get(authController.protect, getAllUsers).post(createUser); // route for get all users and create user

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
