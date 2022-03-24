// import entire SDK
var AWS = require('aws-sdk');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('hello folks..')
})


app.listen(5000);