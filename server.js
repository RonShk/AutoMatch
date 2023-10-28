const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const { sendConfirmation, hashStringToBase64, checkUserAuthentication } = require('./helperFunctions');
const session = require('express-session');
const { serialize } = require('v8');
const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();
const port = 8080;
const dbURL = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1';

const store = new MongoDBStore({
  uri: dbURL, // MongoDB connection URL
  collection: 'sessions' // Collection to store sessions
});

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000 // Session will last for 30 days
    }
  })
);
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

async function fetchUserSearches(objectid) {
  const { db, client } = await connectToDB();
  const searchCollection = db.collection('userSearches');

  // Query the database to find searches with a matching searchID (objectid)
  const searchResults = await searchCollection.find({ searchID: objectid }).toArray();

  return searchResults;
}

app.use(express.json());
app.use(express.static('public'));
app.use(checkUserAuthentication);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/homepage.html');
});

app.get('/dashboard', async (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

app.post('/join-button-form', async (req, res) => {
  try {
    const { db, client } = await connectToDB();
    const pendingUserCollection = db.collection('pendingUsers');
    const usersCollection = db.collection('users');

    const { name, email, password } = req.body;
    console.log(name, email, password);

    const user = await usersCollection.findOne({ email: email });

    if (user) {
      console.log('User exists in the database:', user);
      res.sendStatus(409); // If the user already has an account
      return; // Exit the function to prevent further execution
    }

    const hashedPassword = await hashStringToBase64(password);
    console.log(`HashedPassword: ${hashedPassword}`);

    const pendingUser = {
      name: name,
      email: email,
      password: hashedPassword
    };

    const result = await pendingUserCollection.insertOne(pendingUser);
    const inputtedPendingUser = await pendingUserCollection.find({
      email: email
    });

    if (inputtedPendingUser) {
      sendConfirmation(email, result.insertedId).catch(error => {
        res.sendStatus(500);
        return; // Exit the function on error
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

app.get('/confirm/user', async (req, res) => {
  const objectId = req.query.objectid;

  try {
    const { db, client } = await connectToDB();
    const userCollection = db.collection('users');
    const pendingUserCollection = db.collection('pendingUsers');
    const objectIdToQuery = new ObjectId(objectId);

    const pendingUser = await pendingUserCollection.findOne({
      _id: objectIdToQuery
    });
    const user = await userCollection.insertOne(pendingUser);
    const deletePendingUser = await pendingUserCollection.deleteOne({
      _id: objectIdToQuery
    });

    if (deletePendingUser.deletedCount === 1) {
      req.session.user = {
        id: user._id, // Assuming you have a unique user ID
        email: user.email
        // Add other user-related data as needed
      };
      res.status(500).redirect('/');
      console.log(req.session.user);

      console.log('Everything worked correctly in making the user and adding to the database');
    } else {
      res.status(200).sendFile(__dirname + '/addedUsersPage.html');
      console.log('Deleted count was not 1 ');
    }
  } catch (err) {
    console.error(err);
    res.status(500).sendFile(__dirname + '/addedUsersPage.html');
  }
});

app.post('/login-form', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { db, client } = await connectToDB();
    const userCollection = db.collection('users');

    const userInfo = await userCollection.findOne({ email: email });

    if (!userInfo) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const hashedInputPassword = await hashStringToBase64(password);

    if (userInfo.password === hashedInputPassword) {
      // Create a session and store user information in the session
      req.session.user = {
        id: userInfo._id, // Assuming you have a unique user ID
        email: userInfo.email
        // Add other user-related data as needed
      };

      res.status(200).json({ message: 'Login successful' });
      console.log('Logged In');
    } else {
      res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add this route to your server.js
app.get('/check-login-status', (req, res) => {
  // Check if the user is logged in based on the session
  const isLoggedIn = req.session.user ? true : false;
  if (req.session.user && req.session.user.id) {
    const id = req.session.user.id;
    res.json({ isLoggedIn, id });
    return;
  }

  res.json({ isLoggedIn });
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500); // Handle error gracefully
    } else {
      res.sendStatus(200); // Session destroyed successfully
    }
  });
});

app.post('/user-searches', async (req, res) => {
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
      console.log('got to else block');
      res.sendStatus(500);
    }
  } catch (error) {
    console.log('get to catch block');
    res.sendStatus(500);
  }
});

app.get('/user-previous-searches', async (req, res) => {
  const objectid = req.query.objectid; // Get the objectid from the query string

  // Fetch search results from the database based on the provided objectid
  const searchResults = await fetchUserSearches(objectid); // Implement this function

  res.json(searchResults);
});

app.delete('/delete-search', async (req, res) => {
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

app.listen(port, () => console.log(`Successfully running on Port: ${port}`));
