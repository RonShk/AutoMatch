// Handle toggling of login/signup forms
let loginForm = document.getElementById('login-form');
let signupForm = document.getElementById('signup-form');
let fieldIssuesSignUpDiv = document.getElementById('fieldIssuesSignUp');
let fieldIssuesLoginDiv = document.getElementById('fieldIssuesLoginDiv');

function scrollToElement(elementId) {
  const targetElement = document.getElementById(elementId);

  let offset = 0;

  if (elementId === 'login-form' || targetElement === 'signup-form') {
    offset = 0;
  } else {
    offset = 300;
  }

  if (targetElement) {
    const scrollOptions = {
      behavior: 'smooth'
    };

    const viewportHeight = window.innerHeight;

    const elementRect = targetElement.getBoundingClientRect();
    const elementTop = elementRect.top;

    let scrollToPosition;

    if (elementTop > 0) {
      scrollToPosition = elementTop + window.scrollY - viewportHeight / 2 + elementRect.height / 2 + offset;
    } else {
      scrollToPosition = elementTop + window.scrollY - viewportHeight / 2 + elementRect.height / 2 + offset * 3;
    }

    window.scrollTo({ ...scrollOptions, top: scrollToPosition });
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

  if (!body.classList.contains('overlay')) {
    body.classList.add('overlay');
    // header.classList.add('overlay');
  }
}

function removeOverlay() {
  const body = document.querySelector('body');
  const header = document.querySelector('header');

  if (body.classList.contains('overlay')) {
    body.classList.remove('overlay');
    // header.classList.remove('overlay');
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
function createLogoutButton() {
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

  // Append the "Log Out" button to the header
  const headerSections = document.querySelector('.header-sections');
  headerSections.appendChild(logoutBtn);
}

// Function to update login/signup buttons
function updateLoginButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  // Send a request to the server to check if the user is logged in
  fetch('/check-login-status')
    .then(response => response.json())
    .then(data => {
      const { isLoggedIn } = data;

      if (isLoggedIn) {
        loginBtn.style.display = 'none'; // Hide "Log In" button
        signupBtn.style.display = 'none'; // Hide "Sign Up" button
        createLogoutButton(); // Create and append "Log Out" button
      } else {
        loginBtn.style.display = 'block'; // Show "Log In" button
        signupBtn.style.display = 'block'; // Show "Sign Up" button
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
