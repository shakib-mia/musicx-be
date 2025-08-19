const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.up5jmeq.mongodb.net/?retryWrites=true&w=majority`;
const uri2 = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.up5jmeq.mongodb.net/?retryWrites=true&w=majority`;
const revenueUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.up5jmeq.mongodb.net/?retryWrites=true&w=majority`;
// const uri2 = `mongodb+srv://${process.env.user_db}:${process.env.user_db_pass}@cluster0.ynlqa8v.mongodb.net/?retryWrites=true&w=majority`;
// const revenueUri = `mongodb+srv://adztronaut:${process.env.revenue_password}@cluster0.jmgru.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyJWT = require("./verifyJWT");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const users = require("./routes/users");
const login = require("./routes/login");
const topPerformer = require("./routes/top-performer");
const register = require("./routes/register");
const userSignup = require("./routes/user-signup");
const dashboard = require("./routes/dashboard");
const platforms = require("./routes/platforms");
const revenueUpload = require("./routes/revenue-upload");
const userRevenue = require("./routes/user-revenue");
const postRevenue = require("./routes/post-revenue");
const disbursePayment = require("./routes/disbursePayment");
const songsForIsrc = require("./routes/songs-for-isrc");
const adminRevenue = require("./routes/adminRevenue");
const calculateLifetimeRevenue = require("./routes/calculate-lifetime-revenue");
const getDisbursePayment = require("./routes/getDisbursePayment");
const history = require("./routes/history");
const { getCollections } = require("./constants");
const userDetail = require("./routes/user-profile");
const fbInstaWhitelisting = require("./routes/fb-insta-whitelisting");
const fbInstaProfile = require("./routes/link-facebook-instagram-profile");
const withdrawalRequest = require("./routes/withdrawal-request");
const uploadAadharCards = require("./routes/upload-aadhar-cards");
const uploadPanCards = require("./routes/upload-pan-cards");
const uploadCancelledCheques = require("./routes/cancelledCheque");
const uploadGstCertificate = require("./routes/upload-gst-certificates");
const file = require("./routes/file");
const deleteData = require("./routes/delete");
const secondaryUid = require("./routes/upload-secondary-uid");
const uploadGovtId = require("./routes/upload-govt-id");
const generateIsrc = require("./routes/generateIsrc");
const songUpload = require("./routes/upload-song");
const checkIsrc = require("./routes/checkIsrc");
const uploadArtWork = require("./routes/upload-artwork");
const recordLabels = require("./routes/get-record-labels");
const couponCodes = require("./routes/store-coupon-codes");
const storeInvoice = require("./routes/store-invoice");
const uploadSignature = require("./routes/upload-signature");
const notifications = require("./routes/handle-notifications");
const tokenTime = require("./routes/token-time");
const razorpay = require("./routes/payment");
const updateDisbursed = require("./routes/update-disbursement");
const checkRequested = require("./routes/checkRequested");
const phonePe = require("./routes/handlePhonePePayment");
const generateOrderId = require("./routes/generate-order-id");
const songs = require("./routes/songs");
const recentUploads = require("./routes/recentUploads");
const uploadFilmBanner = require("./routes/upload-film-banner");
const handleFirebaseLogin = require("./routes/handle-firebase-login");
// const refund = require("./routes/refund");
const uploadLetterHeads = require("./routes/upload-letterhead");
// const { customLog } = require("./constants");
const editSong = require("./routes/edit-song");
const handleSongStatus = require("./routes/handle-song-status");
const kyc = require("./routes/kyc");
const yearlyPlans = require("./routes/yearlyPlansRequest");
const bulkUpload = require("./routes/bulkUpload");
const takedownRequests = require("./routes/takedown-requests");
const profile = require("./routes/profile");
const generateUserId = require("./routes/generate-user-id");
const uploadProfilePicture = require("./routes/upload-profile-picture");
const uploadCoverPhoto = require("./routes/upload-cover-photos");
const createEmployee = require("./routes/create-employee");
const employeeLogin = require("./routes/employee-login");
const submitForm = require("./routes/submit-forms");
// const uploadPromotionalArtwork = require("./routes/upload-promotional-artwork");
const sendSongStatus = require("./routes/send-song-status");
const uploadAgreements = require("./routes/upload-agreements");
const uploadRecordLabels = require("./routes/upload-record-labels");
const accountHistory = require("./routes/account-history");
const plans = require("./routes/plans");
const crbtCodes = require("./routes/crbt-codes");
const royaltySplits = require("./routes/split-royalties");
const customCutAPI = require("./routes/custom-cut");
const userLogin = require("./routes/user-logn");
const tokenize = require("./routes/tokenize");
const resetPassword = require("./routes/resetPassword");
const fs = require("fs");

const paidData = [
  {
    client_name: "Humanity-A Vision",
    last_paid: "Sep-21",
    amount: 24229,
    emailId: "akashthakurmsva@gmail.com",
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "Dec-21",
    amount: 11847,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "Gujuu Entertainment",
    last_paid: "Dec-21",
    amount: 6392,
    emailId: "Jaimaabadiya@gmail.com",
  },
  {
    client_name: "Ravi Kansal",
    last_paid: "Jan-21",
    amount: 3662.37,
    emailId: "kansal.ravi89@gmail.com",
  },
  {
    client_name: "Bloomfair Music",
    last_paid: "Jan-21",
    amount: 3044.28,
    emailId: "bloomfairproduction@gmail.com",
  },
  {
    client_name: "Gujuu Entertainment",
    last_paid: "Jan-22",
    amount: 21292,
    emailId: "Jaimaabadiya@gmail.com",
  },
  {
    client_name: "Ravi Kansal",
    last_paid: "Feb-22",
    amount: 17391,
    emailId: "kansal.ravi89@gmail.com",
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "Feb-22",
    amount: 39385,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "Vipin Agnihotri",
    last_paid: "Feb-22",
    amount: 1210,
    emailId: "vipin.agnihotrijournalist@gmail.com",
  },
  {
    client_name: "Raj Mirza",
    last_paid: "Feb-22",
    amount: 12837,
  },
  {
    client_name: "Gujuu Entertainment",
    last_paid: "Feb-22",
    amount: 39542,
    emailId: "Jaimaabadiya@gmail.com",
  },
  {
    client_name: "Gujuu Entertainment",
    last_paid: "Mar-22",
    amount: 32749,
    emailId: "Jaimaabadiya@gmail.com",
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "Mar-22",
    amount: 51671,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "D Land",
    last_paid: "Mar-22",
    amount: 35555,
    emailId: "dlandmusic123@gmail.com",
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "May-22",
    amount: 6352,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "Band Fusion",
    last_paid: "May-22",
    amount: 3783,
    emailId: "wrupsarkar@gmail.com",
  },
  {
    client_name: "Murmu Muzik Production",
    last_paid: "May-22",
    amount: 3927,
    emailId: "murmuproductionofficial@gmail.com",
  },
  {
    client_name: "ASHOKSARAVANAN",
    last_paid: "May-22",
    amount: 1528,
    emailId: "ashoksonsaravanan@gmail.com",
  },
  {
    client_name: "Silent Entertainments",
    last_paid: "May-22",
    amount: 1500,
    emailId: "behindshoots@gmail.com",
  },
  {
    client_name: "Kokborok Music Entertainment",
    last_paid: "May-22",
    amount: 4793,
    emailId: "gupidebbarma@gmail.com",
  },
  {
    client_name: "Soul Track Music",
    last_paid: "May-22",
    amount: 2885,
    emailId: "shubhsaxena555@gmail.com",
  },
  {
    client_name: "Rahul Kiran",
    last_paid: "Jul-22",
    amount: 16068,
    emailId: "sukiranavisions@gmail.com",
  },
  {
    client_name: "Ajit Kumar Films",
    last_paid: "Jul-22",
    amount: 75000,
    emailId: "beingodiotic@gmail.com",
  },
  {
    client_name: "Bucks Boy",
    last_paid: "Jul-22",
    amount: 3402,
    emailId: "sudarshansiddh27@gmail.com",
  },
  {
    client_name: "Laibuma Creation",
    last_paid: "Jul-22",
    amount: 13583,
    emailId: "salkadebbarma91@gmail.com",
  },
  {
    client_name: "Suraj Palodia Films Netwood Tv",
    last_paid: "Jul-22",
    amount: 4350,
    emailId: "palodiyasuraj1999@gmail.com",
  },
  {
    client_name: "Anupam Dutta",
    last_paid: "Aug-22",
    amount: 1606,
    emailId: "duttaa494@gmail.com",
  },
  {
    client_name: "Ravi Kansal",
    last_paid: "Aug-22",
    amount: 26593,
    emailId: "kansal.ravi89@gmail.com",
  },
  {
    client_name: "Raj Mirza",
    last_paid: "Aug-22",
    amount: 21781,
  },
  {
    client_name: "D Land",
    last_paid: "Aug-22",
    amount: 20701,
    emailId: "dlandmusic123@gmail.com",
  },
  {
    client_name: "Band Fusion",
    last_paid: "Sep-22",
    amount: 2310,
    emailId: "wrupsarkar@gmail.com",
  },
  {
    client_name: "Rahul Biswas",
    last_paid: "Sep-22",
    amount: 1055,
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "Sep-22",
    amount: 40604,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "Silent Entertainments",
    last_paid: "Sep-22",
    amount: 1361,
    emailId: "behindshoots@gmail.com",
  },
  {
    client_name: "Kokborok Music Entertainment",
    last_paid: "Oct-22",
    amount: 4138,
    emailId: "gupidebbarma@gmail.com",
  },
  {
    client_name: "Murmu Muzik Production",
    last_paid: "Oct-22",
    amount: 4448,
    emailId: "murmuproductionofficial@gmail.com",
  },
  {
    client_name: "Jeet Music Assamese",
    last_paid: "Oct-22",
    amount: 1073,
    emailId: "zumanjeetofficial@gmail.com",
  },
  {
    client_name: "ASHOKSARAVANAN",
    last_paid: "Nov-22",
    amount: 1712,
    emailId: "ashoksonsaravanan@gmail.com",
  },
  {
    client_name: "D Land",
    last_paid: "Nov-22",
    amount: 16613,
    emailId: "dlandmusic123@gmail.com",
  },
  {
    client_name: "Rahul Kiran",
    last_paid: "Nov-22",
    amount: 38180,
    emailId: "sukiranavisions@gmail.com",
  },
  {
    client_name: "Soul Track Music",
    last_paid: "Dec-22",
    amount: 1826,
    emailId: "shubhsaxena555@gmail.com",
  },
  {
    client_name: "Ajit Kumar Films",
    last_paid: "Dec-22",
    amount: 86443,
    emailId: "beingodiotic@gmail.com",
  },
  {
    client_name: "Being Odiotic",
    last_paid: "Dec-22",
    amount: 56932,
    emailId: "beingodiotic@gmail.com",
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "Jan-23",
    amount: 20471,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "Kokborok Music Entertainment",
    last_paid: "Jan-23",
    amount: 3084,
    emailId: "gupidebbarma@gmail.com",
  },
  {
    client_name: "MRD Films International",
    last_paid: "Feb-23",
    amount: 2073,
    emailId: "itsofficialrk@gmail.com",
  },
  {
    client_name: "LST Enterprise",
    last_paid: "Mar-23",
    amount: 1133,
    emailId: "langnehstudios@gmail.com",
  },
  {
    client_name: "D Land",
    last_paid: "Mar-23",
    amount: 17969,
    emailId: "dlandmusic123@gmail.com",
  },
  {
    client_name: "Bucks Boy",
    last_paid: "Mar-23",
    amount: 60278,
    emailId: "sudarshansiddh27@gmail.com",
  },
  {
    client_name: "Muzical Mind Yo!",
    last_paid: "Mar-23",
    amount: 1060,
    emailId: "muzicalmindyo@gmail.com",
  },
  {
    client_name: "Ravi Kansal",
    last_paid: "Mar-23",
    amount: 1119,
    emailId: "kansal.ravi89@gmail.com",
  },
  {
    client_name: "Band Fusion",
    last_paid: "Mar-23",
    amount: 1258,
    emailId: "wrupsarkar@gmail.com",
  },
  {
    client_name: "KOK Creation",
    last_paid: "Mar-23",
    amount: 7093,
    emailId: "opdewangan26@gmail.com",
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "Mar-23",
    amount: 7101,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "FiMiX Music",
    last_paid: "Mar-23",
    amount: 2243,
    emailId: "fimixmusic.in@gmail.com",
  },
  {
    client_name: "Perfect Sandhu",
    last_paid: "Mar-23",
    amount: 5944,
    emailId: "perfectsandhuofficial@gmail.com",
  },
  {
    client_name: "Pareek Brothers",
    last_paid: "Mar-23",
    amount: 1719,
    emailId: "masterbadalpareek@gmail.com",
  },
  {
    client_name: "Being Odiotic",
    last_paid: "Apr-23",
    amount: 5735,
    emailId: "beingodiotic@gmail.com",
  },
  {
    client_name: "Ajit Kumar Films",
    last_paid: "Apr-23",
    amount: 24882,
    emailId: "beingodiotic@gmail.com",
  },
  {
    client_name: "Laibuma Creation",
    last_paid: "Apr-23",
    amount: 13453,
    emailId: "salkadebbarma91@gmail.com",
  },
  {
    client_name: "Murmu Muzik Production",
    last_paid: "Apr-23",
    amount: 6225,
    emailId: "murmuproductionofficial@gmail.com",
  },
  {
    client_name: "Jayantho",
    last_paid: "Apr-23",
    amount: 6887,
    emailId: "jayantho.15@gmail.com",
  },
  {
    client_name: "Jeet Music Assamese",
    last_paid: "May-23",
    amount: 1850,
    emailId: "zumanjeetofficial@gmail.com",
  },
  {
    client_name: "Om Shantih Production",
    last_paid: "May-23",
    amount: 9086,
    emailId: "omshantiproduction7023@gmail.com",
  },
  {
    client_name: "Rahul Kiran",
    last_paid: "May-23",
    amount: 31270,
    emailId: "sukiranavisions@gmail.com",
  },
  {
    client_name: "Suraj Palodia Films Netwood Tv",
    last_paid: "May-23",
    amount: 2534,
    emailId: "palodiyasuraj1999@gmail.com",
  },
  {
    client_name: "Bucks Boy",
    last_paid: "May-23",
    amount: 14366,
    emailId: "sudarshansiddh27@gmail.com",
  },
  {
    client_name: "Laibuma Creation",
    last_paid: "May-23",
    amount: 22942,
    emailId: "salkadebbarma91@gmail.com",
  },
  {
    client_name: "D Land",
    last_paid: "May-23",
    amount: 15395,
    emailId: "dlandmusic123@gmail.com",
  },
  {
    client_name: "Humanity-A Vision",
    last_paid: "May-23",
    amount: 26987,
    emailId: "akashthakurmsva@gmail.com",
  },
  {
    client_name: "Samprit Tigga",
    last_paid: "May-23",
    amount: 4151,
    emailId: "sadri.beatz@gmail.com",
  },
  {
    client_name: "Perfect Sandhu",
    last_paid: "Jun-23",
    amount: 1550,
    emailId: "perfectsandhuofficial@gmail.com",
  },
  {
    client_name: "Silent Entertainments",
    last_paid: "Jun-23",
    amount: 1838,
    emailId: "behindshoots@gmail.com",
  },
  {
    client_name: "360India",
    last_paid: "Jun-23",
    amount: 6900,
    emailId: "360meet@gmail.com",
  },
  {
    client_name: "bharath varma",
    last_paid: "Jun-23",
    amount: 4683,
    emailId: "bharathproductionsbvrm.2019@gmail.com",
  },
  {
    client_name: "Rohit Gopalakrishnan",
    last_paid: "Jul-23",
    amount: 19172,
    emailId: "rohitextreme@gmail.com",
  },
  {
    client_name: "Anupam Dutta",
    last_paid: "Jul-23",
    amount: 4266,
    emailId: "duttaa494@gmail.com",
  },
  {
    client_name: "Kokborok Music Entertainment",
    last_paid: "Jul-23",
    amount: 3238,
    emailId: "gupidebbarma@gmail.com",
  },
  {
    client_name: "Rahul Sathe",
    last_paid: "Jul-23",
    amount: 1402,
    emailId: "rahulsatheofficial@gmail.com",
  },
  {
    client_name: "Ishwar Bhakti Ras",
    last_paid: "Jul-23",
    amount: 2758,
    emailId: "sunilguptasinger@gmail.com",
  },
  {
    client_name: "Aditya Dalai",
    last_paid: "Aug-23",
    amount: 1381,
    emailId: "arinndalai@gmail.com",
  },
  {
    client_name: "Being Odiotic",
    last_paid: "Aug-23",
    amount: 73897,
    emailId: "beingodiotic@gmail.com",
  },
  {
    client_name: "Ajit Kumar Films",
    last_paid: "Aug-23",
    amount: 123415,
    emailId: "beingodiotic@gmail.com",
  },
  {
    client_name: "Bucks Boy",
    last_paid: "Aug-23",
    amount: 39954,
    emailId: "sudarshansiddh27@gmail.com",
  },
  {
    client_name: "Jinni Music",
    last_paid: "Aug-23",
    amount: 1684,
    emailId: "entertainmentjinni@gmail.com",
  },
  {
    client_name: "Om Shantih Production",
    last_paid: "Sep-23",
    amount: 9748,
    emailId: "omshantiproduction7023@gmail.com",
  },
  {
    client_name: "Trendani Music",
    last_paid: "Sep-23",
    amount: 26006,
    emailId: "trendanimusic@gmail.com",
  },
  {
    client_name: "Perfect Sandhu",
    last_paid: "Oct-23",
    amount: 1061,
    emailId: "perfectsandhuofficial@gmail.com",
  },
  {
    client_name: "Gill Armaan",
    last_paid: "Oct-23",
    amount: 34124,
    emailId: "hs59507@gmail.com",
  },
  {
    client_name: "Pindhood Records",
    last_paid: "Oct-23",
    amount: 2819,
    emailId: "pindhoodrecords@gmail.com",
  },
  {
    client_name: "Anupam Dutta",
    last_paid: "Oct-23",
    amount: 2089,
    emailId: "duttaa494@gmail.com",
  },
  {
    client_name: "Mani Bhawanigarh",
    last_paid: "Oct-23",
    amount: 18980,
    emailId: "manibhawanigarh7860@gmail.com",
  },
  {
    client_name: "Muzical Mind Yo!",
    last_paid: "Oct-23",
    amount: 1416,
    emailId: "muzicalmindyo@gmail.com",
  },
  {
    client_name: "D Land",
    last_paid: "Oct-23",
    amount: 22304,
    emailId: "dlandmusic123@gmail.com",
  },
  {
    client_name: "Pareek Brothers",
    last_paid: "Oct-23",
    amount: 1379,
    emailId: "masterbadalpareek@gmail.com",
  },
  {
    client_name: "Gill Armaan",
    last_paid: "Nov-23",
    amount: 64796,
    emailId: "hs59507@gmail.com",
  },
  {
    client_name: "Om Shantih Production",
    last_paid: "Dec-23",
    amount: 3888,
    emailId: "omshantiproduction7023@gmail.com",
  },
  {
    client_name: "Bucks Boy",
    last_paid: "Dec-23",
    amount: 57559,
    emailId: "sudarshansiddh27@gmail.com",
  },
  {
    client_name: "The Future Music",
    last_paid: "Dec-23",
    amount: 1185,
    emailId: "viparmar5@gmail.com",
  },
];

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies and credentials
};
app.use(express());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));
app.use(cors(corsOptions));
app.options("*", cors());

// app.options("/revenue", cors()); // Handle preflight requests
// app.options("/dashboard", cors()); // Handle preflight requests

app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Replace with your Hostinger SMTP server
  port: 587, // Typically, SMTP uses port 587
  secure: false, // Set to true if you are using SSL/TLS
  auth: {
    user: process.env.emailAddress,
    pass: process.env.emailPass,
  },
});

const port = process.env.port;

app.get("/", async (req, res) => {
  const token = jwt.sign(
    { email: "info.gskillz@gmail.com" },
    process.env.access_token_secret,
    { expiresIn: "1d" }
  );

  bcrypt.hash("123456", 10, async function (err, hash) {
    // Store hash in your password DB.

    res.send(`from port: ${hash} ${port} ${token}`);
  });
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const client2 = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const revenueClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    // await client2.connect();
    // await revenueClient.connect();

    const clientsCollection = await client
      .db("backvision-digital")
      .collection("client-with-isrc-collection"); // users collection

    const isrcCollection = await client
      .db("backvision-digital")
      .collection("isrcs"); // ISRC collection

    const revenueCollections = await client
      .db("backvision-digital")
      .collection("revenue"); // demo-revenue
    const usersCollection = await client
      .db("backvision-digital")
      .collection("user-credentials-db");

    const userDetails = await client
      .db("backvision-digital")
      .collection("user-details");

    const customCut = await client
      .db("backvision-digital")
      .collection("custom-cut");

    const demoClients = await client
      .db("backvision-digital")
      .collection("demo-clients");
    const paymentHistory = await client
      .db("backvision-digital")
      .collection("payment-history");

    const apis = [
      {
        path: "/users",
        element: users,
      },
      {
        path: "/login",
        element: login,
      },
      {
        path: "/top-perfromer",
        element: topPerformer,
      },
      {
        path: "/register",
        element: register,
      },
      {
        path: "/user-signup",
        element: userSignup,
      },
      {
        path: "/dashboard",
        element: dashboard,
      },
      {
        path: "/platforms",
        element: platforms,
      },
      {
        path: "/revenue-upload",
        element: revenueUpload,
      },
      {
        path: "/user-revenue",
        element: userRevenue,
      },
      {
        path: "/revenue",
        element: postRevenue,
      },
      {
        path: "/login",
        element: login,
      },
      {
        path: "/disburse-payment",
        element: disbursePayment,
      },
      {
        path: "/songs-for-isrc",
        element: songsForIsrc,
      },
      {
        path: "/admin-royalty",
        element: adminRevenue,
      },
      {
        path: "/calculate-lifetime-revenue",
        element: calculateLifetimeRevenue,
      },
      {
        path: "/history",
        element: history,
      },
      {
        path: "/user-profile",
        element: userDetail,
      },
      {
        path: "/user-login",
        element: userLogin,
      },
      // {
      //   path: "/fb-insta-whitelisting",
      //   element: fbInstaWhitelisting,
      // },
      // {
      //   path: "/link-fb-insta-profile",
      //   element: fbInstaProfile,
      // },
      {
        path: "/withdrawal-request",
        element: withdrawalRequest,
      },
      {
        path: "/file",
        element: file,
      },
      {
        path: "/top-performer",
        element: topPerformer,
      },
      {
        path: "/upload-aadhar-cards",
        element: uploadAadharCards,
      },
      {
        path: "/upload-pan-cards",
        element: uploadPanCards,
      },
      {
        path: "/upload-cancelled-cheques",
        element: uploadCancelledCheques,
      },
      {
        path: "/upload-gst-certificate",
        element: uploadGstCertificate,
      },
      {
        path: "/delete-data",
        element: deleteData,
      },
      {
        path: "/upload-govt-id",
        element: uploadGovtId,
      },
      {
        path: "/upload-secondary-uid",
        element: secondaryUid,
      },
      {
        path: "/upload-song",
        element: songUpload,
      },
      {
        path: "/check-isrc",
        element: checkIsrc,
      },
      {
        path: "/upload-art-work",
        element: uploadArtWork,
      },
      {
        path: "/record-labels",
        element: recordLabels,
      },
      {
        path: "/coupon-codes",
        element: couponCodes,
      },
      {
        path: "/store-invoice",
        element: storeInvoice,
      },
      {
        path: "/upload-signature",
        element: uploadSignature,
      },
      {
        path: "/notifications",
        element: notifications,
      },
      {
        path: "/token-time",
        element: tokenTime,
      },
      {
        path: "/razorpay",
        element: razorpay,
      },
      {
        path: "/update-disbursement",
        element: updateDisbursed,
      },

      {
        path: "/phonepe-payment",
        element: phonePe,
      },
      {
        path: "/check-requested",
        element: checkRequested,
      },
      {
        path: "/generate-order-id",
        element: generateOrderId,
      },
      {
        path: "/songs",
        element: songs,
      },
      {
        path: "/recent-uploads",
        element: recentUploads,
      },
      {
        path: "/upload-film-banner",
        element: uploadFilmBanner,
      },
      {
        path: "/upload-letterhead",
        element: uploadLetterHeads,
      },
      {
        path: "/upload-agreements",
        element: uploadAgreements,
      },
      {
        path: "/upload-record-labels",
        element: uploadRecordLabels,
      },
      {
        path: "/handle-firebase-login",
        element: handleFirebaseLogin,
      },
      // {
      //   path: "/refund",
      //   element: refund,
      // },
      {
        path: "/edit-song",
        element: editSong,
      },
      {
        path: "/handle-song-status",
        element: handleSongStatus,
      },
      {
        path: "/kyc",
        element: kyc,
      },

      {
        path: "/yearly-plans",
        element: yearlyPlans,
      },

      {
        path: "/bulk-upload",
        element: bulkUpload,
      },

      {
        path: "/takedown-requests",
        element: takedownRequests,
      },
      {
        path: "/profile",
        element: profile,
      },
      {
        path: "/generate-user-id",
        element: generateUserId,
      },
      {
        path: "/upload-profile-picture",
        element: uploadProfilePicture,
      },

      {
        path: "/upload-cover-photo",
        element: uploadCoverPhoto,
      },
      {
        path: "/admin",
        element: createEmployee,
      },
      {
        path: "/employee-login",
        element: employeeLogin,
      },
      {
        path: "/submit-form",
        element: submitForm,
      },
      {
        path: "/send-song-status",
        element: sendSongStatus,
      },
      {
        path: "/account-history",
        element: accountHistory,
      },
      {
        path: "/plans",
        element: plans,
      },
      {
        path: "/crbt-codes",
        element: crbtCodes,
      },
      {
        path: "/royalty-splits",
        element: royaltySplits,
      },

      {
        path: "/custom-cut",
        element: customCutAPI,
      },

      {
        path: "/tokenize",
        element: tokenize,
      },
      {
        path: "/reset-password",
        element: resetPassword,
      },
      // {
      //   path: "/upload-promotional-artwork",
      //   element: uploadPromotionalArtwork,
      // },
    ];

    apis.map(({ path, element }) => app.use(path, element));

    app.get("/getAllIsrcs", async (req, res) => {
      let isrcs = "";

      const allIsrcs = await isrcCollection.find({}).toArray();

      const pipeline = [
        {
          $match: { isrc: "INF232200285" },
        },
        {
          $project: {
            _id: 0,
            royality: 1,
          },
        },
      ];
      const cursor = await revenueCollections.aggregate(pipeline).toArray();
      // console.log(cursor.length);

      res.send(allIsrcs);
    });

    app.get("/handle-payment", async (req, res) => {
      // console.log(paidData);
      for (const item of paidData) {
        const user = await demoClients.findOne({ emailId: item.emailId });
        // console.log(user);
        if (user !== null) {
          // console.log(user);
          const newUser = { ...user, ...item };

          newUser.accountBalance = newUser.lifeTimeRevenue - newUser.amount;
          // console.log(newUser);
          const updatedCursor = await demoClients.updateOne(
            { emailId: item.emailId },
            {
              $set: {
                ...newUser,
              },
            },
            {
              upsert: false,
            }
          );
        }
        res.send({ message: "updated" });
      }
    });

    app.get("/check-duplicates", async (req, res) => {
      function hasDuplicates(array, key) {
        const seenValues = {};
        for (const item of array) {
          if (seenValues[item[key]]) {
            return true; // Found a duplicate
          }
          seenValues[item[key]] = true;
        }
        return false; // No duplicates found
      }

      const { usersCollection } = await getCollections();
      const songs = await usersCollection.find({}).toArray();

      res.send(hasDuplicates(songs, "emailId"));
    });

    app.delete(
      "/revenue/:month/:year/:platform",
      verifyJWT,
      async (req, res) => {
        const deleteCursor = await revenueCollections.deleteMany({
          uploadDate: `${req.params.year}-${req.params.month}`,
          platformName: req.params.platform,
        });
        res.send(deleteCursor);
      }
    );

    // app.post("/user-login", cors(), async (req, res) => {
    //   const { email, password } = req.body;
    //   const userCursor = await usersCollection.findOne({ user_email: email });
    //   const details = await userDetails.findOne({ user_email: email });
    //   if (userCursor !== null) {
    //     bcrypt.compare(password, userCursor.user_password, (err, result) => {
    //       if (result) {
    //         // res.send({ message: "success" });
    //         const token = jwt.sign({ email }, process.env.access_token_secret, {
    //           expiresIn: "2h",
    //         });

    //         res.send({ token, details });
    //       } else {
    //         // console.log(err);
    //         res.status(401).send({ message: "incorrect password" });
    //       }
    //     });
    //   } else {
    //     res.status(401).send({ message: "no user found" });
    //   }
    // });

    app.get("/getUserData", async (req, res) => {
      const { token } = req.headers;
      if (jwt.decode(token) !== null) {
        const { email } = jwt.decode(token);
        // console.log(email);
        const data = await userDetails.findOne({ user_email: email });
        const data2 = await clientsCollection.findOne({ emailId: email });

        console.log({ data: { ...data2, ...data } });

        res.send({ data: { ...data2, ...data } });
      } else {
        res.status(401).send("Unauthorized Access");
      }
    });

    app.get("/generate-password", async (req, res) => {
      bcrypt.hash("123456", 10, async function (err, hash) {
        if (hash.length) {
          res.send(hash);
        }
      });
    });

    const songsDir = path.join(__dirname, "uploads", "songs");

    app.get("/all-songs-file", async (req, res) => {
      // Get MongoDB collection reference
      const { recentUploadsCollection } = await getCollections();

      try {
        // Read all files from the server's songs directory
        const files = await fs.promises.readdir(songsDir);

        // Filter only audio files based on extension
        const songFiles = files.filter((file) =>
          /\.(mp3|wav|m4a|ogg)$/i.test(file)
        );

        // Construct base URL for songs (e.g., http://localhost:3000/uploads/songs/)
        const protocol = req.protocol;
        const host = req.get("host");
        const baseUrl = `${protocol}://${host}/uploads/songs/`;

        // Create a Set of available filenames (in lowercase for case-insensitive matching)
        const availableFilesSet = new Set(
          songFiles.map((f) => f.toLowerCase())
        );

        // Fetch all documents that contain either:
        // - a single songUrl field OR
        // - an array of songs (albums) each having songUrl
        const songsFromDb = await recentUploadsCollection
          .find({
            $or: [
              { songUrl: { $exists: true } },
              { "songs.0": { $exists: true } },
            ],
          })
          .toArray();

        // Initialize array to hold processed song data including availability status
        const songs = [];

        // Loop through each document to extract song URLs and check file availability
        songsFromDb.forEach((doc) => {
          if (doc.songUrl) {
            // For single songs, extract filename from the URL
            const filename = decodeURIComponent(
              doc.songUrl.split("/").pop() || ""
            ).toLowerCase();

            // Check if the file physically exists in the songs folder
            const isAvailable = availableFilesSet.has(filename);

            // Push song data along with availability and filename info
            songs.push({
              ...doc,
              available: isAvailable, // true if file found, false if missing
              fileName: filename, // extracted filename
              fileUrl: doc.songUrl, // full URL to access the song
            });
          } else if (Array.isArray(doc.songs)) {
            // For albums containing multiple songs
            doc.songs.forEach((song) => {
              if (song.songUrl) {
                // Extract filename from each song's URL inside the album
                const filename = decodeURIComponent(
                  song.songUrl.split("/").pop() || ""
                ).toLowerCase();

                // Check if this file is physically present
                const isAvailable = availableFilesSet.has(filename);

                // Push individual song info with parent album reference and availability
                songs.push({
                  ...song,
                  parentAlbumId: doc._id, // reference to the album document
                  available: isAvailable, // availability flag
                  fileName: filename, // filename extracted
                  fileUrl: song.songUrl, // full song URL
                });
              }
            });
          }
        });

        // Filter songs to include only those physically available on the server
        const availableSongsOnly = songs.filter((s) => s.available);

        // Respond with JSON containing only available songs
        res.json(availableSongsOnly);
      } catch (err) {
        // Log error and respond with 500 Internal Server Error
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.delete("/delete-song/:filename", async (req, res) => {
      const { filename } = req.params;

      // console.log(path);

      const filePath = path.join(__dirname, "uploads", "songs", filename);
      if (!fs.existsSync(filePath))
        return res.status(404).json({ error: "File not found" });

      try {
        fs.unlinkSync(filePath);
        // Also delete from database if needed
        return res.status(200).json({ message: "Deleted successfully" });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Deletion failed" });
      }
    });

    app.get("/client-with-isrc", async (req, res) => {
      const data = await clientsCollection.find({}).toArray();
      res.send(data);
    });

    /**
     *
     *
     *
     * Run this after '/calculate-account' to calculate balance and disbursed correctly
     *
     *
     * */

    app.get("/payments", async (req, res) => {
      const paymentHistoryList = await paymentHistory.find({}).toArray();
      res.send(paymentHistoryList);
    });

    app.get("/calculate-account-balance", async (req, res) => {
      const clientsCursor = await clientsCollection.find({}).toArray();
      const paymentHistoryList = await paymentHistory.find({}).toArray();
      for (const item of paymentHistoryList) {
        // console.log(item);
        const found = await clientsCollection.findOne({
          emailId: item.emailId,
        });
        // console.log(found);
        if (found !== null && !found.lifetimeDisbursed) {
          found.lifetimeDisbursed = 0;
        }
      }

      for (const item of clientsCursor) {
        if (!item.lifetimeDisbursed) {
          item.lifetimeDisbursed = 0;
          item.accountBalance = item.lifetimeRevenue + item.lifetimeDisbursed;
          delete item._id;
          const updateCursor = await clientsCollection.updateOne(
            { emailId: item.emailId },
            { $set: { ...item } },
            { upsert: true }
          );

          // console.log(updateCursor);
        }
      }

      res.send(clientsCursor);
    });

    app.get("/calculate-account", async (req, res) => {
      const paymentHistoryCursor = await paymentHistory.find({}).toArray();

      // const
      // res.send(paymentHistoryCursor);
      // console.log(paymentHistoryCursor.filter((item) => item.disbursed));
      const sorted = paymentHistoryCursor
        .filter((item) => item.disbursed)
        .sort((a, b) => a["Email ID"]?.localeCompare(b["Email ID"]));

      const sumByEmailAddress = sorted.reduce((acc, curr) => {
        const email = curr["emailId"];
        // console.log(acc);
        if (!acc[email]) {
          acc[email] = 0;
        }
        // console.log(curr["totalAmount"]);
        acc[email] += parseFloat(curr["totalAmount"]);
        // console.log(Object.keys(curr));
        return acc;
      }, {});
      // console.log(sumByEmailAddress);

      Object.keys(sumByEmailAddress).map(async (item) => {
        // console.log(item);
        const clients = await clientsCollection.findOne({ emailId: item });
        // console.log(clients);
        if (clients !== null) {
          // console.log(sumByEmailAddress[item]);
          clients.lifetimeDisbursed = sumByEmailAddress[item];
          clients.accountBalance =
            (clients.lifetimeRevenue || 0) - (clients.lifetimeDisbursed || 0);
          // console.log(clients);

          const updateCursor = await clientsCollection.updateOne(
            { emailId: clients.emailId },
            {
              $set: { ...clients },
            },
            { upsert: true }
          );

          // res.send()
        }
      });

      res.send(sorted);
    });

    // app.post("/user-signup", async (req, res) => {
    //   const reqBody = req.body;
    //   const userExist = await userDetails.find({
    //     user_email: reqBody.email,
    //   });
    //   const user = await usersCollection.findOne({
    //     user_email: reqBody.email,
    //   });

    //   const users = await userExist.toArray();

    //   // console.log();
    //   if (users.length === 0 && user === null) {
    //     bcrypt.hash(reqBody.password, 10, async function (err, hash) {
    //       if (hash.length) {
    //         // Store hash in your password DB.
    //         // if (hash.length) {
    //         const user = {
    //           user_email: reqBody.email,
    //           user_password: hash,
    //         };

    //         const registerCursor = await usersCollection.insertOne(user);
    //         res.send(registerCursor);
    //         // console.log(registerCursor);
    //         // }
    //       }
    //     });
    //   } else {
    //     res.status(401).send("user already exist");
    //   }
    // });

    app.get("/user-details", async (req, res) => {
      const userDetailsData = await userDetails.find({}).toArray();

      res.send(userDetailsData);
    });

    app.post("/post-user-details", verifyJWT, async (req, res) => {
      // const { user_email } = req.body;
      const { email } = jwt.decode(req.headers.token);
      // console.log(req.body, email);
      const foundUserDetails = await userDetails.findOne({ user_email: email });
      // console.log(foundUserDetails);
      if (foundUserDetails === null) {
        const userDetailsCursor = await userDetails.insertOne({
          ...req.body,
          user_email: email,
        });

        res.send(userDetailsCursor);
      } else {
        res.send("Already exists");
      }
    });

    app.get("/all-users", async (req, res) => {
      try {
        const usersCursor = await clientsCollection.find({}).toArray();
        const userDetailsData = await userDetails.find({}).toArray();

        // Normalize the keys to 'emailId' for both collections
        const normalizedUsers = [
          ...userDetailsData.map((user) => ({
            ...user,
            emailId: user.user_email, // Rename user_email to emailId
            user_email: undefined, // Remove the original key
          })),
          ...usersCursor.map((user) => ({
            ...user,
            emailId: user.emailId, // Ensure emailId key is used
          })),
        ];

        // Create a Map to store unique users based on emailId
        const emailMap = new Map();

        for (const user of normalizedUsers) {
          // Add user to the map only if their emailId is not already present and has both lifetimeDisbursed and lifetimeRevenue
          if (
            user.emailId &&
            !emailMap.has(user.emailId) &&
            user.lifetimeDisbursed &&
            user.lifetimeRevenue
          ) {
            emailMap.set(user.emailId, user);
          }
        }

        // Convert the map values back to an array
        const uniqueUsers = Array.from(emailMap.values());

        res.send(uniqueUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    app.get("/all-users/:cat/:data", async (req, res) => {
      const usersCursor = await clientsCollection.find({});
      const users = await usersCursor.toArray();

      const foundUser = [];

      for (const user of users) {
        if (user[req.params.cat]) {
          if (user[req.params.cat].toLowerCase().includes(req.params.data)) {
            foundUser.push(user);
          }
        }
      }

      res.send(foundUser);
    });

    app.get("/lifetime-revenue/:userId?", async (req, res) => {
      try {
        const user = await demoClients.findOne({
          _id: new ObjectId(req.params.userId),
        });

        // console.log(user);

        const isrcs = user?.isrc?.split(","); // Assuming ISRCs are provided as a comma-separated list
        if (isrcs && isrcs.length) {
          const pipeline = [
            {
              $match: { isrc: { $in: isrcs } },
            },
            {
              $project: {
                _id: 0,
                "final revenue": 1,
              },
            },
          ];
          const revenues = (
            await revenueCollections.aggregate(pipeline).toArray()
          ).map((item) => item["final revenue"]);

          for (const rev of revenues) {
            if (parseFloat(rev) === NaN) {
              // console.log("object");
            }
          }

          const sum = revenues.reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue),
            0
          );

          const updateCursor = await demoClients.updateOne(
            { _id: new ObjectId(req.params.userId) },
            { $set: { ...user, lifeTimeRevenue: sum } },
            {
              upsert: true,
            }
          );

          res.send(revenues);
        } else {
          res.send("no isrcs have been found");
        }
        // res.send(updateCursor);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log("listening on port", port));
