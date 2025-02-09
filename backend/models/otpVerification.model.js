/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OtpVerificationSchema = new Schema({
  userEmail: { type: String, required: true },
  otp: { type: String },
  createdAt: { type: Date },
  expiresAt: { type: Date },
});

module.exports = mongoose.model("OtpVerification", OtpVerificationSchema);