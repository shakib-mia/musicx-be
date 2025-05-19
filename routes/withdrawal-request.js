const express = require("express");
const router = express.Router();
const verifyJWT = require("../verifyJWT"); // Make sure to provide the correct path
const jwt = require("jsonwebtoken");
const { getCollections } = require("../constants");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Replace with your Hostinger SMTP server
  port: 587, // Typically, SMTP uses port 587
  secure: false, // Set to true if you are using SSL/TLS
  auth: {
    user: process.env.emailAddress,
    pass: process.env.emailPass,
  },
});

router.post("/", verifyJWT, async (req, res) => {
  const {
    withdrawalRequest,
    clientsCollection,
    notificationsCollections,
    userDetails,
  } = await getCollections();
  const { token } = req.headers;
  const { email } = jwt.decode(token);

  // console.log(req.body);
  delete req.body._id;
  const userData = await userDetails.findOne({ user_email: email });
  // console.log(userData);
  delete userData._id;

  const postCursor = await withdrawalRequest.insertOne({
    ...req.body,
    ...userData,
  });

  // console.log(userData);

  // const name = userData.first_name ?  `${userData.first_name} ${userData.last_name}`

  var message = {
    from: process.env.emailAddress,
    to: email,
    // to: "smdshakibmia2001@gmail.com",
    subject: "Initiation of Withdrawal Enquiry Process",
    // text: "Plaintext version of the message",
    html: `<div>
    Dear ${userData.first_name} ${userData.last_name}, <br />

    Hi,<br />
    We hope this email finds you well.<br />
    Thank you for submitting your invoice.<br />
   
    We have initiated the process to address your withdrawal request.<br />

    You will receive your payment within few days from the Invoice date. Once the payment is done we will share the payment details with you.<br />
    
    Thank you for choosing BackVision Digital.<br />
    We appreciate your trust in us and look forward to serving you.<br />
    <br />
    Best regards,<br />
    BackVision Digital<br />
    </div>`,
  };

  transporter.sendMail(message, async (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send(error);
    } else {
      console.log("sent");
    }
  });

  // notification

  const timeStamp = Math.floor(new Date().getTime() / 1000);

  const notifications = {
    email: userData.user_email,
    message: "Withdrawal Enquiry Process Initiated",
    date: timeStamp,
    read: false,
  };

  const notificationsCursor = await notificationsCollections.insertOne(
    notifications
  );

  res.send(postCursor);
});

module.exports = router;
