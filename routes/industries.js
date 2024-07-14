const express = require("express");
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res, next) => {

    try {

        // get body data
        const { code, industry } = req.body;

        if (!code || !industry)
            return res.status(400).json({ error: 'Missing required fields.' });

        // attempt to persist new industry
        const response = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]);

        // return result
        if (response.rowCount)
            return res.status(201).json({ industry: response.rows[0] });

        return res.status(500).json({ error: 'Failed to create industry.' });


    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.get('/', async (req, res, next) => {

    try {
        const result = await db.query('SELECT * FROM industries');
        return res.status(200).json({ industries: result.rows });
    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.post('/:industry_code/:company_code', async (req, res, next) => {

    try {

        const { industry_code, company_code } = req.params;

        const [industry, company] = await Promise.all([
            db.query('SELECT * FROM industries WHERE code = $1', [industry_code]),
            db.query('SELECT * FROM companies WHERE code = $1', [company_code])
        ]);

        if (!industry.rowCount || !company.rowCount)
            return res.status(404).json({ error: 'industry or company not found.' });

        const result = await db.query('INSERT INTO companies_industries (company_code, industry_code) VALUES ($1, $2) RETURNING *', [company_code, industry_code]);

        if (result.rowCount)
            return res.status(201).json({ company_industry: result.rows[0] });

        return res.status(500).json({ error: 'Failed to create company-industry relation.' });

    } catch (err) {
        console.log(err);
        return next(err);
    }

});

module.exports = router;