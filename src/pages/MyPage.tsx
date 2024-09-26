import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { RootState } from "../redux/store";
import "./MyPage.css";
import FeedDetail from "../components/FeedDetail"; // 모달 컴포넌트
import PasswordChange from "../components/PasswordChange"; // 비밀번호 변경 모달 컴포넌트

// 명함 정보 인터페이스 정의
interface ContactInfo {
  userId: number;
  name: string;
  company: string;
  department: string;
  position: string;
  email: string;
  phone: string;
}

// 게시물 인터페이스 정의
interface Post {
  postId: number;
  createrId: number;
  createrName: string;
  createdAt: string;
  imageUrl: string;
  isOwnPost: boolean;
}

const MyPage: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState<boolean>(false); // 비밀번호 모달 상태
  const [sortOption, setSortOption] = useState<string>("latest"); // 분류 기준 상태
  const userId = useSelector((state: RootState) => state.user.userId);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // 명함 정보 불러오기
    axiosInstance
      .get(`/contacts/70`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
        },
      })
      .then((response) => setContactInfo(response.data.contact))
      .catch((error) => console.error(error));
  }, [userId]);

  useEffect(() => {
    // 게시물 피드 불러오기
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get(
          `/posts?filter=own&sort=${sortOption}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
            },
          }
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null); // 모달을 닫을 때 데이터 초기화
  };

  const handleAccountDeletion = (password: string | null) => {
    if (window.confirm("정말로 탈퇴하시겠습니까?")) {
      axiosInstance
        .delete("/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
          },
          data: { password },
        })
        .then((response) => alert(response.data.message))
        .catch((error) => alert(error.response.data.message));
    }
  };

  const handleLogout = () => {
    console.log("잘 작동!!!");
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleProfileUpdate = (updatedInfo: Partial<ContactInfo>) => {
    axiosInstance
      .put("/users/businessprofile", updatedInfo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("JWT_TOKEN")}`,
        },
      })
      .then((response) => alert(response.data.message))
      .catch((error) => alert(error.response.data.message));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownOpen) return;
      const target = event.target as HTMLElement;
      if (
        !target.closest(".dropdown-menu") &&
        !target.closest(".settings button")
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="my-page">
      <div className="settings">
        <button onClick={() => setDropdownOpen(!dropdownOpen)}>설정</button>
        {dropdownOpen && (
          <ul className="dropdown-menu">
            <li onClick={() => setIsPasswordModalOpen(true)}>비밀번호 변경</li>
            <li
              onClick={() =>
                handleAccountDeletion(prompt("비밀번호를 입력해주세요"))
              }
            >
              회원탈퇴
            </li>
            <li onClick={handleLogout}>로그아웃</li>
          </ul>
        )}
      </div>

      {/* 명함 정보 */}
      {contactInfo && (
        <div className="business-card">
          {editMode ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedInfo: Partial<ContactInfo> = {
                  name: (e.target as any)[0].value,
                  company: (e.target as any)[1].value,
                  department: (e.target as any)[2].value,
                  position: (e.target as any)[3].value,
                  email: (e.target as any)[4].value,
                  phone: (e.target as any)[5].value,
                };
                handleProfileUpdate(updatedInfo);
                setEditMode(false);
              }}
            >
              <input type="text" defaultValue={contactInfo.name} />
              <input type="text" defaultValue={contactInfo.company} />
              <input type="text" defaultValue={contactInfo.department} />
              <input type="text" defaultValue={contactInfo.position} />
              <input type="email" defaultValue={contactInfo.email} />
              <input type="tel" defaultValue={contactInfo.phone} />
              <button type="submit">저장</button>
            </form>
          ) : (
            <div>
              <p>{contactInfo.name}</p>
              <p>{contactInfo.company}</p>
              <p>{contactInfo.department}</p>
              <p>{contactInfo.position}</p>
              <p>{contactInfo.email}</p>
              <p>{contactInfo.phone}</p>
              <button onClick={() => setEditMode(true)}>수정</button>
            </div>
          )}
        </div>
      )}

      {/* 게시물 피드 */}
      <div className="posts-wrapper">
        <div className="sort-options">
          <label>정렬 기준:</label>
          <select value={sortOption} onChange={handleSortChange}>
            <option value="latest">최신순</option>
            <option value="likes">좋아요순</option>
            <option value="comments">댓글순</option>
          </select>
        </div>
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

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <PasswordChange onClose={() => setIsPasswordModalOpen(false)} />
        </div>
      )}

      {/* 게시물 상세 모달 */}
      {isModalOpen && selectedPostId && (
        <FeedDetail postId={selectedPostId} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default MyPage;
