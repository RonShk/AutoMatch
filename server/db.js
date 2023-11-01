const { MongoClient } = require('mongodb');
const dbURL = `mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1`;

async function connectToDB() {
  const client = new MongoClient(dbURL);
  try {
    await client.connect();
    const db = client.db('car_scraper');
    return { db, client };
  } catch (err) {
    console.error(err);
    console.log('Not connected to db');
  }
}

module.exports = { connectToDB };
