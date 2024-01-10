const express = require("express");
const router = express.Router();
const getCollections = require("../constants");
const verifyJWT = require("../verifyJWT");

router.post("/", verifyJWT, async (req, res) => {
  const { paymentHistory, demoClients } = await getCollections();

  //   const paymentCursor = await paymentHistory.insertOne(req.body);
  //   const paymentData = await paymentCursor.toArray();

  const client = await demoClients.findOne({ emailId: req.body.user_email });

  //   console.log(client);

  if (client !== null) {
    if (client.lifeTimeRevenue > 1000) {
      //   const payment = await paymentHistory.insertOne(req.body);
      //   console.log(parseFloat(req.body.amount));
      client.accountBalance =
        client.lifeTimeRevenue - parseFloat(req.body.amount);
      //   console.log(client);

      const updatedDoc = {
        $set: {
          ...client,
        },
      };

      const updateCursor = await demoClients.updateOne(
        { emailId: req.body.user_email },
        updatedDoc,
        {
          upsert: false,
        }
      );

      res.send(updateCursor);
    } else {
      res.send("Insufficient Balance");
    }
  } else {
    res.send("Invalid Email Id");
  }

  //   res.end({ paymentCursor });
});

module.exports = router;
