import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./FeedPage.css";
import FeedDetail from "../components/FeedDetail"; // 모달 컴포넌트

interface Post {
  postId: number;
  createrId: number;
  createrName: string;
  createdAt: string;
  imageUrl: string;
  isOwnPost: boolean;
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>("latest"); // 정렬 옵션 상태 추가
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // 토큰이 없는 경우 로그인 페이지로 리다이렉팅
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get(
          `/posts?filter=all&sort=${sortOption}`, // sortOption에 따른 동적 API 요청
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
            },
          }
        );
        console.log("Fetched posts:", response.data.posts); // 로그 추가
        setPosts(response.data.posts);
      } catch (error) {
        setError("게시물을 불러오는 중 문제가 발생했습니다.");
        console.error("Error fetching posts:", error); // 오류 로그 추가
      }
    };

    fetchPosts();
  }, [sortOption]); // sortOption 변경 시 다시 게시물 불러오기

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null); // 모달을 닫을 때 데이터 초기화
  };

  const handleCreatePostClick = () => {
    navigate("/create-post"); // 게시물 작성 페이지로 이동
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="feed-container">
      <h1>게시물 피드</h1>

      {/* 정렬 옵션 선택 드롭다운 */}
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)} // 선택된 정렬 옵션 업데이트
        className="sort-dropdown"
      >
        <option value="latest">최신순</option>
        <option value="likes">좋아요 순</option>
        <option value="comments">댓글 순</option>
      </select>

      <button className="create-post-button" onClick={handleCreatePostClick}>
        게시물 작성
      </button>

      <div className="posts-wrapper">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="post-card"
            onClick={() => handlePostClick(post.postId)}
          >
            <img
              src={`${baseUrl}/posts/images/${post.imageUrl
                .replace(/\\/g, "/")
                .replace(/^uploads\//, "")}`}
              alt="Post"
              className="post-image"
            />
            <div className="post-info">
              <p>{post.createrName}</p>
              <p>{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedPostId && (
        <FeedDetail postId={selectedPostId} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default FeedPage;
