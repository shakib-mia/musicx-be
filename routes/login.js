const express = require("express");
const { getCollections } = require("../constants");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { adminsCollection } = await getCollections();
  const { email, password } = req.body;
  const admin = await adminsCollection.findOne({ email });
  // console.log(admin);

  if (admin !== null) {
    if (bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign(
        { email, role: "admin" },
        process.env.access_token_secret,
        {
          expiresIn: "1h",
        }
      );

      res.send({ token, role: "admin" });
    } else {
      res.status(401).send("Invalid Password");
    }
  } else {
    res.status(401).send({ message: "You are not Authorized to login" });
  }
});

module.exports = router;
