const nodemailer = require('nodemailer'); //Sending Email Conformations and car updates

async function sendConfirmation(userEmail, objectID) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ronshaked07@gmail.com',
      pass: 'sknf irxh yhaa uhjq'
    }
  });

  const confirmationLink = `http://localhost:8080/confirm/user?objectid=${objectID}`;
  const details = {
    from: 'ronshaked07@gmail.com',
    to: userEmail,
    subject: 'Confirmation Email',
    text: `Click the link below to confirm your account:\n${confirmationLink}`,
    html: `Click the link below to confirm your account:<br><a href="${confirmationLink}">Confirm your account</a>`
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
