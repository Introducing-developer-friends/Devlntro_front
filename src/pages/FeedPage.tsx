import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeedPage.css'; // 스타일링을 위한 CSS 파일

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts?filter=all&sort=latest', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
          },
        });
        setPosts(response.data.posts);
      } catch (error) {
        setError('게시물을 불러오는 중 문제가 발생했습니다.');
      }
    };

    fetchPosts();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="feed-container">
      <h1>게시물 피드</h1>
      <div className="posts-wrapper">
        {posts.map((post) => (
          <div key={post.postId} className="post-card">
            <img src={post.imageUrl} alt="Post" className="post-image" />
            <div className="post-info">
              <p>{post.createrName}</p>
              <p>{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
