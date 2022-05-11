const express = require("express");
const cors = require("cors");
var bodyParser = require('body-parser')
const fs = require("fs");
var ShortTermInvestment=require("./config/pages/ShortTermInvestment.json");
// Load the Amazon QLDB Driver for Node.js
var qldb = require("amazon-qldb-driver-nodejs");
// Load the AWS SDK for node.js
var AWS = require("aws-sdk");
const sptRoute = require("./routes/sptRoute")
// Configure the SDK by setting the global configuration using 
// AWS.Config
var myConfig = new AWS.Config();
myConfig.update({ region: "us-east-1" });
const app = express();
   
var jsonParser = bodyParser.json();

app.use('/api', jsonParser, sptRoute)

app.use(cors())

const port = 8000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(express.static('public'));
// app.use(require('connect').bodyParser());

app.use(function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
  // res.write('you posted:\n')
  // res.end(JSON.stringify(req.body, null, 2))
  
})


// ## CORS middleware
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// var bodyParser = require('body-parser')

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',  (req, res) => {
  res.send('NODE_ENV');
})

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);


// Get API to get the Person by First Name
app.get("/getPerson", (req, res) => {
  const driver = new qldb.QldbDriver("SPT-dev", myConfig);
//   const firstName = req.params.firstName;
//"SELECT * FROM People"
//'SELECT (first_name || `@` || last_name) AS full_name FROM People'   --- FOR CONCAT QUERY PURPOSE
var sql="SELECT * FROM ShortTerm";  
  driver
    .executeLambda(async (txn) => {
      return txn.execute(
        sql,
        
      );
    })
    .then((result) => {
      const resultList = result.getResultList();
      //Pretty print the result list
      console.log("The result List is ", JSON.stringify(resultList, null, 2));
      res.send(JSON.stringify(resultList, null, 2));
    })
    .then((result) => {
      driver.close();
    });
});


// PUT API for updating a person last name based on first name
app.get("/updatePersonLastName", (req, res) => {
  const driver = new qldb.QldbDriver("SPT-dev", myConfig);
//   const person = req.body;
// txn.execute(
//     "UPDATE People SET first_name = ? WHERE last_name = ?",
//     person.lastName,
//     person.firstName
//   );


    const person = { firstName: 'John', lastName: 'Gurram' };
    var sql = "UPDATE People SET last_name = '"+person.lastName+"' WHERE first_name = 'John'"
  driver
    .executeLambda((txn) => {
      txn.execute(
        sql,
      );
    })
    .then(() => {
      res.send(JSON.stringify("{result: 'Person updated Successfully!'}"));
    })
    .then((result) => {
      driver.close();
    });
});





