// tests/invoices.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let compCode = 'testcomp';

beforeAll(async () => {
    // delete all invoices
    await db.query('DELETE FROM invoices;');

    // delete all companies and add test company for 
    await db.query('DELETE FROM companies;');
    await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code;', [compCode, 'Test Company', 'It is a test company.']);
});

afterAll(async () => {
    await db.end();
});

describe('invoices CRUD API', () => {
    let invoiceId;

    // Test for creating an invoice
    it('should create a new invoice', async () => {
        const response = await request(app)
            .post('/invoices')
            .send({
                comp_code: compCode,
                amt: 2.23,
            })
            .expect(201);

        expect(response.body.invoice).toHaveProperty('id');
        invoiceId = response.body.invoice.id; // Store the invoice id for later tests
    });

    // Test for retrieving all invoices
    it('should retrieve all invoices', async () => {
        const response = await request(app)
            .get('/invoices')
            .expect(200);

        expect(Array.isArray(response.body.invoices)).toBe(true);
        expect(response.body.invoices.length).toBeGreaterThan(0);
    });

    // Test for retrieving a single invoice by id
    it('should retrieve a single invoice by id', async () => {
        const response = await request(app)
            .get(`/invoices/${invoiceId}`)
            .expect(200);

        expect(response.body.invoice).toHaveProperty('id', invoiceId);
    });

    // Test for updating an invoice
    it('should update an existing invoice', async () => {
        const response = await request(app)
            .put(`/invoices/${invoiceId}`)
            .send({
                amt: 3.45,
            })
            .expect(200);

        expect(response.body.invoice).toHaveProperty('id', invoiceId);
        expect(response.body.invoice).toHaveProperty('amt', 3.45);
    });

    // Test for deleting an invoice
    it('should delete an existing invoice', async () => {
        await request(app)
            .delete(`/invoices/${invoiceId}`)
            .expect(200);

        // Verify the invoice was deleted
        await request(app)
            .get(`/invoices/${invoiceId}`)
            .expect(404);
    });

    // Test for handling improper data in POST request
    it('should handle improper data in POST request', async () => {
        const response = await request(app)
            .post('/invoices')
            .send({
                // Missing 'amt' field intentionally
                comp_code: compCode,
            })
            .expect(400);

        expect(response.body).toHaveProperty('error', 'Missing required fields.');
    });

    // Test for handling invoice not found error
    it('should handle invoice not found error', async () => {
        const nonExistentId = 5000;

        const response = await request(app)
            .get(`/invoices/${nonExistentId}`)
            .expect(404);

        expect(response.body).toHaveProperty('error', 'Invoice not found.');
    });

    // Test for handling improper data in PUT request
    it('should handle improper data in PUT request', async () => {
        // Insert a new invoice for this test
        const newInvoiceResponse = await request(app)
            .post('/invoices')
            .send({
                comp_code: compCode,
                amt: 1.11,
            })
            .expect(201);

        const newInvoiceId = newInvoiceResponse.body.invoice.id;

        // Attempt to update with improper data
        const response = await request(app)
            .put(`/invoices/${newInvoiceId}`)
            .send({
                // empty JSON body
            })
            .expect(400);

        expect(response.body).toHaveProperty('error', 'amt is required.');
    });

    // Test for handling invoice not found error in PUT request
    it('should handle invoice not found error in PUT request', async () => {
        const nonExistentId = 5000;

        const response = await request(app)
            .put(`/invoices/${nonExistentId}`)
            .send({
                amt: 1.23,
            })
            .expect(404);

        expect(response.body).toHaveProperty('error', 'Invoice not found at given ID.');
    });

    // Test for handling invoice deletion error
    it('should handle invoice deletion error', async () => {
        const nonExistentId = 5000;

        const response = await request(app)
            .delete(`/invoices/${nonExistentId}`)
            .expect(404);

        expect(response.body).toHaveProperty('error', 'Not found.');
    });
});
