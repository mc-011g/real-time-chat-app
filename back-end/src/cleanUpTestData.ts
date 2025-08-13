import admin from 'firebase-admin';
import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';

export default async function cleanUpTestData() {

    dotenv.config({ path: '.env.test' });

    //Delete Firebase test users
    async function cleanFirebaseTestData() {
        const credentials = JSON.parse(fs.readFileSync('./etc/secrets/firebase-credentials.json', 'utf8'));

        admin.initializeApp({
            credential: admin.credential.cert(credentials)
        });

        const auth = admin.auth();
        const userList = await auth.listUsers();

        for (const user of userList.users) {
            if (user.email && (user.email.includes("+test1") || user.email.includes("+test2"))) {
                await auth.deleteUser(user.uid);      
            }
        }
    }
    await cleanFirebaseTestData();
    console.log("Cleaned up Firebase test users.");

    //Delete database test data
    async function cleanUpMongoDBTestData() {
        const ATLAS_URI = process.env.ATLAS_URI;
        const DB_NAME = process.env.DB_NAME;   

        async function connectToDB() {
            const uri = !ATLAS_URI
                ? 'mongodb://127.0.0.1:27017'
                : ATLAS_URI;  

            const client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true
                }
            });

            await client.connect();
            return client.db(DB_NAME);
        }

        const db: Db = await connectToDB();
        console.log("Connected to MongoDB.");

        await db.collection('users').deleteMany({});
        await db.collection('groups').deleteMany({});
        await db.collection('invitations').deleteMany({});
        await db.collection('messages').deleteMany({});

        console.log("Cleaned database.");
    }
    await cleanUpMongoDBTestData();
}

cleanUpTestData().then(() => process.exit(0)).catch(error => {
    console.error('Clean up script error.');
    process.exit(1);
});