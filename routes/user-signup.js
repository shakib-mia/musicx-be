const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const getCollections = require("../constants");

router.post("/", async (req, res) => {
  const { userDetails, usersCollection } = await getCollections();

  const reqBody = req.body;
  const userExist = await userDetails.find({
    user_email: reqBody.email,
  });
  const user = await usersCollection.findOne({
    user_email: reqBody.email,
  });

  const users = await userExist.toArray();

  if (user === null) {
    if (reqBody.password) {
      bcrypt.hash(reqBody.password, 10, async function (err, hash) {
        if (hash.length) {
          // Store hash in your password DB.
          // if (hash.length) {
          const user = {
            user_email: reqBody.email,
            user_password: hash,
          };

          const registerCursor = await usersCollection.insertOne(user);
          res.send(registerCursor);
          // console.log(registerCursor);
          // }
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

module.exports = router;
