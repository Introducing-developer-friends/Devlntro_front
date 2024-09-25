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
  isOwnPost: boolean;
  userHasLiked: boolean;
}

interface FeedDetailProps {
  postId: number;
  onClose: () => void;
}

const FeedDetail: React.FC<FeedDetailProps> = ({ postId, onClose }) => {
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null); // 게시글 상세보기 데이터
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // 게시물 수정 상태
  const [content, setContent] = useState<string>(""); // 불러올 게시글
  const [imageUrl, setImageUrl] = useState<string>(""); // 불러올 이미지 url
  const [newComment, setNewComment] = useState<string>(""); // 댓글
  const [isEditingCommentId, setIsEditingCommentId] = useState<number | null>(null); // 수정 중인 댓글 id
  const [editedCommentContent, setEditedCommentContent] = useState<string>(""); // 수정할 댓글 내용

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
        onClose();
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

  // 댓글 작성 함수
  const handleAddComment = async () => {
    if (!newComment) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        }
      );
      const newCommentData = {
        commentId: response.data.commentId,
        authorName: "현재 사용자 이름", // 사용자 이름을 적절히 설정하세요.
        content: newComment,
        createdAt: new Date().toISOString(),
        likeCount: 0,
      };
      setPostDetail((prev) => {
        if (prev) {
          return {
            ...prev,
            comments: [...prev.comments, newCommentData],
            commentsCount: prev.commentsCount + 1,
          };
        }
        return prev;
      });
      setNewComment("");
    } catch (error) {
      setError("댓글 작성에 실패했습니다.");
    }
  };

  // 댓글 수정 함수
  const handleEditComment = (comment: Comment) => {
    setIsEditingCommentId(comment.commentId);
    setEditedCommentContent(comment.content);
  };

  const handleSaveCommentChanges = async () => {
    if (!editedCommentContent) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      await axiosInstance.put(
        `/posts/${postId}/comments/${isEditingCommentId}`,
        { content: editedCommentContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        }
      );
      setPostDetail((prev) => {
        if (prev) {
          const updatedComments = prev.comments.map((comment) => {
            if (comment.commentId === isEditingCommentId) {
              return { ...comment, content: editedCommentContent };
            }
            return comment;
          });
          return { ...prev, comments: updatedComments };
        }
        return prev;
      });
      setIsEditingCommentId(null);
      setEditedCommentContent("");
      alert("댓글이 수정되었습니다.");
    } catch (error) {
      setError("댓글 수정에 실패했습니다.");
    }
  };

  // 댓글 삭제 함수
  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("정말로 댓글을 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        });
        setPostDetail((prev) => {
          if (prev) {
            return {
              ...prev,
              comments: prev.comments.filter((comment) => comment.commentId !== commentId),
              commentsCount: prev.commentsCount - 1,
            };
          }
          return prev;
        });
        alert("댓글이 삭제되었습니다.");
      } catch (error) {
        setError("댓글 삭제에 실패했습니다.");
      }
    }
  };

  // 댓글 좋아요 함수
  const handleLikeComment = async (commentId: number) => {
    try {
      const response = await axiosInstance.post(
        `/posts/${postId}/comments/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
        }
      );
      setPostDetail((prev) => {
        if (prev) {
          const updatedComments = prev.comments.map((comment) => {
            if (comment.commentId === commentId) {
              return {
                ...comment,
                likeCount: response.data.likeCount,
              };
            }
            return comment;
          });
          return { ...prev, comments: updatedComments };
        }
        return prev;
      });
      alert(response.data.message);
    } catch (error) {
      setError("댓글 좋아요 처리에 실패했습니다.");
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
            <p>좋아요 {postDetail.likesCount}개</p>
            {!postDetail.userHasLiked && (
              <button onClick={handleLikeClick}>좋아요</button>
            )}
            <h3>댓글 ({postDetail.commentsCount})</h3>
            <div className="comments">
              {postDetail.comments.map((comment) => (
                <div key={comment.commentId} className="comment">
                  <strong>{comment.authorName}</strong>
                  <p>{isEditingCommentId === comment.commentId ? (
                    <div>
                      <textarea
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                      />
                      <button onClick={handleSaveCommentChanges}>저장</button>
                    </div>
                  ) : (
                    <>
                      <span>{comment.content}</span>
                      <button onClick={() => handleEditComment(comment)}>수정</button>
                      <button onClick={() => handleDeleteComment(comment.commentId)}>삭제</button>
                      <button onClick={() => handleLikeComment(comment.commentId)}>좋아요 {comment.likeCount}</button>
                    </>
                  )}</p>
                  <span>{comment.createdAt}</span>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글 추가..."
            />
            <button onClick={handleAddComment}>댓글 추가</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedDetail;
