const { Router } = require("express");
const getCollections = require("../constants");

const router = Router();

router.get("/", async (req, res) => {
  const { demoClients } = await getCollections();

  const allClientsCursor = await demoClients.find({});
  const allClients = await allClientsCursor.toArray();

  const revenues = allClients.map((item) => item.lifeTimeRevenue);
  const existingRevenues = [];

  for (const revenue of revenues) {
    // console.log(revenue !== undefined);
    if (revenue !== undefined && revenue.toString() !== "NaN") {
      existingRevenues.push(revenue);
    }
  }

  const max = Math.max(...existingRevenues);
  res.send(allClients.find((item) => item.lifeTimeRevenue === max));
  // console.log(Math.max(...existingRevenues));
});

module.exports = router;
