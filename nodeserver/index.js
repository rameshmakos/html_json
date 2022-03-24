// import entire SDK
var AWS = require('aws-sdk');
// var AWS = require("aws-sdk");
// Set the Region
AWS.config.update({region: "us-west-2"});
const express = require('express');
const app = express();


// Create DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: "2006-03-01"});

// Call DynamoDB to retrieve the list of tables
ddb.listTables({Limit:10}, function(err, data) {
  if (err) {
    console.log("Error", err.code);
  } else {
    console.log("Tables names are ", data.TableNames);
  }
});

app.get('/', (req, res) => {
  res.send('hello folks..')
})


app.listen(5000);