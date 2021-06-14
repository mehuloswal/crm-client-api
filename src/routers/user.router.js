const express = require("express");
const router = express.Router();

const {
  insertUser,
  getUserByEmail,
  getUserById,
  updatePassword,
} = require("../model/user/UserModel");
const { hashPassword, comparePassword } = require("../helpers/bcryptHelper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt");
const { userAuthorization } = require("../middlewares/authorization");
const {
  setPasswordResetPin,
  getPinByEmailPin,
  deletePin,
} = require("../model/resetPin/ResetPinModel");
const { emailProcessor } = require("../helpers/emailHelper");
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

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);

  if (user && user._id) {
    //creating unique pin
    const setPin = await setPasswordResetPin(email);
    await emailProcessor({
      email,
      pin: setPin.pin,
      type: "request-new-password",
    });

    return res.json({
      status: "Success",
      message:
        "if the email exists in our database, the password reset pin will be sent shortly",
    });
  }

  res.json({
    status: "error",
    message:
      "if the email exists in our database, the password reset pin will be sent shortly",
  });
});

router.patch("/reset-password", async (req, res) => {
  const { email, pin, newPassword } = req.body;
  const getPin = await getPinByEmailPin(email, pin);
  if (getPin && getPin._id) {
    const dbDate = getPin.addedAt;
    let expDate = dbDate.setDate(dbDate.getDate() + 1);
    const today = new Date();
    if (today > expDate) {
      return res.json({ status: "error", message: "Invalid or expired Pin" });
    }
  } else {
    return res.json({ status: "error", message: "Invalid or expired Pin" });
  }

  //encrypting new password
  const hashedPass = await hashPassword(newPassword);
  const user = await updatePassword(email, hashedPass);

  if (user._id) {
    await emailProcessor({ email, type: "password-update-success" });

    //delete pin from db
    deletePin(email, pin);

    return res.json({
      status: "success",
      message: "Your Password has been updated",
    });
  }
  res.json({ status: "error", message: "Unable to update your Password" });
});

module.exports = router;
