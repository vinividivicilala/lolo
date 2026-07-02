'use client';

import React, { useState } from "react";

export default function HomePage(): React.JSX.Element {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{[key: string]: string[]}>({});

  // Daftar akun terdaftar
  const accounts = [
    { id: "user1", name: "Ahmad Fauzi", avatar: "👨" },
    { id: "user2", name: "Siti Rahma", avatar: "👩" },
    { id: "user3", name: "Budi Santoso", avatar: "🧑" },
    { id: "user4", name: "Dewi Lestari", avatar: "👩‍🦰" },
    { id: "user5", name: "Rizky Pratama", avatar: "👨‍🦱" },
  ];

  const handleChatClick = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setSelectedChat(null);
    }
  };

  const handleSendMessage = () => {
    if (selectedChat && message.trim()) {
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), message.trim()]
      }));
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: "Inter, 'Inter Fallback'"
      }}
    >
      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          zIndex: 10,
          fontSize: "56px",
          fontWeight: 400,
          color: "#000",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Menuru
      </div>

      {/* Chat Button & Chat Box */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "40px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        {/* Chat Box */}
        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "380px",
              maxHeight: "500px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              animation: "slideUp 0.3s ease",
              border: "1px solid #f0f0f0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#000",
                }}
              >
                💬 Pesan
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#999",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  transition: "all .2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                ✕
              </button>
            </div>

            {/* Daftar Akun */}
            {!selectedChat ? (
              <div style={{ padding: "12px", overflowY: "auto", flex: 1 }}>
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedChat(account.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      marginBottom: "4px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span style={{ fontSize: "28px" }}>{account.avatar}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                        {account.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        {chatMessages[account.id]?.length || 0} pesan
                      </div>
                    </div>
                    <span style={{ fontSize: "14px", color: "#ccc" }}>→</span>
                  </div>
                ))}
              </div>
            ) : (
              // Chat View
              <div style={{ display: "flex", flexDirection: "column", height: "400px" }}>
                {/* Chat Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                      cursor: "pointer",
                      color: "#666",
                      padding: "4px 8px",
                      borderRadius: "8px",
                    }}
                  >
                    ←
                  </button>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                    {accounts.find(a => a.id === selectedChat)?.avatar}{" "}
                    {accounts.find(a => a.id === selectedChat)?.name}
                  </span>
                </div>

                {/* Chat Messages */}
                <div
                  style={{
                    flex: 1,
                    padding: "16px",
                    overflowY: "auto",
                    backgroundColor: "#fafafa",
                  }}
                >
                  {(chatMessages[selectedChat] || []).length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        fontSize: "14px",
                        marginTop: "40px",
                      }}
                    >
                      Belum ada pesan. Kirim pesan pertama!
                    </div>
                  ) : (
                    (chatMessages[selectedChat] || []).map((msg, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "#c5e800",
                          padding: "10px 14px",
                          borderRadius: "12px",
                          marginBottom: "8px",
                          maxWidth: "80%",
                          alignSelf: "flex-end",
                          marginLeft: "auto",
                          fontSize: "14px",
                          color: "#000",
                        }}
                      >
                        {msg}
                      </div>
                    ))
                  )}
                </div>

                {/* Input Message */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    gap: "8px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      border: "1px solid #e0e0e0",
                      borderRadius: "20px",
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "Inter, 'Inter Fallback'",
                      transition: "border .2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#c5e800";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    style={{
                      backgroundColor: "#c5e800",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#000",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#b0d000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#c5e800";
                    }}
                  >
                    Kirim
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tombol Chat */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: isChatOpen ? "#e0e0e0" : "#0095f6",
            padding: "12px 24px",
            borderRadius: "24px",
            cursor: "pointer",
            transition: "all .3s ease",
            boxShadow: isChatOpen ? "none" : "0 4px 12px rgba(0,149,246,0.35)",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,149,246,0.45)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,149,246,0.35)";
            }
          }}
          onClick={handleChatClick}
        >
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: isChatOpen ? "#000" : "#ffffff",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {isChatOpen ? "Tutup Chat" : "Chat with Menuru"}
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
