import React, { useEffect, useState } from "react";
import axios from "axios";

interface Contact {
  userId: string;
  name: string;
  company: string;
  department: string;
}

const FriendsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = "YOUR_JWT_TOKEN_HERE"; // Replace with the actual JWT token logic
        const response = await axios.get("/api/contacts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setContacts(response.data.contacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setError("Failed to load contacts. Please try again later.");
      }
    };

    fetchContacts();
  }, []);

  return (
    <div>
      <h1>친구 목록</h1>
      {error && <p className="error-message">{error}</p>}
      <ul className="contacts-list">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <li key={contact.userId} className="contact-item">
              <p><strong>Name:</strong> {contact.name}</p>
              <p><strong>Company:</strong> {contact.company}</p>
              <p><strong>Department:</strong> {contact.department}</p>
            </li>
          ))
        ) : (
          <p>No contacts found.</p>
        )}
      </ul>
    </div>
  );
};

export default FriendsPage;
