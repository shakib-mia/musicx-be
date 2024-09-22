const { Router } = require("express");
const { getCollections } = require("../constants");

const router = Router();

router.get("/", async (req, res) => {
  const { demoClients, clientsCollection } = await getCollections();

  const allClientsCursor = await clientsCollection.find({});
  const allClients = await allClientsCursor.toArray();

  const revenues = allClients.map((item) => item.lifetimeRevenue);
  const existingRevenues = [];
  // console.log(revenues);

  for (const revenue of revenues) {
    // console.log(revenue !== undefined);
    if (revenue !== undefined && revenue.toString() !== "NaN") {
      // console.log(revenue);
      existingRevenues.push(revenue);
    }
  }

  const max = Math.max(...existingRevenues);
  // console.log(allClients);
  res.send(allClients.find((item) => item.lifetimeRevenue === max));
  // console.log(Math.max(...existingRevenues));
});

module.exports = router;
