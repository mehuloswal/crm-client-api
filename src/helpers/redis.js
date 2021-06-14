const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);

const setJWT = (key, value) => {
  return new Promise((resolve, reject) => {
    try {
      client.set(key, value, (err, res) => {
        if (err) reject(err);
        resolve(res);
      });
    } catch (error) {
      reject(err);
    }
  });
};
const getJWT = (key) => {
  return new Promise((resolve, reject) => {
    try {
      client.get(key, (error, res) => {
        if (error) reject(error);
        resolve(res);
      });
    } catch (error) {
      reject(error);
    }
  });
};

//delete old token from redis
const deleteJWT = (key) => {
  try {
    client.del(key);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  setJWT,
  getJWT,
  deleteJWT,
};
