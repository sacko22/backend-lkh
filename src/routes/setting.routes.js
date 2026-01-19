const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const verifyToken = require("../middleware/verifyToken");

// GET settings
router.get("/",verifyToken, async (req, res) => {
  const setting = await Setting.findOne();
  res.json(setting);
});

// CREATE ou UPDATE
router.post("/",verifyToken, async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    {},
    req.body,
    { upsert: true, new: true }
  );
  res.json(setting);
});

module.exports = router;
