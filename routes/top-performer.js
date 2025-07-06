const { Router } = require("express");
const { getCollections } = require("../constants");

const router = Router();

router.get("/", async (req, res) => {
  const { clientsCollection, revenueCollections } = await getCollections();
  console.log("ping...");

  // Step 1: Get all ISRCs from revenue collection with their revenues
  const allRevenues = await revenueCollections
    .find({}, { projection: { isrc: 1, date: 1, "final revenue": 1 } })
    .toArray();

  // Step 2: Build ISRC -> revenues map
  const isrcRevenueMap = {};
  for (const item of allRevenues) {
    const isrc = item.isrc?.trim();
    if (!isrc || isNaN(item["final revenue"])) continue;

    if (!isrcRevenueMap[isrc]) {
      isrcRevenueMap[isrc] = [];
    }

    isrcRevenueMap[isrc].push({
      date: item.date,
      finalRevenue: item["final revenue"],
    });
  }

  // Step 3: Fetch all clients once
  const clients = await clientsCollection.find({}).toArray();

  // Step 4: Calculate revenue totals for each client in memory
  let topClient = null;
  let maxRevenue = 0;
  let topClientGraph = [];

  for (const client of clients) {
    const isrcs = (client.isrc || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (isrcs.length === 0) continue;

    let total = 0;
    const graphMap = {};

    for (const isrc of isrcs) {
      const revenues = isrcRevenueMap[isrc];
      if (!revenues) continue;

      for (const { date, finalRevenue } of revenues) {
        total += finalRevenue;

        if (!graphMap[date]) {
          graphMap[date] = 0;
        }
        graphMap[date] += finalRevenue;
      }
    }

    if (total > maxRevenue) {
      maxRevenue = total;
      topClient = client;
      topClientGraph = Object.entries(graphMap)
        .map(([date, totalFinalRevenue]) => ({ date, totalFinalRevenue }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  }

  // Final Output
  res.send({
    client: topClient,
    totalRevenue: maxRevenue,
    graph: topClientGraph,
  });
});

module.exports = router;
