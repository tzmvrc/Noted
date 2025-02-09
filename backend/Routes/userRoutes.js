/** @format */

const express = require("express");
const { createAccount, login, sendOtp, verifyOtp, resendOtp, checkEmail, checkVerified, checkUserExists } = require("../Controllers/authController");
const { updateUser, getUser } = require("../Controllers/userController");
const { authenticateToken } = require("../Utilities/auth");

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/login", login);
router.put("/update-user/:userId", authenticateToken, updateUser);
router.get("/get-user", authenticateToken, getUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/check-email", checkEmail);
router.get("/check-verified", checkVerified);
router.post("/check-user-exists", checkUserExists);

module.exports = router;
