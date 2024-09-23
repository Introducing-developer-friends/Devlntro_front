import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

interface Contact {
  userId: string;
  name: string;
  company: string;
  department: string;
}

const FriendsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
  const [newContactId, setNewContactId] = useState(""); // 추가할 인맥의 ID
  const [addError, setAddError] = useState<string | null>(null); // 인맥 추가 오류 상태

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

  return (
    <div>
      <h1>친구 목록</h1>
      {error && <p className="error-message">{error}</p>}
      <ul className="contacts-list">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <li key={contact.userId} className="contact-item">
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
  );
};

export default FriendsPage;
