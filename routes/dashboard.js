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

    const users = await clientsCollection.find({}).toArray();
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
          $project: {
            isrcs: { $split: ["$isrc", ","] }, // Split the ISRCs into arrays
          },
        },
        {
          $group: {
            _id: null,
            allISRCs: {
              $push: "$isrcs", // Push the array of ISRCs for each document
            },
          },
        },
        {
          $project: {
            _id: 0,
            allISRCs: {
              $reduce: {
                input: "$allISRCs",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] }, // Concatenate all arrays into a single array
              },
            },
          },
        },
      ])
      .toArray();

    // console.log(result);

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

    const { allISRCs } = result[0];

    const pipeline2 = [
      {
        $match: { isrc: { $in: allISRCs } },
      },
      {
        $group: {
          _id: { isrc: "$isrc", song_name: "$song_name" }, // Group by both isrc and song_name
          // If there are other fields you want to include in the uniqueness criteria, add them here.
        },
      },
      {
        $project: {
          _id: 0,
          isrc: "$_id.isrc",
          song_name: "$_id.song_name",
        },
      },
    ];

    const songs = await revenueCollections.aggregate(pipeline2).toArray();

    res.send({
      usersCount: users.length,
      isrcCount: result[0].allISRCs.length,
      topContributor,
      finalRevenue,
      songs,
      // isrcs: result[0].allISRCs,
      // due,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
