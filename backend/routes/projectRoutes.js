const express = require("express");
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById
} = require("../controllers/projectController");

const { verifyAccessToken } = require("../middlewares");

router.post("/", verifyAccessToken, createProject);
router.get("/", verifyAccessToken, getAllProjects);
router.get("/:id", verifyAccessToken, getProjectById);

module.exports = router;
