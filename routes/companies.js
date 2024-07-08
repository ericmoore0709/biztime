const express = require("express");
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {

    try {
        // get list of companies
        const companies = await db.query('SELECT * FROM companies;');
        // return list of companies
        return res.status(200).json({ companies: companies.rows });
    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.get('/:code', async (req, res, next) => {

    const code = req.params.code;

    try {
        const company = await db.query('SELECT * FROM companies WHERE code = $1 LIMIT 1;', [code]);

        if (company.rowCount)
            return res.status(200).json({ company: company.rows[0] });

        return res.status(404).json({ error: { code: 404, message: 'Company not found.' } });
    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.post('/', async (req, res, next) => {

    try {

        const { code, name, description } = req.body;

        if (!code || !name || !description)
            return res.status(400).json({ error: 'Missing required fields' });

        const company = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *;', [code, name, description]);

        if (company.rowCount)
            return res.status(201).json({ company: company.rows[0] });

        return res.status(500).json({ error: 'Failed to create company' });

    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.put('/:code', async (req, res, next) => {
    const code = req.params.code;

    try {

        const exists = (await db.query('SELECT * FROM companies WHERE code = $1 LIMIT 1;', [code])).rowCount;

        if (!exists)
            return res.status(404).json({ error: "Company not found." });

        const { name, description } = req.body;
        if (!name || !description)
            return res.status(400).json({ error: 'Missing required fields' });

        const result = await db.query('UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *;', [name, description, code]);

        if (result.rowCount)
            return res.status(200).json({ company: result.rows[0] });

        return res.status(500).json({ error: "Failed to update company." });

    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.delete('/:code', async (req, res, next) => {

    const code = req.params.code;

    try {

        const exists = (await db.query('SELECT * FROM companies WHERE code = $1;', [code])).rowCount;

        if (!exists)
            return res.status(404).json({ error: 'Company not found.' });

        const deletion = await db.query('DELETE FROM companies WHERE code = $1;', [code]);

        if (deletion.rowCount)
            return res.status(200).json({ message: 'deleted' });

        return res.status(500).json({ error: "Something went wrong." });


    } catch (err) {
        console.log(err);
        return next(err);
    }

});

module.exports = router;