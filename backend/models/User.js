const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, "Please enter your password"]
  },
  role: {
    type: String,
    enum: ["Admin", "Manager", "Member"],
    default: "Member"
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  }],
  joiningTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;
