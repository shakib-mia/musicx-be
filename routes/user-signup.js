const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getCollections } = require("../constants");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// for local testing
const transporter = nodemailer.createTransport({
  // host: "smtp.hostinger.com", // Replace with your Hostinger SMTP server
  // port: 587, // or 465 for SSL
  // secure: false, // true for 465, false for 587  secure: false, // Set to true if you are using SSL/TLS
  service: "gmail",
  auth: {
    user: "smdshakibmia2001@gmail.com",
    pass: "yyfklclhaujgtnkf ", // Use an app password if you have 2FA enabled
  },
});

// for production

// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com", // Replace with your Hostinger SMTP server
//   port: 587, // or 465 for SSL
//   secure: false, // true for 465, false for 587  secure: false, // Set to true if you are using SSL/TLS
//   auth: {
//     user: "mdshakibmia867@gmail.com",
//     pass: "yyfklclhaujgtnkf ", // Use an app password if you have 2FA enabled
//   },
// });

router.post("/", async (req, res) => {
  const { userDetails, usersCollection } = await getCollections();

  const reqBody = req.body;
  const userExist = await userDetails.find({
    user_email: reqBody.email,
  });
  const user = await usersCollection.findOne({
    user_email: reqBody.email,
  });

  // const users = await userExist.toArray();

  if (user === null) {
    if (reqBody.password) {
      const otp = crypto.randomInt(1000, 9999).toString(); // 4 digit OTP

      bcrypt.hash(reqBody.password, 10, async function (err, hash) {
        if (hash.length) {
          // Store hash in your password DB.
          // if (hash.length) {
          const user = {
            user_email: reqBody.email,
            user_password: hash,
          };

          const registerCursor = await usersCollection.insertOne(user);

          const token = await jwt.sign(
            { email: reqBody.email, otp },
            process.env.access_token_secret,
            { expiresIn: "1h" }
          );

          console.log(process.env.emailAddress, process.env.emailPassword);

          transporter.sendMail({
            from: process.env.emailAddress,
            to: reqBody.email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`,
          });

          // Send OTP to user email
          res.send({ token, user_email: reqBody.email });
        }
      });
    } else {
      const registerCursor = await usersCollection.insertOne({
        user_email: reqBody.email,
      });
      res.send(registerCursor);
    }
  } else {
    res.status(401).send("user already exist");
  }
});

router.post("/verify-otp", async (req, res) => {
  const { token } = req.headers;
  const { otp } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.access_token_secret);

    if (decoded.otp === otp) {
      return res
        .status(200)
        .send({ success: true, message: "OTP verified successfully" });
    } else {
      return res.status(401).send({ success: false, message: "Incorrect OTP" });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).send({ success: false, message: "OTP expired" });
    } else {
      return res.status(401).send({ success: false, message: "Invalid token" });
    }
  }
});

module.exports = router;
