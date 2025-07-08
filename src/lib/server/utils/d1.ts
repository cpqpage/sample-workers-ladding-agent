import {
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_DATABASE_ID,
    CLOUDFLARE_D1_TOKEN
} from "$env/static/private";
import Cloudflare from 'cloudflare'; // Add this line to import Cloudflare

const client = new Cloudflare({
  apiToken: CLOUDFLARE_D1_TOKEN,
});

const db = client.d1.database; // Add this line to create a new database
export const d1 = {
    // Returns the created D1 database.
    create : async (db_name: string) => {
        const d1 = await db.create({
            account_id: CLOUDFLARE_ACCOUNT_ID,
            name: db_name,
        });
        return d1;
    },
    // Deletes the specified D1 database.
    delete: async () => {
        await db.delete(CLOUDFLARE_DATABASE_ID, {
            account_id: CLOUDFLARE_ACCOUNT_ID
        });
    },
    // Returns a URL where the SQL contents of your D1 can be downloaded. 
    // Note: this process may take some time for larger DBs, 
    // during which your D1 will be unavailable to serve queries. 
    // To avoid blocking your DB unnecessarily, 
    // an in-progress export must be continually polled 
    // or will automatically cancel.
    exportDatabaseAsSQL: async () => {
        const exportResult = await db.export(CLOUDFLARE_DATABASE_ID, {
            account_id: CLOUDFLARE_ACCOUNT_ID,
            output_format: 'polling',
          });
        return exportResult;
    },
    // Returns the specified D1 database.
    getDatabase: async () => {
        const database = await db.get(CLOUDFLARE_DATABASE_ID, {
            account_id: CLOUDFLARE_ACCOUNT_ID
        });
        return database;
    },
    // Generates a temporary URL for uploading an SQL file to, 
    // then instructing the D1 to import it and polling it for status updates.
    // Imports block the D1 for their duration.
    importSQLIntoDatabase:{
        init: async () => {
            const importResult = await db.import(CLOUDFLARE_DATABASE_ID, {
                account_id: CLOUDFLARE_ACCOUNT_ID,
                action: 'init',
                etag: 'etag',
            });
            return importResult;
        },
        ingest: async (filename: string) => {
            const importResult = await db.import(CLOUDFLARE_DATABASE_ID, {
                account_id: CLOUDFLARE_ACCOUNT_ID,
                action: 'ingest',
                etag: 'etag',
                filename
            });
            return importResult;
        },
        poll: async (current_bookmark: string) => {
            const importResult = await db.import(CLOUDFLARE_DATABASE_ID, {
                account_id: CLOUDFLARE_ACCOUNT_ID,
                action: 'poll',
                current_bookmark,
            });
            return importResult;
        }
    },
    // Returns a list of D1 databases.
    listDatabases: () => {
        return db.list({
            account_id: CLOUDFLARE_ACCOUNT_ID
        });
    },
    // Returns the query result as an object.
    query: (sql: string, params?: Array<string>) => {
        return db.query(CLOUDFLARE_DATABASE_ID,{
            account_id: CLOUDFLARE_ACCOUNT_ID,
            sql,
            params,
        });
    },
    // Returns the query result rows as arrays rather than objects. 
    // This is a performance-optimized version of the /query endpoint.
    queryRaw: (sql: string, params?: Array<string>) => {
        return db.raw(CLOUDFLARE_DATABASE_ID,{
            account_id: CLOUDFLARE_ACCOUNT_ID,
            sql,
            params,
        });
    },
}