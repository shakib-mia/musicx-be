const express = require("express");
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const { ObjectId } = require("mongodb");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.get("/", async (req, res) => {
  const { userDetails, clientsCollection } = await getCollections();
  const { token } = req.headers;
  if (jwt.decode(token) !== null) {
    const { email } = jwt.decode(token);
    // console.log(email);
    const data = await userDetails.findOne({ user_email: email });
    const data2 = await clientsCollection.findOne({ emailId: email });
    // console.log({ data, data2 });
    res.send({ data: { ...data2, ...data } });
  } else {
    res.status(401).send("Unauthorized Access");
  }
});

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { userDetails, clientsCollection, revenueCollections } =
    await getCollections();

  try {
    const user2 = await clientsCollection.findOne({ "user-id": user_id });

    if (!user2) {
      return res
        .status(404)
        .send({ error: "User not found in clientsCollection" });
    }

    // Split ISRCs
    const isrcs = user2?.isrc
      ?.split(",")
      ?.map((i) => i.trim())
      .filter(Boolean);

    let lifetimeRevenue = 0;

    if (isrcs?.length > 0) {
      const revenueResult = await revenueCollections
        .aggregate([
          { $match: { isrc: { $in: isrcs } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$final revenue" },
            },
          },
        ])
        .toArray();

      lifetimeRevenue = revenueResult[0]?.totalRevenue || 0;
    }

    // Optional: Fetch additional user details
    const user = await userDetails.findOne({ user_email: user2.emailId });

    res.send({
      ...user2,
      ...user,
      totalRevenue: lifetimeRevenue,
    });
  } catch (err) {
    console.error("Error fetching user and revenue data:", err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

router.put("/:user_email", async (req, res) => {
  const { user_email } = req.params;
  const { clientsCollection, userDetails } = await getCollections();

  const newBody = { ...req.body };
  delete newBody._id;
  // console.log(req.body);
  // const user = await clientsCollection.findOne({
  //   user_email: req.body.user_email,
  // });
  // console.log(newBody);
  const updateCursor = await userDetails.updateOne(
    { user_email: req.body.user_email },
    { $set: newBody },
    { upsert: false }
  );

  const foundUser = await userDetails.findOne({
    user_email: req.body.user_email,
  });

  console.log({ foundUser });

  res.send(updateCursor);
});

module.exports = router;
