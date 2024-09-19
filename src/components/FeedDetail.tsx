import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeedDetail.css'; // 모달 스타일링 파일

interface Comment {
  commentId: number;
  authorName: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

interface Like {
  userId: number;
  userName: string;
}

interface PostDetail {
  postId: number;
  createrId: number;
  createrName: string;
  createdAt: string;
  imageUrl: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  likes: Like[];
}

interface FeedDetailProps {
  postId: number;
  onClose: () => void;
}

const FeedDetail: React.FC<FeedDetailProps> = ({ postId, onClose }) => {
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`/api/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
          },
        });
        setPostDetail(response.data);
      } catch (error) {
        setError('게시물 정보를 불러오는 중 문제가 발생했습니다.');
      }
    };

    fetchPostDetail();
  }, [postId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!postDetail) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>게시물 상세보기</h2>
        <img src={postDetail.imageUrl} alt="Post" className="post-image" />
        <p><strong>{postDetail.createrName}</strong></p>
        <p>{new Date(postDetail.createdAt).toLocaleString()}</p>
        <p>{postDetail.content}</p>
        <p>좋아요 {postDetail.likesCount} · 댓글 {postDetail.commentsCount}</p>

        <div className="comments-section">
          <h3>댓글</h3>
          {postDetail.comments.map((comment) => (
            <div key={comment.commentId} className="comment">
              <p><strong>{comment.authorName}</strong>: {comment.content}</p>
              <p>{new Date(comment.createdAt).toLocaleString()} - 좋아요 {comment.likeCount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedDetail;
