const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");

router.get("/", verifyJWT, async (req, res) => {
  const {
    clientsCollection,
    demoClientsCollection,
    revenueCollections,
    demoClients,
    // demoClientsCollection,
  } = await getCollections();
  try {
    const usersCursor = await clientsCollection.find({});
    const clientsCursor = await demoClientsCollection.find({});
    const clients = await clientsCursor.toArray();

    const users = await demoClients.find({}).toArray();
    // const pipeline = [
    //   {
    //     $project: {
    //       _id: 0,
    //       lifeTimeRevenue: 1,
    //       "final revenue": 1,
    //     },
    //   },
    // ];

    // const revenues = (
    //   await demoClientsCollection.aggregate(pipeline).toArray()
    // ).map((item) => item.lifeTimeRevenue);

    const pipeline = [
      {
        $project: {
          _id: 0,
          lifeTimeRevenue: 1,
          royality: 1,
        },
      },
    ];

    const revenues = (
      await revenueCollections.aggregate(pipeline).toArray()
    ).map((item) => item.royality);

    // console.log(revenues);

    // create a variable for the sum and initialize it
    let finalRevenue = 0;

    // iterate over each item in the array
    for (let i = 0; i < revenues.length; i++) {
      // console.log(revenues);
      if (revenues[i]) {
        finalRevenue += parseFloat(revenues[i]);
      }
    }

    // console.log(sum);

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
    console.log(result);
    const rev = await demoClients
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
                then: 0, // Replace NaN or negative values with 0
                else: "$final revenue",
              },
            },
            amount: 1, // Include the 'amount' field in the projection
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

    // const due = finalRevenue - rev[0].totalPaid;

    const topContributor = users.reduce(
      (max, obj) =>
        obj.isrc?.split(",").length > max.isrc?.split(",").length ? obj : max,
      users[0]
    );

    res.send({
      usersCount: users.length,
      isrcCount: result[0].totalISRCs,
      topContributor,
      finalRevenue,
      // due,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
