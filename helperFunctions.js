const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function sendConfirmation(userEmail, name, objectID) {
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
  
  const userName = capitalizeFirstLetter(name);


  const htmlTemplatePath = path.join(__dirname, 'HTML', 'confirmationEmail.html');
  const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
  const htmlContent = htmlTemplate.replace(/{{objectID}}/g, verifyLink)
  .replace(/{{username}}/g, userName);

  const details = {
    from: 'AutoMatch <donotreply@automatch.dev>',
    to: userEmail,
    subject: 'AutoMatch - Verify your Account',
    html: htmlContent,
  };

  transporter.sendMail(details, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email Sent:', info.response);
    }
  });
}

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function sendForgotPasswordEmail(userEmail, name, userObjectID) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: 'DoNotReply@automatch.dev', 
      pass: 'tqscqxmpmllnlspd',
    },
  });

  const verifyLink = `http://localhost:8080/reset/password/page?objectid=${userObjectID}`;
  
  const userName = capitalizeFirstLetter(name);


  const htmlTemplatePath = path.join(__dirname, 'HTML', 'forgotPasswordEmail.html');
  const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf-8');
  const htmlContent = htmlTemplate.replace(/{{link}}/g, verifyLink)
  .replace(/{{username}}/g, userName);

  const details = {
    from: 'AutoMatch <donotreply@automatch.dev>',
    to: userEmail,
    subject: 'AutoMatch - Reset your Password',
    html: htmlContent,
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
  checkUserAuthentication,
  sendForgotPasswordEmail
};
