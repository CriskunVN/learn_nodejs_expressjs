const express = require('express');
const userController = require('../controller/userController');

const authController = require('../controller/authController');

const router = express.Router();

// authentication
router.post('/signup', authController.signup); // route for signup
router.post('/login', authController.login); // route for login
router.post('/forgotPassword', authController.forgotPassword); // route for forgot password
router.patch('/resetPassword/:token', authController.resetPassword); // route for reset password

// authentication middleware
router.use(authController.protect); // protect all routes after this middleware

router.patch('/updateMyPassword', authController.updatePassword); // route for update password

router.get('/me', userController.getMe, userController.getUser); // route for get current user
router.patch('/updateMe', userController.updateMe); // route for update user data
router.delete('/deleteMe', userController.deleteMe); // route for delete user

// restrict to admin for the following routes
router.use(authController.restrictTo('admin')); // restrict to admin for all routes after this middleware
// users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser); // route for get all users and create user

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
