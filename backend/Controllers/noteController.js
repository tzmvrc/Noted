/** @format */

const Note = require("../models/note.model");

exports.getAllNotes = async (req, res) => {
  const Id = req.user?.userId;

  try {
    const notes = await Note.find({ userId: Id }).sort({ isPinned: -1 });
    return res.json({
      error: false,
      notes,
      message: "Notes fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Server error",
    });
  }
};

exports.addNote = async (req, res) => {
  const { title, content, tags } = req.body;
  const userId = req.user?.userId;

  if (!title || !content) {
    return res
      .status(400)
      .json({ error: true, message: "Title and content are required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: userId,
    });

    await note.save();

    return res.json({ error: false, note, message: "Note added successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server error" });
  }
};

exports.editNote = async (req, res) => {
  const { noteId } = req.params;
  const { title, content, tags, isPinned } = req.body;
  const id = req.user.userId;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server error" });
  }
};

exports.deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const id = req.user.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server error" });
  }
};

exports.isPinned = async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const id = req.user.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId: id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned || false;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

exports.searchNotes = async (req, res) => {
  const id = req.user.userId;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: true, message: "Query is required" });
  }

  try {
    const martchingNotes = await Note.find({
      userId: id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: martchingNotes,
      message: "Notes fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server error" });
  }
};
