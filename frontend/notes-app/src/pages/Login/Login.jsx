/** @format */

import React, { useState } from "react";
import logo from "../../utils/Images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Input/PasswordInput";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/axiosInstance";
import OtpModal from "../SignUp/OtpModal"; // Import OTP modal
import Loading from "../../components/Loading/Loading"; // Import Loading component

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true); // Show loading while checking user

    try {
      // Step 1: Check if the user exists and is verified
      const checkResponse = await axiosInstance.post(
        "/api/users/check-user-exists",
        { email }
      );

      if (!checkResponse.data.exists) {
        setError("User does not exist. Please sign up.");
        setLoading(false);
        return;
      }

      if (!checkResponse.data.verified) {
        // Step 2: Resend OTP before opening the modal
        const otpResponse = await axiosInstance.post("/api/users/resend-otp", {
          email,
        });

        if (otpResponse.data.success) {
          // Show OTP modal after OTP is successfully resent
          setIsModalOpen(true);
        } else {
          setError("Failed to resend OTP. Please try again.");
        }

        setLoading(false);
        return;
      }

      // Step 3: Proceed with login since the user is verified
      const loginResponse = await axiosInstance.post("/api/users/login", {
        email,
        password,
      });

      if (loginResponse.data && loginResponse.data.accessToken) {
        localStorage.setItem("token", loginResponse.data.accessToken);
        navigate("/home");
      } else {
        setError("Login successful, but no token received.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[100vh] relative">
        <img
          src={logo}
          alt="logo"
          className="absolute w-[100px] h-auto top-[85px] z-10"
        />

        {loading && <Loading message="Processing..." />}

        {/* Login form */}
        <div className="w-[380px] h-[61%] flex flex-col items-center justify-center border-3 border-solid-black rounded-[5px]">
          <h1 className="text-[24px] font-[600] px-[15px] mt-[40px]">
            Login to Noted
          </h1>
          <p className="mb-[40px] mt-[3px]">
            Login your credentials to access your notes
          </p>

          <form onSubmit={handleSubmit} className="w-[60%]">
            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-[14px] pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Login
            </button>
            <p className="text-[15px] text-center mt-[20px]">
              Not registered yet?{" "}
              <Link
                to="/signup"
                className="font-[500] text-violet-600 hover:underline"
              >
                Signup
              </Link>
            </p>
            <p className="text-[15px] text-center mt-[40px]">
              Developed using MERN Stack <br />
              UI by Marc Aspa
            </p>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      {isModalOpen && (
        <OtpModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          email={email}
        />
      )}
    </>
  );
};

export default Login;
