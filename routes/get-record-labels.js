const express = require("express");
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get("/", verifyJWT, async (req, res) => {
  const { recordLabelsCollection } = await getCollections();

  const { email } = jwt.decode(req.headers.token);
  //   console.log(email);

  const recordLabels = await recordLabelsCollection
    .find({
      "Email ID": email,
    })
    .toArray();

  const names = recordLabels.map((item) => item["Sub-Label Name"]);

  // console.log(names);

  res.send([...names, "ForeVision Digital"]); // forevision digital is common for all
});

router.post("/", verifyJWT, async (req, res) => {
  const { recordLabelsCollection } = await getCollections();

  const { body } = req;

  // console.log(body);

  const recordLabels = await recordLabelsCollection.find({}).toArray();

  const found = recordLabels.find(
    (item) => item["Sub-Label Name"] === body["Sub-Label Name"]
  );

  // console.log(found);

  if (!found) {
    const postCursor = await recordLabelsCollection.insertOne(body);

    res.send(postCursor);
  } else {
    res.status(409).send("Record Label Already Exists");
  }
});

module.exports = router;
