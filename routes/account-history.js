const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const { paymentHistory } = await getCollections();
  const { email } = jwt.decode(req.headers.token);

  // Modify query to find either disbursed or declined payments
  const payments = await paymentHistory
    .find({
      emailId: email,
      $or: [{ disbursed: true }, { declined: true }],
    })
    .toArray();

  res.send(payments);
});

module.exports = router;
