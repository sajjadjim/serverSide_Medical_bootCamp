const express = require('express');
const router = express.Router();
const { getAllCamps, getCampByID } = require('../controllers/camp.controller');
const {createCamp} = require('../controllers/camp.controller');

router.get('/', getAllCamps);       // GET all camps
router.post('/', createCamp);       // POST a new camp
router.get('/:id', getCampByID); // GET camp by ID

module.exports = router;
