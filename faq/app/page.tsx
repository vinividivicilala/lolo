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
  updateDoc,
  onDisconnect
} from "firebase/firestore";

// Firebase Config
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
  isOfficial?: boolean;
  online?: boolean;
  lastSeen?: any;
  typing?: boolean;
  bio?: string;
  note?: string;
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
  pinnedAt?: any;
  replyTo?: string;
  replyToText?: string;
  replyToSender?: string;
  sharedFrom?: string;
  sharedFromName?: string;
  isShared?: boolean;
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

// SVG Icons
const PinIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12 2L15 9H21L16 14L18 21L12 17L6 21L8 14L3 9H9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={filled ? "currentColor" : "none"} />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AddUserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const PinDropdownIcon = ({ isOpen = false }: { isOpen?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M3 10L10 3V7C15 7 19 9 21 13C19 11 15 10 10 10V14L3 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8.5 10.5L15.5 6.5M8.5 13.5L15.5 17.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddNoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Instagram Verified Badge
const InstagramVerifiedBadge = ({ size = 16 }: { size?: number }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          marginLeft: "4px",
          display: "inline-block",
          verticalAlign: "-2px",
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <path
          fill="#0095F6"
          d="
            M12 2.2
            C13.6 3.8 16.2 3.8 17.8 2.2
            C18.6 3.8 20.2 5.4 21.8 6.2
            C20.2 7.8 20.2 10.4 21.8 12
            C20.2 13.6 20.2 16.2 21.8 17.8
            C20.2 18.6 18.6 20.2 17.8 21.8
            C16.2 20.2 13.6 20.2 12 21.8
            C10.4 20.2 7.8 20.2 6.2 21.8
            C5.4 20.2 3.8 18.6 2.2 17.8
            C3.8 16.2 3.8 13.6 2.2 12
            C3.8 10.4 3.8 7.8 2.2 6.2
            C3.8 5.4 5.4 3.8 6.2 2.2
            C7.8 3.8 10.4 3.8 12 2.2
            Z
          "
        />
        <path
          d="M9.2 12.3l2 2 4.6-4.6"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 100,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          Akun Resmi
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            border: "6px solid transparent",
            borderTopColor: "#1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
};

// Online Status Indicator
const OnlineIndicator = ({ online, lastSeen }: { online: boolean; lastSeen?: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span 
        style={{ 
          display: "inline-block",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: online ? "#4ade80" : "#666",
          boxShadow: online ? "0 0 12px rgba(74, 222, 128, 0.6)" : "none",
          flexShrink: 0,
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 100,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {online ? "Online" : (lastSeen || "Offline")}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            border: "6px solid transparent",
            borderTopColor: "#1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
};

// Read Status
const ReadStatus = ({ msg, isMine }: { msg: Message; isMine: boolean }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!isMine) return null;
  
  const status = (() => {
    if (msg.senderId !== auth?.currentUser?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#0095f6", label: "Dibaca" };
    }
    return { icon: "✓", color: "#999", label: "Terkirim" };
  })();
  
  if (!status) return null;
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span 
        style={{
          fontSize: "11px",
          color: status.color,
          fontWeight: status.label === "Dibaca" ? 700 : 400,
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {status.icon}
      </span>
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          right: 0,
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 100,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {status.label}
          <div style={{
            position: "absolute",
            top: "100%",
            right: "10px",
            border: "6px solid transparent",
            borderTopColor: "#1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
};

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
  const [selectedNewUser, setSelectedNewUser] = useState("");
  const [addUserStatus, setAddUserStatus] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState<Message | null>(null);
  const [selectedShareUser, setSelectedShareUser] = useState("");
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<ChatUser | null>(null);
  const [editBio, setEditBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [editNote, setEditNote] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [officialMessagesSent, setOfficialMessagesSent] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENURU_OFFICIAL: ChatUser = {
    id: "official_menuru",
    name: "Menuru Official",
    email: "official@menuru.com",
    photoURL: "",
    isOfficial: true,
    isPinned: false,
    bio: "Akun resmi Menuru Chat. Dikelola oleh tim Menuru.",
    note: ""
  };

  const OFFICIAL_MESSAGES = [
    {
      text: "Halo! Selamat datang di Menuru Chat 👋",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Kami sedang melakukan perbaikan fitur chat. Mohon bersabar ya! 🙏",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Fitur pin message dan riwayat chat akan segera ditingkatkan ✨",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Terima kasih atas pengertiannya! 😊",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    }
  ];

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
          
          const googlePhotoURL = currentUser.photoURL || "";
          const googleName = currentUser.displayName || currentUser.email || "";
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              name: googleName,
              email: currentUser.email || "",
              photoURL: googlePhotoURL,
              createdAt: serverTimestamp(),
              isPinned: false,
              isOfficial: false,
              online: true,
              lastSeen: serverTimestamp(),
              typing: false,
              bio: "",
              note: ""
            });
            
            if (googlePhotoURL && currentUser.photoURL !== googlePhotoURL) {
              await updateProfile(currentUser, {
                photoURL: googlePhotoURL,
                displayName: googleName
              });
            }
          } else {
            const userData = userSnap.data();
            const currentPhotoURL = userData?.photoURL || "";
            
            if (googlePhotoURL && currentPhotoURL !== googlePhotoURL) {
              await updateDoc(userRef, {
                photoURL: googlePhotoURL,
                name: googleName,
                lastSeen: serverTimestamp()
              });
            }
            
            await updateDoc(userRef, {
              online: true,
              lastSeen: serverTimestamp()
            });
            
            try {
              const disconnectRef = doc(db, "users", currentUser.uid);
              await onDisconnect(disconnectRef).update({
                online: false,
                lastSeen: serverTimestamp(),
                typing: false
              });
            } catch (err) {
              console.log("Disconnect handler not available, skipping");
            }
          }
          
          const updatedSnap = await getDoc(userRef);
          const updatedData = updatedSnap.data();
          if (updatedData) {
            setUser((prev: any) => ({
              ...prev,
              photoURL: updatedData.photoURL || prev.photoURL || "",
              displayName: updatedData.name || prev.displayName || prev.email,
              bio: updatedData.bio || "",
              note: updatedData.note || ""
            }));
          }
          
          await checkAndSendOfficialMessages(currentUser.uid);
          
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const checkAndSendOfficialMessages = async (userId: string) => {
    if (!db || officialMessagesSent) return;
    
    try {
      const chatId = [userId, MENURU_OFFICIAL.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [userId, MENURU_OFFICIAL.id],
          createdAt: serverTimestamp(),
          isPinned: false
        });
        
        const messagesRef = collection(db, "chats", chatId, "messages");
        for (const msg of OFFICIAL_MESSAGES) {
          await addDoc(messagesRef, {
            text: msg.text,
            senderId: msg.senderId,
            senderName: msg.senderName,
            receiverId: userId,
            timestamp: serverTimestamp(),
            read: false,
            isPinned: false,
            pinnedAt: null,
            replyTo: null,
            replyToText: null,
            replyToSender: null,
            isShared: false
          });
        }
        
        setOfficialMessagesSent(true);
      } else {
        setOfficialMessagesSent(true);
      }
    } catch (error) {
      console.error("Error sending official messages:", error);
    }
  };

  // Load users
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
              const data = doc.data();
              userList.push({ 
                id: doc.id, 
                ...data,
                online: data.online || false,
                lastSeen: data.lastSeen || null,
                typing: data.typing || false,
                bio: data.bio || "",
                note: data.note || "",
                photoURL: data.photoURL || ""
              } as ChatUser);
            }
          });
          
          const selfUser: ChatUser = {
            id: user.uid,
            name: user.displayName || user.email || "Saya",
            email: user.email || "",
            photoURL: user.photoURL || "",
            isPinned: false,
            isOfficial: false,
            online: true,
            lastSeen: null,
            typing: false,
            bio: user.bio || "",
            note: user.note || ""
          };
          
          const selfExists = userList.some(u => u.id === user.uid);
          if (!selfExists) {
            userList.push(selfUser);
          } else {
            const index = userList.findIndex(u => u.id === user.uid);
            if (index !== -1) {
              userList[index] = {
                ...userList[index],
                photoURL: user.photoURL || userList[index].photoURL || "",
                name: user.displayName || userList[index].name || "",
                bio: user.bio || userList[index].bio || "",
                note: user.note || userList[index].note || ""
              };
            }
          }
          
          const officialExists = userList.some(u => u.id === MENURU_OFFICIAL.id);
          if (!officialExists) {
            userList.push({ ...MENURU_OFFICIAL, online: true, typing: false });
          }
          
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

  // Load messages
  useEffect(() => {
    if (!selectedChat || !user || !db) return;

    const chatId = [user.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messageList: Message[] = [];
      const pinnedList: Message[] = [];
      
      snapshot.forEach((doc) => {
        const msg = { id: doc.id, ...doc.data() } as Message;
        messageList.push(msg);
        if (msg.isPinned) {
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
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        online: false,
        lastSeen: serverTimestamp(),
        typing: false
      });
      
      await signOut(auth);
      setIsChatOpen(false);
      setSelectedChat(null);
      setChatRooms([]);
      setTotalUnread(0);
      setOfficialMessagesSent(false);
      setShowProfile(false);
      setProfileUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChatToggle = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setSelectedChat(null);
      setShowAddUser(false);
      setReplyTo(null);
      setShowProfile(false);
      setProfileUser(null);
    }
  };

  // Handle typing
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!selectedChat || !user || !db) return;
    
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      typing: value.length > 0
    });
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const newTimeout = setTimeout(async () => {
      const userRef2 = doc(db, "users", user.uid);
      await updateDoc(userRef2, {
        typing: false
      });
    }, 2000);
    
    setTypingTimeout(newTimeout);
  };

  // Handle open profile
  const handleOpenProfile = (chatUser: ChatUser) => {
    setProfileUser(chatUser);
    setShowProfile(true);
    setBioInput(chatUser.bio || "");
    setNoteInput(chatUser.note || "");
    setEditBio(false);
    setEditNote(false);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setProfileUser(null);
    setEditBio(false);
    setEditNote(false);
  };

  // Handle save bio
  const handleSaveBio = async () => {
    if (!profileUser || !db) return;
    try {
      const userRef = doc(db, "users", profileUser.id);
      await updateDoc(userRef, {
        bio: bioInput
      });
      setProfileUser({ ...profileUser, bio: bioInput });
      setEditBio(false);
      
      setUsers(prev => prev.map(u => {
        if (u.id === profileUser.id) {
          return { ...u, bio: bioInput };
        }
        return u;
      }));
      
      if (profileUser.id === user.uid) {
        setUser((prev: any) => ({
          ...prev,
          bio: bioInput
        }));
      }
    } catch (error) {
      console.error("Error saving bio:", error);
    }
  };

  // Handle save note
  const handleSaveNote = async () => {
    if (!profileUser || !db) return;
    try {
      const userRef = doc(db, "users", profileUser.id);
      await updateDoc(userRef, {
        note: noteInput
      });
      setProfileUser({ ...profileUser, note: noteInput });
      setEditNote(false);
      
      setUsers(prev => prev.map(u => {
        if (u.id === profileUser.id) {
          return { ...u, note: noteInput };
        }
        return u;
      }));
      
      if (profileUser.id === user.uid) {
        setUser((prev: any) => ({
          ...prev,
          note: noteInput
        }));
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedChat || !user || !message.trim() || !db) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { typing: false });
      
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
      const msgData: any = {
        text: message.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: selectedChat.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: false
      };
      
      if (replyTo) {
        msgData.replyTo = replyTo.id;
        msgData.replyToText = replyTo.text;
        msgData.replyToSender = replyTo.senderName;
      }
      
      await addDoc(messagesRef, msgData);

      setMessage("");
      setReplyTo(null);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Share message
  const handleShareMessage = async () => {
    if (!shareMessage || !selectedShareUser || !user || !db) return;
    
    try {
      const targetUser = users.find(u => u.id === selectedShareUser);
      if (!targetUser) return;
      
      const chatId = [user.uid, targetUser.id].sort().join("_");
      
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetUser.id],
          createdAt: serverTimestamp(),
          isPinned: false
        });
      }
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: `Diteruskan dari ${shareMessage.senderName}: ${shareMessage.text}`,
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: targetUser.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: true,
        sharedFrom: shareMessage.senderId,
        sharedFromName: shareMessage.senderName
      });
      
      setShowShareModal(false);
      setShareMessage(null);
      setSelectedShareUser("");
    } catch (error) {
      console.error("Error sharing message:", error);
    }
  };

  // Pin/Unpin message
  const handlePinMessage = async (chatId: string, messageId: string, currentPinned: boolean) => {
    if (!db) return;
    try {
      const msgRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(msgRef, {
        isPinned: !currentPinned,
        pinnedAt: !currentPinned ? serverTimestamp() : null
      });
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  // Resend message
  const handleResendMessage = async (msg: Message) => {
    if (!selectedChat || !user || !db) return;
    
    try {
      const chatId = [user.uid, selectedChat.id].sort().join("_");
      const messagesRef = collection(db, "chats", chatId, "messages");
      
      await addDoc(messagesRef, {
        text: msg.text,
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: selectedChat.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: false,
        replyTo: null,
        replyToText: null,
        replyToSender: null
      });
      
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error resending message:", error);
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

  // Add existing user to chat
  const handleAddExistingUser = async () => {
    if (!selectedNewUser || !user || !db) return;
    
    try {
      const targetUser = users.find(u => u.id === selectedNewUser);
      if (!targetUser) {
        setAddUserStatus("User tidak ditemukan");
        return;
      }
      
      const chatId = [user.uid, targetUser.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetUser.id],
          createdAt: serverTimestamp(),
          isPinned: false
        });
        setAddUserStatus(`✅ Chat dengan ${targetUser.name} berhasil dibuat!`);
      } else {
        setAddUserStatus(`ℹ️ Chat dengan ${targetUser.name} sudah ada.`);
      }
      
      setSelectedNewUser("");
      setShowAddUser(false);
      
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const getOnlineStatus = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser) return false;
    if (chatUser.id === user?.uid) return true;
    return chatUser.online || false;
  };

  const getLastSeen = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser || !chatUser.lastSeen) return "";
    if (chatUser.id === user?.uid) return "Online";
    const date = chatUser.lastSeen.toDate ? chatUser.lastSeen.toDate() : new Date(chatUser.lastSeen);
    return `Terakhir online ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTypingStatus = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser) return false;
    if (chatUser.id === user?.uid) return false;
    return chatUser.typing || false;
  };

  const pinnedUsers = users.filter(u => u.isPinned);
  const pinnedChats = chatRooms.filter(r => r.isPinned);
  const unpinnedChats = chatRooms.filter(r => !r.isPinned);
  const availableUsers = users.filter(u => 
    u.id !== user?.uid && !chatRooms.some(room => room.participants.includes(u.id))
  );

  // Close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div style={{ fontSize: "18px", color: "#000" }}>Loading...</div>
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
        fontFamily: "Inter, 'Inter Fallback'",
        overflow: "hidden",
      }}
    >
      {/* Logo - Kiri Atas */}
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

      {/* Teks "menuru" besar */}
      <div
        style={{
          position: "absolute",
          top: "120px",
          right: "-80px",
          zIndex: 1,
          fontSize: "300px",
          fontWeight: 400,
          color: "#000",
          letterSpacing: "-0.02em",
          lineHeight: 0.9,
          fontFamily: "Inter, 'Inter Fallback'",
          userSelect: "none",
          pointerEvents: "none",
          textAlign: "right",
          textTransform: "lowercase",
          whiteSpace: "nowrap",
        }}
      >
        menuru
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
                  borderRadius: "8px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                onClick={() => {
                  const selfUser = users.find(u => u.id === user.uid);
                  if (selfUser) handleOpenProfile(selfUser);
                }}
              />
            )}
            <span 
              style={{ 
                fontWeight: 500, 
                color: "#000",
                cursor: "pointer",
              }}
              onClick={() => {
                const selfUser = users.find(u => u.id === user.uid);
                if (selfUser) handleOpenProfile(selfUser);
              }}
            >
              {user.displayName || user.email}
            </span>
            <OnlineIndicator online={true} />
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#000",
                cursor: "pointer",
                fontSize: "14px",
                padding: "4px 12px",
                borderRadius: "20px",
                transition: "all .2s ease",
                fontFamily: "Inter, 'Inter Fallback'",
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
              color: "#000",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: "20px",
              transition: "all .2s ease",
              fontFamily: "Inter, 'Inter Fallback'",
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
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#000", marginBottom: "20px", fontFamily: "Inter, 'Inter Fallback'" }}>
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
                color: "#000",
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
                color: "#000",
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
                fontFamily: "Inter, 'Inter Fallback'",
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
                fontFamily: "Inter, 'Inter Fallback'",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Login with Google
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareMessage && (
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
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "12px", fontFamily: "Inter, 'Inter Fallback'" }}>
              Teruskan Pesan
            </h3>
            <div style={{ 
              fontSize: "13px", 
              color: "#666", 
              marginBottom: "16px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px"
            }}>
              <div style={{ fontWeight: 500, color: "#000" }}>Dari: {shareMessage.senderName}</div>
              <div>{shareMessage.text}</div>
            </div>
            <select
              value={selectedShareUser}
              onChange={(e) => setSelectedShareUser(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
                fontFamily: "Inter, 'Inter Fallback'",
                marginBottom: "12px",
                backgroundColor: "#fff",
                color: "#000",
              }}
            >
              <option value="">Pilih user...</option>
              {users.filter(u => u.id !== user.uid && u.id !== shareMessage.senderId).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.isOfficial && <InstagramVerifiedBadge size={14} />}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleShareMessage}
                disabled={!selectedShareUser}
                style={{
                  backgroundColor: selectedShareUser ? "#000" : "#ccc",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: selectedShareUser ? "pointer" : "not-allowed",
                  fontWeight: 500,
                  flex: 1,
                  transition: "all .2s ease",
                  fontFamily: "Inter, 'Inter Fallback'",
                }}
              >
                Teruskan
              </button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareMessage(null);
                  setSelectedShareUser("");
                }}
                style={{
                  background: "none",
                  border: "1px solid #ddd",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#666",
                  cursor: "pointer",
                  fontFamily: "Inter, 'Inter Fallback'",
                }}
              >
                Batal
              </button>
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
        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              width: "620px",
              maxHeight: "760px",
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
                  {showProfile ? "Profil" : (selectedChat ? selectedChat.name : "Pesan")}
                </span>
                {!showProfile && selectedChat && (
                  <>
                    <span style={{ fontSize: "10px", color: "#999" }}>
                      {selectedChat.email}
                    </span>
                    <OnlineIndicator 
                      online={getOnlineStatus(selectedChat.id)} 
                      lastSeen={getLastSeen(selectedChat.id)}
                    />
                  </>
                )}
                {!showProfile && !selectedChat && totalUnread > 0 && (
                  <span
                    style={{
                      backgroundColor: "#c5e800",
                      color: "#000",
                      borderRadius: "50%",
                      padding: "2px 8px",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  if (showProfile) {
                    handleCloseProfile();
                  } else {
                    setIsChatOpen(false);
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  transition: "all .2s ease",
                  opacity: 0.6,
                  display: "flex",
                  alignItems: "center",
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
                <CloseIcon />
              </button>
            </div>

            {/* Content */}
            {showProfile && profileUser ? (
              // Profile View - Note dengan background hitam di atas FP
              <div style={{ padding: "28px 32px", overflowY: "auto", flex: 1, maxHeight: "640px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                  {/* Back Button */}
                  <button
                    onClick={handleCloseProfile}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontFamily: "Inter, 'Inter Fallback'",
                      marginBottom: "16px",
                      padding: "4px 0",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                  >
                    <BackIcon />
                    <span>Kembali</span>
                  </button>

                  {/* Note Section - Background hitam dengan border radius melengkung */}
                  <div style={{ width: "100%", marginBottom: "16px" }}>
                    <div style={{ 
                      backgroundColor: "#000000", 
                      borderRadius: "16px",
                      padding: "16px 20px",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#666", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          Catatan
                        </span>
                        {profileUser.id === user?.uid && (
                          <button
                            onClick={() => setEditNote(!editNote)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#666",
                              fontSize: "11px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            <EditIcon />
                            {profileUser.note ? "Edit" : "Tambah"}
                          </button>
                        )}
                      </div>

                      {editNote && profileUser.id === user?.uid ? (
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input
                            type="text"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Tulis catatan..."
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #333",
                              borderRadius: "10px",
                              color: "#ffffff",
                              fontSize: "14px",
                              outline: "none",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveNote();
                              }
                            }}
                          />
                          <button
                            onClick={handleSaveNote}
                            style={{
                              padding: "8px 20px",
                              backgroundColor: "#c5e800",
                              border: "none",
                              borderRadius: "10px",
                              color: "#000",
                              fontSize: "13px",
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "Inter, 'Inter Fallback'",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditNote(false)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "transparent",
                              border: "1px solid #333",
                              borderRadius: "10px",
                              color: "#666",
                              fontSize: "13px",
                              cursor: "pointer",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div style={{ 
                          padding: "10px 4px",
                          color: profileUser.note ? "#ffffff" : "#555",
                          fontSize: "14px",
                          lineHeight: 1.6,
                          minHeight: "40px",
                        }}>
                          {profileUser.note || "Belum ada catatan"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photo */}
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", width: "100%" }}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "12px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        overflow: "hidden",
                        border: "2px solid #000",
                        flexShrink: 0,
                        position: "relative",
                        marginTop: "-8px",
                      }}
                    >
                      {profileUser.photoURL ? (
                        <img src={profileUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: "#000" }}>{profileUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                      )}
                      {profileUser.isOfficial && (
                        <div style={{ position: "absolute", bottom: -4, right: -4 }}>
                          <InstagramVerifiedBadge size={20} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "20px", fontWeight: 600, color: "#000" }}>
                          {profileUser.name}
                        </span>
                        {profileUser.isOfficial && <InstagramVerifiedBadge size={16} />}
                      </div>
                      <span style={{ fontSize: "14px", color: "#999" }}>{profileUser.email}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                        <OnlineIndicator online={getOnlineStatus(profileUser.id)} />
                        <span style={{ fontSize: "13px", color: "#666" }}>
                          {getOnlineStatus(profileUser.id) ? "Online" : getLastSeen(profileUser.id)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio - di bawah FP */}
                  <div style={{ width: "100%", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "#999", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Bio
                      </span>
                      {profileUser.id === user?.uid && (
                        <button
                          onClick={() => setEditBio(!editBio)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#999",
                            fontSize: "11px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontFamily: "Inter, 'Inter Fallback'",
                          }}
                        >
                          <EditIcon />
                          {profileUser.bio ? "Edit" : "Tambah"}
                        </button>
                      )}
                    </div>
                    {editBio && profileUser.id === user?.uid ? (
                      <div>
                        <textarea
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          placeholder="Tulis bio..."
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            backgroundColor: "#f5f5f5",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            color: "#000",
                            fontSize: "14px",
                            outline: "none",
                            fontFamily: "Inter, 'Inter Fallback'",
                            resize: "vertical",
                          }}
                        />
                        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <button
                            onClick={handleSaveBio}
                            style={{
                              padding: "6px 18px",
                              backgroundColor: "#000",
                              border: "none",
                              borderRadius: "6px",
                              color: "#fff",
                              fontSize: "13px",
                              cursor: "pointer",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditBio(false)}
                            style={{
                              padding: "6px 18px",
                              backgroundColor: "transparent",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              color: "#999",
                              fontSize: "13px",
                              cursor: "pointer",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ 
                        padding: "10px 14px", 
                        backgroundColor: "#f8f8f8", 
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: profileUser.bio ? "#000" : "#ccc",
                        lineHeight: 1.6,
                      }}>
                        {profileUser.bio || "Belum ada bio"}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                    <button
                      onClick={() => {
                        handleCloseProfile();
                        setSelectedChat(profileUser);
                      }}
                      style={{
                        flex: 1,
                        padding: "12px",
                        backgroundColor: "#000",
                        border: "none",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "15px",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "Inter, 'Inter Fallback'",
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      Kirim Pesan
                    </button>
                    <button
                      onClick={() => handlePinUser(profileUser.id, profileUser.isPinned || false)}
                      style={{
                        padding: "12px 20px",
                        backgroundColor: "transparent",
                        border: "1px solid #e0e0e0",
                        borderRadius: "10px",
                        color: profileUser.isPinned ? "#000" : "#999",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "Inter, 'Inter Fallback'",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <PinIcon filled={profileUser.isPinned || false} />
                    </button>
                  </div>
                </div>
              </div>
            ) : !selectedChat ? (
              // Chat List View - sama seperti sebelumnya
              <div style={{ padding: "8px 12px", overflowY: "auto", flex: 1, maxHeight: "640px" }}>
                {/* Announcement */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <div style={{ fontSize: "24px" }}>📢</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#000" }}>
                      Pengumuman
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Fitur chat sedang dalam tahap pengembangan. 
                      Mohon maaf atas ketidaknyamanannya.
                    </div>
                  </div>
                </div>

                {/* Add User Button */}
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    backgroundColor: "#f8f8f8",
                    border: "1px dashed #ccc",
                    borderRadius: "12px",
                    cursor: "pointer",
                    width: "100%",
                    marginBottom: "12px",
                    transition: "all .2s ease",
                    color: "#000",
                    fontFamily: "Inter, 'Inter Fallback'",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                    e.currentTarget.style.borderColor = "#c5e800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f8f8";
                    e.currentTarget.style.borderColor = "#ccc";
                  }}
                >
                  <AddUserIcon />
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>Chat Baru</span>
                </button>

                {showAddUser && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8f8f8",
                      borderRadius: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#000", marginBottom: "12px", fontFamily: "Inter, 'Inter Fallback'" }}>
                      Pilih User untuk Chat
                    </div>
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
                        color: "#000",
                      }}
                    >
                      <option value="" style={{ color: "#000" }}>Pilih user...</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id} style={{ color: "#000" }}>
                          {u.name} {u.isOfficial && <InstagramVerifiedBadge size={14} />}
                          <OnlineIndicator online={u.online || false} />
                        </option>
                      ))}
                    </select>
                    {availableUsers.length === 0 && (
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                        Semua user sudah di-chat
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
                          fontFamily: "Inter, 'Inter Fallback'",
                        }}
                      >
                        Mulai Chat
                      </button>
                      <button
                        onClick={() => setShowAddUser(false)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "12px",
                          color: "#666",
                          cursor: "pointer",
                          fontFamily: "Inter, 'Inter Fallback'",
                        }}
                      >
                        Batal
                      </button>
                    </div>
                    {addUserStatus && (
                      <div style={{ fontSize: "12px", color: "#000", marginTop: "8px" }}>
                        {addUserStatus}
                      </div>
                    )}
                  </div>
                )}

                {/* Pinned Users */}
                {pinnedUsers.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      onClick={() => setShowPinnedUsers(!showPinnedUsers)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <PinIcon filled={true} />
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#000" }}>
                          User Pinned ({pinnedUsers.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedUsers} />
                    </div>
                    {showPinnedUsers && (
                      <div style={{ padding: "4px 0", marginTop: "4px" }}>
                        {pinnedUsers.map((u) => (
                          <div
                            key={u.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span style={{ color: "#000" }}>{u.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                              )}
                            </div>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                              <div>
                                <div 
                                  style={{ fontSize: "13px", fontWeight: 500, color: "#000", cursor: "pointer" }}
                                  onClick={() => handleOpenProfile(u)}
                                >
                                  {u.name}
                                  {u.isOfficial && <InstagramVerifiedBadge size={14} />}
                                </div>
                                <div style={{ fontSize: "10px", color: "#666" }}>
                                  {u.email}
                                </div>
                              </div>
                              <OnlineIndicator online={u.online || false} lastSeen={getLastSeen(u.id)} />
                            </div>
                            <button
                              onClick={() => handlePinUser(u.id, true)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#c5e800",
                                padding: "2px 4px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <PinIcon filled={true} />
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
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <PinIcon filled={true} />
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#000" }}>
                          Chat Pinned ({pinnedChats.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedChats} />
                    </div>
                    {showPinnedChats && (
                      <div style={{ padding: "4px 0", marginTop: "4px" }}>
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
                                gap: "12px",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                backgroundColor: "#fafafa",
                              }}
                            >
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "8px",
                                  backgroundColor: "#f0f0f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "16px",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                {otherUser.photoURL ? (
                                  <img src={otherUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <span style={{ color: "#000" }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                                )}
                              </div>
                              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                                <div>
                                  <div 
                                    style={{ fontSize: "13px", fontWeight: 500, color: "#000", cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenProfile(otherUser);
                                    }}
                                  >
                                    {otherUser.name}
                                    {otherUser.isOfficial && <InstagramVerifiedBadge size={14} />}
                                  </div>
                                  <div style={{ fontSize: "10px", color: "#666" }}>
                                    {room.lastMessage ? room.lastMessage.substring(0, 30) + (room.lastMessage.length > 30 ? "..." : "") : "Belum ada pesan"}
                                  </div>
                                </div>
                                <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} />
                              </div>
                              {room.unreadCount > 0 && (
                                <div
                                  style={{
                                    backgroundColor: "#c5e800",
                                    color: "#000",
                                    borderRadius: "50%",
                                    minWidth: "18px",
                                    height: "18px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    padding: "0 4px",
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
                                  padding: "2px 4px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <PinIcon filled={true} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Chat Rooms List */}
                <div style={{ padding: "4px 0" }}>
                  {unpinnedChats.length === 0 && pinnedChats.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#666",
                        fontSize: "13px",
                        padding: "40px 0",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
                      <div style={{ color: "#666" }}>Belum ada riwayat chat</div>
                      <div style={{ fontSize: "12px", marginTop: "4px", color: "#999" }}>
                        Mulai chat dengan user lain
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
                            gap: "12px",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            transition: "all .2s ease",
                            marginBottom: "2px",
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
                              width: "44px",
                              height: "44px",
                              borderRadius: "8px",
                              backgroundColor: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              flexShrink: 0,
                              overflow: "hidden",
                              position: "relative",
                            }}
                          >
                            {otherUser.photoURL ? (
                              <img 
                                src={otherUser.photoURL} 
                                alt="avatar" 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <span style={{ color: "#000" }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "15px", fontWeight: 500, color: "#000", display: "flex", alignItems: "center", gap: "4px" }}>
                              <span 
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenProfile(otherUser);
                                }}
                              >
                                {otherUser.name}
                              </span>
                              {otherUser.isOfficial && <InstagramVerifiedBadge size={14} />}
                              <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} />
                            </div>
                            <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                              <span style={{ fontSize: "10px", color: "#999" }}>
                                {formatTime(room.lastMessageTime)}
                              </span>
                            )}
                            <div style={{ display: "flex", gap: "4px" }}>
                              {room.unreadCount > 0 && (
                                <div
                                  style={{
                                    backgroundColor: "#c5e800",
                                    color: "#000",
                                    borderRadius: "50%",
                                    minWidth: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
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
                                  handlePinChat(room.id, room.isPinned || false);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: room.isPinned ? "#c5e800" : "#ccc",
                                  padding: "2px 4px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all .2s ease",
                                }}
                              >
                                <PinIcon filled={room.isPinned || false} />
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
              // Chat View - sama seperti sebelumnya
              <div style={{ display: "flex", flexDirection: "column", height: "580px" }}>
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
                    onClick={() => {
                      setSelectedChat(null);
                      setReplyTo(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#fff",
                      padding: "4px 6px",
                      borderRadius: "8px",
                      transition: "all .2s ease",
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center",
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
                    <BackIcon />
                  </button>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: "#2a2a2a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      overflow: "hidden",
                      color: "#fff",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenProfile(selectedChat)}
                  >
                    {selectedChat.photoURL ? (
                      <img 
                        src={selectedChat.photoURL} 
                        alt="avatar" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ color: "#fff" }}>{selectedChat.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <div 
                      style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                      onClick={() => handleOpenProfile(selectedChat)}
                    >
                      <span style={{ fontSize: "15px", fontWeight: 500, color: "#fff" }}>
                        {selectedChat.name}
                      </span>
                      {selectedChat.isOfficial && <InstagramVerifiedBadge size={14} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <OnlineIndicator 
                        online={getOnlineStatus(selectedChat.id)} 
                        lastSeen={getLastSeen(selectedChat.id)}
                      />
                      {getOnlineStatus(selectedChat.id) ? (
                        <span style={{ fontSize: "10px", color: "#999" }}>
                          {getTypingStatus(selectedChat.id) ? "sedang mengetik..." : "Online"}
                        </span>
                      ) : (
                        <span style={{ fontSize: "10px", color: "#999" }}>
                          {getLastSeen(selectedChat.id)}
                        </span>
                      )}
                      {getTypingStatus(selectedChat.id) && getOnlineStatus(selectedChat.id) && (
                        <span style={{ 
                          fontSize: "10px", 
                          color: "#4ade80",
                          animation: "pulse 1.5s ease-in-out infinite"
                        }}>
                          ●
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePinUser(selectedChat.id, selectedChat.isPinned || false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: selectedChat.isPinned ? "#c5e800" : "#666",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      transition: "all .2s ease",
                    }}
                  >
                    <PinIcon filled={selectedChat.isPinned || false} />
                  </button>
                </div>

                {/* Riwayat Pin Message */}
                {pinnedMessages.length > 0 && (
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#0a0a0a",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        color: "#999",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <PinIcon filled={true} />
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>
                          Pesan Pinned ({pinnedMessages.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedMessages} />
                    </div>
                    {showPinnedMessages && (
                      <div style={{ marginTop: "8px", maxHeight: "150px", overflowY: "auto" }}>
                        {pinnedMessages.map((msg) => {
                          const isMine = msg.senderId === user?.uid;
                          return (
                            <div
                              key={msg.id}
                              style={{
                                padding: "6px 10px",
                                marginBottom: "4px",
                                borderRadius: "6px",
                                backgroundColor: isMine ? "rgba(197,232,0,0.1)" : "rgba(255,255,255,0.05)",
                                fontSize: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <span style={{ color: "#666", fontSize: "10px" }}>
                                  {isMine ? "Anda: " : `${msg.senderName}: `}
                                </span>
                                <span style={{ color: "#fff" }}>
                                  {msg.text.length > 50 ? msg.text.substring(0, 50) + "..." : msg.text}
                                </span>
                              </div>
                              <span style={{ fontSize: "9px", color: "#555", marginLeft: "8px" }}>
                                {formatTime(msg.pinnedAt || msg.timestamp)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reply Indicator */}
                {replyTo && (
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#0a0a0a",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ReplyIcon />
                      <div>
                        <div style={{ fontSize: "11px", color: "#c5e800", fontWeight: 500 }}>
                          Membalas {replyTo.senderName === user.displayName ? "diri sendiri" : replyTo.senderName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          {replyTo.text.length > 40 ? replyTo.text.substring(0, 40) + "..." : replyTo.text}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    padding: "24px",
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
                        color: "#888",
                        fontSize: "14px",
                        marginTop: "60px",
                      }}
                    >
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
                      <div style={{ color: "#999" }}>Belum ada pesan</div>
                      <div style={{ fontSize: "12px", marginTop: "6px", color: "#666" }}>
                        Kirim pesan pertama
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?.uid;
                      const chatId = [user.uid, selectedChat.id].sort().join("_");
                      const showDate = idx === 0 || !messages[idx-1]?.timestamp || 
                        formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                      
                      return (
                        <React.Fragment key={idx}>
                          {showDate && (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#666",
                                fontSize: "11px",
                                padding: "8px 0 12px 0",
                                fontWeight: 400,
                                letterSpacing: "0.03em",
                              }}
                            >
                              {formatDate(msg.timestamp)}
                            </div>
                          )}
                          <div
                            style={{
                              alignSelf: isMine ? "flex-end" : "flex-start",
                              maxWidth: "85%",
                              padding: "14px 18px",
                              borderRadius: isMine ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                              backgroundColor: isMine ? "#c5e800" : "#0095f6",
                              color: isMine ? "#000" : "#ffffff",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              position: "relative",
                              border: msg.isPinned ? "2px solid #c5e800" : "none",
                              boxShadow: msg.isPinned ? "0 0 20px rgba(197,232,0,0.2)" : "none",
                            }}
                          >
                            {/* Shared indicator */}
                            {msg.isShared && msg.sharedFromName && (
                              <div
                                style={{
                                  fontSize: "11px",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)",
                                  marginBottom: "4px",
                                  fontStyle: "italic",
                                }}
                              >
                                Diteruskan dari {msg.sharedFromName}
                              </div>
                            )}
                            
                            {/* Reply preview */}
                            {msg.replyTo && msg.replyToText && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: isMine ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)",
                                  padding: "6px 10px",
                                  borderLeft: `3px solid ${isMine ? "#000" : "rgba(255,255,255,0.5)"}`,
                                  marginBottom: "8px",
                                  backgroundColor: isMine ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)",
                                  borderRadius: "4px",
                                }}
                              >
                                <span style={{ fontWeight: 600, color: isMine ? "#000" : "#c5e800" }}>
                                  {msg.replyToSender === user.displayName ? "Anda" : msg.replyToSender}:
                                </span>
                                <span style={{ color: isMine ? "#000" : "#fff" }}> {msg.replyToText}</span>
                              </div>
                            )}
                            
                            <span style={{ color: isMine ? "#000" : "#ffffff" }}>
                              {msg.text}
                            </span>
                            
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "8px",
                                justifyContent: isMine ? "flex-end" : "flex-start",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: isMine ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)",
                                  fontWeight: 400,
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              <ReadStatus msg={msg} isMine={isMine} />
                              <button
                                onClick={() => setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.5)",
                                  padding: "2px 6px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all .2s ease",
                                  borderRadius: "4px",
                                }}
                                title="More"
                              >
                                <MoreIcon />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {showMessageMenu === msg.id && (
                                <div
                                  ref={menuRef}
                                  style={{
                                    position: "absolute",
                                    bottom: "calc(100% + 8px)",
                                    right: isMine ? 0 : "auto",
                                    left: isMine ? "auto" : 0,
                                    backgroundColor: "#1a1a1a",
                                    borderRadius: "12px",
                                    padding: "4px",
                                    minWidth: "160px",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                                    zIndex: 50,
                                    border: "1px solid rgba(255,255,255,0.05)",
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      setReplyTo(msg);
                                      setShowMessageMenu(null);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      padding: "8px 14px",
                                      width: "100%",
                                      background: "none",
                                      border: "none",
                                      color: "#fff",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      borderRadius: "8px",
                                      transition: "all .2s ease",
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <ReplyIcon />
                                    <span>Balas</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleResendMessage(msg);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      padding: "8px 14px",
                                      width: "100%",
                                      background: "none",
                                      border: "none",
                                      color: "#fff",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      borderRadius: "8px",
                                      transition: "all .2s ease",
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <SendIcon />
                                    <span>Kirim Ulang</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShareMessage(msg);
                                      setShowShareModal(true);
                                      setShowMessageMenu(null);
                                    }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      padding: "8px 14px",
                                      width: "100%",
                                      background: "none",
                                      border: "none",
                                      color: "#fff",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      borderRadius: "8px",
                                      transition: "all .2s ease",
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <ShareIcon />
                                    <span>Teruskan</span>
                                  </button>
                                  <button
                                    onClick={() => handlePinMessage(chatId, msg.id, msg.isPinned || false)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      padding: "8px 14px",
                                      width: "100%",
                                      background: "none",
                                      border: "none",
                                      color: msg.isPinned ? "#c5e800" : "#fff",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      borderRadius: "8px",
                                      transition: "all .2s ease",
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <PinIcon filled={msg.isPinned || false} />
                                    <span>{msg.isPinned ? "Unpin" : "Pin"}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {msg.isPinned && (
                            <div
                              style={{
                                alignSelf: isMine ? "flex-end" : "flex-start",
                                fontSize: "10px",
                                color: "#c5e800",
                                marginTop: "-2px",
                                marginBottom: "6px",
                                padding: "0 6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                              }}
                            >
                              <PinIcon filled={true} />
                              <span style={{ color: "#c5e800" }}>Pinned • {formatTime(msg.pinnedAt || msg.timestamp)}</span>
                            </div>
                          )}
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
                    placeholder={replyTo ? "Ketik balasan..." : "Ketik pesan..."}
                    value={message}
                    onChange={handleTyping}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 18px",
                      border: replyTo ? "2px solid #c5e800" : "1px solid #e8e8e8",
                      borderRadius: "60px",
                      fontSize: "15px",
                      outline: "none",
                      fontFamily: "Inter, 'Inter Fallback'",
                      transition: "all .2s ease",
                      backgroundColor: "#f5f5f5",
                      color: "#000",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#c5e800";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = replyTo ? "#c5e800" : "#e8e8e8";
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
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#000",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "Inter, 'Inter Fallback'",
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
                    <SendIcon />
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
              {totalUnread > 0 && (
                <span
                  style={{
                    backgroundColor: "#c5e800",
                    color: "#000",
                    borderRadius: "50%",
                    minWidth: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "0 6px",
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </>
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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
