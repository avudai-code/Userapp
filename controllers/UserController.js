const User = require('../models/UserModel');
const apiResponse = require('../helpers/apiResponse');
const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = 'secret';
const jwtMiddleware = require('../middlewares/jwtMiddleware');

const PAGE_SIZE = 10;



exports.userLogin = [

    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
            } else {
                // Find the user by email (assuming email is unique).
                User.findOne({ email: req.body.email }, (err, user) => {
                    if (err) {
                        return apiResponse.ErrorResponse(res, err);
                    }
                    if (!user) {
                        return apiResponse.unauthorizedResponse(res, 'Invalid email or password.');
                    }

                    // Compare the provided password with the hashed password in the database.
                    bcrypt.compare(req.body.password, user.password, (bcryptErr, isMatch) => {
                        if (bcryptErr) {
                            return apiResponse.ErrorResponse(res, bcryptErr);
                        }
                        if (!isMatch) {
                            return apiResponse.unauthorizedResponse(res, 'Invalid email or password.');
                        }

                        // User login is successful. Generate a JWT token with username and email.
                        const payload = {
                            user: {
                                id: user._id,
                                username: user.username,
                                email: user.email,
                                // Include other user data as needed.
                            },
                        };

                        jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (jwtErr, token) => {
                            if (jwtErr) {
                                return apiResponse.ErrorResponse(res, jwtErr);
                            }

                            // Send the JWT token in the response.
                            return apiResponse.successResponseWithData(res, 'User logged in successfully.', { token });
                        });
                    });
                });
            }
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    },
];


exports.userRegistration = [
    body('username', 'Username must not be empty.').isLength({ min: 1 }).trim().custom((value) => {
        return User.findOne({ username: value }).then(user => {
            if (user) {
                return Promise.reject('Username already exists.');
            }
        });
    }),
    body('email', 'Email must not be empty and should be a valid email.').isEmail().custom((value) => {
        return User.findOne({ email: value }).then(user => {
            if (user) {
                return Promise.reject('Email already exists.');
            }
        });
    }),


    (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
            } else {
                // Hash the user's password before saving it.
                bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
                    if (err) {
                        return apiResponse.ErrorResponse(res, err);
                    }
                    
                    var user = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: hashedPassword, // Store the hashed password in the database.
                        fullName: req.body.fullName,
                        // Add more user fields as needed.
                    });

                    // Save User.
                    user.save(function (err) {
                        if (err) { return apiResponse.ErrorResponse(res, err); }
                        return apiResponse.successResponseWithData(res, 'New User registered successfully.', user);
                    });
                });
            }
        } catch (err) {
            return apiResponse.ErrorResponse(res, err);
        }
    }
];



// GET API for fetching users with pagination (limit and offset)

exports.userList = [
	jwtMiddleware, // Apply JWT middleware here
	function (req, res) {
	  try {
		const limit = Number(req.query.limit) || PAGE_SIZE;
		const page = req.query.page || 1;
		const username = req.query.username; // Change to username filter
		const email = req.query.email; // Add email filter
		const sortBy = req.query.sortBy;
  
		const pipeline = [];
		if (username) {
		  pipeline.push({
			$match: {
			  username: { $regex: username, $options: 'i' },
			},
		  });
		}
		if (email) {
		  pipeline.push({
			$match: {
			  email: { $regex: email, $options: 'i' },
			},
		  });
		}
		if (sortBy) {
		  let field = sortBy;
		  let operator = 1;
		  if (sortBy.includes('-')) {
			field = sortBy.split('-')[1];
			operator = -1;
		  }
		  pipeline.push({
			$sort: { [field]: operator },
		  });
		}
  
		// Exclude the 'password' field from the query result
		pipeline.push({
		  $project: {
			password: 0, // Exclude the 'password' field
		  },
		});
  
		// Pagination with facet
		pipeline.push({
		  $facet: {
			metadata: [{ $count: 'total' }, { $addFields: { page: page } }],
			data: [{ $skip: (limit * (page - 1)) }, { $limit: limit }],
		  },
		});
  
		User.aggregate(pipeline, function (err, result) {
		  if (err) {
			return apiResponse.ErrorResponse(res, err);
		  }
		  res.setHeader('X-Per-Page', limit);
		  res.setHeader('X-Page', page);
		  if (result[0].data.length > 0) {
			res.setHeader('X-Total-Count', result[0].metadata[0].total);
		  } else {
			res.setHeader('X-Total-Count', 0);
		  }
		  return apiResponse.successResponseWithData(res, 'Operation success', result[0].data);
		});
	  } catch (err) {
		// Throw error in JSON response with status 500.
		return apiResponse.ErrorResponse(res, err);
	  }
	},
  ];
  

  exports.userDetails = [jwtMiddleware,
	function (req, res) {
	  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		return apiResponse.validationErrorWithData(res, 'Invalid Error.', 'Invalid Identifier');
	  }
	  try {
		User.findOne({ _id: req.params.id }, { password: 0 }) // Exclude the 'password' field
		  .then((user) => {
			if (!user) {
			  return apiResponse.notFoundResponse(res, 'User not found');
			}
			// Modify user data here if needed
			return apiResponse.successResponseWithData(res, 'Operation success', user);
		  })
		  .catch((err) => {
			return apiResponse.ErrorResponse(res, err);
		  });
	  } catch (err) {
		// Throw error in JSON response with status 500.
		return apiResponse.ErrorResponse(res, err);
	  }
	},
  ];
  

  exports.userUpdate = [jwtMiddleware,
	body('username', 'Username must not be empty.').isLength({ min: 1 }).trim(),
	body('email', 'Email must not be empty.').isEmail().normalizeEmail(),
	
	(req, res) => {
	  try {
		const updates = req.body;
		const errors = validationResult(req);
  
		if (!errors.isEmpty()) {
		  return apiResponse.validationErrorWithData(res, 'Validation Error.', errors.array());
		} else {
		  const update = function () {
			let _model = {
			  username: req.body.username,
			  email: req.body.email,
              fullName: req.body.fullName,
			  _id: req.params.id,
			};
  
			const user = new User(_model);
			User.findByIdAndUpdate(req.params.id, user, {}, function (err) {
			  if (err) {
				return apiResponse.ErrorResponse(res, err);
			  }
			  // Optional: Modify user data here if needed
			  return apiResponse.successResponseWithData(res, 'User update Success.', user);
			});
		  };
  
		  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(res, 'Invalid Error.', 'Invalid Identifier');
		  } else {
			User.findById(req.params.id, async function (err, foundUser) {
			  if (foundUser === null) {
				return apiResponse.notFoundResponse(res, 'User does not exist with this id');
			  } else {
				update();
			  }
			});
		  }
		}
	  } catch (err) {
		// Throw error in JSON response with status 500.
		return apiResponse.ErrorResponse(res, err);
	  }
	},
  ];
  


// DELETE API for deleting a user by ID
exports.userDelete = [
	(req, res) => {
	  try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
		  return apiResponse.validationErrorWithData(res, 'Invalid Error.', 'Invalid Identifier');
		} else {
		  User.findByIdAndRemove(req.params.id, function (err, deletedUser) {
			if (err) {
			  return apiResponse.ErrorResponse(res, err);
			}
			if (!deletedUser) {
			  return apiResponse.notFoundResponse(res, 'User does not exist with this id');
			}
			// Optional: Perform any additional operations after user deletion
  
			return apiResponse.successResponseWithData(res, 'User deleted successfully.', deletedUser);
		  });
		}
	  } catch (err) {
		// Throw error in JSON response with status 500.
		return apiResponse.ErrorResponse(res, err);
	  }
	},
  ];

  



  exports.bookSearch = [ async (req, res) => {
  const { title, author } = req.query;
  if (!title && !author) {
    return apiResponse.ErrorResponse(res, 'Title or author parameter is required.', 400);
  }

  try {
    let query = {};
    if (title) {
      query.title = { $regex: title, $options: 'i' }; // Case-insensitive search for title
    }
    if (author) {
      query.author = { $regex: author, $options: 'i' }; // Case-insensitive search for author
    }

    const books = await Book.find(query);

    return apiResponse.successResponseWithData(res, 'Search successful.', books);
  } catch (err) {
    return apiResponse.ErrorResponse(res, 'Something went wrong.', 500);
  }
}]

