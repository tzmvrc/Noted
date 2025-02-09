/** @format */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import otpImg from "../../utils/Images/otpImage.png";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const OtpModal = ({ isOpen, onClose, email, password }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setOtp(new Array(6).fill(""));
      setError("");
      setResendTimer(0); // Reset timer when modal opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      newOtp[index] = "";
      setOtp(newOtp);
    }
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("api/users/verify-otp", {
        email: email,
        otp: otpValue,
      });

      if (response.data) {
        setError("Account verified! Logging in...");
        handleLogin();
        onClose();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("/api/users/login", {
        email: email,
        password: password,
      });

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        onClose();
      } else {
        setError("Login successful, but no token received.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  const startResendTimer = () => {
    setResendTimer(120); // Start 120s countdown
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return; // Prevent multiple clicks

    setError("");
    startResendTimer(); // Start the countdown

    try {
      const response = await axiosInstance.post("/api/users/resend-otp", {
        email,
      });

      if (response.data.success) {
        setError("A new OTP has been sent to your email.");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Failed to resend OTP. Try again later.");
      setResendTimer(0); // Reset the timer if error occurs
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[5px] bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white p-6 rounded-[5px] border-3 border-solid-black shadow-lg w-[380px] flex flex-col items-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <img
              src={otpImg}
              alt="OTP Verification"
              className="absolute -top-20 w-30 h-auto object-contain"
            />
            <h1 className="text-[24px] font-[600] text-center mt-10">
              Let's verify your email
            </h1>
            <p className="text-center text-[14px] mt-1">
              We've sent a verification code to your email.
            </p>
            <div className="flex space-x-2 mt-[24px]">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center border border-gray-400 rounded-md text-[20px] font-bold text-violet-700 focus:outline-none focus:ring-2 focus:ring-black"
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-[14px] mt-2">{error}</p>}

            {/* Resend OTP button */}
            <button
              className={`mt-10 text-violet-600 hover:underline cursor-pointer ${
                resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : ""
              }`}
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0
                ? `resend code in ${resendTimer}s`
                : "send code again"}
            </button>

            <div className="flex justify-between w-full mt-3">
              <button
                className="bg-gray-500 text-white px-4 py-[8px] w-[40%] ml-[5%] rounded cursor-pointer"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-[8px] w-[40%] mr-[5%] rounded cursor-pointer ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-violet-600 text-white"
                }`}
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OtpModal;
