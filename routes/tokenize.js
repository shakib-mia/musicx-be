const express = require("express");
const router = express.Router();
const { getCollections, transporter } = require("../constants");
const verifyJWT = require("../verifyJWT");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
console.clear();

router.post("/", verifyJWT, async (req, res) => {
  const { email } = jwt.decode(req.headers.token);
  const { clientsCollection, userDetails, tokenizationHistory } =
    await getCollections();
  const client = await clientsCollection.findOne({ emailId: email });
  const client2 = await userDetails.findOne({ user_email: email });
  const { _id, ...rest } = { ...client, ...client2 };
  console.clear();

  if (!rest.tokenized) {
    rest.tokenized = 0;
  }

  rest.tokenized += req.body.tokenizedINR;

  // ✅ Log tokenization to history
  await tokenizationHistory.insertOne({
    email,
    amount: req.body.tokenizedINR,
    date: new Date(),
    status: "success",
  });

  const updateCursor = await userDetails.updateOne(
    { user_email: email },
    { $set: rest },
    { upsert: false }
  );

  res.send(updateCursor);
});

router.get("/history", verifyJWT, async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).send({ error: "No token provided." });
    }

    const decoded = jwt.decode(token);
    const email = decoded?.email;

    const { tokenizationHistory } = await getCollections();

    const history = await tokenizationHistory
      .find({ email })
      .sort({ date: -1 })
      .toArray();

    res.send(history);
  } catch (error) {
    console.error("Error fetching tokenization history:", error);
    res
      .status(500)
      .send({ error: "Server error while fetching tokenization history." });
  }
});

router.post("/send-otp", verifyJWT, async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).send({ error: "No token provided." });

    const decoded = jwt.decode(token);
    if (!decoded?.email)
      return res.status(401).send({ error: "Invalid token." });

    const email = decoded.email;
    const { clientsCollection, userDetails } = await getCollections();

    const client = await clientsCollection.findOne({ emailId: email });
    const userDetail = await userDetails.findOne({ user_email: email });

    if (!client && !userDetail)
      return res.status(404).send({ error: "User not found." });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Verification",
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.send({ hashedOtp, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ error: "Failed to send OTP." });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { otp, hashedOtp, amount, to } = req.body;
    const from = jwt.decode(req.headers.token)?.email; // just decode, no verify

    if (!otp || !hashedOtp || !amount || !to || !from) {
      return res.status(400).send({ error: "Missing required fields." });
    }

    const { clientsCollection, userDetails, tokenTransferHistory } =
      await getCollections();

    const isMatch = await bcrypt.compare(otp, hashedOtp);
    if (!isMatch) {
      return res.status(401).send({ success: false, message: "Invalid OTP." });
    }

    const amountToTransfer = parseFloat(amount);
    if (isNaN(amountToTransfer) || amountToTransfer <= 0) {
      return res.status(400).send({ error: "Invalid amount." });
    }

    // Find sender by emailId (assuming sender identified by emailId)
    const sender = await userDetails.findOne({ emailId: from });
    if (!sender) {
      return res
        .status(404)
        .send({ success: false, message: "Sender not found." });
    }

    const senderBalance = sender.tokenized || 0;
    if (senderBalance < amountToTransfer) {
      return res
        .status(400)
        .send({ success: false, message: "Insufficient balance." });
    }

    // Deduct from sender balance
    await userDetails.updateOne(
      { emailId: from },
      { $inc: { tokenized: -amountToTransfer } }
    );

    let receiverFound = false;

    // Try to credit receiver in userDetails by userId
    const receiver = await userDetails.findOne({ userId: to });
    if (receiver) {
      await userDetails.updateOne(
        { userId: to },
        { $inc: { tokenized: amountToTransfer } }
      );
      receiverFound = true;
    } else {
      // Promote from clientsCollection
      const clientUser = await clientsCollection.findOne({ "user-id": to });
      if (clientUser) {
        const { isrc, ...rest } = clientUser;
        await userDetails.insertOne({
          ...rest,
          tokenized: amountToTransfer,
          createdFromClient: true,
          createdAt: new Date(),
        });
        receiverFound = true;
      }
    }

    // Record transfer history
    await tokenTransferHistory.insertOne({
      from: sender.emailId || from,
      to,
      amount: amountToTransfer,
      date: new Date(),
      status: receiverFound ? "success" : "failed",
    });

    if (!receiverFound) {
      return res.status(404).send({
        success: false,
        message: "Receiver not found in any collection.",
      });
    }

    return res.send({
      success: true,
      message: "Token transferred successfully.",
    });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return res.status(500).send({ error: "Server error during transfer." });
  }
});

// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { otp, hashedOtp, amount, to } = req.body;

//     if (!otp || !hashedOtp || !amount || !to) {
//       return res.status(400).send({ error: "Missing required fields." });
//     }

//     const { clientsCollection, userDetails } = await getCollections();

//     const isMatch = await bcrypt.compare(otp, hashedOtp);
//     if (!isMatch) {
//       return res.status(401).send({ success: false, message: "Invalid OTP." });
//     }

//     // Step 1: Try finding the user in clientsCollection
//     const clientUser = await clientsCollection.findOne({
//       _id: new ObjectId(to),
//     });

//     if (clientUser) {
//       // Destructure to exclude `isrc`
//       const { isrc, ...restClientData } = clientUser;

//       // Check if user already exists in userDetails with same email
//       const existingUser = await userDetails.findOne({
//         email: clientUser.email,
//       });

//       if (existingUser) {
//         return res.status(409).send({
//           success: false,
//           message: "User already exists in userDetails.",
//         });
//       }

//       // Insert into userDetails
//       const insertResult = await userDetails.insertOne({
//         ...restClientData,
//         balance: parseFloat(amount) || 0, // add balance field with amount
//         transferredFromClient: true,
//         createdAt: new Date(),
//       });

//       return res.send({
//         success: true,
//         message: "User created in userDetails and amount transferred.",
//         userId: insertResult.insertedId,
//       });
//     }

//     // Step 2: If not in clientsCollection, check userDetails
//     const targetUser = await userDetails.findOne({ _id: new ObjectId(to) });

//     if (!targetUser) {
//       return res
//         .status(404)
//         .send({ success: false, message: "Target user not found." });
//     }

//     // Update balance (example: add amount to existing balance)
//     const newBalance = (targetUser.balance || 0) + parseFloat(amount);

//     await userDetails.updateOne(
//       { _id: new ObjectId(to) },
//       { $set: { balance: newBalance } }
//     );

//     return res.send({
//       success: true,
//       message: "Amount transferred to existing user.",
//     });
//   } catch (error) {
//     console.error("Error verifying OTP and transferring amount:", error);
//     res.status(500).send({ error: "Failed to verify OTP or transfer amount." });
//   }
// });

router.get("/transfer/history/all", verifyJWT, async (req, res) => {
  try {
    const { tokenTransferHistory } = await getCollections();

    // Fetch all transfer history where user is either sender or receiver
    const history = await tokenTransferHistory
      .find({})
      .sort({ date: -1 }) // Optional: newest first
      .toArray();

    res.send(history);
  } catch (error) {
    console.error("Error fetching transfer history:", error);
    res.status(500).send({ error: "Failed to fetch transfer history." });
  }
});

router.get("/history", verifyJWT, async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).send({ error: "No token provided." });
    }

    const decoded = jwt.decode(token);
    if (!decoded?.email) {
      return res.status(401).send({ error: "Invalid token." });
    }

    const email = decoded.email;
    const { tokenTransferHistory } = await getCollections();

    const history = await tokenTransferHistory
      .find({ $or: [{ from: email }, { to: email }] })
      .sort({ date: -1 })
      .toArray();

    res.send(history);
  } catch (error) {
    console.error("Error fetching transfer history:", error);
    res.status(500).send({ error: "Server error while fetching history." });
  }
});

router.get("/history/all", verifyJWT, async (req, res) => {
  try {
    const { tokenizationHistory, userDetails, clientsCollection } =
      await getCollections();

    const history = await tokenizationHistory
      .find({})
      .sort({ date: -1 })
      .toArray();

    const emails = [...new Set(history.map((entry) => entry.email))];

    const usersFromUserDetails = await userDetails
      .find({ user_email: { $in: emails } })
      .project({ user_email: 1, first_name: 1, last_name: 1 })
      .toArray();

    const usersFromClients = await clientsCollection
      .find({ emailId: { $in: emails } })
      .project({ emailId: 1, first_name: 1, last_name: 1 })
      .toArray();

    const emailNameMap = {};

    usersFromUserDetails.forEach((user) => {
      emailNameMap[user.user_email] = `${user.first_name || ""} ${
        user.last_name || ""
      }`.trim();
    });

    usersFromClients.forEach((client) => {
      const fullName = `${client.first_name || ""} ${
        client.last_name || ""
      }`.trim();
      if (!emailNameMap[client.emailId]) {
        emailNameMap[client.emailId] = fullName;
      }
    });

    const enrichedHistory = history.map((entry) => ({
      ...entry,
      name: emailNameMap[entry.email] || "Unknown",
    }));

    res.send(enrichedHistory);
  } catch (error) {
    console.error("Error fetching all transfer history:", error);
    res.status(500).send({ error: "Server error while fetching all history." });
  }
});

module.exports = router;
