import "./envConfig.js";

import rethinkdb from 'rethinkdb';

const connection = await rethinkdb.connect({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    db: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

if (!connection) {
    console.log('Failed to connect to RethinkDB');
}

export default connection;