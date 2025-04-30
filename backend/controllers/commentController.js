const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    const { taskId, text } = req.body;
    const userId = req.user._id;

    const newComment = await Comment.create({
      task: taskId,
      user: userId,
      text
    });

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
