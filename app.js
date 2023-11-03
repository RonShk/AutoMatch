const express = require('express');
const { sessionMiddleware, checkUserAuthentication } = require('./server/middleware'); // Adjusted import
const authRoutes = require('./server/routes/authRoutes');
const searchRoutes = require('./server/routes/searchRoutes');
const pageRoutes = require('./server/routes/pageRoutes');
const bodyParser = require('body-parser'); // Import body-parser
const path = require('path');
const { startScheduler } = require('./server/scheduler');


const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds



const app = express();
const port = 8080;

// Use the session middleware
app.use(sessionMiddleware);
app.use(checkUserAuthentication); // This will apply it to all routes
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
// Parse application/json
app.use(bodyParser.json());

// Optional: If you want to use checkUserAuthentication as a global middleware for all routes,
// you can use it like this:
// app.use(checkUserAuthentication);

// Use the imported routes
app.use(authRoutes);
app.use(searchRoutes);
app.use(pageRoutes)

// ... other app.use() calls ...

app.listen(port, () => {
	const currentTime = new Date();
	const hours = currentTime.getHours() % 12 || 12; // Convert 0 (midnight) to 12
	const minutes = currentTime.getMinutes().toString().padStart(2, '0');
	const seconds = currentTime.getSeconds().toString().padStart(2, '0');
	const ampm = currentTime.getHours() >= 12 ? 'PM' : 'AM';
	console.log(`Successfully running on Port: ${port} - Server started at ${hours}:${minutes}:${seconds} ${ampm}`);
	startScheduler();

});

  
