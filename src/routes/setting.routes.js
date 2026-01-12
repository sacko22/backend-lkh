const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");

// GET settings
router.get("/", async (req, res) => {
  const setting = await Setting.findOne();
  res.json(setting);
});

// CREATE ou UPDATE
router.post("/", async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    {},
    req.body,
    { upsert: true, new: true }
  );
  res.json(setting);
});

module.exports = router;
