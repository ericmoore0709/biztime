/** Database setup for BizTime. */

const { Client } = require("pg");
require('dotenv').config();

const uri_base = process.env.POSTGRES_URI;

let DB_URI;

if (process.env.NODE_ENV === "test") {
    DB_URI = `${uri_base}_test`;
} else {
    DB_URI = uri_base;
}

let db = new Client({
    connectionString: DB_URI
});

db.connect();

module.exports = db;