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
});

router.get("/monthly", verifyJWT, async (req, res) => {
  try {
    const { clientsCollection, revenueCollections } = await getCollections();
    const { email } = jwt.decode(req.headers.token);

    const user = await clientsCollection.findOne({ emailId: email });

    if (!user || !user.isrc) {
      return res.status(404).send({ error: "ISRCs not found for this user." });
    }

    const isrcList = user.isrc.split(",").map((i) => i.trim());

    const revenues = await revenueCollections
      .find({ isrc: { $in: isrcList } })
      .project({
        "after tds revenue": 1,
        uploadDate: 1,
      })
      .toArray();

    if (!revenues.length) {
      return res.status(404).send({ error: "No revenue data found." });
    }

    // Group by month
    const monthlyRevenue = {};

    revenues.forEach((item) => {
      const date = new Date(item.uploadDate);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      const revenue = parseFloat(item["after tds revenue"]) || 0;

      if (!monthlyRevenue[yearMonth]) {
        monthlyRevenue[yearMonth] = 0;
      }

      monthlyRevenue[yearMonth] += revenue;
    });

    // Convert to sorted array
    const monthlyRevenueArray = Object.keys(monthlyRevenue)
      .sort()
      .map((month) => ({
        month,
        revenue: parseFloat(monthlyRevenue[month].toFixed(2)),
      }));

    res.send({
      email,
      lifetimeRevenue: monthlyRevenueArray,
    });
  } catch (err) {
    console.error("Monthly revenue error:", err);
    res.status(500).send({ error: "Server error while calculating revenue" });
  }
});

router.get("/:isrc", async (req, res) => {
  try {
    const { revenueCollections, splitRoyalties } = await getCollections();

    const isrc = req.params.isrc;
    // const { email } = jwt.decode(req.headers.token);

    // Step 1: Pre-fetch data in batches for all related documents
    const pipeline = [
      { $match: { isrc } },
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
    if (!revenues.length) {
      return res.status(404).send({ error: "No revenues found for this ISRC" });
    }

    const isrcList = revenues.map((item) => item.isrc);

    // Step 2: Fetch splits in batches
    const splitRoyaltiesData = await splitRoyalties
      .find({ isrc: { $in: isrcList }, confirmed: true })
      .toArray();

    const splitRoyaltiesMap = new Map(
      splitRoyaltiesData.map((item) => [item.isrc, item.splits])
    );

    // Step 3: Process the revenues and calculate fields
    const updatedArray = revenues.map((item) => {
      const splits = splitRoyaltiesMap.get(item.isrc);

      const result = {
        ...item,
      };

      // if (splits) {
      //   const userSplit = splits.find(
      //     ({ emailId, confirmed }) => email === emailId && confirmed
      //   );
      //   if (userSplit) {
      //     result.splitPercentage = userSplit.percentage;
      //     result.revenueAfterSplit =
      //       item["after tds revenue"] *
      //       (parseFloat(userSplit.percentage) / 100);
      //   }
      // }

      if (item.uploadDate) {
        result.date = item.uploadDate;
      }

      return result;
    });

    res.send({ revenues: updatedArray });
  } catch (error) {
    console.error("Error processing revenues:", error);
    res
      .status(500)
      .send({ error: "An error occurred while processing revenues" });
  }
});

module.exports = router;
