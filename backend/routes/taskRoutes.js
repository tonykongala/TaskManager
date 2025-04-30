const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTask,
  postTask,
  putTask,
  deleteTask,
  getNotifications,
  markNotificationAsRead
} = require("../controllers/taskControllers");
const { verifyAccessToken } = require("../middlewares");

// Routes starting with /api/tasks
router.get("/", verifyAccessToken, getTasks);
router.get("/notifications/user", verifyAccessToken, getNotifications);
router.put("/notifications/:id/read", verifyAccessToken, markNotificationAsRead);
router.get("/:taskId", verifyAccessToken, getTask);
router.post("/", verifyAccessToken, postTask);
router.put("/:taskId", verifyAccessToken, putTask);
router.delete("/:taskId", verifyAccessToken, deleteTask);

module.exports = router;
