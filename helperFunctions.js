const nodemailer = require('nodemailer');
const crypto = require('crypto');
async function sendConfirmation(userEmail, objectID) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'DoNotReply@automatch.dev', 
      pass: 'tqscqxmpmllnlspd',
    },
  });

  const verifyLink = `http://localhost:8080/confirm/user?objectid=${objectID}`;

  const details = {
    from: 'DoNotReply@automatch.dev',
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
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

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
