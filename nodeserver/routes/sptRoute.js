const express = require('express');
const router = express.Router();

const { createTable, 
        readShortTermRecords, 
        readShortTermRecordsAdmin, 
        createShortTermRecord, 
        updateShortTermRecord,


        newListShort
    } = require('../controllers/ShortTermController');

router.get('/', (req, res) => {
    res.send('Hello World! SAMPLE');
});


router.get('/createTable', createTable); //create table called 'ShortTerm
router.get('/ShortTerm_data/:mode', readShortTermRecords); //list client side records

router.get('/admin/ShortTerm_data/:mode', readShortTermRecordsAdmin); //list admin records
router.post('/admin/ShortTerm_data', createShortTermRecord); //create record
router.delete('/admin/ShortTerm_data', updateShortTermRecord); //update record



module.exports = router;
