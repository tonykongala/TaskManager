// authControllers.js

const User = require("../models/User");
const bcrypt = require("bcrypt");
const { createAccessToken } = require("../utils/token");
const { validateEmail } = require("../utils/validation");

// POST /signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "Please fill all the fields" });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || typeof role !== "string") {
      return res.status(400).json({ msg: "All fields must be strings" });
    }

    if (password.length < 4) {
      return res.status(400).json({ msg: "Password must be at least 4 characters" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    if (!["Admin", "Manager", "Member"].includes(role)) {
      return res.status(400).json({ msg: "Invalid user role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.status(201).json({ status: true, msg: "Account created successfully!" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

// POST /login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, msg: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, msg: "Email not registered" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ status: false, msg: "Incorrect password" });
    }

    const token = createAccessToken({ id: user._id });
    const { _id, name, role } = user;

    res.status(200).json({
      status: true,
      token,
      user: { _id, name, email, role },
      msg: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};
