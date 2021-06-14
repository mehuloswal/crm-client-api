const jwt = require("jsonwebtoken");
const { setJWT, getJWT } = require("./redis");
const { storeUserRefreshJWT } = require("../model/user/UserModel");

const createAccessJWT = async (email, _id) => {
  try {
    const accessJWT = jwt.sign(
      { email },
      process.env.JWT_ACCESS_SECRET_Access,
      { expiresIn: "15m" }
    );
    await setJWT(accessJWT, _id);
    return Promise.resolve(accessJWT);
  } catch (error) {
    return Promise.reject(error);
  }
};
const createRefreshJWT = async (payload, _id) => {
  try {
    const refreshJWT = jwt.sign(
      { payload },
      process.env.JWT_ACCESS_SECRET_Refresh,
      { expiresIn: "30d" }
    );
    await storeUserRefreshJWT(_id, refreshJWT);
    return Promise.resolve(refreshJWT);
  } catch (error) {
    return Promise.reject(error);
  }
};

const verifyAccessJWT = (userJWT) => {
  try {
    return Promise.resolve(
      jwt.verify(userJWT, process.env.JWT_ACCESS_SECRET_Access)
    );
  } catch (error) {
    return Promise.resolve(error);
  }
};
const verifyRefreshJWT = (userJWT) => {
  try {
    return Promise.resolve(
      jwt.verify(userJWT, process.env.JWT_ACCESS_SECRET_Refresh)
    );
  } catch (error) {
    return Promise.resolve(error);
  }
};
module.exports = {
  createAccessJWT,
  createRefreshJWT,
  verifyAccessJWT,
  verifyRefreshJWT,
};
