// Handle toggling of login/signup forms
let loginForm = document.getElementById('login-form');
let signupForm = document.getElementById('signup-form');
let fieldIssuesSignUpDiv = document.getElementById('fieldIssuesSignUp');
let fieldIssuesLoginDiv = document.getElementById('fieldIssuesLoginDiv');

let currentSection = 'about'; // Initialize the current section

function scrollToElement(elementId) {
  const element = document.getElementById(elementId);

  if (element) {
      // Scroll to the element
      element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
      });
  } else {
      console.error(`Element with ID '${elementId}' not found.`);
  }
}

function enableScroll() {
  const scrollPosition = parseInt(document.body.style.top, 10);

  document.body.style.position = '';
  document.body.style.top = '';

  window.scrollTo(0, scrollPosition);
}

function disableScroll() {
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollPosition}px`;
}

function applyOverlay() {
  const body = document.querySelector('body');
  const header = document.querySelector('header');
  const headerBtn = document.getElementById('signupBtn');

  if (body) {
    body.classList.add('overlay');
  }
  if (header) {
    header.classList.add('overlayHeader');
    headerBtn.style.backgroundColor = '#919191b4';
  }
}

function removeOverlay() {
  const body = document.querySelector('body');
  const header = document.querySelector('header');
  const headerBtn = document.getElementById('signupBtn');

  if (body) {
    body.classList.remove('overlay');
  }
  if (header) {
    header.classList.remove('overlayHeader');
    headerBtn.style.backgroundColor = '#ffffffb4';
  }
}

let buttonInfo = [];

function disableHeaderButtons() {
  const headerSections = document.querySelector('.header-sections');
  const anchorElements = headerSections.querySelectorAll('a');
  const headerTitle = document.getElementById('title');
  const headerTitleDiv = document.querySelector('.header-title');

  anchorElements.forEach(anchor => {
    buttonInfo.push({
      element: anchor,
      disabled: anchor.classList.add('disabled'),
      onclick: anchor.onclick
    });

    anchor.onclick = null;
  });

  headerTitleDiv.classList.add('disabled'), headerTitle.removeAttribute('href');
}

function enableHeaderButtons() {
  const headerSections = document.querySelector('.header-sections');
  const headerTitle = document.getElementById('title');
  const headerTitleDiv = document.querySelector('.header-title');
  const anchorElements = headerSections.querySelectorAll('a');

  anchorElements.forEach(anchor => {
    anchor.classList.remove('disabled');
  });

  buttonInfo.forEach(button => {
    button.element.onclick = button.onclick;
  });

  buttonInfo = [];

  headerTitleDiv.classList.remove('disabled');
  headerTitle.setAttribute('href', '/');
}

function clearLogin() {
  const form = document.getElementById('login-form');
  const inputs = form.getElementsByTagName('input');

  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type !== 'checkbox') {
      inputs[i].value = '';
    } else {
      inputs[i].checked = false;
    }
  }
}

function clearSignup() {
  const form = document.getElementById('signup-form');
  const inputs = form.getElementsByTagName('input');

  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].type !== 'checkbox') {
      inputs[i].value = '';
    } else {
      inputs[i].checked = false;
    }
  }
}

function openLogin() {
  document.getElementsByClassName('login-window')[0].style.display = 'block';
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('verifyPopup').style.display = 'none';

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  document.getElementsByClassName('login-window')[0].style.top = scrollTop + window.innerHeight / 2 + 'px';

  applyOverlay();
  disableHeaderButtons();
  disableScroll();
  clearLogin();
}

function openSignUp() {
  document.getElementsByClassName('login-window')[0].style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('verifyPopup').style.display = 'none';

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  document.getElementsByClassName('login-window')[0].style.top = scrollTop + window.innerHeight / 2 + 'px';

  applyOverlay();
  disableHeaderButtons();
  disableScroll();
  clearSignup();
}

function closeLogin() {
  document.getElementsByClassName('login-window')[0].style.display = 'none';

  removeOverlay();
  enableScroll();
  enableHeaderButtons();
}

function shakeButton(btn) {
  const button = document.getElementById(btn);
  button.classList.add('shake-button');

  button.addEventListener('animationend', () => {
    button.classList.remove('shake-button');
  });
}

const signUpSubmissionBtn = document.getElementById('signup-submit');
signUpSubmissionBtn.addEventListener('click', function (event) {
  event.preventDefault(); // Prevent the default form submission

  const name = document.getElementById('signup-form-name').value;
  const email = document.getElementById('signup-form-email').value;
  const password = document.getElementById('signup-form-password').value;

  if (name.length < 1 || email.length < 1 || password.length < 1) {
    fieldIssuesSignUpDiv.innerHTML =
      'Please make sure that you have entered a value for your name, email, and password.';
    shakeButton('signup-submit');
  } else {
    fieldIssuesSignUpDiv.innerHTML = '';
  }

  if (fieldIssuesSignUpDiv.innerHTML === '' && name.length > 1 && email.length > 1 && password.length > 1) {
    signUpSubmission(name, email, password);
  }
});

function signUpSubmission(name, email, password) {
  // Create a data object to send to the server
  const user = {
    name: name,
    email: email,
    password: password
  };

  // Send the data to the server using the Fetch API
  fetch('/join-button-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
    .then(response => {
      if (response.status === 409) {
        fieldIssuesSignUpDiv.innerHTML =
          "An account with that email already exists. Please use a different email or <a onclick='openLogin()'>login</a>.";
        shakeButton('signup-submit');
      } else if (!response.ok) {
        throw new Error('An error occurred. Please try again later.');
      }

      // Return the response as text
      return response.text();
    })
    .then(data => {
      if (data === 'OK') {
        console.log('User registered successfully.');
        openVerifyPane();
      } else {
        // Handle the response data based on your requirements
        console.log('Unexpected response:', data);
      }
    })
    .catch(error => {
      // Handle errors, including 409 case
      if (error.message !== 'Account already exists') {
        console.error('Error registering user:', error);
      }
    });
}

function openVerifyPane() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('verifyPopup').style.display = 'block';
}

const loginSubmissionBtn = document.getElementById('login-submit');
loginSubmissionBtn.addEventListener('click', function (event) {
  event.preventDefault(); // Prevent the default form submission

  const password = document.getElementById('login-password').value;
  const email = document.getElementById('login-email').value;
  if (email.length < 1 || password.length < 1) {
    fieldIssuesLoginDiv.innerHTML = 'Please make sure that you have entered a value for your email and password.';
    shakeButton(loginSubmissionBtn);
    console.log('ran into error real');
  } else {
    fieldIssuesLoginDiv.innerHTML = '';
  }

  if (fieldIssuesLoginDiv.innerHTML === '') {
    loginSubmission(email, password);
  }
});

function loginSubmission(email, password) {
  const data = {
    email: email,
    password: password
  };

  fetch('/login-form', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.status === 200) {
        // Successful login
        fieldIssuesLoginDiv.innerHTML = 'Login successful!';
        closeLogin();
        console.log('Before reloading the page');
        location.reload();
        console.log('After reloading the page');
      } else if (response.status === 404) {
        // User not found
        fieldIssuesLoginDiv.innerHTML = 'User not found';
      } else if (response.status === 401) {
        // Incorrect password
        fieldIssuesLoginDiv.innerHTML = 'Incorrect password. Please try again.';
      }
    })
    .catch(error => {
      // Handle other errors
      console.error(error);
      fieldIssuesLoginDiv.innerHTML = 'An error occurred. Please try again later.';
    });
}

// Function to create a "Log Out" button
function createLogoutButton(id) {
  const logoutBtn = document.createElement('a');
  logoutBtn.textContent = 'Log Out';
  logoutBtn.className = 'header-section';
  logoutBtn.onclick = function () {
    // Send a request to the server to log the user out
    fetch('/logout', {
      method: 'GET'
    })
      .then(response => {
        if (response.status === 200) {
          // Log out was successful
          location.reload(); // Reload the page to update UI
        } else {
          console.error('Error logging out');
        }
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  };

  const dashboardBtn = document.createElement('a');
  dashboardBtn.textContent = 'Dashboard';
  dashboardBtn.id = 'dashboardBtn';
  dashboardBtn.className = 'header-section';
  dashboardBtn.onclick = function () {
    location.href = '/dashboard?objectid=' + id;
  };
  // Append the "Log Out" button to the header
  const headerSections = document.querySelector('.header-sections');
  headerSections.appendChild(logoutBtn);
  headerSections.appendChild(dashboardBtn);
}

// Function to update login/signup buttons
let shouldReload = true; // Initialize the flag
function updateLoginButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');

  // Send a request to the server to check if the user is logged in
  fetch('/check-login-status')
    .then(response => response.json())
    .then(data => {
      const { isLoggedIn, id } = data;

      if (isLoggedIn) {
        loginBtn.style.display = 'none'; // Hide "Log In" button
        signupBtn.style.display = 'none'; // Hide "Sign Up" button
        dashboardBtn.style.display = 'block';

        const stateObj = { foo: 'updated' };
        const title = 'Updated Page Title';
        const updatedUrl = `/?objectid=${id}`;
        window.history.replaceState(stateObj, title, updatedUrl);

        createLogoutButton(id); // Create and append "Log Out" button
      } else {
        loginBtn.style.display = 'block'; // Show "Log In" button
        signupBtn.style.display = 'block'; // Show "Sign Up" button
        dashboardBtn.style.display = 'none';

        const stateObj = { foo: 'updated' };
        const title = 'Updated Page Title';
        const updatedUrl = `/`;

        window.history.replaceState(stateObj, title, updatedUrl);
      }
    })
    .catch(error => {
      console.error('Error checking login status:', error);
    });
}

// Call the updateLoginButtons function when the page loads
window.onload = updateLoginButtons;

window.onclick = event => {
  if (
    !event.target.matches('.login-window') &&
    !event.target.closest('.login-window') &&
    !event.target.matches('.header-section')
  ) {
    if (document.querySelector('.login-window').style.display === 'block') {
      closeLogin();
    }
  }
};
