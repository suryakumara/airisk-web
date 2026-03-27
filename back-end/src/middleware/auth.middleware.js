const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "airisk_secret_change_me";

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Unauthorized." });

  const token = auth.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};
