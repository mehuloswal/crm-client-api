const express = require("express");
const router = express.Router();

const { insertUser, getUserByEmail } = require("../model/user/UserModel");
const { hashPassword, comparePassword } = require("../helpers/bcryptHelper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt");

router.all("/", (req, res, next) => {
  //   res.json({ message: "return form user router" });
  next();
});

//create new user route
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

//user sign in router
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ status: "error", message: "Invalid Form Submission" });
  }
  //get user with email from db
  const user = await getUserByEmail(email);

  const passFromDb = user && user._id ? user.password : null;
  if (!passFromDb) {
    return res.json({ status: "error", message: "Invalid email / password" });
  }

  const result = await comparePassword(password, passFromDb);
  if (!result) {
    return res.json({ status: "error", message: "Invalid email / password" });
  }
  const accessJWT = await createAccessJWT(user.email);
  const refreshJWT = await createRefreshJWT(user.email);
  res.json({
    status: "success",
    message: "Login Successfully!",
    accessJWT,
    refreshJWT,
  });
});
module.exports = router;
