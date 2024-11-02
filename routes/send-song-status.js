const express = require("express");
const nodemailer = require("nodemailer");
const { getCollections, client } = require("../constants");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.post("/", async (req, res) => {
  const {
    clientsCollection,
    notificationsCollections,
    recentUploadsCollection,
  } = await getCollections();
  // console.log(req.body);
  //   const { recipientEmail, artistName, status, songName, additionalInfo } =
  //     req.body;
  const { userEmail, songName, status, reason } = req.body;
  const { first_name, last_name } = await clientsCollection.findOne({
    emailId: userEmail,
  });

  // console.log(process.env.emailAddress, process.env.emailPass);

  //   Create a transport instance with your email configuration
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Replace with your Hostinger SMTP server
    port: 587, // Typically, SMTP uses port 587
    secure: false, // Set to true if you are using SSL/TLS
    auth: {
      user: process.env.emailAddress,
      pass: process.env.emailPass,
    },
  });

  const timeStamp = Math.floor(new Date().getTime() / 1000);

  let notification = {
    email: req.body.userEmail,
    message: `Your content with order id ${req.body.orderId}'s status is ${status}.`,
    date: timeStamp,
  };

  // Define the email content based on the status
  let emailContent = "";

  switch (status) {
    case "Sent to Stores":
      emailContent = `
          Dear ${first_name} ${last_name}, <br/><br/>
          Your music has been successfully distributed to our partner platforms.
          You can expect it to appear on major platforms within the next 2 business days.<br/><br/>
          Best regards,<br/>
          Team ForeVision Digital
        `;
      break;
    case "streaming":
      emailContent = `
          Dear ${first_name} ${last_name}, <br/><br/>
          Your music has been successfully distributed to our partner platforms.
          You can expect it to appear on major platforms within the next 2 business days.<br/><br/>
          Best regards,<br/>
          Team ForeVision Digital
        `;
      break;
    case "Copyright infringed":
      emailContent = `
          Dear ${first_name} ${last_name}, <br/><br/>
          We've received a copyright infringement claim regarding your song "${songName}".
          Please provide documentation of your rights to this content within 5 business days to prevent removal.<br/><br/>
          Best regards,<br/>
          Team ForeVision Digital
        `;
      break;
    case "Taken Down":
      emailContent = `
          Dear ${first_name} ${last_name}, <br/><br/>
          Your song "${songName}" has been removed from distribution due to ${reason}.
          If you believe this is an error, please contact our support team immediately.<br/><br/>
          Best regards,<br/>
          Team ForeVision Digital
        `;
      break;
    case "Rejected":
      emailContent = `
          Dear ${first_name} ${last_name}, <br/><br/>
          Your submission for "${songName}" has been rejected due to ${reason}.
          Please address these issues and resubmit.<br/><br/>
          Best regards,<br/>
          Team ForeVision Digital
        `;
      break;
    case "On Hold":
      emailContent = `
          Dear ${first_name} ${last_name}, <br/><br/>
          Your distribution for "${songName}" is currently on hold due to ${reason}.
          We'll update you once we have more information.<br/><br/>
          Best regards,<br/>
          Team ForeVision Digital
        `;
      break;
    case "paid":
      emailContent = `
          Dear ${first_name} ${last_name}, <br/><br/>
          Your song has been marked as paid.<br/><br/>
          Best regards,<br/>
          Team ForeVision Digital
        `;
      break;
    default:
      return res.status(400).send("Invalid status provided.");
  }

  const notificationCursor = await notificationsCollections.insertOne(
    notification
  );

  //   Set up email data
  let mailOptions = {
    from: process.env.emailAddress,
    to: userEmail,
    // to: "smdshakibmia2001@gmail.com",
    subject: `Update on Your Music Distribution Status with ForeVision Digital`,
    html: emailContent,
  };

  if (status === "Sent to Stores") {
    // console.log(req.body);
    const newBody = { ...req.body };
    delete newBody._id;

    // newBody.status = status;

    const updateCursor = await recentUploadsCollection.updateOne(
      {
        _id: new ObjectId(req.body._id),
      },
      {
        $set: { ...newBody, status },
      },
      {
        upsert: false,
      }
    );

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Failed to send email.");
      }
      // res.status(200).send("Email sent successfully!");
    });

    res.send(updateCursor);
  }

  if (status === "streaming") {
    // console.log(req.body);
    const newBody = { ...req.body };
    delete newBody._id;

    // console.log(req.body);

    // newBody.status = status;

    const updateCursor = await recentUploadsCollection.updateOne(
      {
        _id: new ObjectId(req.body._id),
      },
      {
        $set: { ...newBody, status },
      },
      {
        upsert: false,
      }
    );

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Failed to send email.");
      }
      // res.status(200).send("Email sent successfully!");
    });

    const { isrc, userEmail } = req.body;

    const client = await clientsCollection.findOne({ emailId: userEmail });

    console.log(client.isrc);

    res.send(updateCursor);
  }
});

module.exports = router;
