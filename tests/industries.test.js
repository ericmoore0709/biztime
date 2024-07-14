const request = require('supertest');
const app = require('../app');
const db = require('../db');

describe('Industries CRUD API', () => {

    let compCode = 'test-company';

    beforeAll(async () => {
        // delete everything
        await Promise.all([
            db.query('DELETE FROM companies'),
            db.query('DELETE FROM invoices'),
            db.query('DELETE FROM industries')
        ]);

        // add necessary prerequisite data
        await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', [compCode, 'Test Company', 'It is a test company.']);
    })

    afterAll(async () => {
        await db.end();
    });

    let industryCode;

    it('should create a new industry', async () => {
        const res = await request(app)
            .post('/industries')
            .send({ code: 'tech', industry: 'Technology' })
            .expect(201);

        expect(res.body.industry).toHaveProperty('code', 'tech');
        expect(res.body.industry).toHaveProperty('industry', 'Technology');

        industryCode = res.body.industry.code;
    });

    it('should return 400 for missing required fields', async () => {
        const res = await request(app)
            .post('/industries')
            .send({ code: 'tech' }) // Missing 'industry' field
            .expect(400);
    });

    it('should fetch all industries', async () => {
        const response = await request(app)
            .get('/industries')
            .expect(200);

        expect(Array.isArray(response.body.industries)).toBe(true);
        expect(response.body.industries.length).toBeGreaterThan(0);
    });

    it('should link company to industry', async () => {
        const res = await request(app)
            .post(`/industries/${industryCode}/${compCode}`)
            .expect(201);

        expect(res.body.company_industry).toHaveProperty('company_code', compCode);
        expect(res.body.company_industry).toHaveProperty('industry_code', industryCode);
    });

    it('should return 404 if industry or company not found', async () => {
        const res = await request(app)
            .post(`/industries/non_existing_industry/non_existing_company`)
            .expect(404);

        expect(res.body).toHaveProperty('error', 'industry or company not found.');
    });

});
