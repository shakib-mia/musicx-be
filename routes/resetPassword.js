const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getCollections, transporter } = require("../constants");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { user_email } = req.body;
  const otp = crypto.randomInt(1000, 9999).toString(); // 4 digit OTP

  //   console.log(req.body);
  const { usersCollection } = await getCollections();

  const user = await usersCollection.findOne({
    user_email,
  });

  if (user === null) {
    return res.status(401).send("user not found");
  }

  const token = await jwt.sign(
    { email: user_email, otp },
    process.env.access_token_secret,
    { expiresIn: "1h" }
  );

  transporter.sendMail({
    from: process.env.emailAddress,
    to: user_email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`,
  });

  res.send(token);
});

router.post("/verify", async (req, res) => {
  const { token, otp } = req.body;

  try {
    const decoded = await jwt.verify(token, process.env.access_token_secret);
    if (decoded.otp !== otp) {
      return res.status(401).send("Invalid OTP");
    } else {
      return res.status(200).send({ success: true, message: "OTP verified" });
    }

    // console.log(decoded);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.post("/update", async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = await jwt.verify(token, process.env.access_token_secret);
    const { email } = decoded;
    console.log(decoded);

    const hashedPassword = await bcrypt.hash(password, 10);

    const { usersCollection } = await getCollections();

    const result = await usersCollection.updateOne(
      { user_email: email },
      { $set: { user_password: hashedPassword } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).send(result);
    } else {
      return res.status(500).send("Failed to update password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
