import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import "./FeedDetail.css";

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
  const [content, setContent] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        });
        setPostDetail(response.data);
        setContent(response.data.content);
        setImageUrl(response.data.imageUrl);
      } catch (error) {
        setError("게시물 정보를 불러오는 중 문제가 발생했습니다.");
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
    if (
      postDetail?.isOwnPost &&
      window.confirm("정말로 게시물을 삭제하시겠습니까?")
    ) {
      try {
        await axiosInstance.delete(`/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        });
        alert("게시물이 삭제되었습니다.");
        onClose(); // 삭제 후 모달 닫기
        window.location.reload();
      } catch (error) {
        setError("게시물 삭제에 실패했습니다.");
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      await axiosInstance.put(
        `/posts/${postId}`,
        {
          content,
          imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        }
      );
      setIsEditing(false);
      // 게시물 상세 다시 가져오기
      const response = await axiosInstance.get(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
        },
      });
      setPostDetail(response.data);
    } catch (error) {
      setError("게시물 수정에 실패했습니다.");
    }
  };

  const handleLikeClick = async () => {
    try {
      const response = await axiosInstance.post(
        `/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        }
      );
      const updatedPostDetail = {
        ...postDetail!,
        likesCount: response.data.likeCount,
        userHasLiked: true,
      };
      setPostDetail(updatedPostDetail);
    } catch (error) {
      setError("좋아요 처리에 실패했습니다.");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!postDetail) {
    return <div>로딩 중...</div>;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          {postDetail.isOwnPost && (
            <div className="actions-menu">
              <span className="actions-button">...</span>
              <div className="actions-dropdown">
                <button onClick={handleEditClick}>수정</button>
                <button onClick={handleDeleteClick}>삭제</button>
              </div>
            </div>
          )}
          <span className="close" onClick={onClose}>
            &times;
          </span>
        </div>
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
            <button
              onClick={() => setIsEditing(false)}
              className="cancel-button"
            >
              취소
            </button>
          </div>
        ) : (
          <div>
            {postDetail.imageUrl ? (
              <img
                src={`${baseUrl}/posts/images/${postDetail.imageUrl
                  .replace(/\\/g, "/")
                  .replace(/^uploads\//, "")}`}
                alt="Post"
                className="post-image"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/600x400?text=No+Image"; // 경로를 실제 placeholder 이미지 경로로 수정
                  e.currentTarget.alt = "Placeholder Image";
                }}
              />
            ) : null}
            <p>
              <strong>{postDetail.createrName}</strong>
            </p>
            <p>{new Date(postDetail.createdAt).toLocaleString()}</p>
            <p>{postDetail.content}</p>
            <p>
              좋아요 {postDetail.likesCount} · 댓글 {postDetail.commentsCount}
            </p>

            <div className="post-actions">
              <button
                onClick={handleLikeClick}
                className={`like-button ${
                  postDetail.userHasLiked ? "liked" : ""
                }`}
              >
                👍 좋아요 ({postDetail.likesCount})
              </button>
            </div>

            <div className="comments-section">
              <h3>댓글</h3>
              {postDetail.comments.map((comment) => (
                <div key={comment.commentId} className="comment">
                  <p>
                    <strong>{comment.authorName}</strong>: {comment.content}
                  </p>
                  <p>
                    {new Date(comment.createdAt).toLocaleString()} - 좋아요{" "}
                    {comment.likeCount}
                  </p>
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
