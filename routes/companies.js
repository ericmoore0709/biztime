const express = require("express");
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {

    try {
        // get list of companies
        const companies = await db.query('SELECT * FROM companies;');
        // return list of companies
        return res.status(200).json(companies.rows);
    } catch (err) {
        console.log(err);
        next(err);
    }

});

module.exports = router;