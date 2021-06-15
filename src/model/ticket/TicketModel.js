const { TicketSchema } = require("./TicketSchema");

const insertTicket = (ticketObj) => {
  return new Promise((resolve, reject) => {
    TicketSchema(ticketObj)
      .save()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  insertTicket,
};
