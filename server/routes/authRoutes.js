// authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const { sendConfirmation, hashStringToBase64 } = require('../../helperFunctions');
const { connectToDB } = require('../db'); // Assuming you've moved DB connection logic to db.js

// Move the relevant route handlers from server.js to here
router.post('/signup', async (req, res) => {
  try {
    const { db, client } = await connectToDB();
    const pendingUserCollection = db.collection('pendingUsers');
    const usersCollection = db.collection('users');

    const { name, email, password } = req.body;
    // console.log(name, email, password);
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    const user = await usersCollection.findOne({ email: email });

    if (user) {
      // console.log('User exists in the database:', user);
      res.sendStatus(409); // If the user already has an account
      return; // Exit the function to prevent further execution
    }


    // console.log(`HashedPassword: ${hashedPassword}`);

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

router.get('/confirm/user', async (req, res) => {
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
      res.status(200).redirect('/');

      // console.log('Everything worked correctly in making the user and adding to the database');
    } else {
      res.status(500).sendFile(__dirname, '..', '..','failedUserSignup.html');
      // console.log('Deleted count was not 1 ');
    }
  } catch (err) {
    console.error(err);
    res.status(500).sendFile(__dirname, '..', '..','failedUserSignup.html');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { db, client } = await connectToDB();
    const userCollection = db.collection('users');

    const userInfo = await userCollection.findOne({ email: email });

    if (!userInfo) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(password, userInfo.password);
    console.log(isValid);

    if (isValid) {
      // Create a session and store user information in the session
      req.session.user = {
        id: userInfo._id, // Assuming you have a unique user ID
        email: userInfo.email
        // Add other user-related data as needed
      };

      res.status(200).json({ message: 'Login successful' });
      // console.log('Logged In');
    } else {
      res.status(401).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500); // Handle error gracefully
    } else {
      res.sendStatus(200); // Session destroyed successfully
    }
  });
});

router.get('/check-login-status', (req, res) => {
  // Check if the user is logged in based on the session
  const isLoggedIn = req.session.user ? true : false;
  if (req.session.user && req.session.user.id) {
    const id = req.session.user.id;
    res.json({ isLoggedIn, id });
    return;
  }

  res.json({ isLoggedIn });
});

// Export the router
module.exports = router;
