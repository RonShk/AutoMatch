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
  const searchResults = await searchCollection.find({ userObjectid: objectid }).toArray();

  return searchResults;
}

router.post('/user-searches', async (req, res) => {
  try {
    const { make, model, minYear, maxYear, minPrice, maxPrice, objectid } = req.body;

    // Calculate the next scrape time, which is 6 hours from now
    // This is just an example, adjust the time according to your needs
    const now = new Date();
    const fourMinutesLater = new Date(now.getTime() + 4 * 60 * 1000);


    const { db, client } = await connectToDB();
    const searchCollection = db.collection('userSearches');

    const searchItem = {
      userObjectid: objectid,
      make,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      nextScrapeAt: fourMinutesLater
    };

    const result = await searchCollection.insertOne(searchItem);

    if (result.insertedId) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});


router.get('/user-previous-searches', async (req, res) => {
  try {
    const objectid = req.query.objectid;

    // Validate the objectid (you need to implement isValidObjectId)
    if (!isValidObjectId(objectid)) {
      return res.status(400).json({ message: "Invalid object ID" });
    }

    // Fetch search results from the database
    const searchResults = await fetchUserSearches(objectid);
    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Implement this function to check if the ObjectId is valid
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

router.delete('/delete-search', async (req, res) => {
  try {
    const { objectID } = req.body; // Extract the objectID from the request body

    // Validate the objectID here if necessary
    if (!ObjectId.isValid(objectID)) {
      return res.status(400).send("Invalid ID format");
    }

    const { db } = await connectToDB(); // Ensure you have a function to connect to your database
    const userSearchCollection = db.collection('userSearches'); // Replace with your actual collection name

    // Perform the deletion
    const result = await userSearchCollection.deleteOne({ _id: new ObjectId(objectID) });

    // Check if the search was actually found and deleted
    if (result.deletedCount === 1) {
      res.status(200).send("Search deleted successfully");
    } else {
      res.status(404).send("Search not found");
    }
  } catch (error) {
    console.error("Delete search error:", error);
    res.status(500).send("Internal server error");
  }
});


// Export the router
module.exports = router;
