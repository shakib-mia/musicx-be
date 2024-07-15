const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
const SALT_INDEX = 1;
const MERCHANT_ID = "PGTESTPAYUAT";
const sha256 = require("sha256");
const PHONE_PE_HOST_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const uniqid = require("uniqid");
const APP_BE_URL = "http://localhost:5100"; // our application

router.post("/pay", async function (req, res, next) {
  // Initiate a payment

  // Transaction amount
  const amount = req.body.amount;

  // User ID is the ID of the user present in our application DB
  let userId = "MUID123";

  // Generate a unique merchant transaction ID for each transaction
  let merchantTransactionId = uniqid();

  let normalPayLoad = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,
    merchantUserId: userId,
    amount: amount * 100, // converting to paise
    redirectUrl: `${APP_BE_URL}/payment/validate/${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  // Make a base64-encoded payload
  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
  let base64EncodedPayload = bufferObj.toString("base64");

  // X-VERIFY => SHA256(base64EncodedPayload + "/pg/v1/pay" + SALT_KEY) + ### + SALT_INDEX
  let string = base64EncodedPayload + "/pg/v1/pay" + SALT_KEY;
  let sha256_val = sha256(string);
  let xVerifyChecksum = sha256_val + "###" + SALT_INDEX;

  axios
    .post(
      `${PHONE_PE_HOST_URL}/pg/v1/pay`,
      { request: base64EncodedPayload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerifyChecksum,
          accept: "application/json",
        },
      }
    )
    .then(function (response) {
      // console.log("response->", response.data);
      res.send(response);
    })
    .catch(function (error) {
      // console.log("error->", error);
      res.send(error);
    });
});

router.post("/status", async (req, res) => {
  const merchantTransactionId = req.query.id;
  const keyIndex = 1;

  const string =
    `pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checkSum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checkSum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  axios
    .request(options)
    .then((res) => console.log(`success: ${res}`))
    .catch((error) => console.log(error));
});

module.exports = router;
