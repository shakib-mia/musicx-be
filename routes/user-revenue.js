const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");

router.get("/", verifyJWT, async (req, res) => {
  const { clientsCollection, cutPercentages } = await getCollections();
  const { email } = jwt.decode(req.headers.token);
  const clientsCursor = await clientsCollection.findOne({
    emailId: email,
  });

  const isrcs = [];

  if (clientsCollection !== null) {
    if (clientsCursor !== null) {
      clientsCursor?.isrc?.split(",").map((item) => isrcs.push(item.trim()));
      console.log(isrcs);
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
  const { revenueCollections, dummyRevenue, splitRoyalties, cutPercentages } =
    await getCollections();
  const pipeline = [
    {
      $match: { isrc: req.params.isrc },
    },
    {
      $project: {
        _id: 0,
        "final revenue": 1,
        song_name: 1,
        platformName: 1,
        album: 1,
        track_artist: 1,
        label: 1,
        isrc: 1,
        total: 1,
        "after tds revenue": 1,
        date: 1,
        uploadDate: 1,
      },
    },
  ];

  const revenues = await revenueCollections.aggregate(pipeline).toArray();
  const { email } = jwt.decode(req.headers.token);

  const updatedArrayPromises = revenues.map(async (item) => {
    const cutPercentage = await cutPercentages.findOne({ isrc: item.isrc });
    const splitsList = await splitRoyalties.findOne({ isrc: item.isrc });

    const { uploadDate, ...rest } = item;

    const revenueAfterForeVisionCut =
      item["after tds revenue"] *
      (1 - (cutPercentage?.cut_percentage || 10) / 100);

    // const revenueAfterSplits

    item.finalRevenue = revenueAfterForeVisionCut;
    const confirmed = true;

    if (splitsList !== null) {
      const { splits } = splitsList;
      const found = splits.find(
        ({ emailId }) => email === emailId && confirmed
      );
      // console.log(found);
      item.splitPercentage = found.percentage;
      item.revenueAfterSplit =
        revenueAfterForeVisionCut * (parseFloat(found.percentage) / 100);
    }

    if (uploadDate) {
      return { ...item, date: uploadDate };
    } else {
      return item;
    }
  });

  try {
    const updatedArray = await Promise.all(updatedArrayPromises);
    // console.log(updatedArray);
    res.send({ revenues: updatedArray });
  } catch (error) {
    console.error("Error processing revenues:", error);
    res
      .status(500)
      .send({ error: "An error occurred while processing revenues" });
  }
});

module.exports = router;
