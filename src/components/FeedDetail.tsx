import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { useSelector, useDispatch } from 'react-redux';
import "./FeedDetail.css";
import { RootState } from '../redux/store';
import { addNotification } from '../redux/notificationSlice';

interface Comment {
  commentId: number;
  authorId: number;
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
  onUpdate?: () => void;
  onDelete?: () => void;
}

const FeedDetail: React.FC<FeedDetailProps> = ({ postId, onClose, onUpdate, onDelete }) => {
  const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [isEditingCommentId, setIsEditingCommentId] = useState<number | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const token = userInfo?.token || localStorage.getItem('token');

  const [isPostModified, setIsPostModified] = useState<boolean>(false);
  const [isPostDeleted, setIsPostDeleted] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPostDetail();
    }
  }, [postId, isAuthenticated, token]);

  const fetchPostDetail = async () => {
    if (!token) return null;
    try {
      const response = await axiosInstance.get(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPostDetail(response.data);
      setContent(response.data.content);
      return response.data;
    } catch (error) {
      setError("게시물 정보를 불러오는 중 문제가 발생했습니다.");
      return null;
    }
  };

  const handleEditClick = () => {
    if (postDetail?.isOwnPost) {
      setIsEditing(true);
    }
  };

  const handleDeleteClick = async () => {
    if (!token || !postDetail?.isOwnPost) return;
    if (window.confirm("정말로 게시물을 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("게시물이 삭제되었습니다.");
        setIsPostDeleted(true);
        if (onDelete) {
          onDelete();
        }
        onClose();
      } catch (error) {
        setError("게시물 삭제에 실패했습니다.");
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSaveChanges = async () => {
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (file) {
        formData.append('image', file);
      }

      await axiosInstance.put(`/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setIsEditing(false);
      setIsPostModified(true);
      fetchPostDetail();
      alert("게시물이 성공적으로 수정되었습니다.");
    } catch (error) {
      setError("게시물 수정에 실패했습니다.");
    }
  };

  const handleLikeClick = async () => {
  if (!token || !userInfo || !postDetail) return;
  try {
    const response = await axiosInstance.post(`/posts/${postId}/like`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { message, likeCount } = response.data;
    const isLiked = message.includes('눌렀습니다');

    // 포스트 상세 정보 업데이트
    setPostDetail(prevPostDetail => {
      if (prevPostDetail === null) return null;
      return {
        ...prevPostDetail,
        userHasLiked: isLiked,
        likesCount: likeCount
      };
    });

    alert(message);

    // 좋아요를 눌렀을 때만 알림 생성
    if (isLiked) {
      try {
        const notificationResponse = await axiosInstance.post('/notifications/like-post', {
          postId: postId,
          senderId: userInfo.userId,
          receiverId: postDetail.createrId,
          message: `${userInfo.name || '알 수 없는 사용자'}님이 당신의 게시물에 좋아요를 눌렀습니다.`
        });
        
        if (notificationResponse.data) {
          dispatch(addNotification(notificationResponse.data));
        }
      } catch (error: any) {
        console.error("좋아요 알림 생성 실패:", error);
        if (error.response) {
          console.error("에러 응답:", error.response.data);
        }
      }
    }
  } catch (error) {
    console.error("좋아요 처리 실패:", error);
    setError("좋아요 처리에 실패했습니다.");
  }
};
  

  const handleAddComment = async () => {
    if (!token || !newComment.trim() || !userInfo) return;
    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments`, { content: newComment }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewComment("");
      fetchPostDetail();
      alert("댓글이 추가되었습니다.");

      // 댓글 알림 생성
      try {
        const notificationResponse = await axiosInstance.post('/notifications/comment', {
          postId: postId,
          senderId: userInfo.userId,
          receiverId: postDetail?.createrId,
          message: `${userInfo?.name || '누군가'}님이 당신의 게시물에 댓글을 남겼습니다.`
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (notificationResponse.data) {
          dispatch(addNotification(notificationResponse.data));
        }
      } catch (error) {
        console.error("댓글 알림 생성 실패:", error);
      }
    } catch (error) {
      setError("댓글 작성에 실패했습니다.");
    }
  };

  const handleEditComment = (comment: Comment) => {
    setIsEditingCommentId(comment.commentId);
    setEditedCommentContent(comment.content);
  };

  const handleSaveCommentChanges = async () => {
    if (!token || !editedCommentContent.trim()) return;
    try {
      await axiosInstance.put(`/posts/${postId}/comments/${isEditingCommentId}`, 
        { content: editedCommentContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsEditingCommentId(null);
      setEditedCommentContent("");
      fetchPostDetail();
      alert("댓글이 수정되었습니다.");
    } catch (error) {
      setError("댓글 수정에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
    if (window.confirm("정말로 댓글을 삭제하시겠습니까?")) {
      try {
        await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchPostDetail();
      } catch (error) {
        setError("댓글 삭제에 실패했습니다.");
      }
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!token || !userInfo || !postDetail) return;
    try {
      const response = await axiosInstance.post(`/posts/${postId}/comments/${commentId}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const { message, likeCount } = response.data;
      const isLiked = message.includes('눌렀습니다');
  
      // 댓글 좋아요 상태 업데이트
      setPostDetail(prevPostDetail => {
        if (!prevPostDetail) return null;
        return {
          ...prevPostDetail,
          comments: prevPostDetail.comments.map(comment => 
            comment.commentId === commentId 
              ? { ...comment, likeCount: likeCount }
              : comment
          )
        };
      });
  
      alert(message);
  
      // 좋아요를 눌렀을 때만 알림 생성
      if (isLiked) {
        const comment = postDetail.comments.find(c => c.commentId === commentId);
        if (comment && comment.authorId !== userInfo.userId) {
          try {
            const notificationResponse = await axiosInstance.post('/notifications/like-comment', {
              commentId: commentId,
              senderId: userInfo.userId,
              receiverId: comment.authorId,
              message: `${userInfo.name || '알 수 없는 사용자'}님이 당신의 댓글에 좋아요를 눌렀습니다.`
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (notificationResponse.data) {
              dispatch(addNotification(notificationResponse.data));
            }
          } catch (error: any) {
            console.error("댓글 좋아요 알림 생성 실패:", error);
            if (error.response) {
              console.error("에러 응답:", error.response.data);
            }
          }
        }
      }
    } catch (error) {
      console.error("댓글 좋아요 처리 실패:", error);
      setError("댓글 좋아요 처리에 실패했습니다.");
    }
  };
  
  
  
  useEffect(() => {
    return () => {
      if (isPostModified && onUpdate) {
        onUpdate();
      }
      if (isPostDeleted && onDelete) {
        onDelete();
      }
    };
  }, [isPostModified, isPostDeleted, onUpdate, onDelete]);

  if (!isAuthenticated || !token) return <div>로그인이 필요합니다.</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!postDetail) return <div className="loading-message">게시물 로딩 중...</div>;
    

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{postDetail.createrName}의 게시물</h2>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="post-content-edit"
            />
            <input
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file-input"
            />
            <div className="button-group">
              <button onClick={handleSaveChanges} className="submit-button">저장</button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">취소</button>
            </div>
          </div>
        ) : (
          <div className="post-detail">
            <div className="image-container">
              {postDetail.imageUrl && (
                <img
                  src={postDetail.imageUrl}
                  alt={`Post by ${postDetail.createrName}`}
                  className="post-image"
                />
              )}
            </div>
            <p className="post-content">{postDetail.content}</p>
            <p className="post-date">{new Date(postDetail.createdAt).toLocaleString()}</p>
            <div className="post-actions">
              <span>좋아요 {postDetail.likesCount}개</span>
              <button onClick={handleLikeClick} className="like-button">
              {postDetail.userHasLiked ? '좋아요 취소' : '좋아요'}
            </button>
              {postDetail.isOwnPost && onUpdate && onDelete && (
                <>
                  <button onClick={handleEditClick} className="edit-button">수정</button>
                  <button onClick={handleDeleteClick} className="delete-button">삭제</button>
                </>
              )}
            </div>
            <div className="comments-section">
              <h3>댓글 ({postDetail.commentsCount})</h3>
              {postDetail.comments.map((comment) => (
                <div key={comment.commentId} className="comment">
                  <strong>{comment.authorName}</strong>
                  {isEditingCommentId === comment.commentId ? (
                    <div>
                      <textarea
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                      />
                      <button onClick={handleSaveCommentChanges}>저장</button>
                    </div>
                  ) : (
                    <>
                      <p>{comment.content}</p>
                      <div className="comment-actions">
                        <button onClick={() => handleEditComment(comment)}>수정</button>
                        <button onClick={() => handleDeleteComment(comment.commentId)}>삭제</button>
                        <button onClick={() => handleLikeComment(comment.commentId)}>
                          좋아요 {comment.likeCount}
                        </button>
                      </div>
                    </>
                  )}
                  <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="add-comment">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글 추가..."
              />
              <button onClick={handleAddComment}>댓글 추가</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedDetail;
