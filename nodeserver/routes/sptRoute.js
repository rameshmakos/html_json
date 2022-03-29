const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

const { createTable, 
        readShortTermRecords, 
        readShortTermRecordsAdmin, 
        createShortTermRecord, 
        updateShortTermRecord,
        
        readData,
        createData,
        updateData
    } = require('../controllers/ShortTermController');

router.get('/', (req, res) => {
    res.send('Hello World! SAMPLE');
});


router.get('/createTable', createTable); //create table called 'ShortTerm
router.get('/ShortTerm_data/:mode', readShortTermRecords); //list client side records

router.get('/admin/ShortTerm_data/:mode', readShortTermRecordsAdmin); //list admin records
router.post('/admin/ShortTerm_data', createShortTermRecord); //create record
router.delete('/admin/ShortTerm_data', updateShortTermRecord); //update record

//formal experiment routes
router.get('/datameta/:mode', readData); //list client side records  
router.post('/datameta', createData); //create client side records 
router.put('/datameta/:id', updateData); //updating client side records




module.exports = router;
