// controllers/JobController.js
const Job = require('../models/JobModel');
const { body, validationResult } = require('express-validator');
const apiResponse = require('../helpers/apiResponse');

exports.createJob = [
  // Validation middleware (if needed)
  body('name', 'Name must not be empty.').isLength({ min: 1 }).trim(),
  body('complexity', 'Complexity must not be empty.').isLength({ min: 1 }).trim(),

  (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
      } else {
        // Create a new job with the provided data
        const { name, complexity } = req.body;
        const newJob = new Job({
          name,
          complexity,
          status: 'queued',
        });

        // Save the new job to MongoDB
        newJob.save(function (err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          return apiResponse.successResponseWithData(res, 'New job created successfully.', newJob);
        });
      }
    } catch (err) {
      return apiResponse.ErrorResponse(res, err);
    }
  },
];
