const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  console.log("Contact body:", req.body);

  const { nom, prenom, email, message } = req.body;

  if (!nom || !prenom || !email || !message) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify(); // 🔥 test de connexion SMTP

    await transporter.sendMail({
      from: `"Contact LKH" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email, // 👈 très important
      subject: "Nouveau message depuis le site LKH",
      html: `
        <h3>Nouveau message depuis le site LKH</h3>
        <p><strong>Nom :</strong> ${nom} ${prenom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong><br/>${message}</p>
      `,
    });

    res.status(200).json({ message: "Message envoyé avec succès ✅" });

  } catch (error) {
    console.error("Erreur mail:", error);
    res.status(500).json({
      message: "Erreur lors de l’envoi du message",
      error: error.message
    });
  }
});

module.exports = router;
