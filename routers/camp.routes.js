const express = require('express');
const router = express.Router();
const { getAllCamps } = require('../controllers/camp.controller');
const {createCamp} = require('../controllers/camp.controller');

router.get('/', getAllCamps);       // GET all camps
router.post('/', createCamp);       // POST a new camp

module.exports = router;
