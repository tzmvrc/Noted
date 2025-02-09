/** @format */

const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const OtpVerification = require("../models/otpVerification.model"); // Capitalize to match Mongoose model conventions

const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Nodemailer transporter setup
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer Error:", error);
  } else {
    console.log("✅ Nodemailer is ready");
  }
});

exports.checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists, Login instead" });
    }
    return res.json({ error: false, message: "User does not exist" });
  } catch (err) {
    console.error("Error in checkExisting:", err);
  }
};

exports.checkUserExists = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.json({ exists: false, message: "User does not exist." });
    }

    return res.json({
      exists: true,
      verified: existingUser.verified,
    });
  } catch (err) {
    console.error("Error in checkUserExists:", err);
    return res.status(500).json({ error: true, message: "Server error" });
  }
};


// Create Account
exports.createAccount = async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ fullname, email, password: hashedPassword });
    await user.save();

    // Send OTP
    await exports.sendOtp({ _id: user._id, email });

    // Generate JWT token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "36000m" }
    );

    return res.json({
      error: false,
      user,
      accessToken,
      message: "OTP sent to your email.",
    });
  } catch (error) {
    console.error("Error in createAccount:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
};

// Send OTP
exports.sendOtp = async ({ _id, email }) => {
  try {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    console.log("Generated OTP:", otp);

    const hashedOtp = await bcrypt.hash(otp, 10);
    const newOtpVerification = new OtpVerification({
      userId: _id,
      userEmail: email,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    await newOtpVerification.save();
    console.log("OTP Verification saved:", newOtpVerification);

    await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${otp} This code is valid for 1 hour. Use this code to verify your account.`,
    });

    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};


exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp || !email) {
    return res
      .status(400)
      .json({ error: true, message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: true, message: "User not found" });
    }

    if (user.verified) {
      return res
        .status(400)
        .json({ error: true, message: "Account already verified" });
    }

    const otpRecord = await OtpVerification.findOne({ userEmail: email });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ error: true, message: "OTP not found or expired" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await OtpVerification.deleteOne({ userEmail: email });
      return res
        .status(400)
        .json({ error: true, message: "OTP expired, request a new one" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid OTP, try again" });
    }

    // Mark user as verified
    await User.updateOne({ email }, { verified: true });

    // Delete OTP record after successful verification
    await OtpVerification.deleteOne({ userEmail:email });

    return res.json({
      success: true,
      message: "OTP verified, account is now active",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Server error during OTP verification" });
  }
};


exports.resendOtp = async (req, res) => {
  const { email } = req.body; // Extract userId from params
  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({ error: true, message: "User not found" });
    }

    // 🗑 Delete any existing OTP for the user
    await OtpVerification.deleteOne({ userEmail: email });

    // 🔢 Generate a new 6-digit OTP
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    // 🔒 Hash the new OTP before storing
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    // 📌 Save the new OTP to the database
    const newOtpVerification = new OtpVerification({
      userEmail: email,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // New OTP expires in 1 hour
    });

    await newOtpVerification.save();

    // 📧 Send the new OTP via email
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: "New Verification Code",
      text: `Your new verification code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Server error during OTP resend" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const userInfo = await User.findOne({ email });

    if (!userInfo) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, userInfo.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { userId: userInfo._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "36000m" }
    );

    return res.json({
      error: false,
      message: "Login successful",
      email,
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
};

exports.checkVerified = async (req, res) => {
  const { email } = req.query; // Use query parameters for GET requests

  try {
    const userInfo = await User.findOne({ email });

    if (!userInfo) {
      return res.status(400).json({ error: true, message: "User not found" });
    }

    if (userInfo.verified) {
      return res.json({ error: false, message: "User is verified" });
    } else {
      return res.json({ error: true, message: "User is not verified" });
    }
  } catch (error) {
    console.error("Verification check error:", error);
    return res.status(500).json({ error: true, message: "Server error" });
  }
};
