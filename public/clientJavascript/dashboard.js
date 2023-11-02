const searchSubmitBtn = document.getElementById('searchSubmit');
const searchDiv = document.getElementById('searchDiv');
const queryString = window.location.search;

// Create a URLSearchParams object from the query string
const searchParams = new URLSearchParams(queryString);

// Get the value of the 'objectId' parameter
const objectid = searchParams.get('objectid');

searchSubmitBtn.addEventListener('click', function (event) {
	event.preventDefault(); // Prevent the default form submission
	const make = document.getElementById('make').value;
	const model = document.getElementById('model').value;
	const minYear = document.getElementById('minYear').value;
	const maxYear = document.getElementById('maxYear').value;
	const minPrice = document.getElementById('minPrice').value;
	const maxPrice = document.getElementById('maxPrice').value;


	if (make.length < 1 || model.length < 1 || minYear.length < 1 || maxYear.length < 1 || minPrice.length < 1 || maxPrice.length < 1) {
		searchDiv.innerHTML = 'Please fill out all required fields';
		return;
	}
	submitSearch(make, model, minYear, maxYear, minPrice, maxPrice);
});


async function submitSearch(make, model, minYear, maxYear, minPrice, maxPrice) {
	
	const data = { make, model, minYear, maxYear, minPrice, maxPrice, objectid };

	fetch('/user-searches', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	  .then(response =>  {
			if (response.status === 200) {
				window.location.reload();
			} else {
				searchDiv.innerHTML = 'An error occurred. Please try again later.';
			}
	  })
}

// Function to fetch and display saved searches
function fetchAndDisplaySearches() {
	fetch('/user-previous-searches?objectid=' + objectid) // `userId` should be set to the user's ID
	  .then(response => response.json())
	  .then(searches => {
		if (searches.length === 0) {
		  document.getElementById('search-table').innerHTML = "No saved searches. Please make a search.";
		} else {
		  let tableContent = searches.map(search => `
			<tr>
			  <td>${search.make}</td>
			  <td>${search.model}</td>
			  <td>${search.minYear}</td>
			  <td>${search.maxYear}</td>
			  <td>${search.minPrice}</td>
			  <td>${search.maxPrice}</td>
			  <td><button onclick="deleteSearch('${search._id}')">Delete</button></td>
			  <td><button onclick="viewResults('${search._id}')">Result</button></td>
			</tr>
		  `).join('');
		  document.getElementById('search-table-body').innerHTML = tableContent;
		}
	  });
  }
  
  // Function to delete a search
  function deleteSearch(searchId) {
	fetch('/delete-search', {
	  method: 'DELETE',
	  headers: {
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({ objectID: searchId }),
	})
	.then(response => {
	  if (response.ok) {
		fetchAndDisplaySearches(); // Refresh the searches table
	  } else {
		console.error('Failed to delete search');
	  }
	});
  }
  
  // Function to view search results (this will need to be implemented based on how you want to display results)
  function viewResults(searchId) {
	// Implement functionality to view search results
  }
  
  // Call fetchAndDisplaySearches when the dashboard loads
  document.addEventListener('DOMContentLoaded', fetchAndDisplaySearches);
  