const { Router } = require("express");
const getCollections = require("../constants");

const router = Router();

router.get("/", async (req, res) => {
  const { demoClients } = await getCollections();

  const allClientsCursor = await demoClients.find({});
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
  res.send(allClients.find((item) => item.lifetimeRevenue === max));
  // console.log(Math.max(...existingRevenues));
});

module.exports = router;
