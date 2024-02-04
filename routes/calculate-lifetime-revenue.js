const { Router } = require("express");
const getCollections = require("../constants");

const router = Router();

router.get("/", async (req, res) => {
  const { demoClients, revenueCollections } = await getCollections();
  const clientsCursor = await demoClients.find({});

  //   all the clients
  const clients = await clientsCursor.toArray();
  const newArr = [];

  for (const client of clients) {
    client.lifetimeRevenue = 0;
    if (client.isrc) {
      const isrcs = client.isrc.split(",");
      //   console.log(isrcs);
      for (const isrc of isrcs) {
        const collection = await revenueCollections.find({ isrc }).toArray();
        // console.log(collection["final revenue"]);
        for (const item of collection) {
          client.lifetimeRevenue =
            client.lifetimeRevenue + item["final revenue"];
        }
      }
    }

    if (!client.lifetimeRevenue) {
      const updateCursor = await demoClients.updateOne(
        { _id: client._id },
        { $set: { ...client } },
        { upsert: false }
      );

      console.log(updateCursor);
    }

    newArr.push(client);
  }

  res.send(newArr);
});

module.exports = router;
