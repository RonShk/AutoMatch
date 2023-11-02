const nodemailer = require('nodemailer'); //Sending Email Conformations and car updates
const crypto = require('crypto');
async function sendConfirmation(userEmail, objectID) {
  // let transporter = nodemailer.createTransport({
  //   host: 'smtp.office365.com',
  //   port: 587,
  //   secure: false, 
  //   auth: {
  //     user: 'DoNotReply@automatch.dev', // Your custom email address
  //     pass: 'xddkwxxmxzwbfdt', // Your Microsoft 365 email password
  //   },
  // });

  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'DoNotReply@automatch.dev', // Your custom email address
      pass: 'tqscqxmpmllnlspd', // Use the app password you generated
    },
  });

  const verifyLink = `http://localhost:8080/confirm/user?objectid=${objectID}`;

  const details = {
    from: 'DoNotReply@automatch.dev', // Your custom email address
    to: userEmail,
    subject: 'AutoMatch - Verify your Account',
    text: `Click the link below to confirm your account:\n${verifyLink}`,
    html: `Click the link below to confirm your account:<br><a href="${verifyLink}">Confirm your account</a>`
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
