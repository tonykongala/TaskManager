// /models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  description: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: Date,
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium"
  },
  category: {
    type: String,
    enum: ["Personal", "Professional"],
    default: "Personal"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Task", taskSchema);

