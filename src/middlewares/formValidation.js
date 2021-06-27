const Joi = require("joi");

const email = Joi.string().email({
  minDomainSegments: 2,
  tlds: { allow: ["com", "net"] },
});
const pin = Joi.number().min(000000).max(999999).required();
const phone = Joi.number().min(1000000000).max(9999999999).required();
const newPassword = Joi.string().min(3).max(30).required();
const subject = Joi.string().min(2).max(100).required();
const sender = Joi.string().min(2).max(50).required();
const message = Joi.string().min(2).max(1000).required();
const issueDate = Joi.date().required();
const shortStr = Joi.string().min(2).max(50);
const longStr = Joi.string().min(2).max(1000);

const resetPassReqValidation = (req, res, next) => {
  const schema = Joi.object({ email });
  const value = schema.validate(req.body);
  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};
const updatePassValidation = (req, res, next) => {
  const schema = Joi.object({ email, pin, newPassword });
  const value = schema.validate(req.body);
  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};

const createNewTicketValidation = (req, res, next) => {
  const schema = Joi.object({ subject, sender, message, issueDate });
  const value = schema.validate(req.body);
  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};
const replyTicketMessageValidation = (req, res, next) => {
  const schema = Joi.object({ sender, message });
  const value = schema.validate(req.body);
  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};
const newUserValidation = (req, res, next) => {
  const schema = Joi.object({
    name: shortStr.required(),
    company: shortStr.required(),
    address: longStr.required(),
    phone,
    email,
    password: shortStr.required(),
  });
  const value = schema.validate(req.body);
  if (value.error) {
    return res.json({ status: "error", message: value.error.message });
  }
  next();
};
module.exports = {
  resetPassReqValidation,
  updatePassValidation,
  createNewTicketValidation,
  replyTicketMessageValidation,
  newUserValidation,
};
