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
          "final revenue": 1,
        },
      },
    ];

    const revenues = (
      await revenueCollections.aggregate(revenuePipeline).toArray()
    ).map((item) => item["final revenue"]);

    console.log(revenues);

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

    const data = {
      usersCount: users.length,
      clientsCount: clients.length,
      isrcCount,
      finalRevenue,
      totalPaid,
      topContributor,
    };

    console.log(data);

    // Send the response
    res.send(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/graph", async (req, res) => {
  const { revenueCollections } = await getCollections();

  const data = await revenueCollections
    .aggregate([
      {
        $group: {
          _id: "$date", // Group by the "date" field (month)
          totalFinalRevenue: { $sum: "$final revenue" }, // Sum of final revenue for each month
        },
      },
      {
        $project: {
          _id: 0, // Remove _id field from output
          date: "$_id", // Rename _id to date
          totalFinalRevenue: 1, // Keep the totalFinalRevenue field
        },
      },
      {
        $sort: { date: 1 }, // Sort by date ascending (optional)
      },
    ])
    .toArray();

  console.log(data);

  res.send(data);
});

module.exports = router;
