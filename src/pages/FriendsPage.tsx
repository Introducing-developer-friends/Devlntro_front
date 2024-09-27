import React, { useEffect, useState,  useCallback  } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./FriendsPage.css";

interface Contact {
  userId: string;
  name: string;
  company: string;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
}

interface Request {
  requestId: number;
  senderLoginId?: string;
  senderName?: string;
  receiverLoginId?: string;
  receiverName?: string;
  requestedAt: string;
}

const FriendsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContactId, setNewContactId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contacts' | 'received' | 'sent'>('contacts');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<'add' | 'received' | 'sent' | null>(null);

  const isAuthenticated = !!localStorage.getItem('token');


  const handleGoToFeed = () => {
    if (selectedContact) {
      navigate(`/friends-feed/${selectedContact.userId}`);
    }
  };

  const toggleModal = (modalType: 'add' | 'received' | 'sent') => {
    setActiveModal(activeModal === modalType ? null : modalType);
  };


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchContacts();
      fetchReceivedRequests();
      fetchSentRequests();
    }
  }, [isAuthenticated, navigate]);

  const fetchContacts = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/contacts");
      setContacts(response.data.contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setError("Failed to load contacts. Please try again later.");
    }
  }, []);

  const fetchReceivedRequests = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/contacts/requests/received");
      setReceivedRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching received requests:", error);
    }
  }, []);

  const fetchSentRequests = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/contacts/requests/sent");
      setSentRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  }, []);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchContacts();
      fetchReceivedRequests();
      fetchSentRequests();
    }
  }, [isAuthenticated, navigate, fetchContacts, fetchReceivedRequests, fetchSentRequests]);

  const handleSelectContact = async (contact: Contact) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/contacts/${contact.userId}`);
      setSelectedContact(response.data.contact);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      setError("Failed to load contact details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContactRequest = async () => {
    try {
      await axiosInstance.post("/contacts", { login_id: newContactId });
      setNewContactId("");
      fetchSentRequests();
      setNotification("요청을 보냈습니다.");
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send contact request.");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await axiosInstance.delete(`/contacts/${contactId}`);
      fetchContacts();
      setNotification("연락처가 삭제되었습니다.");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error deleting contact:", error);
      setError("Failed to delete contact. Please try again.");
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await axiosInstance.post(`/contacts/accept/${requestId}`);
      fetchContacts();
      fetchReceivedRequests();
      setNotification("수락했습니다.");
      setTimeout(() => setNotification(null), 3000);
      setActiveTab('contacts');
    } catch (error) {
      console.error("Error accepting request:", error);
      setError("Failed to accept request. Please try again.");
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    try {
      await axiosInstance.post(`/contacts/reject/${requestId}`);
      fetchReceivedRequests();
      setNotification("거절했습니다.");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error rejecting request:", error);
      setError("Failed to reject request. Please try again.");
    }
  };


  return (
    <div className="friends-page">
      <div className="top-bar">
        <button onClick={() => toggleModal('add')}>Add Contact</button>
        <button onClick={() => toggleModal('received')}>Received Requests</button>
        <button onClick={() => toggleModal('sent')}>Sent Requests</button>
      </div>

      <div className="main-content">
        <div className="left-panel">
          <h2>My Contacts</h2>
          <div className="contacts-list">
            {contacts.map((contact) => (
              <div key={contact.userId} className="contact-item" onClick={() => handleSelectContact(contact)}>
                <p>{contact.name}</p>
                <p>{contact.company}</p>
                <p>{contact.department}</p>
                <button onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContact(contact.userId);
                }}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          {isLoading ? (
            <p className="loading">Loading contact details...</p>
          ) : selectedContact ? (
            <div className="contact-details">
              <h2>{selectedContact.name}</h2>
              <p>Company: {selectedContact.company}</p>
              <p>Department: {selectedContact.department}</p>
              <p>Position: {selectedContact.position || 'N/A'}</p>
              <p>Email: {selectedContact.email || 'N/A'}</p>
              <p>Phone: {selectedContact.phone || 'N/A'}</p>
              <button onClick={handleGoToFeed} className="go-to-feed-btn">Go to User's Feed</button>
            </div>
          ) : (
            <p>Select a contact to view details</p>
          )}
        </div>
      </div>

      {activeModal === 'add' && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Contact</h3>
            <input
              type="text"
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
              placeholder="Enter user ID"
            />
            <button onClick={handleAddContactRequest}>Send Request</button>
            <button onClick={() => setActiveModal(null)}>Close</button>
          </div>
        </div>
      )}

      {activeModal === 'received' && (
        <div className="modal">
          <div className="modal-content">
            <h3>Received Requests</h3>
            {receivedRequests.map((request) => (
              <div key={request.requestId} className="request-item">
                <p>{request.senderName} ({request.senderLoginId})</p>
                <button onClick={() => handleAcceptRequest(request.requestId)}>Accept</button>
                <button onClick={() => handleRejectRequest(request.requestId)}>Reject</button>
              </div>
            ))}
            <button onClick={() => setActiveModal(null)}>Close</button>
          </div>
        </div>
      )}

      {activeModal === 'sent' && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sent Requests</h3>
            {sentRequests.map((request) => (
              <div key={request.requestId} className="request-item">
                <p>To: {request.receiverName} ({request.receiverLoginId})</p>
                <p>Status: Pending</p>
              </div>
            ))}
            <button onClick={() => setActiveModal(null)}>Close</button>
          </div>
        </div>
      )}

      {notification && <div className="notification">{notification}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FriendsPage;