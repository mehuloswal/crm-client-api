const jwt = require("jsonwebtoken");

const createAccessJWT = (payload) => {
  const accessJWT = jwt.sign(
    { payload },
    process.env.JWT_ACCESS_SECRET_Access,
    { expiresIn: "15m" }
  );
  return Promise.resolve(accessJWT);
};
const createRefreshJWT = (payload) => {
  const refreshJWT = jwt.sign(
    { payload },
    process.env.JWT_ACCESS_SECRET_Refresh,
    { expiresIn: "30d" }
  );
  return Promise.resolve(refreshJWT);
};

// JWT_ACCESS_SECRET_Access
// JWT_ACCESS_SECRET_Refresh

module.exports = {
  createAccessJWT,
  createRefreshJWT,
};
