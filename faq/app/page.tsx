'use client';

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
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
  isPinned?: boolean;
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
  isPinned?: boolean;
  pinnedBy?: string;
  pinnedAt?: any;
}

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSenderId?: string;
  unreadCount: number;
  isPinned?: boolean;
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
  const [showPinnedUsers, setShowPinnedUsers] = useState(false);
  const [showPinnedChats, setShowPinnedChats] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [addUserStatus, setAddUserStatus] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
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
              createdAt: serverTimestamp(),
              isPinned: false
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
          userList.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
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
              unreadCount,
              isPinned: data.isPinned || false
            });
          }
        }
      }
      
      rooms.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
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

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user || !db) return;

    const chatId = [user.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messageList: Message[] = [];
      const pinnedList: Message[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Message;
        const msg = { id: doc.id, ...data };
        messageList.push(msg);
        if (data.isPinned) {
          pinnedList.push(msg);
        }
      });
      
      setMessages(messageList);
      setPinnedMessages(pinnedList);
      
      const unreadMessages = messageList.filter(m => !m.read && m.senderId !== user.uid);
      for (const msg of unreadMessages) {
        const msgRef = doc(db, "chats", chatId, "messages", msg.id);
        await updateDoc(msgRef, {
          read: true,
          readAt: serverTimestamp()
        });
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

  // Handle login
  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
      setLoginError("");
    } catch (error) {
      console.error("Login error:", error);
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
      console.error("Login error:", error);
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
          createdAt: serverTimestamp(),
          isPinned: false
        });
      }
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: message.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: selectedChat.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedBy: null,
        pinnedAt: null
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

  // Pin/Unpin message
  const handlePinMessage = async (chatId: string, messageId: string, currentPinned: boolean) => {
    if (!db || !user) return;
    try {
      const msgRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(msgRef, {
        isPinned: !currentPinned,
        pinnedBy: !currentPinned ? user.uid : null,
        pinnedAt: !currentPinned ? serverTimestamp() : null
      });
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return { 
            ...msg, 
            isPinned: !currentPinned,
            pinnedBy: !currentPinned ? user.uid : null,
            pinnedAt: !currentPinned ? new Date() : null
          };
        }
        return msg;
      }));
      
      if (!currentPinned) {
        const pinnedMsg = messages.find(m => m.id === messageId);
        if (pinnedMsg) {
          setPinnedMessages(prev => [...prev, { ...pinnedMsg, isPinned: true, pinnedBy: user.uid }]);
        }
      } else {
        setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  // Pin/Unpin chat room
  const handlePinChat = async (chatId: string, currentPinned: boolean) => {
    if (!db) return;
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        isPinned: !currentPinned
      });
      
      setChatRooms(prev => prev.map(room => {
        if (room.id === chatId) {
          return { ...room, isPinned: !currentPinned };
        }
        return room;
      }));
    } catch (error) {
      console.error("Error pinning chat:", error);
    }
  };

  // Pin/Unpin user
  const handlePinUser = async (userId: string, currentPinned: boolean) => {
    if (!db) return;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isPinned: !currentPinned
      });
      
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, isPinned: !currentPinned };
        }
        return u;
      }));
    } catch (error) {
      console.error("Error pinning user:", error);
    }
  };

  // Add existing user by email
  const handleAddExistingUser = async () => {
    if (!searchEmail.trim() || !user || !db) return;
    
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchEmail.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setAddUserStatus("❌ Email tidak ditemukan. Pastikan user sudah pernah login.");
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
          createdAt: serverTimestamp(),
          isPinned: false
        });
        setAddUserStatus(`✅ Chat dengan ${userData.name || userData.email} berhasil dibuat!`);
      } else {
        setAddUserStatus(`ℹ️ Chat dengan ${userData.name || userData.email} sudah ada.`);
      }
      
      setSearchEmail("");
      setShowAddUser(false);
      setTimeout(() => setAddUserStatus(""), 3000);
      
    } catch (error) {
      console.error("Error adding user:", error);
      setAddUserStatus("❌ Gagal menambahkan user.");
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
    }
  };

  // Format time
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
      return { icon: "✓✓", color: "#0095f6", label: "Dibaca" };
    }
    return { icon: "✓", color: "#999", label: "Terkirim" };
  };

  const pinnedUsers = users.filter(u => u.isPinned);
  const pinnedChats = chatRooms.filter(r => r.isPinned);
  const unpinnedChats = chatRooms.filter(r => !r.isPinned);

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
        <div style={{ fontSize: "20px", color: "#666" }}>Loading...</div>
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
            <span style={{ fontWeight: 500, fontSize: "14px" }}>{user.displayName || user.email}</span>
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
            {loginError && (
              <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>
                {loginError}
              </div>
            )}
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
        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              width: "440px",
              maxHeight: "600px",
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
                padding: "20px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#000",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {selectedChat ? selectedChat.name : "Pesan"}
                </span>
                {selectedChat && (
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    {selectedChat.email}
                  </span>
                )}
                {!selectedChat && totalUnread > 0 && (
                  <span
                    style={{
                      backgroundColor: "#c5e800",
                      color: "#000",
                      borderRadius: "50%",
                      padding: "2px 10px",
                      fontSize: "12px",
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
                  padding: "4px 10px",
                  borderRadius: "8px",
                  transition: "all .2s ease",
                  opacity: 0.6,
                  display: "flex",
                  alignItems: "center",
                  fontSize: "20px",
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
              <div style={{ padding: "12px 16px", overflowY: "auto", flex: 1 }}>
                {/* Add User by Email */}
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "16px" }}>➕</span>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#000" }}>
                      Chat dengan User Terdaftar
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="email"
                      placeholder="Masukkan email user..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddExistingUser()}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "15px",
                        outline: "none",
                        fontFamily: "Inter, 'Inter Fallback'",
                        backgroundColor: "#ffffff",
                      }}
                    />
                    <button
                      onClick={handleAddExistingUser}
                      disabled={!searchEmail.trim()}
                      style={{
                        backgroundColor: searchEmail.trim() ? "#c5e800" : "#ccc",
                        color: searchEmail.trim() ? "#000" : "#666",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: "10px",
                        fontSize: "15px",
                        cursor: searchEmail.trim() ? "pointer" : "not-allowed",
                        fontWeight: 600,
                        transition: "all .2s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Kirim
                    </button>
                  </div>
                  {addUserStatus && (
                    <div style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                      {addUserStatus}
                    </div>
                  )}
                </div>

                {/* Pinned Users */}
                {pinnedUsers.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      onClick={() => setShowPinnedUsers(!showPinnedUsers)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        cursor: "pointer",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>📌</span>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                          User Pinned ({pinnedUsers.length})
                        </span>
                      </div>
                      <span style={{ fontSize: "16px", transform: showPinnedUsers ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</span>
                    </div>
                    {showPinnedUsers && (
                      <div style={{ padding: "6px 0", marginTop: "6px" }}>
                        {pinnedUsers.map((user) => (
                          <div
                            key={user.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              backgroundColor: "rgba(197,232,0,0.08)",
                              borderLeft: "4px solid #c5e800",
                              marginBottom: "4px",
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                overflow: "hidden",
                              }}
                            >
                              {user.photoURL ? (
                                <img src={user.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                user.name?.charAt(0)?.toUpperCase() || "👤"
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "15px", fontWeight: 500, color: "#000" }}>{user.name}</div>
                              <div style={{ fontSize: "13px", color: "#999" }}>{user.email}</div>
                            </div>
                            <button
                              onClick={() => handlePinUser(user.id, true)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#c5e800",
                                padding: "4px 8px",
                                display: "flex",
                                alignItems: "center",
                                fontSize: "18px",
                              }}
                            >
                              📌
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pinned Chats */}
                {pinnedChats.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      onClick={() => setShowPinnedChats(!showPinnedChats)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        cursor: "pointer",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>📌</span>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                          Chat Pinned ({pinnedChats.length})
                        </span>
                      </div>
                      <span style={{ fontSize: "16px", transform: showPinnedChats ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>▼</span>
                    </div>
                    {showPinnedChats && (
                      <div style={{ padding: "6px 0", marginTop: "6px" }}>
                        {pinnedChats.map((room) => {
                          const otherId = room.participants.find(id => id !== user.uid);
                          const otherUser = users.find(u => u.id === otherId);
                          if (!otherUser) return null;
                          return (
                            <div
                              key={room.id}
                              onClick={() => setSelectedChat(otherUser)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                backgroundColor: "rgba(197,232,0,0.08)",
                                borderLeft: "4px solid #c5e800",
                                marginBottom: "4px",
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  backgroundColor: "#f0f0f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "18px",
                                  overflow: "hidden",
                                }}
                              >
                                {otherUser.photoURL ? (
                                  <img src={otherUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  otherUser.name?.charAt(0)?.toUpperCase() || "👤"
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "15px", fontWeight: 500, color: "#000" }}>{otherUser.name}</div>
                                <div style={{ fontSize: "13px", color: "#999" }}>
                                  {room.lastMessage ? room.lastMessage.substring(0, 35) + (room.lastMessage.length > 35 ? "..." : "") : "Belum ada pesan"}
                                </div>
                              </div>
                              {room.unreadCount > 0 && (
                                <div
                                  style={{
                                    backgroundColor: "#c5e800",
                                    color: "#000",
                                    borderRadius: "50%",
                                    minWidth: "22px",
                                    height: "22px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    padding: "0 6px",
                                  }}
                                >
                                  {room.unreadCount}
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinChat(room.id, true);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#c5e800",
                                  padding: "4px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  fontSize: "18px",
                                }}
                              >
                                📌
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Unpinned Chats */}
                <div style={{ padding: "4px 0" }}>
                  {unpinnedChats.length === 0 && pinnedChats.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        fontSize: "15px",
                        padding: "50px 0",
                      }}
                    >
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>💬</div>
                      <div style={{ fontSize: "16px", fontWeight: 500 }}>Belum ada riwayat chat</div>
                      <div style={{ fontSize: "14px", marginTop: "6px", color: "#ccc" }}>
                        Cari email user untuk memulai chat
                      </div>
                    </div>
                  ) : (
                    unpinnedChats.map((room) => {
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
                            gap: "14px",
                            padding: "12px 16px",
                            borderRadius: "12px",
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
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              backgroundColor: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "20px",
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            {otherUser.photoURL ? (
                              <img 
                                src={otherUser.photoURL} 
                                alt="avatar" 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              otherUser.name?.charAt(0)?.toUpperCase() || "👤"
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "16px", fontWeight: 500, color: "#000" }}>
                              {otherUser.name}
                            </div>
                            <div style={{ fontSize: "14px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {room.lastMessage ? (
                                <>
                                  {isLastMessageFromMe && "Anda: "}
                                  {room.lastMessage}
                                </>
                              ) : (
                                "Belum ada pesan"
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                            {room.lastMessageTime && (
                              <span style={{ fontSize: "12px", color: "#ccc" }}>
                                {formatTime(room.lastMessageTime)}
                              </span>
                            )}
                            <div style={{ display: "flex", gap: "6px" }}>
                              {room.unreadCount > 0 && (
                                <div
                                  style={{
                                    backgroundColor: "#c5e800",
                                    color: "#000",
                                    borderRadius: "50%",
                                    minWidth: "24px",
                                    height: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    padding: "0 8px",
                                  }}
                                >
                                  {room.unreadCount}
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinChat(room.id, room.isPinned || false);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: room.isPinned ? "#c5e800" : "#ccc",
                                  padding: "4px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all .2s ease",
                                  fontSize: "18px",
                                }}
                              >
                                📌
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Chat View
              <div style={{ display: "flex", flexDirection: "column", height: "450px" }}>
                {/* Chat Header */}
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    backgroundColor: "#000",
                  }}
                >
                  <button
                    onClick={() => setSelectedChat(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      transition: "all .2s ease",
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center",
                      fontSize: "22px",
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
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#2a2a2a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
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
                    <div style={{ fontSize: "17px", fontWeight: 500, color: "#fff" }}>
                      {selectedChat.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {selectedChat.email}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePinUser(selectedChat.id, selectedChat.isPinned || false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: selectedChat.isPinned ? "#c5e800" : "#666",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      transition: "all .2s ease",
                      fontSize: "20px",
                    }}
                  >
                    📌
                  </button>
                </div>

                {/* Pinned Messages Section */}
                {pinnedMessages.length > 0 && (
                  <div
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "rgba(197,232,0,0.06)",
                      borderBottom: "1px solid rgba(197,232,0,0.15)",
                      maxHeight: "120px",
                      overflowY: "auto",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px" }}>📌</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#c5e800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Pinned Messages ({pinnedMessages.length})
                      </span>
                    </div>
                    {pinnedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 12px",
                          backgroundColor: "rgba(197,232,0,0.08)",
                          borderRadius: "8px",
                          marginBottom: "4px",
                          fontSize: "14px",
                          color: "#000",
                          borderLeft: "3px solid #c5e800",
                        }}
                      >
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14px" }}>
                          <strong>{msg.senderName}:</strong> {msg.text}
                        </span>
                        <button
                          onClick={() => {
                            const chatId = [user.uid, selectedChat.id].sort().join("_");
                            handlePinMessage(chatId, msg.id, true);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#c5e800",
                            padding: "2px 8px",
                            fontSize: "16px",
                          }}
                        >
                          📌
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    padding: "20px",
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
                        color: "#666",
                        fontSize: "15px",
                        marginTop: "80px",
                      }}
                    >
                      <div style={{ fontSize: "40px", marginBottom: "12px" }}>💬</div>
                      <div style={{ color: "#888", fontSize: "16px" }}>Belum ada pesan</div>
                      <div style={{ fontSize: "14px", marginTop: "6px", color: "#555" }}>
                        Kirim pesan pertama
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?.uid;
                      const status = getMessageStatus(msg);
                      const chatId = [user.uid, selectedChat.id].sort().join("_");
                      const showDate = idx === 0 || !messages[idx-1]?.timestamp || 
                        formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                      
                      return (
                        <React.Fragment key={idx}>
                          {showDate && (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#444",
                                fontSize: "12px",
                                padding: "10px 0",
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
                              maxWidth: "75%",
                              padding: "12px 18px",
                              borderRadius: isMine ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                              backgroundColor: isMine ? "#c5e800" : "#2a2a2a",
                              color: isMine ? "#000" : "#fff",
                              fontSize: "16px",
                              lineHeight: 1.5,
                              position: "relative",
                              border: msg.isPinned ? "2px solid #c5e800" : "none",
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
                                  fontSize: "11px",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "#666",
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              {isMine && status && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: status.color,
                                    fontWeight: status.label === "Dibaca" ? 700 : 400,
                                  }}
                                >
                                  {status.icon}
                                </span>
                              )}
                              <button
                                onClick={() => handlePinMessage(chatId, msg.id, msg.isPinned || false)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: msg.isPinned ? "#c5e800" : "#555",
                                  padding: "0 4px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all .2s ease",
                                  fontSize: "16px",
                                }}
                              >
                                📌
                              </button>
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
                    padding: "14px 18px 18px",
                    borderTop: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    gap: "12px",
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
                      padding: "12px 20px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "60px",
                      fontSize: "16px",
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
                      padding: "12px 24px",
                      borderRadius: "60px",
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#000",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" strokeLinecap="round" strokeLinejoin="round"/>
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
            gap: "12px",
            backgroundColor: isChatOpen ? "transparent" : "#000",
            padding: isChatOpen ? "0" : "16px 32px",
            borderRadius: "60px",
            border: "none",
            cursor: "pointer",
            transition: "all .4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: isChatOpen ? "none" : "0 8px 32px rgba(0,0,0,0.12)",
            userSelect: "none",
            fontFamily: "Inter, 'Inter Fallback'",
            position: "relative",
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
            <>
              <span
                style={{
                  fontSize: "18px",
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
                    minWidth: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "0 8px",
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
