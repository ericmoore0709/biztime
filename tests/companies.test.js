// tests/companies.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { beforeEach } = require('node:test');

beforeAll(async () => {
    await db.query('DELETE FROM companies;');
})

afterAll(async () => {
    await db.end();
});

describe('Companies CRUD API', () => {
    let companyCode;

    // Test for creating a company
    it('should create a new company', async () => {
        const response = await request(app)
            .post('/companies')
            .send({
                code: 'testcode',
                name: 'Test Company',
                description: 'This is a test company',
            })
            .expect(201);

        expect(response.body.company).toHaveProperty('code');
        companyCode = response.body.company.code; // Store the company code for later tests
    });

    // Test for reading all companies
    it('should retrieve all companies', async () => {
        const response = await request(app)
            .get('/companies')
            .expect(200);

        expect(Array.isArray(response.body.companies)).toBe(true);
        expect(response.body.companies.length).toBeGreaterThan(0);
    });

    // Test for reading a single company by code
    it('should retrieve a single company by code', async () => {
        const response = await request(app)
            .get(`/companies/${companyCode}`)
            .expect(200);

        expect(response.body.company).toHaveProperty('code', companyCode);
    });

    // Test for updating a company
    it('should update an existing company', async () => {
        const response = await request(app)
            .put(`/companies/${companyCode}`)
            .send({
                name: 'Updated Company',
                description: 'This is an updated test company',
            })
            .expect(200);

        expect(response.body.company).toHaveProperty('code', companyCode);
        expect(response.body.company).toHaveProperty('name', 'Updated Company');
    });

    // Test for deleting a company
    it('should delete an existing company', async () => {
        await request(app)
            .delete(`/companies/${companyCode}`)
            .expect(200);

        // Verify the company was deleted
        await request(app)
            .get(`/companies/${companyCode}`)
            .expect(404);
    });

    // Error handling snippets for CRUD operations

    // // Test for handling database connection error
    // it('should handle database connection error', async () => {
    //     // Close the database connection to simulate a connection error
    //     await db.end();

    //     const response = await request(app)
    //         .get('/companies')
    //         .expect(500);

    //     expect(response.body).toHaveProperty('error', 'Internal Server Error');
    // });

    // Test for handling improper data in POST request
    it('should handle improper data in POST request', async () => {
        const response = await request(app)
            .post('/companies')
            .send({
                // Missing 'name' field intentionally
                code: 'testcode',
                description: 'This is a test company',
            })
            .expect(400);

        expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    // Test for handling company not found error
    it('should handle company not found error', async () => {
        const nonExistentCode = 'nonexistentcode';

        const response = await request(app)
            .get(`/companies/${nonExistentCode}`)
            .expect(404);

        expect(response.body).toHaveProperty('error', 'Company not found.');
    });

    // Test for handling improper data in PUT request
    it('should handle improper data in PUT request', async () => {
        
        const putData = await request(app)
            .post('/companies')
            .send({
                code: 'testcode',
                name: 'Test Company',
                description: 'This is a test company',
            })
        
        const response = await request(app)
            .put(`/companies/${companyCode}`)
            .send({
                // Missing 'name' field intentionally
                description: 'Updated description',
            })
            .expect(400);

        expect(response.body).toHaveProperty('error', 'Missing required fields');
    });

    // Test for handling company not found error in PUT request
    it('should handle company not found error in PUT request', async () => {
        const nonExistentCode = 'nonexistentcode';

        const response = await request(app)
            .put(`/companies/${nonExistentCode}`)
            .send({
                name: 'Updated Company',
                description: 'Updated description',
            })
            .expect(404);

        expect(response.body).toHaveProperty('error', 'Company not found.');
    });

    // Test for handling company deletion error
    it('should handle company deletion error', async () => {
        const nonExistentCode = 'nonexistentcode';

        const response = await request(app)
            .delete(`/companies/${nonExistentCode}`)
            .expect(404);

        expect(response.body).toHaveProperty('error', 'Company not found.');
    });


});
