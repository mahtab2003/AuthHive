import { connection } from "../config/index.js";
import rethinkdb from 'rethinkdb';

const setupDB = async () => {
    try {
        const dbList = await rethinkdb.dbList().run(connection);
        if (!dbList.includes(process.env.DB_NAME)) {
            await rethinkdb.dbCreate(process.env.DB_NAME).run(connection);
            console.log(`Database ${process.env.DB_NAME} created`);
        } else {
            console.log(`Database ${process.env.DB_NAME} already exists`);
        }

        const tableList = await rethinkdb.tableList().run(connection);
        const tablesToCreate = [
            "users",
            'logs',
            'verification_tokens',
            'site_settings',
            'admin_users',
            'csrf_tokens'
        ];
        for (const table of tablesToCreate) {
            if (!tableList.includes(table)) {
                await rethinkdb.tableCreate(table).run(connection);
                await rethinkdb.table(table).indexCreate('createdAt').run(connection);
                console.log(`Table ${table} created`);
            } else {
                console.log(`Table ${table} already exists`);
            }
        }
        console.log("Database setup complete");
    } catch (error) {
        console.error("Error setting up the database:", error);
    }
}

setupDB();