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
  fullName: String,
  age: Number,
  gender: String,
  contact: String,
  bio: String,
  preferences: String,
  online: { type: Boolean, default: false },
  friendMessages: [
    { type: mongoose.Schema.Types.ObjectId, ref: "FriendMessage" },
  ],
});

const friendMessageSchema = new mongoose.Schema({
  content: String,
  date: { type: Date, default: Date.now },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);

const FriendMessage = mongoose.model("FriendMessage", friendMessageSchema);

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
    res.status(500).json({
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

app.get("/api/profil", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Administrateur non trouvé" });
    }
    res.json({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      age: user.age,
      gender: user.gender,
      contact: user.contact,
      bio: user.bio,
      preferences: user.preferences,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération du profil : ", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
    });
  }
});

// route pour récupérer les infos du profil d'un ami
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    res.json({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      age: user.age,
      gender: user.gender,
      contact: user.contact,
      bio: user.bio,
      preferences: user.preferences,
    });
  } catch (err) {
    console.error("Erreur lors de la récupération du profil : ", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
    });
  }
});
// Route pour mettre à jour le profil de l'ami de l'administrateurs
app.put(
  "/api/users/:id",
  [
    body("username").optional().isString(),
    body("fullName").optional().isString(),
    body("age").optional().isInt({ min: 0 }),
    body("gender").optional().isIn(["male", "female"]),
    body("contact").optional().isString(),
    body("bio").optional().isString(),
    body("preferences").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      res.json({ success: true, message: "Profil mis à jour" });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil :", err);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du profil",
      });
    }
  }
);

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

//Route pour récupérer tous les profils de l'administrateurs
app.get("/api/users", async (req, res) => {
  try {
    const profiles = await User.find({ admin: true });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des profils",
    });
  }
});

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

app.post("/api/logout", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non connecté" });
    }
    user.online = false;
    await user.save();
    res.json({ success: true, message: "Déconnexion réussie" });
  } catch (err) {
    console.error("Erreur lors de la déconnexion :", err);
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la déconnexion" });
  }
});

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
      res.status(500).json({
        success: false,
        message: "Erreur lors de la réinitialisation du mot de passe",
      });
    }
  }
);

// Mise à jour du profil de l'administrateur

app.put("/api/profil", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Administrateur non trouvé" });
    }
    const { username, fullName, age, gender, contact, bio, preferences } =
      req.body;
    console.log("Données reçues :", req.body); // Ajouté pour débogage

    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.age = age || user.age;
    user.gender = gender || user.gender;
    user.contact = contact || user.contact;
    user.bio = bio || user.bio;
    user.preferences = preferences || user.preferences;

    await user.save();
    res.json({ success: true, message: "Profil mis à jour" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du profil :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du profil",
    });
  }
});

// Suppression du profil de l'administrateur
app.delete("/api/profil", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Administrateur non trouvé" });
    }
    res.json({ success: true, message: "Profil supprimé" });
  } catch (err) {
    console.error("Erreur lors de la suppression du profil :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du profil",
    });
  }
});

// Mise à jour du profil de l'ami de l'administrateur
app.post(
  "/api/users/:id",
  [
    body("username").optional().isString(),
    body("fullName").optional().isString(),
    body("age").optional().isInt({ min: 0 }),
    body("gender").optional().isIn(["male", "female"]),
    body("contact").optional().isString(),
    body("bio").optional().isString(),
    body("preferences").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        return res.status(404).json({ error: "administrateur non trouvé" });
      }
      res.json({ success: true, message: "Profil mis à jour" });
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil :", err);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du profil",
      });
    }
  }
);

// Route pour que l'administrateur puuisse publier un message

app.post("/api/messages", async (req, res) => {
  try {
    const { content } = req.body;
    const message = new Message({ content });
    await message.save();
    res.json({ success: true, content: message.content });
  } catch (err) {
    console.error("Erreur lors de la publication du message :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la publication du message",
    });
  }
});

// Route pour que l'administrateur puisse publier un message dans le profil de son ami
app.post("/api/friendMessages/:friendId", async (req, res) => {
  try {
    const { content } = req.body;
    const friend = await User.findById(req.params.friendId);
    if (!friend) {
      return res.status(404).json({ error: "Ami non trouvé" });
    }
    const message = new FriendMessage({
      content,
      sender: req.user.id,
      recipient: friend._id,
    });
    await message.save();
    res.json({ success: true, content: message.content });
  } catch (err) {
    console.error("Erreur lors de la publication du message :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la publication du message",
    });
  }
});

// Route pour que l'administrateur puisse publier un message sur tous les profils

app.post("/api/postAllProfiles", async (req, res) => {
  try {
    const { content } = req.body;
    const users = await User.find();

    const messages = users.map((user) => ({
      content,
      sender: req.user.id,
      recipient: user._id,
    }));
    await FriendMessage.insertMany(messages);
    res.json({ success: true, message: "Message publié sur tous les profils" });
  } catch (err) {
    console.error("Erreur lors de la publication du message :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la publication du message",
    });
  }
});

// Route pour récupérer tous les messages publiés

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    console.error("Erreur lors de la récupération des messages :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des messages",
    });
  }
});

// Route pour récupérer tous les messages publiés sur tous les profils

app.get("/api/allProfilesMessages", async (req, res) => {
  try {
    const messages = await FriendMessage.find().sort({ date: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    console.error("Erreur lors de la récupération des messages :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des messages",
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
