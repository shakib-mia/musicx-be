const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");

router.get("/", async (req, res) => {
  const {
    clientsCollection,
    demoClientsCollection,
    revenueCollections,
    demoClients,
  } = await getCollections();

  try {
    // Fetch users and clients
    const users = await clientsCollection.find({}).toArray();
    const clients = await demoClientsCollection.find({}).toArray();

    // Pipeline for revenue calculation
    const revenuePipeline = [
      {
        $project: {
          _id: 0,
          royality: 1,
        },
      },
    ];

    const revenues = (
      await revenueCollections.aggregate(revenuePipeline).toArray()
    ).map((item) => item.royality);

    // Calculate final revenue
    const finalRevenue = revenues.reduce((sum, value) => {
      return sum + (value ? parseFloat(value) : 0);
    }, 0);

    // Aggregation pipeline to count ISRCs
    const isrcCountResult = await clientsCollection
      .aggregate([
        {
          $match: {
            isrc: { $ne: null },
          },
        },
        {
          $project: {
            isrcs: { $split: ["$isrc", ","] },
          },
        },
        {
          $unwind: "$isrcs", // Unwind the ISRC arrays into individual values
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }, // Count total ISRCs
          },
        },
      ])
      .toArray();

    const isrcCount = isrcCountResult[0]?.count || 0;

    // Revenue aggregation for demo clients
    const demoRevenue = await demoClients
      .aggregate([
        {
          $match: {
            amount: { $exists: true },
          },
        },
        {
          $project: {
            _id: 0,
            lifeTimeRevenue: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ["$final revenue", NaN] },
                    { $lt: ["$final revenue", 0] },
                  ],
                },
                then: 0,
                else: "$final revenue",
              },
            },
            amount: 1,
          },
        },
        {
          $group: {
            _id: null,
            totalLifeTimeRevenue: { $sum: "$lifeTimeRevenue" },
            totalPaid: { $sum: "$amount" },
          },
        },
      ])
      .toArray();

    const totalPaid = demoRevenue[0]?.totalPaid || 0;

    // Find the top contributor based on the number of ISRCs
    const topContributor = users.reduce(
      (max, obj) =>
        obj.isrc?.split(",").length > max.isrc?.split(",").length ? obj : max,
      users[0]
    );

    // Send the response
    res.send({
      usersCount: users.length,
      clientsCount: clients.length,
      isrcCount,
      finalRevenue,
      totalPaid,
      topContributor,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
