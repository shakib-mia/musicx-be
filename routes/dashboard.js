const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");

router.get("/", verifyJWT, async (req, res) => {
  const { clientsCollection, demoClientsCollection, revenueCollections } =
    await getCollections();
  try {
    const usersCursor = await clientsCollection.find({});
    const clientsCursor = await demoClientsCollection.find({});
    const clients = await clientsCursor.toArray();

    const users = await usersCursor.toArray();
    const pipeline = [
      {
        $project: {
          _id: 0,
          "final revenue": 1,
        },
      },
    ];

    const revenues = (
      await revenueCollections.aggregate(pipeline).toArray()
    ).map((item) => item["final revenue"]);

    const result = await clientsCollection
      .aggregate([
        {
          $match: {
            isrc: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            totalISRCs: {
              $sum: {
                $size: { $split: ["$isrc", ","] },
              },
            },
          },
        },
      ])
      .toArray();

    const topContributor = users.reduce(
      (max, obj) =>
        obj.isrc?.split(",").length > max.isrc?.split(",").length ? obj : max,
      users[0]
    );

    res.send({
      usersCount: users.length,
      isrcCount: result[0].totalISRCs,
      topContributor,
      grandTotalRevenue: 0,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
