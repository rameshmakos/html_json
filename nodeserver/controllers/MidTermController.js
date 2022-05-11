var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(express.json());

const fs = require("fs");
const uniqid = require("uniqid");

// Load the Amazon QLDB Driver for Node.js
var qldb = require("amazon-qldb-driver-nodejs");
// Load the AWS SDK for node.js
var AWS = require("aws-sdk");

// Configure the SDK by setting the global configuration using 
var myConfig = new AWS.Config();
myConfig.update({ region: "us-east-1" });

//function to create index for the table shortTerm
const createIndex = function (driver, callback) {
    driver
        .executeLambda(async (txn) => {
            txn.execute("CREATE INDEX ON MediumTermInvestment(Id)");
        })
        .then(callback);
};


// API to create table 'ShortTerm' in the ledger 
const createTableMediumTerm = (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    driver
        .executeLambda(async (txn) => {
            txn.execute("CREATE TABLE MediumTermInvestment");
        })
        .then(() => {
            createIndex(driver, function () {
                driver.close();
            });
        })
        .then((result) => {
            res.json({ result: 'Created Midiumterm Table Successfully!' });
        });
}



// API to read all short term data for all screen size
const readMediumTermRecords = async (req, res) => {
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    // const jsonfile = fs.readFileSync("./config/pages/MediumTermInvestment.json");
    // var json_object = JSON.parse(jsonfile);
    var json_object = '';

    await qldbDriver.executeLambda(async (txn) => {

        const query = 'SELECT * FROM Config WHERE name = ?';

        const result = await txn.execute(query, 'MediumTerm');
        const resultList = result.getResultList();
        // console.log('my new query SHORT TERM CONFIG RESULT -', resultList[0].data);
        // res.send(resultList[0].data);
        json_object = resultList[0].data
        
       
    });

    const result_array = [];
    var mode_type = req.params.mode;
    var children = json_object[mode_type]['children'];
    json_object['children'] = children;

    delete json_object['Desktop'];
    delete json_object['Tab'];
    delete json_object['Mobile'];
    delete json_object['Admin'];
    var text = '';
    children.forEach(element => {
        text = text + element.dataSource + ",";
    });
    const sql = text.slice(0, -1) //'abcde'
    console.log('Final SQL QUERY - ', sql);
    var final_sql = "SELECT " + sql + " FROM MediumTermInvestment";


    qldbDriver
        .executeLambda(async (txn) => {
            return txn.execute(
                final_sql,
            );
        })
        .then((result) => {
            console.log('Result - ', result.getResultList());
            const data = result.getResultList();
            const response = Object.values(JSON.parse(JSON.stringify(data)));
            response.forEach((item) => {
                var temp_array = []
                for (const [key, value] of Object.entries(item)) {
                    temp_array.push(value);
                }
                result_array.push(temp_array);
            })
            //Pretty print the result list
            //console.log("The result List is ", JSON.stringify(resultList, null, 2));
            //console.log(resultList);
            json_object['data'] = result_array;
            res.send(json_object);
        })
        .then((result) => {
            qldbDriver.close();
        });

};


//function to insert new short term record in the 'ShortTermInvestment' Table from admin site
const createMediumTermData = async (req, res) => {
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    var document = req.body;
    document.id = uniqid();
    console.log('INputs Medium Term - ', document);
    // var final_sql = "SELECT * FROM ShortTermInvestment";
    //docIdArray[0].get('documentId').stringValue(); to check doc id

    await qldbDriver.executeLambda(async (txn) => {

        const query = 'INSERT INTO MediumTermInvestment ?';

        const result = await txn.execute(query, document);
        const resultList = result.getResultList();
        console.log('LAMBDA RESULT -', resultList);
        res.json({ message: 'Record created Successfully', data: resultList });
        res.end();

        // res.json({ data : data});
    });

};


//function to read admin side midterm records
///function to read list of records for admin site
const readMediumTermData = async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    // const jsonfile = fs.readFileSync("./config/pages/MediumTermInvestment.json");
    // var json_object = JSON.parse(jsonfile);

    var json_object = '';

    await qldbDriver.executeLambda(async (txn) => {

        const query = 'SELECT * FROM Config WHERE name = ?';

        const result = await txn.execute(query, 'MediumTerm');
        const resultList = result.getResultList();
        // console.log('my new query SHORT TERM CONFIG RESULT -', resultList[0].data);
        // res.send(resultList[0].data);
        json_object = resultList[0].data
        
       
    });
    const result_array = [];
    var mode_type = 'Admin';
    var children = json_object[mode_type]['children'];
    json_object['children'] = children;

    delete json_object['Desktop'];
    delete json_object['Tab'];
    delete json_object['Mobile'];
    delete json_object['Admin'];

    var text = '';
    children.forEach(element => {
        text = text + element.dataSource + ",";
    });
    const sql = text.slice(0, -1) //'abcde'
    console.log('Final SQL QUERY reading- ', sql);
    var final_sql = "SELECT " + sql + " FROM MediumTermInvestment";

    await qldbDriver.executeLambda(async (txn) => {
        sampleQuery = 'SELECT * FROM MediumTermInvestment';
        const result = await txn.execute(sampleQuery);
        const resultList = result.getResultList();
        json_object['data'] = resultList;
        // console.log('LAMBDA RESULT -', resultList);

        // res.json({ message : 'Success', data : resultList });
        res.send(json_object);
        res.end();
    });

};

//function to update new short term record in the 'ShortTermInvestment' Table
const updateMediumTermData = async (req, res) => {
   // res.set('Access-Control-Allow-Origin', 'http://localhost:3000/api/admin');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    const id = req.body.id;

    const document = req.body;
    console.log('Update Inputs in medium term - ', document); 

    await qldbDriver.executeLambda(async (txn) => {

        //an update query to modify given document with the updated data
        const query = 'UPDATE MediumTermInvestment AS MT SET MT.stock = ?, MT.price = ?, MT.target = ?, MT.info = ?, MT.disclosure = ? WHERE MT.id = ?';

        const result = await txn.execute(query, document.stock, document.price, document.target, document.info, document.disclosure, id);
        const resultList = result.getResultList();
        console.log('LAMBDA UPDATE RESULT -', resultList);
        res.json({ message: 'Record updated Successfully', data: resultList });
        res.end();

        // res.json({ data : `document update id is  = ${id}`});
    });

};


//function to delete a record from table with id
const deleteMediumTermData = async (req, res) => {
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    const id = req.params.id;
    console.log('delete record id -', id);

    await qldbDriver.executeLambda(async (txn) => {

        //an update query to modify given document with the updated data
        //const query = 'DELETE FROM ShortTermInvestment AS ST WHERE ST.id = ?'; ///Hind Copper
        const newQuery = 'DELETE FROM MediumTermInvestment WHERE id = ?'
       

        const result = await txn.execute(newQuery, id);
        const resultList = result.getResultList();
        // console.log('LAMBDA DELETE RESULT -', resultList);
        res.json({ message: 'Record deleted Successfully', data: resultList });
        res.end();

    });
    
};


///----------------------------------------------------------------------------------------------------------------------------////


//function to insert medium term config file in the 'config' table
const insertIntoMediumTermConfigTable = async (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    console.info('Inserting into Config table...'); 
    // const document = req.body;
    const jsonfile = fs.readFileSync("./config/pages/MediumTermInvestment.json");
    var json_object = JSON.parse(jsonfile);
    // res.json({ message: 'Config table inserted Successfully!', data: json_object });
    const newConfigData =  { id: uniqid(), name :'MediumTerm', data: json_object };
    // document.id = uniqid();
    console.log('insert Into Config Table - ', newConfigData);
    await driver.executeLambda(async (txn) => {
        const query = 'INSERT INTO Config ?';
        const result = await txn.execute(query, newConfigData);
        const resultList = result.getResultList();
        // console.log('LAMBDA RESULT -', resultList);
        res.json({ message: 'Config record added into medium term Successfully', data: resultList });
        res.end();
    });
    //  res.json({ message: 'Config table inserted Successfully!', data: newConfigData });
 
}


module.exports = {
    createTableMediumTerm,
    readMediumTermRecords,

    createMediumTermData,
    readMediumTermData,
    updateMediumTermData,
    deleteMediumTermData,

    insertIntoMediumTermConfigTable

}