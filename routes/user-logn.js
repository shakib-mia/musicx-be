const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { getCollections } = require("../constants");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

router.post("/", cors(corsOptions), async (req, res) => {
  const { email, password } = req.body;
  const { usersCollection, userDetails } = await getCollections();

  const userCursor = await usersCollection.findOne({ user_email: email });
  const details = await userDetails.findOne({ user_email: email });
  // console.log(req.body);
  if (userCursor !== null) {
    bcrypt.compare(password, userCursor.user_password, (err, result) => {
      if (result) {
        // res.send({ message: "success" });
        const token = jwt.sign({ email }, process.env.access_token_secret, {
          expiresIn: "1h",
        });

        res.send({ token, details });
      } else {
        res.status(401).send({ message: "incorrect password" });
      }
    });
  } else {
    res.status(401).send({ message: "no user found" });
  }
});

router.post("google-login/:token", async (req, res) => {
  const { token } = req.params;
  const { usersCollection, userDetails } = await getCollections();

  try {
    const decoded = jwt.verify(token, process.env.GOOGLE_CLIENT_SECRET);

    console.log(decoded);
  } catch (error) {
    res.status(401).send({ message: "invalid token" });
  }
});

module.exports = router;
