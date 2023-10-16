const nodemailer = require("nodemailer"); //Sending Email Conformations and car updates

async function sendConfirmation(userEmail, objectID) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ronshaked07@gmail.com",
      pass: "sknf irxh yhaa uhjq",
    },
  });

  const details = {
    from: "ronshaked07@gmail.com",
    to: userEmail,
    subject: "Confirmation Email",
    text: `Click here to confirm your account: http://localhost:8080/addedUsersPage?objectid=${objectID}`,
  };

  transporter.sendMail(details, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("Email Sent:", info.response);
    }
  });
}

async function hashStringToBase64(input) {
  // Convert the input string to an ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // Use the SubtleCrypto API to create a hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert the hash result to a Base64 string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return hashBase64;
}

function checkUserAuthentication(req, res, next) {
  if (req.session && req.session.user) {
    // User is logged in
    console.log("User is logged in");
    console.log("User ID: " + req.session.user.id);
    console.log("User Email: " + req.session.user.email);
  } else {
    // User is not logged in
    console.log("User is not logged in");
  }
  next();
}

module.exports = {
  sendConfirmation,
  hashStringToBase64,
  checkUserAuthentication,
};
