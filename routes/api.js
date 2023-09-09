let express = require('express');

let userRouter = require('./user');
let jobRouter = require('./job');


let app = express();

app.use('/user/', userRouter);
app.use('/job/', jobRouter);


module.exports = app;
