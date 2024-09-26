import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import "./FriendsPage.css";

interface Contact {
  userId: string;
  name: string;
  company: string;
  department: string;
  position?: string; // 직무
  email?: string; // 이메일
  phone?: string; // 전화번호
}

const FriendsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [newContactId, setNewContactId] = useState(""); // 추가할 인맥의 ID
  const [addError, setAddError] = useState<string | null>(null); // 인맥 추가 오류 상태
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null); // 선택된 인맥 정보 상태
  const [detailError, setDetailError] = useState<string | null>(null); // 상세 조회 오류 상태
  const navigate = useNavigate(); // useNavigate 훅 추가

  // 토큰이 없는 경우 로그인 페이지로 리다이렉팅
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        console.log("연락처 불러오는 중...");

        const response = await axiosInstance.get("/contacts");

        // api 응답 확인
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.contacts)) {
          setContacts(response.data.contacts);
        } else {
          setError("contacts data is invalid!!!");
          console.error("Invalid contacts data:", response.data);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error); 
        setError("Failed to load contacts. Please try again later.");
      }
    };

    fetchContacts();
  }, []);

  const handleAddContact = async () => {
    try {
      console.log("Adding contact with ID:", newContactId);

      const response = await axiosInstance.post(
        "/contacts",
        { login_id: newContactId },
      );
      console.log("Contact added:", response.data);
      setAddError(null);
      setNewContactId(""); // 입력란 초기화
      setIsModalOpen(false); // 모달 닫기

      // 추가된 후 연락처 목록 다시 불러오기
      const updatedContacts = await axiosInstance.get("/contacts");
      setContacts(updatedContacts.data.contacts);
    } catch (error: any) {
      console.error("연락처 추가 에러:", error);
      if (error.response && error.response.status === 400) {
        setAddError("잘못된 사용자 ID입니다.");
      } else if (error.response && error.response.status === 409) {
        setAddError("이미 인맥으로 등록된 사용자입니다.");
      } else {
        setAddError("인맥 추가 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 상세보기할 인맥 선택
  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(null); // 이전 선택 초기화
    setDetailError(null); // 오류 초기화

    try {
      const response = await axiosInstance.get(`/contacts/${contact.userId}`);
      console.log("Detailed contact info:", response.data);
      if (response.data && response.data.contact) {
        setSelectedContact(response.data.contact);
      }
    } catch (error: any) {
      console.error("Error fetching contact details:", error);
      if (error.response && error.response.status === 400) {
        setDetailError("유효하지 않은 사용자 ID입니다.");
      } else if (error.response && error.response.status === 404) {
        setDetailError("해당 사용자의 명함을 찾을 수 없습니다.");
      } else {
        setDetailError("명함 상세 정보를 가져오는 중 오류가 발생했습니다.");
      }
    }
  };

  // 피드로 이동 버튼 클릭 시
  const handleGoToFeed = () => {
    if (selectedContact) {
      navigate(`/friends-feed/${selectedContact.userId}`); // 선택된 친구의 userId를 넘겨줌
    }
  };

  return (
    <div className="friends-page">
      {/* 왼쪽: 친구 목록 */}
      <div className="contacts-list-container">
      <h1>친구 목록</h1>
      {error && <p className="error-message">{error}</p>}
      <ul className="contacts-list">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
              <li
                key={contact.userId}
                className="contact-item"
                onClick={() => handleSelectContact(contact)} // 친구 선택 시 정보 표시
              >
              <p>
                <strong>Name:</strong> {contact.name}
              </p>
              <p>
                <strong>Company:</strong> {contact.company}
              </p>
              <p>
                <strong>Department:</strong> {contact.department}
              </p>
            </li>
          ))
        ) : (
          <p>No contacts found.</p>
        )}
      </ul>

      {/* 인맥 추가 버튼 */}
      <button onClick={() => setIsModalOpen(true)}>인맥 추가하기</button>

      {/* 모달 창 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>인맥 추가</h2>
            <label>
              사용자 ID:
              <input
                type="text"
                value={newContactId}
                onChange={(e) => setNewContactId(e.target.value)}
              />
            </label>
            {addError && <p className="error-message">{addError}</p>}
            <button onClick={handleAddContact}>추가하기</button>
            <button onClick={() => setIsModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
      </div>

      {/* 오른쪽: 선택된 친구의 정보 */}
      <div className="business-card-container">
        {detailError && <p className="error-message">{detailError}</p>}
        {selectedContact ? (
          <div className="business-card">
            <h2>{selectedContact.name}</h2>
            <p><strong>Company:</strong> {selectedContact.company}</p>
            <p><strong>Department:</strong> {selectedContact.department}</p>
            <p><strong>Position:</strong> {selectedContact.position || "N/A"}</p>
            <p><strong>Email:</strong> {selectedContact.email || "N/A"}</p>
            <p><strong>Phone:</strong> {selectedContact.phone || "N/A"}</p>
            <button onClick={handleGoToFeed}>피드로 이동</button>
          </div>
        ) : (
          <div className="business-card placeholder">
            <h2>이름</h2>
            <p><strong>Company:</strong> 회사명</p>
            <p><strong>Department:</strong> 부서</p>
            <p><strong>Position:</strong> 직무</p>
            <p><strong>Email:</strong> 이메일</p>
            <p><strong>Phone:</strong> 전화번호</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
