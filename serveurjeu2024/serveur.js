import express from "express";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import cors from "cors";
import { body, validationResult } from "express-validator";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join("C:/Users/juan_/Documents/Paris24/jeu2024")));

mongoose
  .connect("mongodb://localhost:27017/jeu2024", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

const sendEmailConfirmation = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé avec succès à ${email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
  }
};

app.get("/api/messageCount", async (req, res) => {
  try {
    const count = await Post.countDocuments();
    res.json(count);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération du nombre de messages" });
  }
});

app.get("/api/online", async (req, res) => {
  try {
    const users = await User.countDocuments({ online: true });
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Erreur lors de la récupération des utilisateurs connectés",
      });
  }
});

app.get("/api/index", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/api/about", (req, res) => {
  res.sendFile(path.join(__dirname, "about.html"));
});

app.post(
  "/api/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Minimum 3 caractères pour le nom d'utilisateur"),
    body("email").isEmail().withMessage("Email non validé"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("6 caractères au moins pour le mot de passe"),
  ],
  async (req, res) => {
    console.log("Données reçues :", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Erreurs de validation :", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();

      const subject = "Inscription confirmée";
      const message = "Vous êtes inscrit !";
      await sendEmailConfirmation(email, subject, message);

      res.json({ success: true, message: "Inscription réussie" });
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      res
        .status(500)
        .json({ success: false, message: "Erreur lors de l'inscription" });
    }
  }
);

app.post(
  "/api/login",
  [
    body("username").notEmpty().withMessage("Pseudonyme nécessaire"),
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
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(401)
          .json({ error: "Pseudonyme ou mot de passe incorrect" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ error: "Pseudonyme ou mot de passe incorrect" });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ success: true, token });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Erreur lors de la connexion" });
    }
  }
);

app.post(
  "/api/forgot-password",
  [body("email").isEmail().withMessage("Email non validé")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ error: "Aucun utilisateur avec cet email trouvé" });
      }
      const newPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
      const subject = "Réinitialisation du mot de passe";
      const message = `Cliquez ici pour réinitialiser votre mot de passe : ${resetLink}`;
      await sendEmailConfirmation(email, subject, message);

      res.json({
        success: true,
        message: "Un email de réinitialisation a été envoyé",
      });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur lors de la réinitialisation du mot de passe",
        });
    }
  }
);

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
