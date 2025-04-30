const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const Project = require("../models/Project");
const { validateObjectId } = require("../utils/validation");

// ========== TASK CONTROLLERS ==========

exports.getTasks = async (req, res) => {
  try {
    const search = req.query.search || "";

    let query = {
      $or: [
        { user: req.user.id },
        { category: "Professional" }
      ]
    };

    if (search.trim()) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { description: regex },
        { priority: regex },
        { category: regex }
      ];
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name")
      .populate("project", "name");

    const now = new Date();
    const tasksWithDueSoon = tasks.map(task => {
      let isDueSoon = false;
      if (task.dueDate) {
        const timeDiff = task.dueDate.getTime() - now.getTime();
        if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0) {
          isDueSoon = true;
        }
      }
      return { ...task.toObject(), isDueSoon };
    });

    res.status(200).json({ tasks: tasksWithDueSoon, status: true, msg: "Tasks found successfully.." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

exports.getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    const task = await Task.findById(req.params.taskId)
      .populate("user", "name")
      .populate("project", "name");

    if (!task) {
      return res.status(400).json({ status: false, msg: "No task found.." });
    }

    let isDueSoon = false;
    if (task.dueDate) {
      const now = new Date();
      const timeDiff = task.dueDate.getTime() - now.getTime();
      if (timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0) {
        isDueSoon = true;
      }
    }

    res.status(200).json({ task: { ...task.toObject(), isDueSoon }, status: true, msg: "Task found successfully.." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

exports.postTask = async (req, res) => {
  try {
    const { description, dueDate, priority, category, projectName } = req.body;

    if (!description) {
      return res.status(400).json({ status: false, msg: "Description required" });
    }

    const taskData = {
      user: req.user.id,
      description,
      dueDate: dueDate ? new Date(dueDate + "T00:00:00") : undefined,
      priority: priority && priority.trim() ? priority : "Medium",
      category: category && category.trim() ? category : "Personal"
    };

    if (category === "Professional") {
      if (!projectName || typeof projectName !== "string" || !projectName.trim()) {
        return res.status(400).json({ status: false, msg: "Project name is required for Professional tasks" });
      }

      let project = await Project.findOne({ name: projectName.trim() });

      if (!project) {
        project = await Project.create({
          name: projectName.trim(),
          members: [req.user.id],
          createdBy: req.user.id
        });
      }

      taskData.project = project._id;
    }

    const task = await Task.create(taskData);

    if (task.category === "Professional") {
      const users = await User.find();
      const notifications = users.map(user => ({
        user: user._id,
        message: `New Professional Task Created: "${task.description}" with ${task.priority} priority by ${req.user.name}`
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ task, status: true, msg: "Task created successfully.." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

exports.putTask = async (req, res) => {
  try {
    const { description, completed, dueDate, priority, category, projectName } = req.body;

    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't update another user's task" });
    }

    const updateFields = {};
    if (description !== undefined) updateFields.description = description;
    if (completed !== undefined) updateFields.completed = completed;
    if (dueDate !== undefined) updateFields.dueDate = dueDate ? new Date(dueDate + 'T00:00:00') : undefined;
    if (priority !== undefined && ["High", "Medium", "Low"].includes(priority)) updateFields.priority = priority;
    if (category !== undefined && ["Personal", "Professional"].includes(category)) updateFields.category = category;

    if (category === "Professional") {
      if (!projectName || typeof projectName !== "string" || !projectName.trim()) {
        return res.status(400).json({ status: false, msg: "Project name is required for Professional tasks" });
      }

      let project = await Project.findOne({ name: projectName.trim() });

      if (!project) {
        project = await Project.create({
          name: projectName.trim(),
          members: [req.user.id],
          createdBy: req.user.id
        });
      }

      updateFields.project = project._id;
    }

    task = await Task.findByIdAndUpdate(req.params.taskId, updateFields, { new: true });

    if (task.category === "Professional") {
      const users = await User.find();
      const notifications = users.map(user => ({
        user: user._id,
        message: `Professional Task Updated: "${task.description}" with ${task.priority} priority by ${req.user.name}`,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ task, status: true, msg: "Task updated successfully.." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't delete another user's task" });
    }

    await Task.findByIdAndDelete(req.params.taskId);

    if (task.category === "Professional") {
      const users = await User.find();
      const notifications = users.map(user => ({
        user: user._id,
        message: `Professional Task Deleted: "${task.description}" by ${req.user.name}`,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(200).json({ status: true, msg: "Task deleted successfully.." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

// ========== NOTIFICATIONS CONTROLLERS ==========

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ notifications, status: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ status: false, msg: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ notification, status: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
};
