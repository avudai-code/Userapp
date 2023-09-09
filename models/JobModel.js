// Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  name: String,
  complexity: String,
  status: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);
