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

  const userId = useSelector((state: RootState) => state.user.userInfo?.userId);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

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

  useEffect(() => {
    if (userId) {
      // axios를 사용해 백엔드로 GET 요청 전송
      axiosInstance
        .get(`/contacts/${userId}`)
        .then((response) => {
          console.log("Contact info response:", response.data);
          setContactInfo(response.data.contact);
        })
        .catch((error) => {
          console.error("Full error object:", error);
          console.error("Error response:", error.response);
          console.error("Error fetching contact info:", error.response?.data || error.message);
          setError("명함 정보를 불러오는데 실패했습니다.");
        });
    }
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
    setSelectedPostId(null);
  };
  const handlePostUpdate = () => {
    fetchPosts(); // 게시물이 수정되었을 때만 호출됨
  };

  const handlePostDelete = () => {
    fetchPosts();
  };

  const handleAccountDeletion = (password: string | null) => {
    if (window.confirm("정말로 탈퇴하시겠습니까?")) {
      axiosInstance
        .delete("/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT 토큰 헤더 추가
          },
          data: { password }, // 사용자가 입력한 비밀번호 포함
        })
        .then((response) => {
          alert(response.data.message || "회원 탈퇴가 완료되었습니다.");
          handleLogout(); // 탈퇴 성공 시 로그아웃 처리
        })
        .catch((error) => {
          if (error.response) {
            alert(error.response.data.message || "탈퇴 중 문제가 발생했습니다.");
          } else {
            alert("서버와의 연결에 문제가 있습니다. 다시 시도해 주세요.");
          }
        });
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
      .then((response) => {
        alert(response.data.message);
        // 프로필 정보가 성공적으로 업데이트되면 contactInfo 상태를 갱신하여 새로고침 없이 UI 업데이트
        setContactInfo((prev) => {
          return prev ? { ...prev, ...updatedInfo } : null;
        });
        setEditMode(false); // 수정 모드를 종료
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
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

  const processImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl.replace(
      /\\/g,
      "/"
    )}`;
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="my-page">
      <div className="settings">
        <button onClick={() => setDropdownOpen(!dropdownOpen)}>Settings</button>
        {dropdownOpen && (
          <ul className="dropdown-menu">
            <li onClick={() => setIsPasswordModalOpen(true)}>비밀번호 변경</li>
            <li onClick={() => handleAccountDeletion(prompt("비밀번호를 입력해주세요"))}>회원탈퇴</li>
            <li onClick={handleLogout}>로그아웃</li>
          </ul>
        )}
      </div>

      {contactInfo && (
        <div className="contact-info">
          <h2>My Profile</h2>
          {editMode ? (
            <form
            onSubmit={(e) => {
              e.preventDefault();
              const updatedInfo: Partial<ContactInfo> = {
                name: (e.target as any).name.value,
                company: (e.target as any).company.value,
                department: (e.target as any).department.value,
                position: (e.target as any).position.value,
                email: (e.target as any).email.value,
                phone: (e.target as any).phone.value,
              };
              // 프로필 정보를 업데이트하고 UI에 즉시 반영
              handleProfileUpdate(updatedInfo);
            }}
          >
            <input name="name" type="text" defaultValue={contactInfo.name} />
            <input name="company" type="text" defaultValue={contactInfo.company} />
            <input name="department" type="text" defaultValue={contactInfo.department} />
            <input name="position" type="text" defaultValue={contactInfo.position} />
            <input name="email" type="email" defaultValue={contactInfo.email} />
            <input name="phone" type="tel" defaultValue={contactInfo.phone} />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </form>          
          ) : (
            <div>
              <p>
                <strong>Name:</strong> {contactInfo.name}
              </p>
              <p>
                <strong>Company:</strong> {contactInfo.company}
              </p>
              <p>
                <strong>Department:</strong> {contactInfo.department}
              </p>
              <p>
                <strong>Position:</strong> {contactInfo.position}
              </p>
              <p>
                <strong>Email:</strong> {contactInfo.email}
              </p>
              <p>
                <strong>Phone:</strong> {contactInfo.phone}
              </p>
              <button onClick={() => setEditMode(true)}>Edit</button>
            </div>
          )}
        </div>
      )}

      <div className="posts-section">
        <h2>My Posts</h2>
        <div className="sort-options">
          <label>Sort by:</label>
          <select value={sortOption} onChange={handleSortChange}>
            <option value="latest">Latest</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Commented</option>
          </select>
        </div>
        <div className="posts-wrapper">
          {posts.map((post) => (
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
                alt={`Post by ${post.createrName}`}
                className="post-image"
                onError={(e) => {
                  console.error("Image load error:", e);
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/300x200?text=No+Image";
                  (e.target as HTMLImageElement).alt = "Image load failed";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <PasswordChange onClose={() => setIsPasswordModalOpen(false)} />
        </div>
      )}

      {isModalOpen && selectedPostId && (
        <FeedDetail postId={selectedPostId} onClose={handleCloseModal} onUpdate={handlePostUpdate} onDelete={handlePostDelete} />
      )}
    </div>
  );
};

export default MyPage;
