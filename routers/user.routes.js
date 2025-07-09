const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/user.controller');
const { createUser } = require('../controllers/user.controller');

// GET /users
router.get('/', getAllUsers);
router.post('/', createUser); 

module.exports = router;
