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

const getPinByEmailPin = (email, pin) => {
  return new Promise((resolve, reject) => {
    try {
      ResetPinSchema.findOne({ email, pin }, (error, data) => {
        if (error) {
          console.log(error);
          resolve(false);
        }
        resolve(data);
      });
    } catch (error) {
      reject(error);
      console.log(error);
    }
  });
};
const deletePin = (email, pin) => {
  ResetPinSchema.findOneAndDelete({ email, pin }).catch((error) => {
    console.log(error);
  });
};

module.exports = {
  setPasswordResetPin,
  getPinByEmailPin,
  deletePin,
};
