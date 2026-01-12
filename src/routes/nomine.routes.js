const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Nomine = require("../models/Nomine");
const Vote = require("../models/Vote");

// CREATE nominé
router.post("/", async (req, res) => {
  try {
    const nomine = new Nomine(req.body);
    await nomine.save();
    res.status(201).json(nomine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ nominés par catégorie
// router.get("/categorie/:categorieId", async (req, res) => {
//   const nomines = await Nomine.find({
//     categorieId: req.params.categorieId,
//     active: true
//   });
//   res.json(nomines);
// });

router.get("/categorie/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  const nomines = await Nomine.aggregate([
    { $match: { categoryId: new mongoose.Types.ObjectId(categoryId), active: true } },

    {
      $lookup: {
        from: "votes",
        localField: "_id",
        foreignField: "nomineId",
        as: "votes"
      }
    },

    {
      $addFields: {
        nombreVotes: { $size: "$votes" }
      }
    },

    {
      $project: {
        votes: 0
      }
    }
  ]);

  res.json(nomines);
});


// READ un nominé
router.get("/:id", async (req, res) => {
  const nomine = await Nomine.findById(req.params.id);
  res.json(nomine);
});

// READ tous les nominés
router.get("/", async (req, res) => {
  const nomine = await Nomine.find();
  res.json(nomine);
});

// UPDATE nominé
router.put("/:id", async (req, res) => {
  const nomine = await Nomine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(nomine);
});

// DELETE (soft)
router.delete("/:id", async (req, res) => {
  await Nomine.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ message: "Nominé désactivé" });
});

module.exports = router;
