const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(400).json({ status: false, msg: "Authorization header missing" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ status: false, msg: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ status: false, msg: "Invalid token" });
  }
};

module.exports = { verifyAccessToken };
