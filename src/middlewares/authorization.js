const { verifyAccessJWT } = require("../helpers/jwt");
const { getJWT, deleteJWT } = require("../helpers/redis");

const userAuthorization = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.json({
      status: "error",
      message: "Please provide Auth Headers",
    });
  }
  console.log(authorization);
  //1. verify if jwt is valid
  //2. check if jwt exist in redis
  const decoded = await verifyAccessJWT(authorization);
  console.log(decoded);
  if (decoded.email) {
    const userId = await getJWT(authorization);

    if (!userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.userId = userId;
    return next();
  }
  deleteJWT(authorization);

  return res.status(403).json({ message: "Forbidden" });
};

module.exports = {
  userAuthorization,
};
