/** @format */

const express = require("express");
const {
  addNote,
  editNote,
  getAllNotes,
  deleteNote,
  isPinned,
  searchNotes,
} = require("../Controllers/noteController");
const { authenticateToken } = require("../Utilities/auth");

const router = express.Router();

router.post("/add-note", authenticateToken, addNote);
router.put("/edit-note/:noteId", authenticateToken, editNote);
router.get("/get-all-notes", authenticateToken, getAllNotes);
router.delete("/delete-note/:noteId", authenticateToken, deleteNote);
router.put("/update-note-pinned/:noteId", authenticateToken, isPinned);
router.get("/search-notes", authenticateToken, searchNotes);
// Add other note routes (like delete, update pinned, etc.) similarly

module.exports = router;
