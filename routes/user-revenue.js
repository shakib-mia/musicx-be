const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");

router.get("/", verifyJWT, async (req, res) => {
  //   console.log("object");
  const { clientsCollection } = await getCollections();
  const { email } = jwt.decode(req.headers.token);

  const clientsCursor = await clientsCollection.findOne({
    emailId: email,
  });

  // const

  const isrcs = [];

  if (clientsCollection !== null) {
    if (clientsCursor !== null) {
      clientsCursor.isrc.split(",").map((item) => isrcs.push(item.trim()));
      res.send(isrcs);
    } else {
      res.send({ message: "No isrc found in clientsCursor" });
    }
  } else {
    res.send({ message: "clientsCollection is null" });
  }

  // isrcs.map((isrc) => {
  //   const revenueCursor = revenueCollections.findOne({ isrc });
  // });
  // for (const isrc of isrcs) {
  //   const revenueCursor = await revenueCollections.find({ isrc });
  //   const allRevenues = await revenueCursor.toArray();

  //   // res.send(allRevenues);
  //   // revenueCursor !== null && revenues.push(revenueCursor);
  // }
});

router.get("/:isrc", async (req, res) => {
  const { revenueCollections } = await getCollections();
  const pipeline = [
    {
      $match: { isrc: req.params.isrc },
    },
    {
      $project: {
        _id: 0,
        "final revenue": 1,
        song_name: 1,
        platform_name: 1,
        album: 1,
        track_artist: 1,
        label: 1,
        isrc: 1,
        total: 1,
        "after tds revenue": 1,
      },
    },
  ];

  const revenues = await revenueCollections.aggregate(pipeline).toArray();
  res.send({ revenues });
});

module.exports = router;
