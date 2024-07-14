// tests/companies.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { default: slugify } = require('slugify');

let companyCode;

beforeAll(async () => {
    await db.query('DELETE FROM companies;');
})

afterAll(async () => {
    await db.end();
});

describe('Companies CRUD API', () => {

    // Test for creating a company
    it('should create a new company', async () => {
        const response = await request(app)
            .post('/companies')
            .send({
                name: 'First Company',
                description: 'This is the first company.',
            })
            .expect(201);

        expect(response.body.company).toHaveProperty('code');

        companyCode = response.body.company.code;
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

    // Test for handling improper data in POST request
    it('should handle improper data in POST request', async () => {
        const response = await request(app)
            .post('/companies')
            .send({
                // empty JSON
            })
            .expect(400);
    });

    // Test for handling company not found error
    it('should handle company not found error', async () => {
        const nonExistentCode = 'nonexistentcode';

        const response = await request(app)
            .get(`/companies/${nonExistentCode}`)
            .expect(404);
    });

    // Test for handling improper data in PUT request
    it('should handle improper data in PUT request', async () => {

        const putData = await request(app)
            .post('/companies')
            .send({
                name: 'New Company',
                description: 'This is a new company',
            })

        const code = putData.body.company.code;

        const response = await request(app)
            .put(`/companies/${code}`)
            .send({
                // empty JSON
            })
            .expect(400);
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
    });

    // Test for handling company deletion error
    it('should handle company deletion error', async () => {
        const nonExistentCode = 'nonexistentcode';

        const response = await request(app)
            .delete(`/companies/${nonExistentCode}`)
            .expect(404);
    });


});
