'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  where,
  getDoc
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

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

// Instagram Verified Badge Component - Minimalist Design
const VerifiedBadge = ({ size = 14, email = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Cek apakah email adalah Gmail (otomatis untuk semua email @gmail.com)
  const isGmail = email.toLowerCase().includes('@gmail.com');
  
  if (!isGmail) return null;
  
  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        marginLeft: '4px',
        lineHeight: 1
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          verticalAlign: 'middle'
        }}
      >
        <circle cx="8" cy="8" r="7" fill="#1DA1F2" stroke="none" />
        <path 
          d="M5 8L7 10L11 6" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1a1a1a',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '400',
          letterSpacing: '0.2px',
          whiteSpace: 'nowrap',
          marginBottom: '4px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          Akun Gmail Terverifikasi
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: '#1a1a1a transparent transparent transparent'
          }} />
        </div>
      )}
    </span>
  );
};

// Minimalist Collaborate Badge
const CollaborateBadge = ({ size = 14 }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontSize: '11px',
    fontWeight: '500',
    letterSpacing: '0.2px',
    borderRadius: '3px',
    lineHeight: 1,
    marginLeft: '8px'
  }}>
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3V13" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M3 8H13" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="6.5" stroke="#666" strokeWidth="1.2"/>
    </svg>
    Kolaborasi
  </span>
);

// Collaborator Avatars Component - Minimalist
const CollaboratorAvatars = ({ collaborators = [], collaboratorNames = {}, currentUserId }) => {
  if (!collaborators || collaborators.length === 0) return null;
  
  // Filter out current user
  const otherCollaborators = collaborators.filter(id => id !== currentUserId);
  
  if (otherCollaborators.length === 0) return null;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      marginTop: '12px'
    }}>
      <span style={{
        fontSize: '12px',
        color: '#888',
        fontWeight: '400',
        letterSpacing: '0.2px'
      }}>
        Kolaborator:
      </span>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px'
      }}>
        {otherCollaborators.slice(0, 3).map((id, index) => (
          <div
            key={id}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '500',
              color: '#555',
              border: '1px solid #e0e0e0',
              marginLeft: index > 0 ? '-8px' : '0',
              position: 'relative',
              zIndex: collaborators.length - index
            }}
            title={collaboratorNames[id] || 'Kolaborator'}
          >
            {(collaboratorNames[id] || '?').charAt(0).toUpperCase()}
          </div>
        ))}
        {otherCollaborators.length > 3 && (
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#555',
            border: '1px solid #e0e0e0',
            marginLeft: '-8px'
          }}>
            +{otherCollaborators.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};

interface Note {
  id?: string;
  title: string;
  category: string;
  link: string;
  description: string;
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: any;
  updatedAt: any;
  savedBy?: string[];
  thumbnail?: string;
  collaborators?: string[];
  collaboratorNames?: {[key: string]: string};
  isCollaborative?: boolean;
}

interface Group {
  id?: string;
  name: string;
  ownerId: string;
  ownerName: string;
  members: string[];
  memberNames?: {[key: string]: string};
  createdAt: any;
}

interface Notification {
  id?: string;
  type: 'group_invite' | 'collaborate_invite';
  groupId?: string;
  groupName?: string;
  noteId?: string;
  noteTitle?: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  receiverId: string;
  receiverName?: string;
  receiverEmail?: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: any;
}

export default function NotesPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ 
    title: "", 
    category: "", 
    link: "", 
    description: "" 
  });
  const [editNote, setEditNote] = useState({ 
    title: "", 
    category: "", 
    link: "", 
    description: "" 
  });
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [collaborateEmail, setCollaborateEmail] = useState("");
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const categories = [
    "Makanan", "Minuman", "Fotografi", "Coding", "Desain",
    "Musik", "Film", "Buku", "Olahraga", "Travel",
    "Pendidikan", "Bisnis", "Kesehatan", "Teknologi", "Hobi"
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      
      setAuth(authInstance);
      setDb(dbInstance);
      
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || 
                    currentUser.email?.split('@')[0] || 
                    'User';
        const email = currentUser.email || '';
        setUserDisplayName(name);
        setUserEmail(email);
        
        await saveUserToFirestore(currentUser.uid, name, email);
        
        loadUserNotes(currentUser.uid);
        loadUserGroups(currentUser.uid);
        loadUserNotifications(currentUser.uid);
      } else {
        router.push('/');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth, router]);

  const saveUserToFirestore = async (userId: string, name: string, email: string) => {
    if (!db) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      const userData = {
        id: userId,
        name: name,
        email: email.toLowerCase(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (!userSnap.exists()) {
        await setDoc(userRef, userData);
      } else {
        await updateDoc(userRef, userData);
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  };

  const loadUserNotes = (userId: string) => {
    if (!db) return;
    
    setIsLoading(true);
    try {
      const notesRef = collection(db, 'userNotes');
      const q = query(
        notesRef, 
        where('userId', '==', userId), 
        orderBy('updatedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesData: Note[] = [];
        querySnapshot.forEach((doc) => {
          const noteData = doc.data() as Note;
          notesData.push({
            id: doc.id,
            ...noteData
          });
        });
        
        loadCollaborativeNotes(userId, notesData);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading notes:", error);
      setIsLoading(false);
    }
  };

  const loadCollaborativeNotes = async (userId: string, existingNotes: Note[]) => {
    if (!db) return;
    
    try {
      const notesRef = collection(db, 'userNotes');
      const q = query(notesRef, where('collaborators', 'array-contains', userId));
      
      const querySnapshot = await getDocs(q);
      const collaborativeNotes: Note[] = [];
      
      querySnapshot.forEach((doc) => {
        const noteData = doc.data() as Note;
        if (!existingNotes.some(note => note.id === doc.id)) {
          collaborativeNotes.push({
            id: doc.id,
            ...noteData,
            isCollaborative: true
          });
        }
      });
      
      setNotes([...existingNotes, ...collaborativeNotes]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading collaborative notes:", error);
      setIsLoading(false);
    }
  };

  const loadUserGroups = async (userId: string) => {
    if (!db) return;

    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('members', 'array-contains', userId));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const groupsData: Group[] = [];
        querySnapshot.forEach((doc) => {
          const groupData = doc.data() as Group;
          groupsData.push({
            id: doc.id,
            ...groupData
          });
        });
        setGroups(groupsData);
        
        if (groupsData.length > 0 && !currentGroup) {
          setCurrentGroup(groupsData[0]);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const loadUserNotifications = (userId: string) => {
    if (!db) return;

    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef, 
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsData: Notification[] = [];
        querySnapshot.forEach((doc) => {
          const notificationData = doc.data() as Notification;
          notificationsData.push({
            id: doc.id,
            ...notificationData
          });
        });
        setNotifications(notificationsData);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const findUserByEmail = async (email: string) => {
    if (!db || !email) return null;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      return null;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  };

  const createUserRecord = async (email: string, name?: string) => {
    if (!db) return null;

    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: userId,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, userData);
      
      return userId;
    } catch (error) {
      console.error("Error creating user record:", error);
      return null;
    }
  };

  const handleInviteCollaborator = async () => {
    if (!user || !db || !currentNote || !collaborateEmail.trim()) {
      alert("Email harus diisi");
      return;
    }

    try {
      const invitedUser = await findUserByEmail(collaborateEmail.trim());
      let invitedUserId = invitedUser?.id;
      let invitedUserName = invitedUser?.name || collaborateEmail.split('@')[0];

      if (!invitedUser) {
        invitedUserId = await createUserRecord(collaborateEmail.trim());
        if (!invitedUserId) {
          alert("Gagal membuat user record");
          return;
        }
        invitedUserName = collaborateEmail.split('@')[0];
      }

      if (currentNote.collaborators && currentNote.collaborators.includes(invitedUserId)) {
        alert("User sudah menjadi kolaborator catatan ini");
        return;
      }

      const notificationData = {
        type: 'collaborate_invite',
        noteId: currentNote.id,
        noteTitle: currentNote.title,
        senderId: user.uid,
        senderName: userDisplayName,
        senderEmail: userEmail,
        receiverId: invitedUserId,
        receiverEmail: collaborateEmail.trim().toLowerCase(),
        receiverName: invitedUserName,
        status: 'pending',
        message: `${userDisplayName} mengundang Anda untuk berkolaborasi`,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      
      setCollaborateEmail("");
      setShowCollaborateModal(false);
      
      alert(`Undangan kolaborasi telah dikirim`);
      
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      alert("Gagal mengundang kolaborator.");
    }
  };

  const handleInviteUser = async () => {
    if (!user || !db || !currentGroup || !inviteEmail.trim()) {
      alert("Email harus diisi");
      return;
    }

    try {
      const invitedUser = await findUserByEmail(inviteEmail.trim());
      let invitedUserId = invitedUser?.id;
      let invitedUserName = invitedUser?.name || inviteEmail.split('@')[0];

      if (!invitedUser) {
        invitedUserId = await createUserRecord(inviteEmail.trim());
        if (!invitedUserId) {
          alert("Gagal membuat user record");
          return;
        }
        invitedUserName = inviteEmail.split('@')[0];
      }

      if (currentGroup.members.includes(invitedUserId)) {
        alert("User sudah menjadi anggota grup ini");
        return;
      }

      const notificationData = {
        type: 'group_invite',
        groupId: currentGroup.id,
        groupName: currentGroup.name,
        senderId: user.uid,
        senderName: userDisplayName,
        senderEmail: userEmail,
        receiverId: invitedUserId,
        receiverEmail: inviteEmail.trim().toLowerCase(),
        receiverName: invitedUserName,
        status: 'pending',
        message: `${userDisplayName} mengundang Anda bergabung ke grup`,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      
      setInviteEmail("");
      setShowInviteModal(false);
      
      alert(`Undangan telah dikirim`);
      
    } catch (error) {
      console.error("Error inviting user:", error);
      alert("Gagal mengundang user.");
    }
  };

  const handleNotificationResponse = async (notificationId: string, accept: boolean) => {
    if (!user || !db) return;

    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      
      if (!notification) return;

      await updateDoc(notificationRef, {
        status: accept ? 'accepted' : 'rejected'
      });

      if (accept) {
        if (notification.type === 'group_invite' && notification.groupId) {
          try {
            const groupRef = doc(db, 'groups', notification.groupId);
            
            await updateDoc(groupRef, {
              members: arrayUnion(user.uid),
              [`memberNames.${user.uid}`]: userDisplayName
            });
            
            loadUserGroups(user.uid);
            
          } catch (error) {
            console.error("Error adding user to group:", error);
          }
        } else if (notification.type === 'collaborate_invite' && notification.noteId) {
          try {
            const noteRef = doc(db, 'userNotes', notification.noteId);
            
            await updateDoc(noteRef, {
              collaborators: arrayUnion(user.uid),
              [`collaboratorNames.${user.uid}`]: userDisplayName,
              isCollaborative: true
            });
            
            loadUserNotes(user.uid);
            
          } catch (error) {
            console.error("Error adding collaborator to note:", error);
          }
        }
      }

      setTimeout(async () => {
        try {
          await deleteDoc(notificationRef);
        } catch (error) {
          console.error("Error deleting notification:", error);
        }
      }, 3000);

    } catch (error) {
      console.error("Error responding to notification:", error);
    }
  };

  const handleCreateNote = async () => {
    if (!user || !db || !newNote.title.trim()) {
      alert("Judul catatan harus diisi");
      return;
    }

    try {
      const thumbnail = generateThumbnail(newNote.link.trim());

      const noteData = {
        title: newNote.title.trim(),
        category: newNote.category.trim(),
        link: newNote.link.trim(),
        description: newNote.description.trim(),
        userId: user.uid,
        userName: userDisplayName,
        userEmail: userEmail,
        thumbnail: thumbnail,
        savedBy: [],
        collaborators: [],
        collaboratorNames: {},
        isCollaborative: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'userNotes'), noteData);
      
      setNewNote({ title: "", category: "", link: "", description: "" });
      setShowNewNoteForm(false);
      
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Gagal membuat catatan.");
    }
  };

  const handleEditNote = async () => {
    if (!user || !db || !currentNote) return;

    try {
      const noteRef = doc(db, 'userNotes', currentNote.id!);
      
      await updateDoc(noteRef, {
        title: editNote.title.trim() || currentNote.title,
        category: editNote.category.trim() || currentNote.category,
        link: editNote.link.trim() || currentNote.link,
        description: editNote.description.trim() || currentNote.description,
        updatedAt: serverTimestamp()
      });
      
      setShowEditNoteModal(false);
      setCurrentNote(null);
      
    } catch (error) {
      console.error("Error editing note:", error);
    }
  };

  const generateThumbnail = (link: string): string => {
    if (!link) return "";
    
    try {
      const url = new URL(link);
      
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
      }
      
      return "";
    } catch {
      return "";
    }
  };

  const handleSaveNote = async (noteId: string) => {
    if (!user || !db) return;

    try {
      const noteRef = doc(db, 'userNotes', noteId);
      await updateDoc(noteRef, {
        savedBy: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!db) return;
    
    if (confirm("Hapus catatan ini?")) {
      try {
        await deleteDoc(doc(db, 'userNotes', noteId));
      } catch (error) {
        console.error("Error deleting note:", error);
      }
    }
  };

  const handleShareToGroup = async (noteId: string) => {
    if (!user || !db || !currentGroup) {
      alert("Pilih grup terlebih dahulu");
      return;
    }

    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;

      const messageData = {
        text: note.description || "Catatan yang dibagikan",
        userId: user.uid,
        userName: userDisplayName,
        groupId: currentGroup.id,
        type: 'link',
        link: note.link || "",
        thumbnail: note.thumbnail || "",
        title: note.title,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'groupMessages'), messageData);
      
      alert(`Catatan dibagikan ke grup`);
    } catch (error) {
      console.error("Error sharing note:", error);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  const getVideoEmbedUrl = (link: string) => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}`;
      }
      
      if (link.match(/\.(mp4|webm|ogg|mov)$/i)) return link;
      
      return null;
    } catch {
      return null;
    }
  };

  const togglePlayPause = (noteId: string) => {
    const video = videoRefs.current[noteId];
    if (video) {
      if (video.paused) video.play();
      else video.pause();
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const canEditNote = (note: Note) => {
    return note.userId === user?.uid || 
           (note.collaborators && note.collaborators.includes(user?.uid));
  };

  const isNoteOwner = (note: Note) => {
    return note.userId === user?.uid;
  };

  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const notificationCount = pendingNotifications.length;

  if (!auth || !db) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '14px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#333',
      position: 'relative'
    }}>
      {/* Header - Minimalist */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '500',
          color: '#333',
          letterSpacing: '-0.5px',
          cursor: 'pointer'
        }} onClick={() => router.push('/')}>
          Menuru
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: '400',
            color: '#333'
          }}>
            {userDisplayName}
            <VerifiedBadge email={userEmail} />
          </div>
          
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'none',
                border: 'none',
                color: '#333',
                padding: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                position: 'relative'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 4a6 6 0 00-6 6c0 7-3 9-3 9h18s-3-2-3-9a6 6 0 00-6-6zM13 17a3 3 0 01-6 0"/>
              </svg>
              {notificationCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ff4444',
                  borderRadius: '50%'
                }} />
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                backgroundColor: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                width: '360px',
                maxHeight: '480px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  padding: '16px',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Notifikasi
                </div>
                
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '13px'
                  }}>
                    Tidak ada notifikasi
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} style={{
                      padding: '16px',
                      borderBottom: '1px solid #f0f0f0',
                      backgroundColor: notification.status === 'pending' ? '#fafafa' : '#fff'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        marginBottom: '8px',
                        color: '#333',
                        lineHeight: '1.5'
                      }}>
                        {notification.message}
                        {notification.type === 'collaborate_invite' && notification.noteTitle && (
                          <span style={{ fontWeight: '500' }}> "{notification.noteTitle}"</span>
                        )}
                      </div>
                      
                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginBottom: '12px'
                      }}>
                        dari {notification.senderName}
                      </div>
                      
                      {notification.status === 'pending' && (
                        <div style={{
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => handleNotificationResponse(notification.id!, true)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: '#fff',
                              border: '1px solid #333',
                              color: '#333',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '400',
                              cursor: 'pointer'
                            }}
                          >
                            Terima
                          </button>
                          <button
                            onClick={() => handleNotificationResponse(notification.id!, false)}
                            style={{
                              padding: '6px 16px',
                              backgroundColor: '#fff',
                              border: '1px solid #ccc',
                              color: '#999',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                      
                      {notification.status === 'accepted' && (
                        <div style={{ color: '#00aa00', fontSize: '12px' }}>✓ Diterima</div>
                      )}
                      {notification.status === 'rejected' && (
                        <div style={{ color: '#ff4444', fontSize: '12px' }}>✗ Ditolak</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Groups */}
          {groups.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={currentGroup?.id || ''}
                onChange={(e) => {
                  const group = groups.find(g => g.id === e.target.value);
                  setCurrentGroup(group || null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  color: '#333',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowInviteModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#333',
                  padding: '6px',
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="6" r="4"/>
                  <line x1="17" y1="8" x2="17" y2="14"/>
                  <line x1="20" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
            </div>
          )}
          
          {/* Create Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: '#333' }}>Buat Grup</span>
            <button
              onClick={() => setShowGroupModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#333',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="10" y1="5" x2="10" y2="15"/>
                <line x1="5" y1="10" x2="15" y2="10"/>
              </svg>
            </button>
          </div>
          
          {/* Create Note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: '#333' }}>Buat Catatan</span>
            <button
              onClick={() => setShowNewNoteForm(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#333',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="10" y1="5" x2="10" y2="15"/>
                <line x1="5" y1="10" x2="15" y2="10"/>
              </svg>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#333',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 15l3-3-3-3M17 12H9M9 5H5a2 2 0 00-2 2v6a2 2 0 002 2h4"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '120px 20px 80px'
      }}>
        {isLoading ? (
          <div style={{
            textAlign: 'center',
            padding: '80px',
            color: '#999',
            fontSize: '14px'
          }}>
            Memuat catatan...
          </div>
        ) : notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px'
          }}>
            <div style={{
              fontSize: '18px',
              color: '#333',
              marginBottom: '12px',
              fontWeight: '400'
            }}>
              Belum ada catatan
            </div>
            <div style={{
              fontSize: '14px',
              color: '#999'
            }}>
              Buat catatan pertama Anda
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '48px'
          }}>
            {notes.map((note) => {
              const videoEmbedUrl = getVideoEmbedUrl(note.link);
              const isSaved = note.savedBy?.includes(user?.uid);
              const userCanEdit = canEditNote(note);
              const userIsOwner = isNoteOwner(note);
              
              return (
                <div key={note.id} style={{
                  position: 'relative',
                  borderBottom: '1px solid #f0f0f0',
                  paddingBottom: '32px'
                }}>
                  {/* Category */}
                  {note.category && (
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      marginBottom: '8px',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase'
                    }}>
                      {note.category}
                    </div>
                  )}

                  {/* Title with Collaborate Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: '400',
                      color: '#333',
                      lineHeight: '1.3'
                    }}>
                      {note.title}
                    </div>
                    {note.isCollaborative && <CollaborateBadge />}
                  </div>

                  {/* Description */}
                  {note.description && (
                    <div style={{
                      fontSize: '15px',
                      color: '#666',
                      lineHeight: '1.6',
                      marginBottom: '20px'
                    }}>
                      {note.description}
                    </div>
                  )}

                  {/* Thumbnail/Video */}
                  {note.thumbnail && !videoEmbedUrl && (
                    <div style={{ margin: '20px 0' }}>
                      <img 
                        src={note.thumbnail} 
                        alt=""
                        style={{
                          width: '100%',
                          maxWidth: '500px',
                          height: 'auto',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}

                  {videoEmbedUrl && (
                    <div style={{ margin: '20px 0' }}>
                      {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (
                        <div style={{
                          position: 'relative',
                          paddingBottom: '56.25%',
                          height: 0
                        }}>
                          <iframe
                            src={videoEmbedUrl}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              borderRadius: '4px'
                            }}
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          ref={(el) => {
                            if (note.id) videoRefs.current[note.id] = el;
                          }}
                          src={videoEmbedUrl}
                          style={{
                            width: '100%',
                            maxWidth: '500px',
                            height: 'auto',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => togglePlayPause(note.id!)}
                          controls
                        />
                      )}
                    </div>
                  )}

                  {/* Collaborators */}
                  <CollaboratorAvatars 
                    collaborators={note.collaborators}
                    collaboratorNames={note.collaboratorNames}
                    currentUserId={user?.uid}
                  />

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '13px',
                      color: '#999'
                    }}>
                      <span>
                        {formatDate(note.updatedAt)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        oleh {note.userName}
                        <VerifiedBadge email={note.userEmail} />
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <button
                        onClick={() => handleSaveNote(note.id!)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isSaved ? '#333' : '#999',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill={isSaved ? "#333" : "none"} stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2H4a1 1 0 00-1 1v11l4-3 4 3V3a1 1 0 00-1-1z"/>
                        </svg>
                        {isSaved ? 'Tersimpan' : 'Simpan'}
                      </button>

                      {groups.length > 0 && (
                        <button
                          onClick={() => handleShareToGroup(note.id!)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="4" r="2"/>
                            <circle cx="4" cy="8" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <line x1="6" y1="9" x2="10" y2="11"/>
                            <line x1="10" y1="5" x2="6" y2="7"/>
                          </svg>
                          Bagikan
                        </button>
                      )}

                      {userIsOwner && (
                        <button
                          onClick={() => {
                            setCurrentNote(note);
                            setShowCollaborateModal(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="8" cy="4" r="2"/>
                            <circle cx="12" cy="10" r="2"/>
                            <circle cx="4" cy="10" r="2"/>
                            <line x1="9" y1="5" x2="11" y2="8"/>
                            <line x1="5" y1="8" x2="7" y2="5"/>
                          </svg>
                          Undang
                        </button>
                      )}

                      {userCanEdit && (
                        <button
                          onClick={() => {
                            setCurrentNote(note);
                            setEditNote({
                              title: note.title,
                              category: note.category,
                              link: note.link || '',
                              description: note.description || ''
                            });
                            setShowEditNoteModal(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M11 2l3 3L5 14H2v-3l9-9z"/>
                          </svg>
                          Edit
                        </button>
                      )}

                      {note.link && (
                        <a
                          href={note.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#999',
                            textDecoration: 'none',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M10 6l4 4-4 4M14 10H6M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3"/>
                          </svg>
                          Buka
                        </a>
                      )}
                      
                      {note.userId === user?.uid && (
                        <button
                          onClick={() => handleDeleteNote(note.id!)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="12" y1="4" x2="4" y2="12"/>
                            <line x1="4" y1="4" x2="12" y2="12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '40px',
        zIndex: 99
      }}>
        <a
          href="/"
          style={{
            color: '#999',
            textDecoration: 'none',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 4L4 12M12 12V4H4"/>
          </svg>
          Halaman Utama
        </a>
      </div>

      {/* Modal Create Note */}
      {showNewNoteForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '400',
              color: '#333',
              marginBottom: '32px'
            }}>
              Buat Catatan Baru
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Judul</div>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Contoh: Tutorial React"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Kategori</div>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Link</div>
                <input
                  type="text"
                  value={newNote.link}
                  onChange={(e) => setNewNote({...newNote, link: e.target.value})}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Deskripsi</div>
                <textarea
                  value={newNote.description}
                  onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                  placeholder="Tulis deskripsi..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '15px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                marginTop: '32px'
              }}>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    padding: '8px 20px',
                    background: 'none',
                    border: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateNote}
                  style={{
                    padding: '8px 20px',
                    background: '#333',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Note */}
      {showEditNoteModal && currentNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '400',
              color: '#333',
              marginBottom: '32px'
            }}>
              Edit Catatan
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Judul</div>
                <input
                  type="text"
                  value={editNote.title}
                  onChange={(e) => setEditNote({...editNote, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Kategori</div>
                <select
                  value={editNote.category}
                  onChange={(e) => setEditNote({...editNote, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Link</div>
                <input
                  type="text"
                  value={editNote.link}
                  onChange={(e) => setEditNote({...editNote, link: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Deskripsi</div>
                <textarea
                  value={editNote.description}
                  onChange={(e) => setEditNote({...editNote, description: e.target.value})}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '15px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                marginTop: '32px'
              }}>
                <button
                  onClick={() => {
                    setShowEditNoteModal(false);
                    setCurrentNote(null);
                  }}
                  style={{
                    padding: '8px 20px',
                    background: 'none',
                    border: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleEditNote}
                  style={{
                    padding: '8px 20px',
                    background: '#333',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Group */}
      {showGroupModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '400',
              color: '#333',
              marginBottom: '32px'
            }}>
              Buat Grup Baru
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nama Grup"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #e0e0e0',
                  color: '#333',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                marginTop: '32px'
              }}>
                <button
                  onClick={() => {
                    setShowGroupModal(false);
                    setNewGroupName("");
                  }}
                  style={{
                    padding: '8px 20px',
                    background: 'none',
                    border: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateGroup}
                  style={{
                    padding: '8px 20px',
                    background: '#333',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Buat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Invite to Group */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '400',
              color: '#333',
              marginBottom: '32px'
            }}>
              Undang ke Grup
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #e0e0e0',
                  color: '#333',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                marginTop: '32px'
              }}>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                  }}
                  style={{
                    padding: '8px 20px',
                    background: 'none',
                    border: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleInviteUser}
                  style={{
                    padding: '8px 20px',
                    background: '#333',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Invite Collaborator */}
      {showCollaborateModal && currentNote && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: '400',
              color: '#333',
              marginBottom: '8px'
            }}>
              Undang Kolaborator
            </div>
            <div style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '32px'
            }}>
              {currentNote.title}
            </div>

            {currentNote.collaborators && currentNote.collaborators.length > 0 && (
              <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#fafafa',
                borderRadius: '4px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '12px'
                }}>
                  Kolaborator saat ini:
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {Object.entries(currentNote.collaboratorNames || {}).map(([id, name]) => (
                    id !== user?.uid && (
                      <span key={id} style={{
                        padding: '4px 10px',
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '3px',
                        fontSize: '12px',
                        color: '#333'
                      }}>
                        {name}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <input
                type="email"
                value={collaborateEmail}
                onChange={(e) => setCollaborateEmail(e.target.value)}
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #e0e0e0',
                  color: '#333',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '16px',
                marginTop: '32px'
              }}>
                <button
                  onClick={() => {
                    setShowCollaborateModal(false);
                    setCollaborateEmail("");
                    setCurrentNote(null);
                  }}
                  style={{
                    padding: '8px 20px',
                    background: 'none',
                    border: '1px solid #e0e0e0',
                    color: '#333',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleInviteCollaborator}
                  style={{
                    padding: '8px 20px',
                    background: '#333',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
