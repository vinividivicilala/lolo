'use client';

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updateEmail,
  deleteUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  writeBatch,
  where,
  deleteDoc,
  getDocs
} from "firebase/firestore";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9"
};

let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  auth = getAuth(app);
  db = getFirestore(app);
}

// Providers untuk login
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

interface ChatUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: any;
}

export default function HomePage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Daftar akun default
  const defaultUsers: ChatUser[] = [
    { id: "user1", name: "Ahmad Fauzi", email: "ahmad@email.com", photoURL: "👨" },
    { id: "user2", name: "Siti Rahma", email: "siti@email.com", photoURL: "👩" },
    { id: "user3", name: "Budi Santoso", email: "budi@email.com", photoURL: "🧑" },
    { id: "user4", name: "Dewi Lestari", email: "dewi@email.com", photoURL: "👩‍🦰" },
    { id: "user5", name: "Rizky Pratama", email: "rizky@email.com", photoURL: "👨‍🦱" },
  ];

  // Auth Listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load users from Firestore
  useEffect(() => {
    if (!db) return;
    const loadUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const userList: ChatUser[] = [];
          snapshot.forEach((doc) => {
            userList.push({ id: doc.id, ...doc.data() } as ChatUser);
          });
          if (userList.length === 0) {
            // Seed default users
            defaultUsers.forEach(async (u) => {
              await setDoc(doc(db, "users", u.id), u);
            });
            setUsers(defaultUsers);
          } else {
            setUsers(userList);
          }
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers(defaultUsers);
      }
    };
    loadUsers();
  }, []);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user || !db) return;

    const chatId = [user.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  // Handle login with Google
  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setIsChatOpen(false);
      setSelectedChat(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedChat || !user || !message.trim() || !db) return;

    try {
      const chatId = [user.uid, selectedChat.id].sort().join("_");
      const messagesRef = collection(db, "chats", chatId, "messages");
      
      await addDoc(messagesRef, {
        text: message.trim(),
        senderId: user.uid,
        senderName: user.displayName || "User",
        receiverId: selectedChat.id,
        timestamp: serverTimestamp(),
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle chat
  const handleChatToggle = () => {
    if (!user) {
      handleLogin();
      return;
    }
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setSelectedChat(null);
    }
  };

  // Get chat users (users that user has chatted with)
  useEffect(() => {
    if (!user || !db) return;
    const getChatUsers = async () => {
      try {
        const chatRef = collection(db, "chats");
        const q = query(chatRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const userIds = new Set<string>();
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.participants) {
              data.participants.forEach((id: string) => {
                if (id !== user.uid) userIds.add(id);
              });
            }
          });
          const chatUserList = users.filter(u => userIds.has(u.id));
          setChatUsers(chatUserList);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading chat users:", error);
      }
    };
    getChatUsers();
  }, [user, users]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        fontFamily: "Inter, 'Inter Fallback'"
      }}>
        <div style={{ fontSize: "18px", color: "#666" }}>Loading...</div>
      </div>
    );
  }

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

      {/* User Status */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "8px 20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "60px",
          fontSize: "14px",
          color: "#000",
        }}
      >
        {user ? (
          <>
            <span>{user.displayName || user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "14px",
                padding: "4px 12px",
                borderRadius: "20px",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e0e0e0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              background: "none",
              border: "none",
              color: "#0095f6",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: "20px",
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Login with Google
          </button>
        )}
      </div>

      {/* Chat Box - Awwwards Style */}
      <div
        style={{
          position: "fixed",
          bottom: "40px",
          right: "40px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "16px",
        }}
      >
        {/* Chat Box */}
        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              width: "420px",
              maxHeight: "560px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)",
              animation: "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              border: "1px solid rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backdropFilter: "blur(20px)",
              backgroundColor: "rgba(255,255,255,0.98)",
            }}
          >
            {/* Header - Awwwards Style */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.98)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#c5e800",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#000",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {selectedChat ? "Chat" : "Pesan"}
                </span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#999",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  transition: "all .2s ease",
                  lineHeight: 1,
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

            {/* Content */}
            {!selectedChat ? (
              // User List - Awwwards Style
              <div style={{ padding: "8px", overflowY: "auto", flex: 1 }}>
                <div style={{ padding: "8px 12px 16px", fontSize: "12px", color: "#999", fontWeight: 500, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                  Kontak
                </div>
                {(chatUsers.length > 0 ? chatUsers : users).map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedChat(account)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "12px 16px",
                      borderRadius: "16px",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      marginBottom: "2px",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        flexShrink: 0,
                      }}
                    >
                      {account.photoURL || "👤"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                        {account.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {messages.filter(m => m.senderId === account.id || m.receiverId === account.id).length || 0} pesan
                      </div>
                    </div>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#c5e800",
                        opacity: 0.4,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Chat View - Awwwards Style
              <div style={{ display: "flex", flexDirection: "column", height: "420px" }}>
                {/* Chat Header */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "rgba(255,255,255,0.98)",
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
                      transition: "all .2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    ←
                  </button>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    {selectedChat.photoURL || "👤"}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                      {selectedChat.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#999" }}>
                      {selectedChat.email}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto",
                    backgroundColor: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        fontSize: "13px",
                        marginTop: "60px",
                      }}
                    >
                      <div style={{ fontSize: "32px", marginBottom: "12px" }}>💬</div>
                      Belum ada pesan
                      <div style={{ fontSize: "12px", marginTop: "4px", color: "#ccc" }}>
                        Kirim pesan pertama!
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?.uid;
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                            padding: "10px 16px",
                            borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            backgroundColor: isMine ? "#c5e800" : "#ffffff",
                            color: isMine ? "#000" : "#000",
                            fontSize: "14px",
                            lineHeight: 1.5,
                            boxShadow: isMine ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                            border: isMine ? "none" : "1px solid rgba(0,0,0,0.04)",
                          }}
                        >
                          {msg.text}
                          <div
                            style={{
                              fontSize: "9px",
                              color: isMine ? "rgba(0,0,0,0.4)" : "#ccc",
                              marginTop: "4px",
                              textAlign: isMine ? "right" : "left",
                            }}
                          >
                            {msg.senderName}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                  style={{
                    padding: "12px 16px 16px",
                    borderTop: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    gap: "10px",
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
                      padding: "12px 18px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "60px",
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "Inter, 'Inter Fallback'",
                      transition: "all .2s ease",
                      backgroundColor: "#f5f5f5",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#c5e800";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e8e8e8";
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    style={{
                      backgroundColor: "#c5e800",
                      border: "none",
                      padding: "12px 20px",
                      borderRadius: "60px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#000",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.04)";
                      e.currentTarget.style.backgroundColor = "#b0d000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.backgroundColor = "#c5e800";
                    }}
                  >
                    Kirim →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Button - Awwwards Style */}
        <button
          onClick={handleChatToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: isChatOpen ? "#e8e8e8" : "#000",
            padding: "14px 28px",
            borderRadius: "60px",
            border: "none",
            cursor: "pointer",
            transition: "all .4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: isChatOpen ? "none" : "0 8px 32px rgba(0,0,0,0.12)",
            userSelect: "none",
            fontFamily: "Inter, 'Inter Fallback'",
          }}
          onMouseEnter={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.18)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
            }
          }}
        >
          <span
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: isChatOpen ? "#000" : "#ffffff",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {isChatOpen ? "Tutup" : user ? "Chat with Menuru" : "Login to Chat"}
          </span>
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
