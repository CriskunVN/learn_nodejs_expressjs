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
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

router.patch('/updateMe', authController.protect, updateMe);
router.delete('/deleteMe', authController.protect, deleteMe);

// users
router.route('/').get(authController.protect, getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
