var express = require('express');
const JobController = require('../controllers/JobController');

var router = express.Router();


router.post('/', JobController.createJob);




module.exports = router;