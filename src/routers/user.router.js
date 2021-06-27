const express = require("express");
const router = express.Router();

const {
  insertUser,
  getUserByEmail,
  getUserById,
  updatePassword,
  storeUserRefreshJWT,
  verifyUser,
} = require("../model/user/UserModel");
const { hashPassword, comparePassword } = require("../helpers/bcryptHelper");
const { createAccessJWT, createRefreshJWT } = require("../helpers/jwt");
const { userAuthorization } = require("../middlewares/authorization");
const {
  resetPassReqValidation,
  updatePassValidation,
  newUserValidation,
} = require("../middlewares/formValidation");
const {
  setPasswordResetPin,
  getPinByEmailPin,
  deletePin,
} = require("../model/resetPin/ResetPinModel");
const { emailProcessor } = require("../helpers/emailHelper");
const { deleteJWT } = require("../helpers/redis");

const verificationURL = "http://localhost:3000/verification/";

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
  const { name, email } = userProfile;
  res.json({ user: { _id, name, email } });
});

//Verify user after sign up
router.patch("/verify", async (req, res) => {
  try {
    const { _id, email } = req.body;
    //update user database
    const result = await verifyUser(_id, email);
    if (result && result.id) {
      return res.json({
        status: "success",
        message: "Your account has been activated, you may sign in now.",
      });
    }
    return res.json({
      status: "error",
      message: "Invalid Request!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: "Invalid Request!",
    });
  }
});

//create new user route
router.post("/", newUserValidation, async (req, res) => {
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
    await emailProcessor({
      email,
      type: "new-user-confirmation",
      verificationLink: verificationURL + result._id + "/" + email,
    });
    res.json({ status: "success", message: "New User Created", result });
  } catch (error) {
    console.log(error);
    let message =
      "Unable to create the new user at the moment. Please try again later";
    if (error.message.includes("duplicate key error collection")) {
      message = "This email already exists!";
    }
    res.json({ status: "error", message });
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
  if (!user.isVerified) {
    return res.json({
      status: "error",
      message:
        "Your account has not been verified. Please check your email and verify your account before you login again.",
    });
  }
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

router.post("/reset-password", resetPassReqValidation, async (req, res) => {
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
      status: "success",
      message: " OTP will be sent shortly to your email.",
    });
  }

  res.json({
    status: "error",
    message: "Not registered user. Register now.",
  });
});

router.patch("/reset-password", updatePassValidation, async (req, res) => {
  const { email, pin, newPassword } = req.body;
  const getPin = await getPinByEmailPin(email, pin);
  if (getPin && getPin._id) {
    //or getPin?._id is also same as that
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

router.delete("/logout", userAuthorization, async (req, res) => {
  const { authorization } = req.headers;
  const _id = req.userId;
  deleteJWT(authorization);
  const result = await storeUserRefreshJWT(_id, "");
  if (result._id) {
    return res.json({ status: "success", message: "Logged out successfully" });
  }
  res.json({
    status: "error",
    message: "Something went wrong! Try again later",
  });
});
module.exports = router;
