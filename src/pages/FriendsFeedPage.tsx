import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./FriendsFeedPage.css";
import FeedDetail from "../components/FeedDetail";

interface Post {
  postId: number;
  createrId: number;
  createrName: string;
  createdAt: string;
  imageUrl: string;
}

interface Contact {
  userId: string;
  name: string;
  company: string;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
}

const FriendsFeedPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [contactInfo, setContactInfo] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("latest");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const isAuthenticated = !!localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      fetchContactInfo();
      fetchPosts();
    }
  }, [isAuthenticated, navigate, userId, sortOption]);

  const fetchContactInfo = async () => {
    try {
      const response = await axiosInstance.get(`/contacts/${userId}`);
      setContactInfo(response.data.contact);
    } catch (error) {
      console.error("Error fetching contact info:", error);
      setError("Failed to load contact information.");
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axiosInstance.get(
        `/posts?filter=specific&specificUserId=${userId}&sort=${sortOption}`
      );
      setPosts(response.data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("게시물을 불러오는 중 문제가 발생했습니다.");
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  const processImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
      return imageUrl;
    }
    return `${baseUrl}/${imageUrl.replace(/\\/g, "/")}`;
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }


  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <div className="friends-feed-page">
      {contactInfo && (
        <div className="contact-info">
          <h2>{contactInfo.name}'s Feed</h2>
          <p><strong>Company:</strong> {contactInfo.company}</p>
          <p><strong>Department:</strong> {contactInfo.department}</p>
          <p><strong>Position:</strong> {contactInfo.position || 'N/A'}</p>
          <p><strong>Email:</strong> {contactInfo.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {contactInfo.phone || 'N/A'}</p>
        </div>
      )}

      <div className="sort-options">
        <label>Sort by:</label>
        <select value={sortOption} onChange={handleSortChange}>
          <option value="latest">Latest</option>
          <option value="likes">Most Liked</option>
          <option value="comments">Most Commented</option>
        </select>
      </div>

      <div className="posts-wrapper">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.postId}
              className="post-card"
              onClick={() => handlePostClick(post.postId)}
            >
              <div className="post-header">
                <h3>{post.createrName}</h3>
                <p>{formatDate(post.createdAt)}</p>
              </div>
              <img
                src={processImageUrl(post.imageUrl)}
                alt="Post"
                className="post-image"
              />
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      {isModalOpen && selectedPostId && (
        <FeedDetail postId={selectedPostId} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default FriendsFeedPage;