// Helper Class

exports.successResponse = function (res, msg) {
	var data = {
		status: 1,
		message: msg
	};
	return res.status(200).json(data);
};

exports.successResponseWithData = function (res, msg, data) {
	var resData = {
		status: 1,
		message: msg,
		data: data
	};
	return res.status(200).json(resData);
};

exports.ErrorResponse = function (res, msg, data) {
	console.log('Error Message: ', msg);
	console.log('Error Stack: ', data);
	var data = {
		status: 0,
		message: process.env.NODE_ENV !=='production' ? msg : 'Something went wrong',
		data: process.env.NODE_ENV !=='production' ? data : {},
	};
	return res.status(500).json(data);
};



exports.notFoundResponse = function (res, msg) {
	var data = {
		status: 0,
		message: msg,
	};
	return res.status(404).json(data);
};
exports.forbiddenResponse = function (res, msg) {
	var data = {
		status: 403,
		message: msg,
	};
	return res.status(403).json(data);
};
exports.processingResponse = function (res, msg) {
	var data = {
		status: 202,
		message: msg,
	};
	return res.status(202).json(data);
};
exports.validationErrorWithData = function (res, msg, data) {
	var resData = {
		status: 0,
		message: msg,
		data: data
	};
	return res.status(400).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
	var data = {
		status: 0,
		message: msg,
	};
	return res.status(401).json(data);
};

exports.conflictResponse = function (res, msg) {
	var data = {
		status: 409,
		message: msg,
	};
	return res.status(409).json(data);
};
