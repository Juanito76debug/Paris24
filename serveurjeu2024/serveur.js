import express from "express";
import path from "path";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Vous pouvez ensuite utiliser req.user dans vos routes
    next();
  } catch (err) {
    res.status(400).json({ error: "Token invalide." });
  }
};

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join("C:/Users/juan_/Documents/Paris24/jeu2024")));

mongoose
  .connect("mongodb://localhost:27017/jeu2024")
  .then(() => console.log("Connexion à MongoDB réussie"))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

const postSchema = new mongoose.Schema({
  content: String,
  date: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  online: { type: Boolean, default: false },
});

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);

//Ajout de nodemailer
const sendEmailConfirmation = async (email, subject, message) => {
  try {
    // Création du transporteur Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Utiliser l'email défini dans .env
        pass: process.env.EMAIL_PASS, // Utiliser le mot de passe défini dans .env
      },
    });

    // Configuration de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER, // L'email de l'expéditeur
      to: email,
      subject: subject,
      text: message,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé avec succès à ${email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
  }
};
// message publiés en temps réel.
app.get("/api/messageCount", async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.json(count);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Errur lors de la récupération du nombre de messages" });
  }
});
//membres connectés en temps réel.
app.get("/api/users/online", async (req, res) => {
  try {
    const users = await User.countDocuments({ online: true });
    res.json(users);
  } catch (err) {
    res.status(500).json({
      error: "Errur lors de la récupération des utilisateurs connectés",
    });
  }
});
// Route pour servir le fichier HTML de la page d'inscription
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});
// Route pour servir le fichier HTML de la page "À propos"
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});
// Route pour gérer l'inscription des utilisateurs avec vérifications.
app.post(
  "/api/users/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("minimum 3 caractères pour le nom d'utilisateur"),
    body("email").isEmail().withMessage("Email non validé"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("6 caractères au moins pour le mot de passe"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      res
        .status(201)
        .json({ success: true, message: "Utilisateur créé avec succès" });
    } catch (err) {
      res.status(500).json({ success: false, message: "err.message" });
    }
  }
);

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
