const puppeteer = require('puppeteer');
const { connectToDB } = require('../db'); // Assuming you've moved DB connection logic to db.js

async function fetchScrapResults(objectid) {
	const searches = await fetchUserSearches(objectid);
	const listingData = await performSearchScrapingLoop(searches);
}

async function fetchUserSearches(objectid) {
	try{
		const { db } = await connectToDB();
		const searchCollection = db.collection('userSearches');
	
		// Query the database to find searches with a matching searchID (objectid)
		const searchResults = await searchCollection.find({ userObjectid: objectid }).toArray();
	
		return searchResults;
	} catch (error) {
		console.error(error);
	}
}

async function performSearchScrapingLoop(searches) { 
	searches.array.forEach(search => {
		scrapeCraigslist(search);
	});
}

async function scrapeCraigslist(searchObject) {

}