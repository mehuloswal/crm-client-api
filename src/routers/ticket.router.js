const express = require("express");
const router = express.Router();
const { insertTicket } = require("../model/ticket/TicketModel");

router.all("/", (req, res, next) => {
  // res.json({ message: "return form ticket router" });
  next();
});

//create new ticket API added
router.post("/", async (req, res) => {
  try {
    const { subject, sender, message } = req.body;
    const ticketObj = {
      clientId: "60c09b408f11241d58238149",
      subject,
      conversations: [{ sender, message }],
    };
    const result = await insertTicket(ticketObj);

    if (result._id) {
      return res.json({
        status: "Success",
        message: "New Ticket has been created!",
      });
    }
    res.json({
      status: "error",
      message:
        "Unable to create the ticket at the moment, Please try again later",
    });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

module.exports = router;
