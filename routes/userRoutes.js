const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controller/userController');

const { signup } = require('../controller/authController');

const router = express.Router();

// authentication
router.post('/signup', signup);

// users
router.route('/').get(getAllUsers).post(createUser);

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
