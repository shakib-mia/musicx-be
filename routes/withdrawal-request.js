const express = require("express");
const router = express.Router();
const verifyJWT = require("../verifyJWT"); // Make sure to provide the correct path
const jwt = require("jsonwebtoken");
const getCollections = require("../constants");

router.post("/", verifyJWT, async (req, res) => {
  const { withdrawalRequest, clientsCollection } = await getCollections();
  const { token } = req.headers;
  console.log(token);
  const { email } = jwt.decode(token);

  // console.log(req.body);
  delete req.body._id;
  const userData = await clientsCollection.findOne({ emailId: email });
  // console.log(userData);
  delete userData._id;

  const postCursor = await withdrawalRequest.insertOne({
    ...req.body,
    ...userData,
  });
  res.send(postCursor);
});

module.exports = router;
