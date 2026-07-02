'use client';

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs,
  updateDoc
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

const googleProvider = new GoogleAuthProvider();

interface ChatUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt?: any;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: any;
  read: boolean;
  readAt?: any;
}

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSenderId?: string;
  unreadCount: number;
}

export default function HomePage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");
  const [addUserStatus, setAddUserStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              name: currentUser.displayName || currentUser.email,
              email: currentUser.email,
              photoURL: currentUser.photoURL || "",
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Load users
  useEffect(() => {
    if (!db || !user) return;
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: ChatUser[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          userList.push({ id: doc.id, ...doc.data() } as ChatUser);
        }
      });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [user]);

  // Load chat rooms
  useEffect(() => {
    if (!user || !db) return;
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef);
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rooms: ChatRoom[] = [];
      let totalUnreadCount = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(user.uid)) {
          const otherId = data.participants.find((id: string) => id !== user.uid);
          const otherUser = users.find(u => u.id === otherId);
          if (otherUser) {
            const messagesRef = collection(db, "chats", docSnap.id, "messages");
            const qMsg = query(messagesRef, orderBy("timestamp", "desc"));
            const msgSnap = await getDocs(qMsg);
            let lastMessage = "";
            let lastMessageTime = null;
            let lastMessageSenderId = "";
            let unreadCount = 0;
            if (!msgSnap.empty) {
              const lastMsg = msgSnap.docs[0].data() as Message;
              lastMessage = lastMsg.text;
              lastMessageTime = lastMsg.timestamp;
              lastMessageSenderId = lastMsg.senderId;
            }
            const unreadQuery = query(
              messagesRef, 
              where("read", "==", false),
              where("senderId", "!=", user.uid)
            );
            const unreadSnap = await getDocs(unreadQuery);
            unreadCount = unreadSnap.size;
            totalUnreadCount += unreadCount;
            rooms.push({
              id: docSnap.id,
              participants: data.participants,
              lastMessage,
              lastMessageTime,
              lastMessageSenderId,
              unreadCount
            });
          }
        }
      }
      rooms.sort((a, b) => {
        if (a.lastMessageTime && b.lastMessageTime) {
          return b.lastMessageTime.seconds - a.lastMessageTime.seconds;
        }
        return 0;
      });
      setChatRooms(rooms);
      setTotalUnread(totalUnreadCount);
    });
    return () => unsubscribe();
  }, [user, users]);

  // Load messages
  useEffect(() => {
    if (!selectedChat || !user || !db) return;
    const chatId = [user.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList);
      const unreadMessages = messageList.filter(m => !m.read && m.senderId !== user.uid);
      for (const msg of unreadMessages) {
        const msgRef = doc(db, "chats", chatId, "messages", msg.id);
        await updateDoc(msgRef, { read: true, readAt: serverTimestamp() });
      }
      if (unreadMessages.length > 0) {
        setChatRooms(prev => prev.map(room => {
          if (room.id === chatId) {
            return { ...room, unreadCount: 0 };
          }
          return room;
        }));
        setTotalUnread(prev => Math.max(0, prev - unreadMessages.length));
      }
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    return () => unsubscribe();
  }, [selectedChat, user]);

  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
      setLoginError("");
    } catch (error) {
      setLoginError("Login gagal. Silahkan coba lagi.");
    }
  };

  const handleEmailLogin = async () => {
    if (!auth || !loginEmail || !loginPassword) return;
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      setLoginError("");
    } catch (error) {
      setLoginError("Email atau password salah.");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setIsChatOpen(false);
      setSelectedChat(null);
      setChatRooms([]);
      setTotalUnread(0);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !user || !message.trim() || !db) return;
    try {
      const chatId = [user.uid, selectedChat.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, selectedChat.id],
          createdAt: serverTimestamp()
        });
      }
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: message.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: selectedChat.id,
        timestamp: serverTimestamp(),
        read: false
      });
      setChatRooms(prev => prev.map(room => {
        if (room.id === chatId) {
          return { 
            ...room, 
            lastMessage: message.trim(), 
            lastMessageTime: serverTimestamp(),
            lastMessageSenderId: user.uid
          };
        }
        return room;
      }));
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAddExistingUser = async () => {
    if (!searchEmail.trim() || !user || !db) return;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchEmail.trim()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setAddUserStatus("❌ Email tidak ditemukan.");
        return;
      }
      const existingUser = querySnapshot.docs[0];
      const userData = existingUser.data() as ChatUser;
      if (existingUser.id === user.uid) {
        setAddUserStatus("❌ Tidak bisa menambahkan diri sendiri.");
        return;
      }
      const chatId = [user.uid, existingUser.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, existingUser.id],
          createdAt: serverTimestamp()
        });
        setAddUserStatus(`✅ Chat dengan ${userData.name || userData.email} berhasil dibuat!`);
      } else {
        setAddUserStatus(`ℹ️ Chat sudah ada.`);
      }
      setSearchEmail("");
      setTimeout(() => setAddUserStatus(""), 3000);
    } catch (error) {
      setAddUserStatus("❌ Gagal menambahkan user.");
    }
  };

  const handleChatToggle = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) setSelectedChat(null);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== user?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#0095f6" };
    }
    return { icon: "✓", color: "#999" };
  };

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
        <div style={{ fontSize: "24px", color: "#666" }}>Loading...</div>
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
          fontSize: "72px",
          fontWeight: 400,
          color: "#000",
          letterSpacing: "-0.03em",
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
          gap: "20px",
          padding: "10px 24px",
          backgroundColor: "#f5f5f5",
          borderRadius: "60px",
          fontSize: "16px",
          color: "#000",
        }}
      >
        {user ? (
          <>
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="avatar" 
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            )}
            <span style={{ fontWeight: 500, fontSize: "16px" }}>{user.displayName || user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
                fontSize: "16px",
                padding: "6px 16px",
                borderRadius: "20px",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e0e0e0"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            style={{
              background: "none",
              border: "none",
              color: "#0095f6",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 500,
              padding: "6px 16px",
              borderRadius: "20px",
              transition: "all .2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Login
          </button>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowLogin(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "24px",
              padding: "48px",
              maxWidth: "420px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "28px", fontWeight: 600, color: "#000", marginBottom: "24px" }}>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                marginBottom: "14px",
                fontSize: "16px",
                outline: "none",
                fontFamily: "Inter, 'Inter Fallback'",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                marginBottom: "16px",
                fontSize: "16px",
                outline: "none",
                fontFamily: "Inter, 'Inter Fallback'",
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
            />
            {loginError && (
              <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "14px" }}>{loginError}</div>
            )}
            <button
              onClick={handleEmailLogin}
              style={{
                width: "100%",
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Login with Email
            </button>
            <div style={{ marginTop: "16px", textAlign: "center", fontSize: "16px", color: "#666" }}>atau</div>
            <button
              onClick={handleLogin}
              style={{
                width: "100%",
                backgroundColor: "#4285f4",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 500,
                cursor: "pointer",
                marginTop: "10px",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Login with Google
            </button>
          </div>
        </div>
      )}

      {/* Chat Box - Full Width Design */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "16px",
        }}
      >
        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "28px",
              width: "520px",
              maxHeight: "680px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.12), 0 10px 30px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            {/* Header - Large */}
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#000",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ fontSize: "22px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>
                  {selectedChat ? selectedChat.name : "Pesan"}
                </span>
                {selectedChat && (
                  <span style={{ fontSize: "14px", color: "#666" }}>{selectedChat.email}</span>
                )}
                {!selectedChat && totalUnread > 0 && (
                  <span
                    style={{
                      backgroundColor: "#c5e800",
                      color: "#000",
                      borderRadius: "50%",
                      padding: "4px 14px",
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  transition: "all .2s ease",
                  opacity: 0.6,
                  fontSize: "24px",
                  fontWeight: 300,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.opacity = "0.6";
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {!selectedChat ? (
              <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
                {/* Add User */}
                <div
                  style={{
                    padding: "18px 20px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "18px" }}>➕</span>
                    <span style={{ fontSize: "17px", fontWeight: 600, color: "#000" }}>
                      Mulai Chat dengan User Terdaftar
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <input
                      type="email"
                      placeholder="Masukkan email user..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddExistingUser()}
                      style={{
                        flex: 1,
                        padding: "14px 18px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        fontSize: "16px",
                        outline: "none",
                        fontFamily: "Inter, 'Inter Fallback'",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <button
                      onClick={handleAddExistingUser}
                      disabled={!searchEmail.trim()}
                      style={{
                        backgroundColor: searchEmail.trim() ? "#000" : "#ccc",
                        color: searchEmail.trim() ? "#fff" : "#666",
                        border: "none",
                        padding: "14px 24px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        cursor: searchEmail.trim() ? "pointer" : "not-allowed",
                        fontWeight: 500,
                        transition: "all .2s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Kirim
                    </button>
                  </div>
                  {addUserStatus && (
                    <div style={{ fontSize: "15px", color: "#666", marginTop: "12px" }}>{addUserStatus}</div>
                  )}
                </div>

                {/* Chat List */}
                <div style={{ padding: "4px 0" }}>
                  {chatRooms.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        padding: "60px 0",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
                      <div style={{ fontSize: "20px", fontWeight: 500, color: "#000" }}>Belum ada chat</div>
                      <div style={{ fontSize: "16px", marginTop: "8px", color: "#ccc" }}>
                        Cari email user untuk memulai chat
                      </div>
                    </div>
                  ) : (
                    chatRooms.map((room) => {
                      const otherId = room.participants.find(id => id !== user.uid);
                      const otherUser = users.find(u => u.id === otherId);
                      if (!otherUser) return null;
                      const isLastMessageFromMe = room.lastMessageSenderId === user.uid;
                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedChat(otherUser)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "16px 18px",
                            borderRadius: "16px",
                            cursor: "pointer",
                            transition: "all .2s ease",
                            marginBottom: "4px",
                            backgroundColor: room.unreadCount > 0 ? "rgba(197,232,0,0.08)" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = room.unreadCount > 0 ? "rgba(197,232,0,0.15)" : "#f5f5f5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = room.unreadCount > 0 ? "rgba(197,232,0,0.08)" : "transparent";
                          }}
                        >
                          <div
                            style={{
                              width: "56px",
                              height: "56px",
                              borderRadius: "50%",
                              backgroundColor: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "24px",
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            {otherUser.photoURL ? (
                              <img src={otherUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              otherUser.name?.charAt(0)?.toUpperCase() || "👤"
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "18px", fontWeight: 500, color: "#000" }}>
                              {otherUser.name}
                            </div>
                            <div style={{ fontSize: "15px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {room.lastMessage ? (
                                <>{isLastMessageFromMe && "Anda: "}{room.lastMessage}</>
                              ) : (
                                "Belum ada pesan"
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                            {room.lastMessageTime && (
                              <span style={{ fontSize: "13px", color: "#bbb" }}>
                                {formatTime(room.lastMessageTime)}
                              </span>
                            )}
                            {room.unreadCount > 0 && (
                              <div
                                style={{
                                  backgroundColor: "#c5e800",
                                  color: "#000",
                                  borderRadius: "50%",
                                  minWidth: "28px",
                                  height: "28px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  padding: "0 10px",
                                }}
                              >
                                {room.unreadCount}
                              </div>
                            )}
                          </div>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ccc"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                          </svg>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Chat View
              <div style={{ display: "flex", flexDirection: "column", height: "500px" }}>
                {/* Chat Header */}
                <div
                  style={{
                    padding: "16px 22px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#333",
                      padding: "6px 10px",
                      borderRadius: "10px",
                      transition: "all .2s ease",
                      fontSize: "24px",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    ←
                  </button>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: "#e8e8e8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      overflow: "hidden",
                    }}
                  >
                    {selectedChat.photoURL ? (
                      <img src={selectedChat.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      selectedChat.name?.charAt(0)?.toUpperCase() || "👤"
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "20px", fontWeight: 500, color: "#000" }}>
                      {selectedChat.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#999" }}>{selectedChat.email}</div>
                  </div>
                </div>

                {/* Messages - Full Width */}
                <div
                  style={{
                    flex: 1,
                    padding: "24px 28px",
                    overflowY: "auto",
                    backgroundColor: "#000000",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#555",
                        fontSize: "16px",
                        marginTop: "100px",
                      }}
                    >
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
                      <div style={{ color: "#888", fontSize: "20px", fontWeight: 500 }}>Belum ada pesan</div>
                      <div style={{ fontSize: "16px", marginTop: "8px", color: "#666" }}>
                        Kirim pesan pertama
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?.uid;
                      const status = getMessageStatus(msg);
                      const showDate = idx === 0 || !messages[idx-1]?.timestamp || 
                        formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                      return (
                        <React.Fragment key={idx}>
                          {showDate && (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#444",
                                fontSize: "13px",
                                padding: "14px 0",
                                fontWeight: 500,
                                letterSpacing: "0.05em",
                              }}
                            >
                              {formatDate(msg.timestamp)}
                            </div>
                          )}
                          <div
                            style={{
                              alignSelf: isMine ? "flex-end" : "flex-start",
                              maxWidth: "78%",
                              padding: "14px 20px",
                              borderRadius: isMine ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
                              backgroundColor: isMine ? "#c5e800" : "#2a2a2a",
                              color: isMine ? "#000" : "#fff",
                              fontSize: "17px",
                              lineHeight: 1.6,
                            }}
                          >
                            {msg.text}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "6px",
                                justifyContent: isMine ? "flex-end" : "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "#666",
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              {isMine && status && (
                                <span
                                  style={{
                                    fontSize: "14px",
                                    color: status.color,
                                  }}
                                >
                                  {status.icon}
                                </span>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input - Large */}
                <div
                  style={{
                    padding: "16px 20px 20px",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    gap: "14px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "14px 22px",
                      border: "2px solid #e8e8e8",
                      borderRadius: "60px",
                      fontSize: "17px",
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
                      padding: "14px 28px",
                      borderRadius: "60px",
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "#000",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#b0d000";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#c5e800";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <span>Kirim</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Button - Large */}
        <button
          onClick={handleChatToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            backgroundColor: isChatOpen ? "transparent" : "#000",
            padding: isChatOpen ? "0" : "18px 36px",
            borderRadius: "60px",
            border: "none",
            cursor: "pointer",
            transition: "all .4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: isChatOpen ? "none" : "0 12px 40px rgba(0,0,0,0.15)",
            userSelect: "none",
            fontFamily: "Inter, 'Inter Fallback'",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
            }
          }}
        >
          {!isChatOpen && (
            <>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {user ? "Chat with Menuru" : "Login to Chat"}
              </span>
              {totalUnread > 0 && (
                <span
                  style={{
                    backgroundColor: "#c5e800",
                    color: "#000",
                    borderRadius: "50%",
                    minWidth: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    padding: "0 10px",
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
