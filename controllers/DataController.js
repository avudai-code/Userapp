const axios = require('axios');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const apiResponse = require('../helpers/apiResponse');
const { Job } = require('../models/JobModel');

const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

exports.fetchDataAndStoreInMongoDB = async () => {
  try {
    // Fetch data from the third-party API
    const response = await axios.get(apiUrl);

    // Parse the response data
    const apiData = response.data;

    // Store the parsed data in MongoDB
    await Data.insertMany(apiData);

    console.log('Data fetched and stored successfully.');
  } catch (error) {
    console.error('Error fetching or storing data:', error.message);
  } 
};
