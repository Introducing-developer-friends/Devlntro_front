import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./SignUpPage.css";

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [formError, setFormError] = useState("");

  const navigate = useNavigate(); // Create a history instance

  const checkIdDuplication = async () => {
    try {
      const response = await axiosInstance.get(`/auth/check-id/${userId}`);
      setIdAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking ID duplication:", error);
    }
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setFormError("Passwords do not match!");
      return;
    }

    try {
      const signUpData = {
        login_id: userId,
        password,
        name: username,
        company,
        department,
        position,
        email,
        phone,
      };
      await axiosInstance.post("/auth/register", signUpData);
      alert("Sign-up successful!");
      navigate("/login");
    } catch (error) {
      console.error("Error during sign-up:", error);
      setFormError("Sign-up failed. Please try again.");
    }
  };

  return (
    <div>
      <h1>회원가입 페이지</h1>
      <form>
        <div>
          <label>사용자 이름:</label>
          <input
            type="text"
            className="sign-up-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>아이디:</label>
          <input
            type="text"
            className="sign-up-input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onBlur={checkIdDuplication}
          />
          {idAvailable === false && (
            <p className="form-error">아이디가 이미 존재합니다.</p>
          )}
          {idAvailable === true && (
            <p className="success-message">사용 가능한 아이디입니다.</p>
          )}
        </div>
        <div>
          <label>비밀번호:</label>
          <input
            type="password"
            className="sign-up-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>비밀번호 확인:</label>
          <input
            type="password"
            className="sign-up-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <h2>명함 정보</h2>
        <div>
          <label>회사명:</label>
          <input
            type="text"
            className="sign-up-input"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label>부서:</label>
          <input
            type="text"
            className="sign-up-input"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div>
          <label>직급:</label>
          <input
            type="text"
            className="sign-up-input"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
        <div>
          <label>이메일:</label>
          <input
            type="email"
            className="sign-up-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>연락처:</label>
          <input
            type="tel"
            className="sign-up-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <button type="button" className="sign-up-button" onClick={handleSignUp}>
          회원가입
        </button>
      </form>
      <div className="nav-spacer"></div>
    </div>
  );
};

export default SignUpPage;
