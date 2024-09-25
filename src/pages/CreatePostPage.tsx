import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./CreatePostPage.css"; // 스타일링 파일

const CreatePostPage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handlePostCreation = async () => {
    if (!content || !imageFile) {
      setError("내용과 이미지를 업로드해주세요.");
      return;
    }

    try {
      // 이미지 및 내용 추가
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("content", content);

      // 서버로 게시물 작성 및 이미지 업로드 요청
      const response = await axiosInstance.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
        },
      });

      if (response.status === 201) {
          navigate("/feed"); // 성공적으로 작성 후 피드 페이지로 이동
      }
    } catch (error) {
      setError("게시물 작성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="create-post-container">
      <h1>게시물 작성</h1>
      {error && <div className="error-message">{error}</div>}
      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="post-content"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="post-image-upload"
      />
      <button onClick={handlePostCreation} className="submit-button">
        게시물 작성
      </button>
    </div>
  );
};

export default CreatePostPage;