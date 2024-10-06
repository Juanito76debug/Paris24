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
  username: String,
  online: { type: Boolean, default: false },
});

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);
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

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
