import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams 추가
import axiosInstance from "../api/axiosInstance";
import "./FriendsFeedPage.css"; // 스타일 추가
import FeedDetail from "../components/FeedDetail"; // 모달 컴포넌트 추가

interface Post {
  postId: number;
  createrId: number;
  createrName: string;
  createdAt: string;
  imageUrl: string;
}

const FriendsFeedPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>(); // URL 파라미터로 userId 받기
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null); // 선택된 게시물 ID 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // 모달 상태
  const [sortOption, setSortOption] = useState<string>("latest"); // 분류 기준 상태
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // 토큰이 없는 경우 로그인 페이지로 리다이렉팅
  const isAuthenticated = !!localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get(
          `/posts?filter=specific&specificUserId=${userId}&sort=${sortOption}` // 선택된 분류 기준 반영
        );
        setPosts(response.data.posts);
      } catch (error) {
        setError("게시물을 불러오는 중 문제가 발생했습니다.");
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [userId, sortOption]); // sortOption이 변경될 때마다 게시물 재요청

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value); // 분류 기준 변경
  };

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true); // 모달 열기
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null); // 모달을 닫을 때 데이터 초기화
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="friends-feed-page">
      <h1>친구의 피드</h1>
      <div className="sort-options">
        <label>정렬 기준:</label>
        <select value={sortOption} onChange={handleSortChange}>
          <option value="latest">최신순</option>
          <option value="likes">좋아요순</option>
          <option value="comments">댓글순</option>
        </select>
      </div>

      <div className="posts-wrapper">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.postId}
              className="post-card"
              onClick={() => handlePostClick(post.postId)} // 게시물 클릭 시 모달 열기
            >
              <h3>{post.createrName}</h3>
              <p>{new Date(post.createdAt).toLocaleDateString()}</p>
              <img
                src={`${baseUrl}/posts/images/${post.imageUrl
                  .replace(/\\/g, "/")
                  .replace(/^uploads\//, "")}`}
                alt="Post"
                className="post-image"
              />
            </div>
          ))
        ) : (
          <p>게시물이 없습니다.</p>
        )}
      </div>

      {isModalOpen && selectedPostId && (
        <FeedDetail postId={selectedPostId} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default FriendsFeedPage;
