const express = require("express");
const router = express.Router();
const { addComment, getCommentsByTask } = require("../controllers/commentController");
const { verifyAccessToken } = require("../middlewares");

router.post("/", verifyAccessToken, addComment);
router.get("/:taskId", verifyAccessToken, getCommentsByTask);

module.exports = router;
