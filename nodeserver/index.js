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

app.use('/api', sptRoute)

app.use(cors())
const port = 5000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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





