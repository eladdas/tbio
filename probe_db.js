import pg from 'pg';
const { Client } = pg;

const checkConnection = async (connectionString) => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log(`Success: ${connectionString}`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log(`Failed: ${connectionString} - ${err.message}`);
    await client.end();
  }
};

const urls = [
  'postgres://postgres:postgres@localhost:5432/postgres',
  'postgres://postgres:password@localhost:5432/postgres',
  'postgres://postgres:1234@localhost:5432/postgres',
  'postgres://postgres:root@localhost:5432/postgres'
];

(async () => {
    for (const url of urls) {
        await checkConnection(url);
    }
})();
