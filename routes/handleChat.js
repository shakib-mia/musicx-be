// backend/routes/chat.js
const express = require("express");
const router = express.Router();
const { getCollections } = require("../constants");
const verifyJWT = require("../verifyJWT");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

router.get("/", (req, res) => {
  getCollections()
    .then(async ({ chatsCollection }) => {
      try {
        const allChats = await chatsCollection.find({}).toArray();
        res.send(allChats);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error fetching chats" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Database connection error" });
    });
});

router.get("/history", verifyJWT, (req, res) => {
  // res.send("Chat route is working");
  const { token } = req.headers;
  getCollections()
    .then(async ({ chatsCollection }) => {
      try {
        const decoded = jwt.decode(token);
        const email = decoded.email;

        const chatHistory = await chatsCollection
          .find({ user_email: email })
          .toArray();

        console.log({ chatHistory });

        res.send(chatHistory);
      } catch (error) {
        console.error(error);
        res.status(401).send({ message: "invalid token" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Database connection error" });
    });
});

router.post("/", verifyJWT, async (req, res) => {
  const { token } = req.headers;
  const { chatsCollection } = await getCollections();
  const { message, chatId } = req.body;

  try {
    const decoded = jwt.decode(token);
    const email = decoded.email;

    // 1️⃣ MongoDB te user message save
    const chatEntry = {
      chat_id: chatId,
      user_email: email,
      message: message,
      timestamp: new Date(),
      response: "", // AI response pore update korbo
    };

    const result = await chatsCollection.insertOne(chatEntry);
    if (!result.insertedId) {
      return res.status(500).send({ message: "Failed to store chat message" });
    }

    // 2️⃣ Stream AI response backend e
    const aiResponse = await fetch("http://localhost:11434/v1/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen:0.5b",
        prompt: `
You are a GeetBazaar-only assistant. 
Answer only based on the GeetBazaar project code and features. 
Do NOT answer anything outside this project. 
If a question is unrelated, respond with this text:
"I can only answer questions related to the GeetBazaar project."
User question: ${message}
`,
        stream: true,
      }),
    });

    if (!aiResponse.body)
      return res.status(500).send({ message: "No AI response body" });

    const reader = aiResponse.body.getReader();
    const decoder = new TextDecoder();
    let botText = "";

    // 3️⃣ Streaming response server-sent events style frontend ke pathano
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      chunk.split("\n").forEach((line) => {
        if (line.startsWith("data: ")) {
          const jsonStr = line.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") return;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.choices && parsed.choices[0].text) {
              botText += parsed.choices[0].text;
              // live update frontend ke send
              res.write(`data: ${JSON.stringify({ text: botText })}\n\n`);
            }
          } catch (err) {
            console.error("JSON parse error:", err);
          }
        }
      });
    }

    // 4️⃣ Final update MongoDB te
    await chatsCollection.updateOne(
      { _id: result.insertedId },
      { $set: { response: botText } }
    );

    res.end();
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: "invalid token" });
  }
});

router.post("/context", async (req, res) => {
  // Example endpoint to fetch chat context or history if needed
  const { token } = req.headers;
  const { chatbotParams } = await getCollections();

  try {
    const matchedData = await chatbotParams
      .find({
        allKeywords: { $in: req.body.message.split(" ") },
      })
      .toArray();
    res.send(matchedData);
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: "invalid token" });
  }
});

router.get("/context", async (req, res) => {
  // Example endpoint to fetch chat context or history if needed
  const { token } = req.headers;
  const { chatbotParams } = await getCollections();

  try {
    const allData = await chatbotParams.find({}).toArray();
    res.send(allData);
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: "invalid token" });
  }
});

module.exports = router;
