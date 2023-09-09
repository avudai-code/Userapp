const mongoose = require('mongoose');

// Define the Data schema
const dataSchema = new mongoose.Schema({
  userId: Number,
  id: Number,
  title: String,
  body: String,
});


// Create the Data model
const Data = mongoose.model('Data', dataSchema);

module.exports = { User, Data };
