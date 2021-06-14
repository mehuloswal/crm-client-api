const express = require("express");
const router = express.Router();

const {
  insertUser,
  getUserByEmail,
  getUserById,
} = require("../model/user/UserModel");
const { hashPassword, comparePassword } = require("../helpers/bcryptHelper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt");
const { userAuthorization } = require("../middlewares/authorization");
router.all("/", (req, res, next) => {
  //   res.json({ message: "return form user router" });
  next();
});

//get user profile router
router.get("/", userAuthorization, async (req, res) => {
  const _id = req.userId;
  //3. extract user id
  //4. get user profile

  const userProfile = await getUserById(_id);
  res.json({ user: userProfile });
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
  const accessJWT = await createAccessJWT(user.email, `${user._id}`);
  const refreshJWT = await createRefreshJWT(user.email, `${user._id}`);
  res.json({
    status: "success",
    message: "Login Successfully!",
    accessJWT,
    refreshJWT,
  });
});
module.exports = router;
