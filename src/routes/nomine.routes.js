const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Nomine = require("../models/Nomine");
const Vote = require("../models/Vote");

// CREATE nominé
// router.post("/", async (req, res) => {
//   try {
//     const nomine = new Nomine(req.body);
//     await nomine.save();
//     res.status(201).json(nomine);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

const multer = require("multer");
const cloudinary = require("../cloudinary");

// stockage temporaire en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// upload d'un nominé
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    // vérifier que req.file existe
    if (!req.file) {
      return res.status(400).json({ message: "Aucune image envoyée" });
    }

    // debugger : vérifier ce que Multer reçoit
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { nomComplet, biographie, categoryId } = req.body;

    if (!nomComplet || !biographie || !categoryId) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // upload sur Cloudinary
    const streamifier = require("streamifier");
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "nomines" },
      async (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur Cloudinary", err });

        // sauvegarde dans MongoDB
        const nomine = new Nomine({
          nomComplet,
          biographie,
          categoryId,
          photoUrl: result.secure_url
        });

        await nomine.save();
        res.status(201).json({ message: "Nominé enregistré ✅", nomine });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error });
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
