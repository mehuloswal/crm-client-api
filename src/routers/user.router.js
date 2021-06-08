const express = require("express");
const router = express.Router();

router.all("/", (req, res, next) => {
  res.json({ message: "return form user router" });
});

module.exports = router;
