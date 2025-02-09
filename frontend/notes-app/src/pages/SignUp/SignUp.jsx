/** @format */

import React, { useState, useEffect } from "react";
import logo from "../../utils/Images/logo.png";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/axiosInstance";
import OtpModal from "./OtpModal"; // Import OTP modal
import Loading from "../../components/Loading/Loading"; // Import Loading component

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Manage loading state
  const [isVerified, setIsVerified] = useState(false); // Track verification status
  const [loadingMessage, setLoadingMessage] = useState("");

  const navigate = useNavigate();

  // ✅ Trigger verification check only after OTP modal closes
  useEffect(() => {
    const checkUserVerification = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/users/check-verified?email=${email}`
        );
        if (!response.data.error) {
          setLoadingMessage("Logging in...");
          setLoading(true);

          // Add a 2-second delay before hiding the loader and navigating
          setTimeout(() => {
            setLoading(false);
            navigate("/home");
          }, 3000);
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      }
    };

    // ✅ Run only when the OTP modal is closed and user is expected to be verified
    if (!isModalOpen && isVerified) {
      checkUserVerification();
    }
  }, [isModalOpen, isVerified]); // Runs when OTP modal closes

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsVerified(true); // ✅ Set verified status when modal closes after successful OTP
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoadingMessage("Loading...");    

    // Set loading state to true while making API call
    setLoading(true);

    // API Call and send OTP
    try {
      const response = await axiosInstance.post("/api/users/create-account", {
        fullname: name,
        email: email,
        password: password,
      });

      // Set loading state to false and open OTP modal
      setLoading(false); // Stop loading
      handleOpenModal(); // Show the OTP modal

      if (response.data && response.data.message) {
        setError(response.data.message);
        return;
      }
    } catch (error) {
      setLoading(false); // Stop loading in case of error
      setError(error.response.data.message);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[100vh] relative">
        <img
          src={logo}
          alt="logo"
          className="absolute w-[100px] h-auto top-[58px] z-10"
        />

        {/* Show loading spinner if loading is true */}
        {loading && <Loading message={loadingMessage}/>}

        {/* Signup Form */}
        <div className="w-[380px] h-[69%] flex flex-col items-center justify-center border-3 border-solid-black rounded-[5px]">
          <h1 className="text-[24px] font-[600] px-[15px] mt-[40px]">
            Register to Noted
          </h1>
          <p className="mb-[40px] mt-[3px]">
            Sign up to try out your online diary
          </p>

          <form onSubmit={handleSignup} className="w-[60%]">
            <input
              type="text"
              placeholder="Name"
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              Create Account
            </button>

            <p className="text-[15px] text-center mt-[20px]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-[500] text-violet-600 hover:underline"
              >
                Login
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
          onClose={handleCloseModal}
          email={email}
          password={password}
        />
      )}
    </>
  );
};

export default SignUp;
