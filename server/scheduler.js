const cron = require('node-cron');
const { fetchScrapeResults } = require('./websiteScraping/craigslist');

let scheduledTask;

module.exports = {
	startScheduler: () => {
	  if (!scheduledTask) {
		scheduledTask = cron.schedule('*/4 * * * *', () => {
		  console.log(`Running fetchScrapeResults at ${new Date().toLocaleTimeString()}`);
		  fetchScrapeResults();
		});
	  }
	},
	stopScheduler: () => {
	  if (scheduledTask) {
		scheduledTask.stop();
	  }
	}
  };
  
  