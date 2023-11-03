const puppeteer = require('puppeteer');
const { connectToDB } = require('../db'); // Assuming you've moved DB connection logic to db.js

async function fetchScrapeResults(objectid) {
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
  // Destructure the searchObject to get the relevant fields
  const { make, model, minYear, maxYear, minPrice, maxPrice } = searchObject;

  // Construct the query by combining make and model
  const query = `${make} ${model}`;

  const baseUrl = 'https://dallas.craigslist.org/search/cta'; // 'cta' stands for cars+trucks
  
  // Construct the query string with the search parameters
  const queryString = `?query=${encodeURIComponent(query)}&min_price=${encodeURIComponent(minPrice)}&max_price=${encodeURIComponent(maxPrice)}&min_auto_year=${encodeURIComponent(minYear)}&max_auto_year=${encodeURIComponent(maxYear)}`;
  const finalUrl = baseUrl + queryString;

	const browser = await puppeteer.launch({
		headless: 'new',
	});
	const page = await browser.newPage();

	try {
		await page.goto(finalUrl, { waitUntil: 'networkidle0' });

		// Fetch all URLs first
		const urls = await page.$$eval('.gallery-card a.main', links => links.map(a => a.href));

		let allListings = [];

		for (const url of urls) {
		  await page.goto(url, { waitUntil: 'networkidle0' });
		
		  const attrGroups = await page.$$('.mapAndAttrs .attrgroup');
		  let listingObj = {};
		
		  for (let i = 0; i < attrGroups.length; i++) {
			const text = await (await attrGroups[i].getProperty('textContent')).jsonValue();
			const cleanText = text.replace(/\s+/g, ' ').trim();
		
			const regex = /(\bcondition|\bcylinders|\bdrive|\bfuel|\bodometer|\bpaint color|\bsize|\btitle status|\btransmission|\btype): ([^:]+?)(?=\bcondition:|\bcylinders:|\bdrive:|\bfuel:|\bodometer:|\bpaint color:|\bsize:|\btitle status:|\btransmission:|\btype:|$)/g;
		
			let match;
			while ((match = regex.exec(cleanText)) !== null) {
			  listingObj[match[1]] = match[2].trim();
			}
		  }

		
		  allListings.push(listingObj);
		}
		
		console.log(allListings);

	} catch (error) {
		console.error('Scraping failed:', error);
	} finally {
		await browser.close();
	}
}

