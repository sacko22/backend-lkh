const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// CREATE catégorie
router.post("/", async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ toutes les catégories
router.get("/", async (req, res) => {
  const categories = await Category.find({ active : true });
  res.json(categories);
});

// READ une catégorie
router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  res.json(category);
});

// UPDATE catégorie
router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(category);
});

// DELETE (soft)
router.delete("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );
  res.json({ message: "Catégorie désactivée" });
});

module.exports = router;
