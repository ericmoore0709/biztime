const express = require("express");
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {

    try {

        const invoices = await db.query('SELECT * FROM invoices;');

        return res.status(200).json({ invoices: invoices.rows });

    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.get('/:id', async (req, res, next) => {

    const id = req.params.id;

    try {

        const invoice = await db.query('SELECT * FROM invoices WHERE id = $1 LIMIT 1', [id]);

        if (invoice.rowCount)
            return res.status(200).json({ invoice: invoice.rows[0] });

        return res.status(404).json({ error: "Invoice not found." });

    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.post('/', async (req, res, next) => {

    try {
        const { comp_code, amt, paid, paid_date } = req.body;

        if (!comp_code || !amt || !paid || !paid_date)
            return res.status(400).json({ error: 'Missing required fields.' });

        const result = await db.query('INSERT INTO invoices (comp_Code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING *;', [comp_code, amt, paid, paid_date]);

        if (result.rowCount)
            return res.status(201).json({ invoice: result.rows[0] });

        return res.status(500).json({ error: 'Failed to add invoice.' });

    } catch (err) {
        console.log(err);
        return next(err);
    }

});

router.put('/:id', async (req, res, next) => {

    const id = req.params.id;

    

});

module.exports = router;