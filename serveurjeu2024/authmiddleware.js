import jwt from "jsonwebtoken";
const authenticateToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.warn("Token non fourni");
    return res.status(401).json({ error: "Token non fourni" });
  }
  try {
    const secret = process.env.JWT_SECRET;
    const user = jwt.verify(token, secret);
    console.log("Token valide:", user);
    req.user = user;
    next();
  } catch (err) {
    console.warn("Token invalide :", err);
    return res.status(403).json({ error: "Token invalide" });
  }
};
export default authenticateToken;
