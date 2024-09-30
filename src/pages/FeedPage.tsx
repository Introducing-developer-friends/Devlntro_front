import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./FeedPage.css";
import FeedDetail from "../components/FeedDetail";

interface Post {
  postId: number;
  createrId: number;
  createrName: string;
  createdAt: string;
  imageUrl: string | null; // imageUrl이 null일 수 있음
  isOwnPost: boolean;
  likesCount?: number;
  commentsCount?: number;
}

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<string>("latest");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

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
          `/posts?filter=all&sort=${sortOption}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
            },
          }
        );
        console.log("Full API response:", JSON.stringify(response.data, null, 2));
        console.log("Fetched posts:", response.data.posts);
        response.data.posts.forEach((post: Post) => {
          console.log(`Post ${post.postId} details:`, JSON.stringify(post, null, 2));
        });
        setPosts(response.data.posts);
      } catch (error) {
        setError("게시물을 불러오는 중 문제가 발생했습니다.");
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [sortOption]);

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  const handleCreatePostClick = () => {
    navigate("/create-post");
  };


  
  const processImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    
    // 이미지 URL의 특수 문자 인코딩 처리
    const encodedUrl = encodeURI(imageUrl);
    console.log("Processed Image URL:", encodedUrl);
    return encodedUrl; // 인코딩된 S3 URL을 반환
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="feed-container">
      <h1>게시물 피드</h1>

      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
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
            {post.imageUrl ? (
              <img
              src={processImageUrl(post.imageUrl)}
              alt={`Post by ${post.createrName}`}
              className="post-image"
              onError={(e) => {
                console.error("Image load error:", e);
                (e.target as HTMLImageElement).alt = 'Image load failed';
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
              <div className="no-image">No image available</div>
            )}
            <div className="post-info">
              <p>{post.createrName}</p>
              <p>{new Date(post.createdAt).toLocaleDateString()}</p>
              {post.likesCount !== undefined && <p>좋아요: {post.likesCount}</p>}
              {post.commentsCount !== undefined && <p>댓글: {post.commentsCount}</p>}
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