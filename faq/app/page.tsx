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
import gsap from "gsap";

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

export default function HomePage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedNewUser, setSelectedNewUser] = useState<string>("");
  const [addUserStatus, setAddUserStatus] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

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

  // Load users from Firestore
  useEffect(() => {
    if (!db || !user) return;
    
    const loadUsers = async () => {
      try {
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
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, [user]);

  // Load messages for selected chat
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
      
      // Mark messages as read
      const unreadMessages = messageList.filter(m => !m.read && m.senderId !== user.uid);
      for (const msg of unreadMessages) {
        const msgRef = doc(db, "chats", chatId, "messages", msg.id);
        await updateDoc(msgRef, {
          read: true,
          readAt: serverTimestamp()
        });
      }
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  // Load chat users and unread counts
  useEffect(() => {
    if (!user || !db) return;
    
    const loadChatData = async () => {
      try {
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef);
        const querySnapshot = await getDocs(q);
        
        const userIds = new Set<string>();
        const unreadMap: {[key: string]: number} = {};
        
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          if (data.participants && data.participants.includes(user.uid)) {
            const otherId = data.participants.find((id: string) => id !== user.uid);
            if (otherId) {
              userIds.add(otherId);
              
              // Count unread messages
              const messagesRef = collection(db, "chats", docSnap.id, "messages");
              const qMsg = query(messagesRef, where("read", "==", false), where("senderId", "!=", user.uid));
              const msgSnap = await getDocs(qMsg);
              unreadMap[otherId] = msgSnap.size;
            }
          }
        }
        
        setUnreadCounts(unreadMap);
        const chatUserList = users.filter(u => userIds.has(u.id));
        setChatUsers(chatUserList);
      } catch (error) {
        console.error("Error loading chat data:", error);
      }
    };
    
    if (users.length > 0) {
      loadChatData();
    }
  }, [user, users]);

  // Handle login with Google
  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Handle login with email
  const handleEmailLogin = async () => {
    if (!auth || !loginEmail || !loginPassword) return;
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      console.error("Login error:", error);
      setAddUserStatus("Login gagal. Periksa email dan password.");
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setIsChatOpen(false);
      setSelectedChat(null);
      setChatUsers([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Send message
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
      setShowLogin(true);
      return;
    }
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setSelectedChat(null);
      setShowAddUser(false);
      setSelectedNewUser("");
    }
  };

  // Add existing user to chat
  const handleAddExistingUser = async () => {
    if (!selectedNewUser || !user || !db) return;
    
    try {
      const targetUser = users.find(u => u.id === selectedNewUser);
      if (!targetUser) {
        setAddUserStatus("User tidak ditemukan");
        return;
      }
      
      // Check if chat already exists
      const chatId = [user.uid, targetUser.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetUser.id],
          createdAt: serverTimestamp()
        });
        setAddUserStatus(`✅ Chat dengan ${targetUser.name} berhasil dibuat!`);
      } else {
        setAddUserStatus(`ℹ️ Chat dengan ${targetUser.name} sudah ada.`);
      }
      
      // Add to chat users list
      setChatUsers(prev => {
        if (!prev.find(u => u.id === targetUser.id)) {
          return [...prev, targetUser];
        }
        return prev;
      });
      
      setSelectedNewUser("");
      setShowAddUser(false);
      
      // GSAP animation
      if (addButtonRef.current) {
        gsap.fromTo(addButtonRef.current, 
          { scale: 1 },
          { scale: 1.1, duration: 0.3, ease: "power2.out" }
        );
      }
      
    } catch (error) {
      console.error("Error adding user:", error);
      setAddUserStatus("❌ Gagal menambahkan user.");
    }
  };

  // Format time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Get message status
  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== user?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#0095f6", label: "Dibaca" };
    }
    return { icon: "✓✓", color: "#999", label: "Terkirim" };
  };

  // Filter users for dropdown
  const availableUsers = users.filter(u => 
    !chatUsers.find(cu => cu.id === u.id) && 
    u.id !== user?.uid &&
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // GSAP animation for add button
  useEffect(() => {
    if (addButtonRef.current && showAddUser) {
      gsap.fromTo(addButtonRef.current,
        { rotation: 0 },
        { rotation: 45, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [showAddUser]);

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
            {user.photoURL && (
              <img 
                src={user.photoURL} 
                alt="avatar" 
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            )}
            <span style={{ fontWeight: 500 }}>{user.displayName || user.email}</span>
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
            onClick={() => setShowLogin(true)}
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
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>
              Login
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "14px",
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
                padding: "12px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
                outline: "none",
                fontFamily: "Inter, 'Inter Fallback'",
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
            />
            <button
              onClick={handleEmailLogin}
              style={{
                width: "100%",
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Login with Email
            </button>
            <div style={{ marginTop: "12px", textAlign: "center", fontSize: "14px", color: "#666" }}>
              atau
            </div>
            <button
              onClick={handleLogin}
              style={{
                width: "100%",
                backgroundColor: "#4285f4",
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                marginTop: "8px",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Login with Google
            </button>
            <div style={{ marginTop: "12px", textAlign: "center", fontSize: "12px", color: "#999" }}>
              {addUserStatus}
            </div>
          </div>
        </div>
      )}

      {/* Chat Box */}
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
              borderRadius: "20px",
              width: "420px",
              maxHeight: "560px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#000",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {selectedChat ? selectedChat.name : "Pesan"}
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {!selectedChat && user && (
                  <button
                    ref={addButtonRef}
                    onClick={() => setShowAddUser(!showAddUser)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "20px",
                      cursor: "pointer",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      transition: "all .2s ease",
                      fontWeight: 300,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    +
                  </button>
                )}
                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    transition: "all .2s ease",
                    lineHeight: 1,
                    opacity: 0.6,
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
            </div>

            {/* Content */}
            {!selectedChat ? (
              <div style={{ padding: "8px 12px", overflowY: "auto", flex: 1 }}>
                {/* Add User Form - Pilih user yang sudah ada */}
                {showAddUser && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8f8f8",
                      borderRadius: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#000", marginBottom: "12px" }}>
                      Tambah Chat Baru
                    </div>
                    <input
                      type="text"
                      placeholder="Cari user..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "13px",
                        outline: "none",
                        fontFamily: "Inter, 'Inter Fallback'",
                        marginBottom: "8px",
                      }}
                    />
                    <select
                      value={selectedNewUser}
                      onChange={(e) => setSelectedNewUser(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "13px",
                        outline: "none",
                        fontFamily: "Inter, 'Inter Fallback'",
                        marginBottom: "8px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <option value="">Pilih user...</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                    {availableUsers.length === 0 && (
                      <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
                        Semua user sudah di-chat atau belum terdaftar
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={handleAddExistingUser}
                        disabled={!selectedNewUser}
                        style={{
                          backgroundColor: selectedNewUser ? "#000" : "#ccc",
                          color: "#fff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          cursor: selectedNewUser ? "pointer" : "not-allowed",
                          fontWeight: 500,
                          transition: "all .2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedNewUser) e.currentTarget.style.opacity = "0.8";
                        }}
                        onMouseLeave={(e) => {
                          if (selectedNewUser) e.currentTarget.style.opacity = "1";
                        }}
                      >
                        Tambah Chat
                      </button>
                      <button
                        onClick={() => setShowAddUser(false)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "12px",
                          color: "#999",
                          cursor: "pointer",
                        }}
                      >
                        Batal
                      </button>
                    </div>
                    {addUserStatus && (
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                        {addUserStatus}
                      </div>
                    )}
                  </div>
                )}

                {/* Chat List */}
                <div style={{ padding: "4px 0" }}>
                  {chatUsers.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        fontSize: "13px",
                        padding: "40px 0",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
                      Belum ada chat
                      <div style={{ fontSize: "12px", marginTop: "4px", color: "#ccc" }}>
                        Tambah user untuk mulai chat
                      </div>
                    </div>
                  ) : (
                    chatUsers.map((account) => (
                      <div
                        key={account.id}
                        onClick={() => setSelectedChat(account)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all .2s ease",
                          marginBottom: "2px",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
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
                            fontSize: "18px",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}
                        >
                          {account.photoURL ? (
                            <img 
                              src={account.photoURL} 
                              alt="avatar" 
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            account.name?.charAt(0)?.toUpperCase() || "👤"
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "15px", fontWeight: 500, color: "#000" }}>
                            {account.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#999" }}>
                            {account.email}
                          </div>
                        </div>
                        {unreadCounts[account.id] > 0 && (
                          <div
                            style={{
                              backgroundColor: "#c5e800",
                              color: "#000",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {unreadCounts[account.id]}
                          </div>
                        )}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ color: "#ccc", flexShrink: 0 }}
                        >
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // Chat View
              <div style={{ display: "flex", flexDirection: "column", height: "420px" }}>
                {/* Chat Header */}
                <div
                  style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "#000",
                  }}
                >
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                      cursor: "pointer",
                      color: "#fff",
                      padding: "4px 6px",
                      borderRadius: "8px",
                      transition: "all .2s ease",
                      opacity: 0.6,
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
                    ←
                  </button>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#2a2a2a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      overflow: "hidden",
                      color: "#fff",
                    }}
                  >
                    {selectedChat.photoURL ? (
                      <img 
                        src={selectedChat.photoURL} 
                        alt="avatar" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      selectedChat.name?.charAt(0)?.toUpperCase() || "👤"
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: "#fff" }}>
                      {selectedChat.name}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666" }}>
                      {selectedChat.email}
                    </div>
                  </div>
                </div>

                {/* Messages - Background hitam */}
                <div
                  style={{
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto",
                    backgroundColor: "#000000",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#666",
                        fontSize: "13px",
                        marginTop: "60px",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
                      <div style={{ color: "#888" }}>Belum ada pesan</div>
                      <div style={{ fontSize: "11px", marginTop: "4px", color: "#555" }}>
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
                                fontSize: "10px",
                                padding: "8px 0",
                                fontWeight: 500,
                                letterSpacing: "0.03em",
                              }}
                            >
                              {formatDate(msg.timestamp)}
                            </div>
                          )}
                          <div
                            style={{
                              alignSelf: isMine ? "flex-end" : "flex-start",
                              maxWidth: "75%",
                              padding: "10px 14px",
                              borderRadius: isMine ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                              backgroundColor: isMine ? "#c5e800" : "#2a2a2a",
                              color: isMine ? "#000" : "#fff",
                              fontSize: "14px",
                              lineHeight: 1.5,
                              position: "relative",
                            }}
                          >
                            {msg.text}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "4px",
                                justifyContent: isMine ? "flex-end" : "flex-start",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "#666",
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              {isMine && status && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    color: status.color,
                                    fontWeight: status.label === "Dibaca" ? 700 : 400,
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
                      padding: "10px 16px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "60px",
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "Inter, 'Inter Fallback'",
                      transition: "all .2s ease",
                      backgroundColor: "#f5f5f5",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#000";
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
                      backgroundColor: "#000",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "60px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#fff",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1a1a1a";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#000";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <span>Kirim</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Button */}
        <button
          onClick={handleChatToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: isChatOpen ? "transparent" : "#000",
            padding: isChatOpen ? "0" : "14px 28px",
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
          {!isChatOpen && (
            <span
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {user ? "Chat with Menuru" : "Login to Chat"}
            </span>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
