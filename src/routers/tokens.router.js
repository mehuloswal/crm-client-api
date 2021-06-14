const express = require("express");
const router = express.Router();

const { verifyRefreshJWT, createAccessJWT } = require("../helpers/jwt");
const { getUserByEmail } = require("../model/user/UserModel");

router.get("/", async (req, res, next) => {
  const { authorization } = req.headers;

  //1. make sure the token is valid
  const decoded = await verifyRefreshJWT(authorization);

  if (decoded.payload) {
    //2. check if the jwt is exist in database
    const userProfile = await getUserByEmail(decoded.payload);

    if (userProfile._id) {
      let tokenExp = userProfile.refreshJWT.addedAt;
      const dBrefreshToken = userProfile.refreshJWT.token;
      tokenExp = tokenExp.setDate(
        tokenExp.getDate() + +process.env.JWT_REFRESH_SECRET_EXP_DAY
      );
      const today = new Date();
      if (dBrefreshToken !== authorization && tokenExp < today) {
        return res.status(403).json({ message: "Please login again" });
      }
      const accessJWT = await createAccessJWT(
        decoded.email,
        userProfile._id.toString()
      );

      return res.json({ status: "success", accessJWT });
    }
  }

  //3. check if not expired
  res.status(403).json({ message: "Please login again" });
});

module.exports = router;
