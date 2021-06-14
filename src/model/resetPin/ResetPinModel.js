const { randomPin } = require("../../utils/randomGenerator");
const { ResetPinSchema } = require("./ResetPinSchema");

const setPasswordResetPin = async (email) => {
  const pinLength = 6;
  const randomPinNumber = await randomPin(pinLength);
  const resetObj = {
    email,
    pin: randomPinNumber,
  };
  return new Promise((resolve, reject) => {
    ResetPinSchema(resetObj)
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
  setPasswordResetPin,
};
