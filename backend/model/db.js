import { Client } from 'pg';

const client = new Client(process.env.DATABASE_URL);

await client.connect();

export default client;