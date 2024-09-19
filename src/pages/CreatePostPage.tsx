import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreatePostPage.css'; // 스타일링 파일

const CreatePostPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePostCreation = async () => {
    if (!content || !imageUrl) {
      setError('내용과 이미지 URL을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/posts',
        {
          content,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
          },
        }
      );
      if (response.status === 201) {
        navigate('/'); // 성공적으로 작성 후 피드 페이지로 이동
      }
    } catch (error) {
      setError('게시물 작성에 실패했습니다. 다시 시도해주세요.');
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
        type="text"
        placeholder="이미지 URL을 입력하세요"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="post-image-url"
      />
      <button onClick={handlePostCreation} className="submit-button">
        게시물 작성
      </button>
    </div>
  );
};

export default CreatePostPage;
