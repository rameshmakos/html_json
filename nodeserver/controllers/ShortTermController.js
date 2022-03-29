
const fs = require("fs");
const uniqid = require("uniqid");
var ShortTermInvestment = require("../config/pages/ShortTermInvestment.json");

const dataSourceq = require("../config/admin/shortTermInvestmentAdmin.json")
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
const readShortTermRecords = (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);

    const jsonfile = fs.readFileSync("./config/pages/ShortTermInvestment.json");
    var json_object = JSON.parse(jsonfile);
    const result_array = [];
    var mode_type = req.params.mode;
    var children = json_object[mode_type]['children'];
    json_object['children'] = children;

    delete json_object['Desktop'];
    delete json_object['Tab'];
    delete json_object['Mobile'];

    var text = '';
    children.forEach(element => {
        text = text + element.dataSource + ",";
    });
    const sql = text.slice(0, -1) //'abcde'
    console.log('Final SQL QUERY - ', sql);
    var final_sql = "SELECT " + sql + " FROM ShortTermInvestment";



    driver
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
            driver.close();
        });

};

// API to read all short term data for all screen size at admin site
const readShortTermRecordsAdmin = (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);

    const jsonfile = fs.readFileSync("./config/admin/shortTermInvestmentAdmin.json");
    var json_object = JSON.parse(jsonfile);
    const result_array = [];
    var mode_type = req.params.mode;
    var children = json_object[mode_type]['children'];
    json_object['children'] = children;

    delete json_object['Desktop'];
    delete json_object['Tab'];
    delete json_object['Mobile'];

    var text = '';
    children.forEach(element => {
        text = text + element.dataSource + ",";
    });
    const sql = text.slice(0, -1) //'abcde'
    console.log('Final SQL QUERY in admin- ', sql);
    var final_sql = "SELECT " + sql + " FROM ShortTermInvestment";



    driver
        .executeLambda(async (txn) => {
            return txn.execute(
                final_sql,
            );
        })
        .then((result) => {
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
            driver.close();
        });

};


// Api to create a new short term record in the admin section
const createShortTermRecord = (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    const data = req.body;

    var newData = {
        stock: 'PatelEng',
        stockCat: "Micro Cop",
        cmp: "25.15",
        bs: "Buy",
        price: "31 (5th Jan @ 02.01 pm)",
        target: "33 (31st Mar)",
        disclosure: "Have Interest"
    };
    console.log('Old Object - ', newData);
    newData.id = uniqid();
    console.log('New Object - ', newData);

    // console.log('ABC -', req.body);
    // var final_sql = "SELECT " + sql + " FROM ShortTerm";
    var final_sql = "INSERT INTO ShortTermInvestment ?";

    driver
        .executeLambda((txn) => {
            txn.execute(final_sql, newData);

        })
        .then(() => {
            res.json({ message: 'Created Record Successfully!', data: newData });
        })
        .then((result) => {
            driver.close();
        });

}


// Api to create a new short term record in the admin section
const updateShortTermRecord = (req, res) => {
    const driver = new qldb.QldbDriver("SPT-dev", myConfig);
    const data = req.body;

    var newData = {
        stock: 'Shipping Power',
        stockCat: "XXX Corp",
        cmp: "-",
        bs: "Buy",
        price: "123 (16th Feb @ 11.35 am)",
        target: "343 (31st Mar)",
        disclosure: "Have Interest"
    };
    // newData = JSON.stringify(newData);
    // console.log('ABC -', req.body);
    // var final_sql = "SELECT " + sql + " FROM ShortTerm";
    // var final_sql = "UPDATE ShortTermInvestment SET stockCat = ? WHERE stock = ?";
    var delete_sql = "DELETE FROM ShortTermInvestment WHERE stock = ?";

    driver
        .executeLambda((txn) => {
            txn.execute(delete_sql, 'Adano Willmar');

        })
        .then(() => {
            // res.send(JSON.stringify("{result: 'Added Record Successfully!'}"));
            res.json({ message: 'Updated Record Successfully!', data: newData });
        })
        .then((result) => {
            driver.close();
        });

}

const readData = async (req, res) => {     
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    const jsonfile = fs.readFileSync("./config/pages/ShortTermInvestment.json");
    var json_object = JSON.parse(jsonfile);
    const result_array = [];
    var mode_type = req.params.mode;
    var children = json_object[mode_type]['children'];
    json_object['children'] = children;

    delete json_object['Desktop'];
    delete json_object['Tab'];
    delete json_object['Mobile'];

    var text = '';
    children.forEach(element => {
        text = text + element.dataSource + ",";
    });
    const sql = text.slice(0, -1) //'abcde'
    console.log('Final SQL QUERY - ', sql);
    var final_sql = "SELECT " + sql + " FROM ShortTermInvestment";

    await qldbDriver.executeLambda(async (txn) => {
        const result = await txn.execute(final_sql);
        const resultList = result.getResultList();
        console.log('LAMBDA RESULT -', resultList);

        res.json({ message : 'Success', data : resultList });
        res.end();
    });
     
};


const createData = async (req, res) => {     
    const qldbDriver = new qldb.QldbDriver("SPT-dev", myConfig);
    const data = req.body;
    // var final_sql = "SELECT * FROM ShortTermInvestment";
    //docIdArray[0].get('documentId').stringValue(); to check doc id


    await qldbDriver.executeLambda(async (txn) => {
        const document = {
            stock: "Hind Copper",
            stockCat: "Mid Corp",
            cmp: "117.60",
            bs: "Buy",
            price: "154 (23th Mar @ 12.35 pm)",
            target: "28.5 (31st Mar)",
            disclosure: "Have Interest"
        }

        const query = 'INSERT INTO ShortTermInvestment ?';
        const result = await txn.execute(query, document);
        const resultList = result.getResultList();
        console.log('LAMBDA RESULT -', resultList);
        res.json({ message : 'Record created Successfully', data : resultList });
        res.end();
    });
     
};




module.exports = {
    createTable,
    readShortTermRecords,
    readShortTermRecordsAdmin,
    createShortTermRecord,
    updateShortTermRecord,

    readData,
    createData
};  