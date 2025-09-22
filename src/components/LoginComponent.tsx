// *********************
// Role of the component: Login component that is displayed on the login page
// Name of the component: LoginComponent.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.1 (added login with axios + JWT)
// Component call: <LoginComponent />
// Input parameters: no input parameters
// Output: Login component that contains input fields for email and password, and buttons for login with Google and GitHub
// *********************

import { FaReact } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa6";
import {
  InputWithLabel,
  SimpleInput,
  ThirdPartyAuthButton,
  WhiteButton,
} from ".";
import { useState } from "react";
import api from "../utils/api";

const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const handleLogin = async () => {
  setLoading(true);
  setError("");
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    console.log("Login response:", res.data);

    // check token
    const token = res.data.token || res.data.access_token;
    if (!token) {
      throw new Error("Token tidak ditemukan di response");
    }

    // store token
    localStorage.setItem("token", token);

    alert("Login success!");
    window.location.href = "/";
  } catch (err: any) {
    setError("❌ Login failed, please check your credentials.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-[500px] h-[750px] dark:bg-gray-900 bg-white flex flex-col justify-between items-center py-10 max-sm:w-[400px] max-[420px]:w-[320px] max-sm:h-[750px]">
      <div className="flex flex-col items-center gap-10">
        <FaReact className="text-5xl dark:text-whiteSecondary text-blackPrimary hover:rotate-180 hover:duration-1000 hover:ease-in-out cursor-pointer max-sm:text-4xl" />
        <h2 className="text-2xl dark:text-whiteSecondary text-blackPrimary font-medium max-sm:text-xl">
          Welcome to the dashboard!
        </h2>
        <div className="flex gap-5">
          <ThirdPartyAuthButton>
            <FaGoogle className="text-2xl max-sm:text-xl" />
          </ThirdPartyAuthButton>
          <ThirdPartyAuthButton>
            <FaGithub className="text-2xl max-sm:text-xl" />
          </ThirdPartyAuthButton>
        </div>

        <p className="dark:text-gray-400 text-gray-700 text-xl max-sm:text-base">OR</p>

        <div className="w-full flex flex-col gap-5">
          <InputWithLabel label="Email">
            <SimpleInput
              type="email"
              placeholder="Enter a email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputWithLabel>

          <InputWithLabel label="Password">
            <SimpleInput
              type="password"
              placeholder="Enter a password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputWithLabel>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <WhiteButton
          textSize="lg"
          width="full"
          py="2"
          text={loading ? "Logging in..." : "Login now"}
          onClick={handleLogin}
        />
      </div>
    </div>
  );
};
export default LoginComponent;
