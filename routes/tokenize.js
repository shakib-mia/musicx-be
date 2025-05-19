const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");

router.post("/", verifyJWT, async (req, res) => {
  const { email } = jwt.decode(req.headers.token);
  const { clientsCollection, userDetails } = await getCollections();
  const client = await clientsCollection.findOne({ emailId: email });
  const client2 = await userDetails.findOne({ user_email: email });
  const { _id, ...rest } = { ...client, ...client2 };

  //   const
  rest.tokenized += req.body.tokenizedINR;
  const updateCursor = await userDetails.updateOne(
    { user_email: email },
    { $set: rest },
    { upsert: false }
  );

  res.send(updateCursor);
});

module.exports = router;
