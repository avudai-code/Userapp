require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const server = http.Server(app);
var apiRouter = require('./routes/api');

var bodyParser = require('body-parser');



const mongoURI = process.env.MONGODB_URI;

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});
var db = mongoose.connection;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use('/api/', apiRouter);


const port = 3000;
server.listen(port, () => {
  console.log(`App listening on port: ${port}`);
});
module.exports = app;