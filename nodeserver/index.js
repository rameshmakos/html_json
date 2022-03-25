const express = require("express");
// Load the Amazon QLDB Driver for Node.js
var qldb = require("amazon-qldb-driver-nodejs");
// Load the AWS SDK for node.js
var AWS = require("aws-sdk");
// Configure the SDK by setting the global configuration using 
// AWS.Config
var myConfig = new AWS.Config();
myConfig.update({ region: "us-east-1" });
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
const createIndex = function (driver, callback) {
  driver
    .executeLambda(async (txn) => {
      txn.execute("CREATE INDEX ON People (firstName)");
    })
    .then(callback);
};
// API to create table 'People' in the ledger 
// named 'my-store-ledger' 
app.get("/createTable", (req, res) => {
  const driver = new qldb.QldbDriver("SPT-dev", myConfig);
  driver
    .executeLambda(async (txn) => {
      txn.execute("CREATE TABLE People");
    })
    .then(() => {
      createIndex(driver, function () {
         driver.close();
      });
    })
    .then((result) => {
      res.send(JSON.stringify("{result: 'Created Table Successfully!'}"));
    });
});
// API to add a person in the table
app.post("/addPerson", (req, res) => {
  const driver = new qldb.QldbDriver("SPT-dev", myConfig);
  const person = req.body;
  driver
    .executeLambda((txn) => {
      txn.execute('INSERT INTO People `{"first_name":"John","last_name":"Doe", "age":"17"}`');
      
    })
    .then(() => {
      res.send(JSON.stringify("{result: 'Added Person Successfully!'}"));
    })
    .then((result) => {
      driver.close();
    });
});
// Get API to get the Person by First Name
app.get("/getPerson", (req, res) => {
  const driver = new qldb.QldbDriver("SPT-dev", myConfig);
//   const firstName = req.params.firstName;
//"SELECT * FROM People"
//'SELECT (first_name || `@` || last_name) AS full_name FROM People'   --- FOR CONCAT QUERY PURPOSE
  driver
    .executeLambda(async (txn) => {
      return txn.execute(
        "SELECT * FROM People"  ,
        
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