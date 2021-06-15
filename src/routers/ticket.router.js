const express = require("express");
const router = express.Router();
const {
  insertTicket,
  getTickets,
  getTicketsById,
} = require("../model/ticket/TicketModel");
const { userAuthorization } = require("../middlewares/authorization");

router.all("/", (req, res, next) => {
  // res.json({ message: "return form ticket router" });
  next();
});

//create new ticket API
router.post("/", userAuthorization, async (req, res) => {
  try {
    const { subject, sender, message } = req.body;
    const userId = req.userId;
    const ticketObj = {
      clientId: userId,
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

//get all tickets for a specific user
router.get("/", userAuthorization, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await getTickets(userId);

    return res.json({
      status: "Success",
      result,
    });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});
//get ticket for a specific user
router.get("/:_id", userAuthorization, async (req, res) => {
  try {
    const { _id } = req.params;
    const userId = req.userId;
    const result = await getTicketsById(_id, userId);

    return res.json({
      status: "Success",
      result,
    });
  } catch (error) {
    res.json({ status: "error", message: error.message });
  }
});

module.exports = router;
