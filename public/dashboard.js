const searchBtn = document.getElementById('searchSubmit');

searchBtn.addEventListener('click', function (event) {
  event.preventDefault();
  search();
});

function search() {
  const make = document.getElementById('make').value;
  const model = document.getElementById('model').value;
  const minYear = document.getElementById('minYear').value;
  const maxYear = document.getElementById('maxYear').value;
  const minPrice = document.getElementById('minPrice').value;
  const maxPrice = document.getElementById('maxPrice').value;
  const searchDiv = document.getElementById('searchDiv');

  // Check if any of the fields are empty
  if (
    make.length === 0 ||
    model.length === 0 ||
    minYear.length === 0 ||
    maxYear.length === 0 ||
    minPrice.length === 0 ||
    maxPrice.length === 0
  ) {
    searchDiv.innerHTML = 'Please fill out all fields';
    return;
  }
  // Get the objectid from the query string
  const urlParams = new URLSearchParams(window.location.search);
  const objectid = urlParams.get('objectid');

  // Create an object to represent the search criteria and objectid
  const searchData = {
    make,
    model,
    minYear,
    maxYear,
    minPrice,
    maxPrice,
    objectid // Add the objectid to the search data
  };

  // Send the search criteria to the backend
  fetch('/user-searches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchData)
  })
    .then(response => {
      if (response.status === 200) {
        searchDiv.innerHTML = 'Search submitted';
        window.location.reload();
      } else {
        searchDiv.innerHTML = 'Error submitting search';
      }
    })
    .catch(error => {
      console.error('Error submitting search:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Get the objectid from the query string
  const urlParams = new URLSearchParams(window.location.search);
  const objectid = urlParams.get('objectid');

  // Fetch the user's previous searches
  fetch(`/user-previous-searches?objectid=${objectid}`)
    .then(response => response.json())
    .then(searchResults => {
      // Process the retrieved searchResults and generate the table
      generateSearchTable(searchResults);
    })
    .catch(error => {
      console.error('Error fetching search results:', error);
    });
});

function generateSearchTable(searchResults) {
  const tableDiv = document.getElementById('tableDiv');

  if (searchResults && searchResults.length > 0) {
    // Create an HTML table and its header row
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Define the column headers
    const headers = ['Make', 'Model', 'Min Price', 'Max Price', 'Min Year', 'Max Year', 'Actions'];

    // Create table headers
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.appendChild(document.createTextNode(headerText));
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table rows based on the searchResults
    const tbody = document.createElement('tbody');
    searchResults.forEach(result => {
      const row = document.createElement('tr');
      ['make', 'model', 'minPrice', 'maxPrice', 'minYear', 'maxYear'].forEach(field => {
        const cell = document.createElement('td');
        cell.appendChild(document.createTextNode(result[field] || ''));
        row.appendChild(cell);
      });

      // Add a delete button
      const deleteCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        handleDeleteSearch(result._id);
      });
      deleteCell.appendChild(deleteButton);
      row.appendChild(deleteCell);

      // Set the data-objectid attribute on the delete button
      deleteButton.setAttribute('data-objectid', result.objectID);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add the table to the page
    tableDiv.innerHTML = ''; // Clear any previous content
    tableDiv.appendChild(table);
  } else {
    tableDiv.innerHTML = 'No searches found, please make a search.';
  }
}

function handleDeleteSearch(objectID) {
  // Send a DELETE request to the server to delete the specific search

  const objectIDString = objectID.toString();
  fetch(`/delete-search`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ objectID: objectIDString }) // Send the objectID as a string
  })
    .then(response => {
      if (response.status === 200) {
        // Search deleted successfully, refresh the page
        window.location.reload();
      } else {
        console.error('Error deleting search');
      }
    })
    .catch(error => {
      console.error('Error deleting search:', error);
    });
}
