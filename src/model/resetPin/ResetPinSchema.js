const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResetPinSchema = new Schema({
  email: {
    type: String,
    maxlength: 50,
    required: true,
    unique: true,
  },
  pin: {
    type: String,
    minlength: 6,
    maxlength: 6,
    required: true,
  },
});

module.exports = {
  ResetPinSchema: mongoose.model("Reset-Pin", ResetPinSchema),
};
