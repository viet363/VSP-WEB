import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/chat";

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminId, setAdminId] = useState(null);

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  // =====================================================
  // 📌 Hàm chung để gửi kèm header token
  // =====================================================
  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // =====================================================
  // 📌 1. Lấy danh sách user
  // =====================================================
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users`, authHeader);

      if (res.data.success) {
        setUsers(res.data.data);
        setAdminId(res.data.adminId);
      }
    } catch (err) {
      console.error("Load users error:", err?.response?.data || err);
    }
  }, [token]);

  // =====================================================
  // 📌 2. Lấy tin nhắn của user
  // =====================================================
  const fetchMessages = useCallback(
    async (userId) => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/user/${userId}`,
          authHeader
        );

        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error("Load messages error:", err?.response?.data || err);
      }
    },
    [token]
  );

  // =====================================================
  // 📌 3. Tải danh sách người dùng khi mở trang
  // =====================================================
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // =====================================================
  // 📌 4. Tải tin nhắn khi chọn user
  // =====================================================
  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser.Id);
  }, [selectedUser, fetchMessages]);

  // =====================================================
  // 📌 5. Auto scroll xuống cuối tin nhắn
  // =====================================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =====================================================
  // 📌 6. Gửi tin nhắn
  // =====================================================
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await axios.post(
        `${API_BASE_URL}/admin/send`,
        {
          userId: selectedUser.Id,
          message: newMessage,
        },
        authHeader
      );

      setNewMessage("");

      fetchMessages(selectedUser.Id);
      fetchUsers();
    } catch (err) {
      console.error("Send message error:", err?.response?.data || err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // =====================================================
  // 📌 Nếu chưa có token → chưa login admin
  // =====================================================
  if (!token) {
    return <h3>Bạn chưa đăng nhập admin</h3>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* ================= USER LIST ================ */}
      <div style={{ width: 300, borderRight: "1px solid #333", padding: 10 }}>
        <h3>Người dùng</h3>

        {users.length === 0 && <p>Không có người dùng nào</p>}

        {users.map((user) => (
          <div
            key={user.Id}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: 12,
              marginBottom: 10,
              borderRadius: 6,
              cursor: "pointer",
              background: selectedUser?.Id === user.Id ? "#4b82e0" : "#222",
              color: "white",
            }}
          >
            <strong>{user.Fullname || user.Username}</strong>

            {user.UnreadCount > 0 && (
              <span style={{ color: "red", marginLeft: 5 }}>
                ({user.UnreadCount})
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ================= CHAT AREA ================ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!selectedUser ? (
          <div style={{ padding: 20 }}>Chọn người dùng để bắt đầu chat</div>
        ) : (
          <>
            <div style={{ padding: 15, background: "#444", color: "white" }}>
              Chat với {selectedUser.Fullname || selectedUser.Username}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                background: "#111",
                color: "white",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.Id}
                  style={{
                    textAlign: msg.SenderId === adminId ? "right" : "left",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "10px 14px",
                      borderRadius: 10,
                      maxWidth: "65%",
                      background:
                        msg.SenderId === adminId ? "#2ecc71" : "#333",
                    }}
                  >
                    {msg.Message}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: 10, display: "flex", gap: 10 }}>
              <input
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 20,
                  border: "1px solid #666",
                  background: "#222",
                  color: "white",
                }}
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "12px 18px",
                  background: "#3498db",
                  border: "none",
                  borderRadius: 20,
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Gửi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
