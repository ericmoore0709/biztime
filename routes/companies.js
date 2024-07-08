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
        return next(err);
    }

});

router.get('/:code', async (req, res, next) => {

    const code = req.params.code;

    try {
        const company = await db.query('SELECT * FROM companies WHERE code = $1 LIMIT 1;', [code]);
        return res.status(200).json(company.rows);
    } catch (err) {
        console.log(err);
        return next(err);
    }

});

module.exports = router;