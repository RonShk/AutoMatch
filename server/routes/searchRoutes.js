// searchRoutes.js
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const { connectToDB } = require('../db'); // Assuming you've moved DB connection logic to db.js

// Move the relevant route handlers from server.js to here

async function fetchUserSearches(objectid) {
  const { db, client } = await connectToDB();
  const searchCollection = db.collection('userSearches');

  // Query the database to find searches with a matching searchID (objectid)
  const searchResults = await searchCollection.find({ searchID: objectid }).toArray();

  return searchResults;
}

router.post('/user-searches', async (req, res) => {
  try {
    const { make, model, minYear, maxYear, minPrice, maxPrice, objectid } = req.body;

    const { db, client } = await connectToDB();
    const searchCollection = db.collection('userSearches');

    const searchItem = {
      searchID: objectid,
      make,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice
    };

    const result = await searchCollection.insertOne(searchItem);

    if (result.insertedId) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (error) {
    res.sendStatus(500);
  }
});

router.get('/user-previous-searches', async (req, res) => {
  const objectid = req.query.objectid; // Get the objectid from the query string

  // Fetch search results from the database based on the provided objectid
  const searchResults = await fetchUserSearches(objectid); // Implement this function

  res.json(searchResults);
});

router.delete('/delete-search', async (req, res) => {
  try {
    const objectID = req.body.objectID; // Retrieve the objectID as a string
    const objectIdToQuery = new ObjectId(objectID);

    if (!objectID) {
      res.status(400).send('Invalid objectID');
      return;
    }

    const { db, client } = await connectToDB();
    const searchCollection = db.collection('userSearches');

    const deleteResult = await searchCollection.deleteOne({ _id: objectIdToQuery });

    if (deleteResult.deletedCount === 1) {
      res.sendStatus(200);
    } else {
      res.status(404).send('Search not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting search');
  }
});

// Export the router
module.exports = router;
