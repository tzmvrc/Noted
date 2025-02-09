/** @format */

const User = require("../models/user.model");

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { fullName, email, password } = req.body;

  if (!fullName && !email && !password) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    if (fullName) user.fullname = fullName;
    if (email) user.email = email;
    if (password) user.password = password; // Hash the password if needed

    await user.save();

    return res.json({
      error: false,
      user,
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Server error" });
  }
};

exports.getUser = async (req, res) => {
  const userId = req.user?.userId;

  try {
    const isUser = await User.findById(userId);
    if (!isUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.json({
      user: {
        fullName: isUser.fullname,
        email: isUser.email,
        _id: isUser._id,
        createdOn: isUser.createdOn,
      },
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
};
