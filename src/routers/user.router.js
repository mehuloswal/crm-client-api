const express = require("express");
const router = express.Router();

const { insertUser } = require("../model/user/UserModel");
const { hashPassword } = require("../helpers/bcryptHelper");

router.all("/", (req, res, next) => {
  //   res.json({ message: "return form user router" });
  next();
});

router.post("/", async (req, res) => {
  const { name, company, address, phone, email, password } = req.body;
  try {
    //hashing the password
    const hashPass = await hashPassword(password);

    const newUserObj = {
      name,
      company,
      address,
      phone,
      email,
      password: hashPass,
    };
    const result = await insertUser(newUserObj);
    console.log(result);
    res.json({ message: "New User Created", result });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", message: error.message });
  }
});

module.exports = router;
