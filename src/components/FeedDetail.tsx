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
  isOwnPost: boolean; // 추가된 필드
  userHasLiked: boolean; // 추가된 필드
}

interface FeedDetailProps {
  postId: number;
  onClose: () => void;
}

const FeedDetail: React.FC<FeedDetailProps> = ({ postId, onClose }) => {
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axios.get(`/api/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
          },
        });
        setPostDetail(response.data);
        setContent(response.data.content);
        setImageUrl(response.data.imageUrl);
      } catch (error) {
        setError('게시물 정보를 불러오는 중 문제가 발생했습니다.');
      }
    };

    fetchPostDetail();
  }, [postId]);

  const handleEditClick = () => {
    if (postDetail?.isOwnPost) {
      setIsEditing(true);
    }
  };

  const handleDeleteClick = async () => {
    if (postDetail?.isOwnPost && window.confirm('정말로 게시물을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
          },
        });
        onClose(); // 삭제 후 모달 닫기
      } catch (error) {
        setError('게시물 삭제에 실패했습니다.');
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `/api/posts/${postId}`,
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
      setIsEditing(false);
      // 게시물 상세 다시 가져오기
      const response = await axios.get(`/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
        },
      });
      setPostDetail(response.data);
    } catch (error) {
      setError('게시물 수정에 실패했습니다.');
    }
  };

  const handleLikeClick = async () => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('JWT_TOKEN')}`,
        },
      });
      const updatedPostDetail = { ...postDetail!, likesCount: response.data.likeCount, userHasLiked: true };
      setPostDetail(updatedPostDetail);
    } catch (error) {
      setError('좋아요 처리에 실패했습니다.');
    }
  };

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
        {isEditing ? (
          <div>
            <h2>게시물 수정</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="post-content-edit"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="post-image-url-edit"
            />
            <button onClick={handleSaveChanges} className="submit-button">
              저장
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-button">
              취소
            </button>
          </div>
        ) : (
          <div>
            <div className="post-actions">
              {postDetail.isOwnPost && (
                <div className="actions-menu">
                  <button className="actions-button">...</button>
                  <div className="actions-dropdown">
                    <button onClick={handleEditClick}>수정</button>
                    <button onClick={handleDeleteClick}>삭제</button>
                  </div>
                </div>
              )}
              <button
                onClick={handleLikeClick}
                className={`like-button ${postDetail.userHasLiked ? 'liked' : ''}`}
              >
                👍 좋아요 ({postDetail.likesCount})
              </button>
            </div>
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
        )}
      </div>
    </div>
  );
};

export default FeedDetail;
