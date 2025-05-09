const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controller/userController');

const { protect } = require('../controller/authController');

const { signup, login } = require('../controller/authController');

const router = express.Router();

// authentication
router.post('/signup', signup);
router.post('/login', login);

// users
router.route('/').get(protect, getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
