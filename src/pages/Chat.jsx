import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api/chat";

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [adminId, setAdminId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const messagesEndRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.get(`${API_BASE_URL}/users`);
      
      console.log("Users response:", res.data);

      if (res.data.success) {
        setUsers(res.data.data || []);
        setRetryCount(0);
      } else {
        setError(res.data.message || "Không thể tải danh sách người dùng");
      }
    } catch (err) {
      console.error("Load users error:", err);
      
      let errorMessage = "Lỗi khi tải danh sách người dùng";
      if (err.response) {
        console.error("Response error:", err.response.data);
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchUsers();
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const fetchMessages = useCallback(
    async (userId) => {
      if (!userId) return;
      
      try {
        const res = await axios.get(
          `${API_BASE_URL}/user/${userId}`
        );

        if (res.data.success) {
          setMessages(res.data.data || []);
        }
      } catch (err) {
        console.error("Load messages error:", err?.response?.data || err);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers();
    
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.Id);
      
      const messageInterval = setInterval(() => {
        fetchMessages(selectedUser.Id);
      }, 5000);
      
      return () => clearInterval(messageInterval);
    }
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const tempId = Date.now();
      const tempMessage = {
        Id: tempId,
        UserId: selectedUser.Id,
        SenderId: adminId,
        Message: newMessage,
        MessageType: "text",
        IsRead: 1,
        Created_at: new Date().toISOString(),
        ChatType: "admin_to_user",
        SenderName: "You",
        SenderFullname: "You",
        SenderAvatar: null
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");

      await axios.post(
        `${API_BASE_URL}/admin/send`,
        {
          userId: selectedUser.Id,
          message: newMessage,
        }
      );

      fetchMessages(selectedUser.Id);
      fetchUsers();
    } catch (err) {
      console.error("Send message error:", err?.response?.data || err);
      alert("Gửi tin nhắn thất bại");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ 
        display: "flex", 
        height: "100vh", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p>Đang tải danh sách người dùng...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div style={{ 
        display: "flex", 
        height: "100vh", 
        alignItems: "center", 
        justifyContent: "center",
        flexDirection: "column" 
      }}>
        <h3 style={{ color: "#e74c3c" }}>Lỗi</h3>
        <p>{error}</p>
        <button 
          onClick={fetchUsers}
          style={{
            padding: "10px 20px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ 
        width: 300, 
        borderRight: "1px solid #333", 
        padding: 10,
        background: "#1a1a1a",
        overflowY: "auto"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 20 
        }}>
          <h3 style={{ margin: 0 }}>Người dùng</h3>
          <button 
            onClick={fetchUsers}
            style={{
              padding: "5px 10px",
              background: "#444",
              border: "none",
              borderRadius: "5px",
              color: "white",
              cursor: "pointer"
            }}
          >
            ↻
          </button>
        </div>

        {loading && users.length === 0 ? (
          <p>Đang tải...</p>
        ) : users.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "20px",
            color: "#999"
          }}>
            <p>Không có người dùng nào</p>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              Chưa có cuộc trò chuyện nào
            </p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.Id}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                cursor: "pointer",
                background: selectedUser?.Id === user.Id ? "#4b82e0" : "#222",
                color: "white",
                transition: "background 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderLeft: user.UnreadCount > 0 ? "4px solid #e74c3c" : "none"
              }}
            >
              <div>
                <strong style={{ display: "block" }}>
                  {user.Fullname || user.Username || `User #${user.Id}`}
                </strong>
                <small style={{ opacity: 0.7, fontSize: "12px" }}>
                  {user.LastMessageTime ? 
                    new Date(user.LastMessageTime).toLocaleDateString('vi-VN') : 
                    "Chưa có tin nhắn"}
                </small>
              </div>
              
              {user.UnreadCount > 0 && (
                <span style={{
                  background: "#e74c3c",
                  color: "white",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {user.UnreadCount}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        background: "#0a0a0a"
      }}>
        {!selectedUser ? (
          <div style={{ 
            display: "flex", 
            flex: 1, 
            alignItems: "center", 
            justifyContent: "center",
            flexDirection: "column",
            color: "#999"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>💬</div>
            <h3>Chọn người dùng để bắt đầu chat</h3>
            <p>Danh sách người dùng đã từng chat với admin</p>
            <div style={{ marginTop: "20px", color: "#666" }}>
              <small>Tổng số: {users.length} người dùng</small>
            </div>
          </div>
        ) : (
          <>
            <div style={{ 
              padding: "15px 20px", 
              background: "#2c3e50", 
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <h4 style={{ margin: 0 }}>
                  Chat với {selectedUser.Fullname || selectedUser.Username}
                </h4>
                <small style={{ opacity: 0.8 }}>
                  {selectedUser.Email || selectedUser.Phone || "Không có thông tin"}
                </small>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {selectedUser.UnreadCount > 0 && (
                  <span style={{ 
                    background: "#e74c3c", 
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "12px"
                  }}>
                    {selectedUser.UnreadCount} tin nhắn chưa đọc
                  </span>
                )}
                <button 
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: "5px 10px",
                    background: "transparent",
                    border: "1px solid white",
                    borderRadius: "5px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  ← Quay lại
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
                color: "white",
              }}
            >
              {messages.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px 20px",
                  color: "#666"
                }}>
                  <p>Chưa có tin nhắn nào</p>
                  <p>Hãy bắt đầu cuộc trò chuyện</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.Id}
                    style={{
                      marginBottom: "14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.SenderId === adminId ? "flex-end" : "flex-start"
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.SenderId === adminId ? "flex-end" : "flex-start"
                      }}
                    >
                      <small style={{ 
                        opacity: 0.6, 
                        marginBottom: "4px",
                        fontSize: "12px"
                      }}>
                        {msg.SenderId === adminId ? "Bạn" : msg.SenderFullname} • 
                        {new Date(msg.Created_at).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </small>
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "18px",
                          background: msg.SenderId === adminId ? "#007bff" : "#444",
                          color: "white",
                          wordBreak: "break-word",
                          borderBottomRightRadius: msg.SenderId === adminId ? "4px" : "18px",
                          borderBottomLeftRadius: msg.SenderId === adminId ? "18px" : "4px"
                        }}
                      >
                        {msg.Message}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ 
              padding: "20px", 
              background: "#1a1a1a",
              borderTop: "1px solid #333"
            }}>
              <div style={{ 
                display: "flex", 
                gap: "10px",
                alignItems: "flex-end"
              }}>
                <textarea
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "20px",
                    border: "1px solid #444",
                    background: "#222",
                    color: "white",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    resize: "none",
                    minHeight: "44px",
                    maxHeight: "120px"
                  }}
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !selectedUser}
                  style={{
                    padding: "12px 24px",
                    background: newMessage.trim() ? "#3498db" : "#555",
                    border: "none",
                    borderRadius: "20px",
                    color: "white",
                    cursor: newMessage.trim() ? "pointer" : "not-allowed",
                    fontWeight: "bold",
                    transition: "background 0.2s"
                  }}
                >
                  Gửi
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;