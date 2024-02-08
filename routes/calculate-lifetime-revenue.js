const { Router } = require("express");
const getCollections = require("../constants");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { revenueCollections, clientsCollection } = await getCollections();
    const clients = await clientsCollection.find({}).toArray();

    for (const client of clients) {
      let lifetimeRevenue = 0;

      if (client.isrc) {
        const isrcs = client.isrc.split(",");
        for (const isrc of isrcs) {
          const revenueItems = await revenueCollections
            .find({ isrc })
            .toArray();
          revenueItems.forEach((item) => {
            lifetimeRevenue += item["final revenue"];
          });
        }
      }

      // Update the client's lifetimeRevenue if it has changed
      if (client.lifetimeRevenue !== lifetimeRevenue) {
        await clientsCollection.updateOne(
          { _id: client._id },
          { $set: { lifetimeRevenue } }
        );
      }

      // Reflect the updated lifetimeRevenue in the client object for response
      client.lifetimeRevenue = lifetimeRevenue;
    }

    res.send(clients);
  } catch (error) {
    console.error("Failed to calculate lifetimeRevenue:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

module.exports = router;
