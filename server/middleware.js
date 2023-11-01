// middleware.js

// Import any necessary modules
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const dbURL = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.1';

// Session store configuration
const store = new MongoDBStore({
  uri: dbURL,
  collection: 'sessions'
});

// Session configuration
const sessionMiddleware = session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // Session will last for 30 days
  }
});

let hasLoggedAuthentication = false;

function checkUserAuthentication(req, res, next) {
  if (req.session && req.session.user) {
    if (!hasLoggedAuthentication) {
      console.log('User is logged in');
      console.log('User ID: ' + req.session.user.id);
      console.log('User Email: ' + req.session.user.email);
      hasLoggedAuthentication = true;
    }
  } else {
    if (!hasLoggedAuthentication) {
      console.error('User is not logged in or session issue');
      hasLoggedAuthentication = true;
    }
  }
  next();
}
// Export the middleware functions
module.exports = {
  sessionMiddleware,
  checkUserAuthentication
};
