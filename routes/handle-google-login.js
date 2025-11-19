const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const { token } = req.headers;
  const { usersCollection, userDetails } = await getCollections();

  try {
    const decoded = jwt.decode(token);
    const email = decoded.email;

    const userCursor = await usersCollection.findOne({ user_email: email });
    const details = await userDetails.findOne({ user_email: email });

    if (userCursor) {
      const authToken = jwt.sign({ email }, process.env.access_token_secret, {
        expiresIn: "1h",
      });
      res.send({ token: authToken, details });
    } else {
      res.status(401).send({ message: "no user found" });
    }
  } catch (error) {
    res.status(401).send({ message: "invalid token" });
  }
});

router.get("/:email", async (req, res) => {
  const { email } = req.params;
  const { usersCollection, userDetails } = await getCollections();

  try {
    // const decoded = jwt.decode(token);
    // const email = decoded.email;

    const userCursor = await usersCollection.findOne({ user_email: email });
    const details = await userDetails.findOne({ user_email: email });

    if (userCursor) {
      const authToken = jwt.sign({ email }, process.env.access_token_secret, {
        expiresIn: "1h",
      });
      res.send({ token: authToken, details });
    } else {
      res.status(401).send({ message: "no user found" });
    }
  } catch (error) {
    res.status(401).send({ message: "invalid token" });
  }
});

module.exports = router;
