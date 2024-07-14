const express = require("express");
const router = express.Router();
const db = require('../db');
const { default: slugify } = require("slugify");

router.get('/', async (req, res, next) => {

    try {
        // get list of companies
        const companies = await db.query('SELECT * FROM companies;');
        // return list of companies
        return res.status(200).json({ companies: companies.rows });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get('/:code', async (req, res, next) => {

    const code = req.params.code;

    try {
        // Fetch company details along with associated industries
        const companyQuery = `
            SELECT c.*, json_agg(i.industry) as industries
            FROM companies c
            LEFT JOIN companies_industries ci ON c.code = ci.company_code
            LEFT JOIN industries i ON ci.industry_code = i.code
            WHERE c.code = $1
            GROUP BY c.code
        `;
        const companyResult = await db.query(companyQuery, [code]);

        if (companyResult.rowCount) {
            return res.status(200).json({ company: companyResult.rows[0] });
        }

        return res.status(404).json({ error: 'Company not found.' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.post('/', async (req, res, next) => {

    try {

        const { name, description } = req.body;

        if (!name || !description)
            return res.status(400).json({ error: 'Missing required fields' });


        const code = slugify(name);

        const company = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *;', [code, name, description]);

        if (company.rowCount)
            return res.status(201).json({ company: company.rows[0] });

        return res.status(500).json({ error: 'Failed to create company' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.put('/:code', async (req, res, next) => {
    const code = req.params.code;

    try {

        const { name, description } = req.body;
        if (!name || !description)
            return res.status(400).json({ error: 'Missing required fields' });

        const result = await db.query('UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *;', [name, description, code]);

        if (result.rowCount)
            return res.status(200).json({ company: result.rows[0] });

        return res.status(404).json({ error: "Company not found." });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.delete('/:code', async (req, res, next) => {

    const code = req.params.code;

    try {

        const deletion = await db.query('DELETE FROM companies WHERE code = $1;', [code]);

        if (deletion.rowCount)
            return res.status(200).json({ message: 'deleted' });

        return res.status(404).json({ error: "Company not found." });


    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

});

module.exports = router;