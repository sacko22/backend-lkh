const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Nomine = require("../models/Nomine");
const Vote = require("../models/Vote");
const verifyToken = require("../middleware/verifyToken");

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
const streamifier = require("streamifier");

// stockage temporaire en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/nomines
router.post("/",verifyToken, upload.single("photo"), async (req, res) => {
  try {
    // Debugger : vérifier ce que Multer reçoit
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { nomComplet, biographie, categoryId } = req.body;

    if (!nomComplet || !biographie || !categoryId) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucune image envoyée" });
    }

    
    // Fonction helper pour upload Cloudinary en Promise
    const uploadFromBuffer = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "nomines" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    };
    
    console.log("Cloudinary config:", cloudinary.config());

    // Upload de l'image
    const result = await uploadFromBuffer(req.file.buffer);

    // Création du nominé dans MongoDB
    const nomine = new Nomine({
      nomComplet,
      biographie,
      categoryId,
      photo: result.secure_url
    });

    await nomine.save();

    res.status(201).json({ message: "Nominé enregistré ✅", nomine });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err });
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
