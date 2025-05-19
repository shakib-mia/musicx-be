const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.up5jmeq.mongodb.net/?retryWrites=true&w=majority&tls=true`;
const uri2 = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.up5jmeq.mongodb.net/?retryWrites=true&w=majority&tls=true`;
const revenueUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.up5jmeq.mongodb.net/?retryWrites=true&w=majority&tls=true`;
const nodemailer = require("nodemailer");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});
const client2 = new MongoClient(uri2, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});
const revenueClient = new MongoClient(revenueUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

const getCollections = async () => {
  const userProfileCollection = await client
    .db("backvision-digital")
    .collection("user-profile-data");

  const adminsCollection = await client
    .db("backvision-digital")
    .collection("admins"); // admins collection

  const clientsCollection = await client
    .db("backvision-digital")
    .collection("client-with-isrc-collection"); // users collection

  const demoClientsCollection = await client
    .db("backvision-digital")
    .collection("demo-clients"); // users collection

  const isrcWithIDCollection = await client
    .db("backvision-digital")
    .collection("all-isrcs"); // ISRC collection
  const recordLabelsCollection = await client
    .db("backvision-digital")
    .collection("record-labels");

  const platformsCollection = await client
    .db("backvision-digital")
    .collection("platform-name"); // platform-name

  const revenueCollections = await client
    .db("backvision-digital")
    .collection("revenue"); // demo-revenue
  const usersCollection = await client
    .db("backvision-digital")
    .collection("user-credentials-db");

  const userDetails = await client
    .db("backvision-digital")
    .collection("user-details");

  const demoClients = await client
    .db("backvision-digital")
    .collection("demo-clients");

  const paymentHistory = await client
    .db("backvision-digital")
    .collection("payment-history");

  const isrcCollection = await client
    .db("backvision-digital")
    .collection("isrcs");

  const paymentRequest = await client
    .db("backvision-digital")
    .collection("withdrawal-request");

  const fbInstaWhitelisting = await client
    .db("backvision-digital")
    .collection("fb-insta-whitelisting");

  const fbInstaProfile = await client
    .db("backvision-digital")
    .collection("fb-insta-profile");
  const withdrawalRequest = await client
    .db("backvision-digital")
    .collection("withdrawal-request");
  const songsCollection = await client
    .db("backvision-digital")
    .collection("mother-isrc-collection");
  const couponCodesCollection = await client
    .db("backvision-digital")
    .collection("coupon-codes");
  const notificationsCollections = await client
    .db("backvision-digital")
    .collection("notifications");
  const dummyRevenue = await client
    .db("backvision-digital")
    .collection("dummy-revenue");
  const cutPercentages = await client
    .db("backvision-digital")
    .collection("cut-percentages");

  const songUpdateRequestCollection = await client
    .db("backvision-digital")
    .collection("song-update-requests");

  const newSongs = await client
    .db("backvision-digital")
    .collection("new-songs");

  const paymentsCollection = await client
    .db("backvision-digital")
    .collection("payments");

  const refundRequests = await client
    .db("backvision-digital")
    .collection("refund-requests");

  const kycCollection = await client.db("backvision-digital").collection("kyc");

  const yearlyPlansCollection = await client
    .db("backvision-digital")
    .collection("yearly-plan-requests");

  const bulkUploadCollection = await client
    .db("backvision-digital")
    .collection("bulk-upload");

  const songs = await client.db("backvision-digital").collection("songs");

  const recentUploadsCollection = await client
    .db("backvision-digital")
    .collection("recent-uploads");

  const agreementsCollection = await client
    .db("backvision-digital")
    .collection("agreements");
  const recordLabelFilesCollection = await client
    .db("backvision-digital")
    .collection("record-label-files");

  const takedownRequestsCollection = await client
    .db("backvision-digital")
    .collection("takedown-requests");
  const employeesCollection = await client
    .db("backvision-digital")
    .collection("employees");

  const plansCollection = await client
    .db("backvision-digital")
    .collection("plans");

  const crbtCodes = await client
    .db("backvision-digital")
    .collection("crbt-codes");

  const splitRoyalties = await client
    .db("backvision-digital")
    .collection("split-royalties");

  const cutsCollection = await client
    .db("backvision-digital")
    .collection("custom-cut");

  function customLog(...messages) {
    const err = new Error();
    const stackLine = err.stack.split("\n")[2]; // Adjust this line number based on where the error stack points to the correct caller
    const matchResult = stackLine.match(/at (.*)\s+\((.*):(\d*):(\d*)\)/);
    if (matchResult) {
      const [, , filePath, line, column] = matchResult;
      const fileAndLine = `${filePath}:${line}:${column}`;
      console.log(fileAndLine, ...messages);
    } else {
      console.log(...messages);
    }
  }

  return {
    adminsCollection,
    clientsCollection,
    demoClients,
    isrcCollection,
    platformsCollection,
    revenueCollections,
    usersCollection,
    userProfileCollection,
    userDetails,
    demoClientsCollection,
    paymentHistory,
    paymentRequest,
    fbInstaWhitelisting,
    fbInstaProfile,
    withdrawalRequest,
    songsCollection,
    customLog,
    isrcWithIDCollection,
    recordLabelsCollection,
    couponCodesCollection,
    notificationsCollections,
    paymentsCollection,
    songs,
    recentUploadsCollection,
    dummyRevenue,
    cutPercentages,
    refundRequests,
    songUpdateRequestCollection,
    kycCollection,
    yearlyPlansCollection,
    bulkUploadCollection,
    newSongs,
    takedownRequestsCollection,
    employeesCollection,
    agreementsCollection,
    recordLabelFilesCollection,
    plansCollection,
    crbtCodes,
    splitRoyalties,
  };
};

// for local testing
const transporter = nodemailer.createTransport({
  // host: "smtp.hostinger.com", // Replace with your Hostinger SMTP server
  // port: 587, // or 465 for SSL
  // secure: false, // true for 465, false for 587  secure: false, // Set to true if you are using SSL/TLS
  service: "gmail",
  auth: {
    user: "smdshakibmia2001@gmail.com",
    pass: "yyfklclhaujgtnkf ", // Use an app password if you have 2FA enabled
  },
});

// for production

// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com", // Replace with your Hostinger SMTP server
//   port: 587, // or 465 for SSL
//   secure: false, // true for 465, false for 587  secure: false, // Set to true if you are using SSL/TLS
//   auth: {
//     user: "mdshakibmia867@gmail.com",
//     pass: "yyfklclhaujgtnkf ", // Use an app password if you have 2FA enabled
//   },
// });

// module.exports = getCollections;
module.exports = { client, client2, getCollections, transporter };
