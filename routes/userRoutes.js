const express = require('express');
const userController = require('../controller/userController');

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

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
); // route for get current user
router.patch('/updateMe', authController.protect, userController.updateMe); // route for update user data
router.delete('/deleteMe', authController.protect, userController.deleteMe); // route for delete user

// users
router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser); // route for get all users and create user

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser,
  );

module.exports = router;
