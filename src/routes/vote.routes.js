const express = require("express");
const router = express.Router();
const Vote = require("../models/Vote");
const Nomine = require("../models/Nomine");
const Setting = require("../models/Setting");

// VOTER
router.post("/", async (req, res) => {
  const setting = await Setting.findOne();

  if (!setting || !setting.voteActif) {
    return res.status(403).json({ message: "Le vote est actuellement fermé ❌" });
  }

  const now = new Date();

  if (setting.dateDebutVote && now < setting.dateDebutVote) {
    return res.status(403).json({ message: "Le vote n'a pas encore commencé ⏳" });
  }

  if (setting.dateFinVote && now > setting.dateFinVote) {
    return res.status(403).json({ message: "Le vote est terminé ❌" });
  }

  const { nomineId, visitorId } = req.body;

  const nomine = await Nomine.findById(nomineId);
  if (!nomine) {
    return res.status(404).json({ message: "Nominé introuvable" });
  }

  // Assure-toi que Nomine a bien un champ categoryId
  const categoryId = nomine.categoryId;
  if (!categoryId) {
    return res.status(400).json({ message: "Catégorie du nominé introuvable" });
  }

  // 1) Verrouillage à vie du premier choix dans cette catégorie
  const firstVote = await Vote.findOne({
    visitorId,
    categoryId
  }).sort({ createdAt: 1 });

  if (firstVote) {
    // Si le premier vote existe et que le candidat est différent → rejet, même après 24h
    if (firstVote.nomineId.toString() !== nomineId) {
      return res.status(403).json({
        message: "Vous ne pouvez voter que pour le même candidat dans cette catégorie."
      });
    }

    // 2) Si même candidat, vérifier la fenêtre de 24h basée sur le dernier vote
    const lastVote = await Vote.findOne({
      visitorId,
      categoryId
    }).sort({ createdAt: -1 });

    if (lastVote) {
      const diffHeures = (Date.now() - lastVote.createdAt.getTime()) / (1000 * 60 * 60);
      if (diffHeures < 24) {
        return res.status(403).json({
          message: "Vous avez déjà voté dans cette catégorie. Réessayez plus tard."
        });
      }
    }
    // Si >24h et même candidat que le premier vote → autorisé
  } else {
    // Aucun vote précédent dans cette catégorie → autoriser comme premier choix
  }

  // Enregistrer le vote
  await Vote.create({
    nomineId,
    categoryId,
    visitorId
  });

  res.json({ message: "Vote enregistré avec succès" });
});

// Vérifier le vote d'un visiteur dans une catégorie
router.get("/status/:categoryId/:visitorId", async (req, res) => {
  const { categoryId, visitorId } = req.params;

  const firstVote = await Vote.findOne({
    categoryId,
    visitorId
  }).sort({ createdAt: 1 });

  const lastVote = await Vote.findOne({
    categoryId,
    visitorId
  }).sort({ createdAt: -1 });

  if (!lastVote) {
    return res.json({ hasVoted: false });
  }

  const diffMs = Date.now() - lastVote.createdAt.getTime();
  const diffHeures = diffMs / (1000 * 60 * 60);

  if (diffHeures < 24) {
    const remainingMs = 24 * 60 * 60 * 1000 - diffMs;
    return res.json({
      hasVoted: true,
      nomineId: lastVote.nomineId,
      remainingMs,
      locked: Boolean(firstVote),
      lockedNomineId: firstVote ? firstVote.nomineId : null
    });
  }

  // Après 24h : toujours retourner le candidat verrouillé (premier choix)
  return res.json({
    hasVoted: true,
    nomineId: lastVote.nomineId,
    locked: Boolean(firstVote),
    lockedNomineId: firstVote ? firstVote.nomineId : null,
    message: "Vous êtes engagé pour ce candidat dans cette catégorie."
  });
});

// LISTE DES VOTES (admin)
router.get("/", async (req, res) => {
  const votes = await Vote.find();
  res.json(votes);
});

module.exports = router;