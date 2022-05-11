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
            txn.execute("CREATE INDEX ON ShortTermInvestment(Id)");
        })
        .then(callback);
};


// API to create table 'ShortTerm' in the ledger 
const createTable = (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    driver
        .executeLambda(async (txn) => {
            txn.execute("CREATE TABLE ShortTermInvestment");
        })
        .then(() => {
            createIndex(driver, function () {
                driver.close();
            });
        })
        .then((result) => {
            res.json({ result: 'Created Table Successfully!' });
        });
}



// API to read all short term data for all screen size
const readShortTermRecords = async (req, res) => {
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    // const jsonfile = fs.readFileSync("./config/pages/ShortTermInvestment.json");
    // var json_object = JSON.parse(jsonfile);
    var json_object = '';

    await qldbDriver.executeLambda(async (txn) => {

        const query = 'SELECT * FROM Config WHERE name = ?';

        const result = await txn.execute(query, 'ShortTerm');
        const resultList = result.getResultList();
        console.log('my new query SHORT TERM CONFIG RESULT -', resultList[0].data);
        // res.send(resultList[0].data);
        json_object = resultList[0].data
        
       
    });

    const result_array = [];
    var mode_type = req.params.mode;
    var children = json_object[mode_type]['children'];
    json_object['children'] = children;

    // delete json_object['Desktop'];
    // delete json_object['Tab'];
    // delete json_object['Mobile'];
    // delete json_object['Admin'];
    delete json_object.Desktop;
    delete json_object.Tab;
    delete json_object.Mobile;
    delete json_object.Admin;

    var text = '';
    children.forEach(element => {
        text = text + element.dataSource + ",";
    });
    const sql = text.slice(0, -1) //'abcde'
    console.log('Final SQL QUERY - ', sql);
    var final_sql = "SELECT " + sql + " FROM ShortTermInvestment";



    qldbDriver
        .executeLambda(async (txn) => {
            return txn.execute(
                final_sql,
            );
        })
        .then((result) => {
            // console.log('Result - ', result.getResultList());
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
            
            json_object['data'] = result_array;
            res.send(json_object);
        })
        .then((result) => {
            qldbDriver.close();
        });

};




///function to read list of records for admin site
const readData = async (req, res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    // const jsonfile = fs.readFileSync("./config/pages/ShortTermInvestment.json");
    // var json_object = '';
    var json_object = '';

    await qldbDriver.executeLambda(async (txn) => {

        const query = 'SELECT * FROM Config WHERE name = ?';

        const result = await txn.execute(query, 'ShortTerm');
        const resultList = result.getResultList();
        console.log('my new query SHORT TERM CONFIG RESULT -', resultList[0].data);
        // res.send(resultList[0].data);
        json_object = resultList[0].data
        
       
    });


    // var json_object = JSON.parse(jsonfile);
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
    // console.log('Final SQL QUERY reading- ', sql);
    var final_sql = "SELECT " + sql + " FROM ShortTermInvestment";

    await qldbDriver.executeLambda(async (txn) => {
        sampleQuery = 'SELECT * FROM ShortTermInvestment';
        const result = await txn.execute(sampleQuery);
        const resultList = result.getResultList();
        json_object['data'] = resultList;
        // console.log('LAMBDA RESULT -', resultList);

        res.send(json_object);
        // res.end();
    });


};


//function to insert new short term record in the 'ShortTermInvestment' Table from admin site
const createData = async (req, res) => {
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.setHeader('Content-Type', 'application/json');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    var document = req.body;
    // document = JSON.parse(document);
    document.id = uniqid();

   
    console.log('Create Inputs backend- ', document);
    // var final_sql = "SELECT * FROM ShortTermInvestment";
    //docIdArray[0].get('documentId').stringValue(); to check doc id
   

    await qldbDriver.executeLambda(async (txn) => {

        const query = 'INSERT INTO ShortTermInvestment ?';

        const result = await txn.execute(query, document);
        const resultList = result.getResultList();
        console.log('LAMBDA RESULT -', resultList);
        res.json({ message: 'Record created Successfully', data: resultList });
        // res.end();
        // res.json({ data : data});
    });

};

//function to update new short term record in the 'ShortTermInvestment' Table
const updateData = async (req, res) => {
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    // res.setHeader('Content-Type', 'application/json');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    const id = req.body.id;

    var document = req.body;
    // document = JSON.parse(document);

    console.log('Update Inputs - ', document); 
    // const id = 'kpq5ppll1f0i4t7';
    // const document = {
    //     stock: "Abc",
    //     stockCat: "Mid Corp",
    //     cmp: "123.23",
    //     bs: "Buy",
    //     price: "541 (11th Feb @ 02.35 pm)",
    //     target: "1050 (31st Mar)",
    //     disclosure: "Have Not Interest"
    // }

    await qldbDriver.executeLambda(async (txn) => {

        //an update query to modify given document with the updated data
        const query = 'UPDATE ShortTermInvestment AS ST SET ST.stock = ?, ST.stockCat = ?, ST.bs = ?, ST.price = ?, ST.target = ?, ST.disclosure = ? WHERE ST.id = ?';

        const result = await txn.execute(query, document.stock, document.stockCat, document.bs, document.price, document.target, document.disclosure, id);
        const resultList = result.getResultList();
        console.log('LAMBDA UPDATE RESULT -', resultList);
        res.json({ message: 'Record updated Successfully', data: resultList });
        // res.end();

        // res.json({ data : `document update id is  = ${id}`});
    });

};


//function to delete a record from table with id
const deleteData = async (req, res) => {
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    const id = req.params.id;
    console.log('delete record id -', id);

    await qldbDriver.executeLambda(async (txn) => {

        //an update query to modify given document with the updated data
        //const query = 'DELETE FROM ShortTermInvestment AS ST WHERE ST.id = ?'; ///Hind Copper
        const newQuery = 'DELETE FROM ShortTermInvestment WHERE id = ?'
       

        const result = await txn.execute(newQuery, id);
        const resultList = result.getResultList();
        // console.log('LAMBDA DELETE RESULT -', resultList);
        res.json({ message: 'Record deleted Successfully 17.80', data: resultList });
        res.end();

    });
    
};

//------------------------------------------------------------------------------==-=-==-=--=---------------------------------//


//function to create index for the table 'Config'
const createConfigIndex = function (driver, callback) {
    driver
        .executeLambda(async (txn) => {
            txn.execute("CREATE INDEX ON Config(Id)");
        })
        .then(callback);
};

///creating config file database table 'Config'
const createConfigTable = async (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    console.log('config table created...');
    driver
        .executeLambda(async (txn) => {
            txn.execute("CREATE TABLE Config");
        })
        .then(() => {
            createConfigIndex(driver, function () {
                driver.close();
            });
        })
        .then((result) => {
          
            res.json({ result: 'Config table created Successfully!'});
        });

}

const insertIntoConfigTable = async (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    console.info('Inserting into Config table...'); 
    // const document = req.body;
    const jsonfile = fs.readFileSync("./config/pages/ShortTermInvestment.json");
    var json_object = JSON.parse(jsonfile);
    // res.json({ message: 'Config table inserted Successfully!', data: json_object });
    const newConfigData =  { id: uniqid(), name :'ShortTerm', data: json_object };
    // document.id = uniqid();
    console.log('insert Into Config Table - ', newConfigData);
    await driver.executeLambda(async (txn) => {
        const query = 'INSERT INTO Config ?';
        const result = await txn.execute(query, newConfigData);
        const resultList = result.getResultList();
        // console.log('LAMBDA RESULT -', resultList);
        res.json({ message: 'Config record created Successfully', data: resultList });
        res.end();
    });
   
 
}

const readShortTermConfigData = async (req, res) => { 
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    console.info('Reading Config table...');
    await driver.executeLambda(async (txn) => {
        const query = 'SELECT * FROM Config WHERE name = ?';
        const name = 'ShortTerm'
        const result = await txn.execute(query, name);
        const resultList = result.getResultList();

        console.log('LAMBDA RESULT -', resultList);
        res.json({ data: resultList, message: 'Config record read Successfully' });
        res.end();
    });
}






///getting config file from local files
// API to read all short term data for all screen size
const RSTR = async (req, res) => {
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    const jsonfile = fs.readFileSync("./config/pages/ShortTermInvestment.json");
    var json_object = JSON.parse(jsonfile);
    

    const result_array = [];
    var mode_type = req.params.mode;
    var children = json_object[mode_type]['children'];
    json_object['children'] = children;

    delete json_object['Desktop'];
    delete json_object['Tab'];
    delete json_object['Mobile'];
    delete json_object['Admin'];
    // delete json_object.Desktop;
    // delete json_object.Tab;
    // delete json_object.Mobile;
    // delete json_object.Admin;

    var text = '';
    children.forEach(element => {
        text = text + element.dataSource + ",";
    });
    const sql = text.slice(0, -1) //'abcde'
    console.log('Final SQL QUERY - ', sql);
    var final_sql = "SELECT " + sql + " FROM ShortTermInvestment";



    qldbDriver
        .executeLambda(async (txn) => {
            return txn.execute(
                final_sql,
            );
        })
        .then((result) => {
            // console.log('Result - ', result.getResultList());
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
            
            json_object['data'] = result_array;
            res.send(json_object);
        })
        .then((result) => {
            qldbDriver.close();
        });

};






module.exports = {
    createTable,
    readShortTermRecords,

    readData,
    createData,
    updateData,
    deleteData,

    createConfigTable,
    insertIntoConfigTable,
    readShortTermConfigData,


    RSTR
};  