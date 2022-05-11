const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const { createTable, 
        readShortTermRecords,  
        readData,
        createData,
        updateData,
        deleteData,

        createConfigTable,
        insertIntoConfigTable,
        readShortTermConfigData,

        RSTR

    } = require('../controllers/ShortTermController');

const { 
        createTableMediumTerm,
        readMediumTermRecords,
        createMediumTermData,
        readMediumTermData,
        updateMediumTermData,
        deleteMediumTermData,
        insertIntoMediumTermConfigTable 
    
    } = require('../controllers/MidTermController');

router.get('/', (req, res) => {
    res.send('Hello World! SAMPLE');
});


////----------------------------- short term routes CRUD ------------------------------------------------/////
router.get('/createTableConfig', createConfigTable); //create table called 'Config
router.post('/insertConfig', insertIntoConfigTable); //insert json into 'Config` table
router.get('/createTableShortTerm', createTable); //create table called 'ShortTermInvestment
router.get('/ShortTerm_data/:mode', readShortTermRecords); //list short term client side records


//formal experiment routes
router.get('/admin/ShortTerm_data', readData); //list client side records --admin
router.post('/admin/ShortTerm_data', createData); //create client side records   --admin
router.put('/admin/ShortTerm_data', updateData); //updating client side records  --admin
router.delete('/admin/ShortTerm_data/:id', deleteData); //deleting client side records  --admin

//route to modify config table
router.get('/admin/config', readShortTermConfigData); //list client side config --admin



//insertIntoMediumTermConfigTable
//////-----------------------------medium term routes CRUD ---------------------------------------------//////

router.get('/createTableMediumTerm', createTableMediumTerm); //create table called 'MediumTermInvestment
router.get('/createTableConfigMediumTerm', insertIntoMediumTermConfigTable); //insert config into table called 'MediumTermInvestment
router.get('/MediumTerm_data/:mode', readMediumTermRecords); //list medium term client side records

router.get('/admin/MediumTerm_data', readMediumTermData); //list client side midterm records --admin
router.post('/admin/MediumTerm_data', createMediumTermData); //create client side midterm records   --admin
router.put('/admin/MediumTerm_data', updateMediumTermData); //updating client side records midterm  --admin
router.delete('/admin/MediumTerm_data/:id', deleteMediumTermData); //deleting client side records midterm --admin


router.get('/shortterm/:mode', RSTR);



module.exports = router;

 