const { TicketSchema } = require("./TicketSchema");

const insertTicket = (ticketObj) => {
  return new Promise((resolve, reject) => {
    try {
      TicketSchema(ticketObj)
        .save()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
};
const getTickets = (userId) => {
  return new Promise((resolve, reject) => {
    try {
      TicketSchema.find({ clientId: userId })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  insertTicket,
  getTickets,
};
