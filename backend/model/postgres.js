import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client: ' + err);
})

export default pool;

// TEST
// import { Client } from 'pg';

// const client = new Client(process.env.DATABASE_URL);

// await client.connect();

// export default client;