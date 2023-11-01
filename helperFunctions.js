const nodemailer = require('nodemailer'); //Sending Email Conformations and car updates

async function sendConfirmation(userEmail, objectID) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // Set to true if you want to use TLS (not recommended for port 587)
    auth: {
      user: 'donotreply@automatch.dev', // Your custom email address
      pass: 'e8$6rRgQVd#4tF2', // Your Microsoft 365 email password
    },
  });
  
  const details = {
    from: 'donotreply@automatch.dev', // Your custom email address
    to: userEmail,
    subject: 'AutoMatch - Verify your Account',
    text: `Click here to verify your account: http://localhost:8080/confirm/user?objectid=${objectID}`
  };

  transporter.sendMail(details, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email Sent:', info.response);
    }
  });
}

async function hashStringToBase64(input) {
  // Convert the input string to an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // Use the SubtleCrypto API to create a hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash result to a Base64 string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return hashBase64;
}

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

module.exports = {
  sendConfirmation,
  hashStringToBase64,
  checkUserAuthentication
};
