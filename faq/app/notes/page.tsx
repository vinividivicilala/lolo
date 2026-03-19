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

// Instagram Verified Badge Component
const VerifiedBadge = ({ size = 14 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        marginLeft: '4px',
        verticalAlign: 'middle',
        cursor: 'help'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="#1DA1F2" />
        <path 
          d="M8 12L11 15L16 9" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#2D2D2D',
          color: '#FFFFFF',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '400',
          letterSpacing: '0.2px',
          whiteSpace: 'nowrap',
          marginBottom: '6px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          Akun Gmail Terverifikasi
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#2D2D2D transparent transparent transparent'
          }} />
        </div>
      )}
    </span>
  );
};

// Minimalist Collaborate Badge - Awwwards Style
const CollaborateBadge = () => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: '#F5F5F5',
    color: '#666666',
    fontSize: '11px',
    fontWeight: '400',
    letterSpacing: '0.2px',
    borderRadius: '3px',
    lineHeight: 1
  }}>
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3V13" stroke="#999999" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M3 8H13" stroke="#999999" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="6.5" stroke="#999999" strokeWidth="1.2"/>
    </svg>
    <span>Kolaborasi</span>
  </div>
);

// Minimalist Collaborator List - Awwwards Style
const CollaboratorList = ({ collaborators = [], collaboratorNames = {}, currentUserEmail = '' }) => {
  if (!collaborators || collaborators.length === 0) return null;
  
  // Filter out current user and get unique collaborators
  const otherCollaborators = Object.entries(collaboratorNames || {})
    .filter(([id]) => id !== 'currentUserId'); // We'll handle this in parent
  
  if (otherCollaborators.length === 0) return null;
  
  return (
    <div style={{
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #EEEEEE'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: '12px',
          color: '#999999',
          fontWeight: '400',
          letterSpacing: '0.2px'
        }}>
          Kolaborator:
        </span>
        {otherCollaborators.map(([id, name]) => (
          <div
            key={id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '13px',
              color: '#666666',
              fontWeight: '400'
            }}
          >
            <span>{name}</span>
            <VerifiedBadge size={12} />
          </div>
        ))}
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
  userEmail: string;
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
    "Makanan",
    "Minuman", 
    "Fotografi",
    "Coding",
    "Desain",
    "Musik",
    "Film",
    "Buku",
    "Olahraga",
    "Travel",
    "Pendidikan",
    "Bisnis",
    "Kesehatan",
    "Teknologi",
    "Hobi"
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
      const q = query(notesRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
      
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
      return () => {};
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
      
      // Sort all notes by date
      const allNotes = [...existingNotes, ...collaborativeNotes].sort((a, b) => {
        const dateA = a.updatedAt?.toDate?.() || new Date(0);
        const dateB = b.updatedAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setNotes(allNotes);
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

  const handleCreateGroup = async () => {
    if (!user || !db || !newGroupName.trim()) {
      alert("Nama grup harus diisi");
      return;
    }

    try {
      const groupData = {
        name: newGroupName.trim(),
        ownerId: user.uid,
        ownerName: userDisplayName,
        members: [user.uid],
        memberNames: {
          [user.uid]: userDisplayName
        },
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'groups'), groupData);
      
      setNewGroupName("");
      setShowGroupModal(false);
      alert("Grup berhasil dibuat!");
      
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Gagal membuat grup.");
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
      alert("Catatan berhasil diperbarui!");
      
    } catch (error) {
      console.error("Error editing note:", error);
      alert("Gagal mengedit catatan.");
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
      alert("Catatan berhasil disimpan!");
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
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
      }
      
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
      }
      
      if (link.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) return link;
      
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

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
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
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '42px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          color: 'white',
          letterSpacing: '1px',
          cursor: 'pointer'
        }} onClick={() => router.push('/')}>
          Menuru
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px'
        }}>
          <div style={{
            fontSize: '32px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {userDisplayName}
            <VerifiedBadge />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </div>
          
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
              title="Notifikasi"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {notificationCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {notificationCount}
                </div>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '8px',
                width: '400px',
                maxHeight: '500px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #333',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}>
                  Notifikasi ({notifications.length})
                </div>
                
                {notifications.length === 0 ? (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#888',
                    fontSize: '18px'
                  }}>
                    Tidak ada notifikasi
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: '20px',
                          borderBottom: '1px solid #222',
                          backgroundColor: notification.status === 'pending' ? 'rgba(255,255,255,0.05)' : 'transparent'
                        }}
                      >
                        <div style={{
                          fontSize: '18px',
                          marginBottom: '10px',
                          color: notification.status === 'pending' ? 'white' : '#aaa'
                        }}>
                          {notification.message}
                          {notification.type === 'collaborate_invite' && notification.noteTitle && (
                            <span style={{ fontWeight: 'bold' }}> "{notification.noteTitle}"</span>
                          )}
                        </div>
                        
                        <div style={{
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '10px'
                        }}>
                          Dari: {notification.senderName}
                          <br />
                          Waktu: {formatTime(notification.createdAt)}
                        </div>
                        
                        {notification.status === 'pending' && (
                          <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginTop: '15px'
                          }}>
                            <button
                              onClick={() => handleNotificationResponse(notification.id!, true)}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: 'green',
                                border: 'none',
                                color: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                            >
                              Terima
                            </button>
                            <button
                              onClick={() => handleNotificationResponse(notification.id!, false)}
                              style={{
                                padding: '8px 20px',
                                backgroundColor: 'red',
                                border: 'none',
                                color: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                        
                        {notification.status === 'accepted' && (
                          <div style={{ color: 'green', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
                            ✓ Diterima
                          </div>
                        )}
                        
                        {notification.status === 'rejected' && (
                          <div style={{ color: 'red', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
                            ✗ Ditolak
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {groups.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <select
                value={currentGroup?.id || ''}
                onChange={(e) => {
                  const group = groups.find(g => g.id === e.target.value);
                  setCurrentGroup(group || null);
                }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '18px',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id} style={{ backgroundColor: 'black' }}>
                    {group.name}
                  </option>
                ))}
              </select>
              
              {currentGroup && (
                <button
                  onClick={() => router.push('/groups')}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '10px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Buka Halaman Grup"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  Grup
                </button>
              )}
              
              <button
                onClick={() => setShowInviteModal(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  padding: '10px',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
                title="Undang ke Grup"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </button>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{
              fontSize: '20px',
              color: 'white'
            }}>
              Buat Grup Baru
            </span>
            <button
              onClick={() => setShowGroupModal(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                padding: '10px',
                cursor: 'pointer',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Buat Grup Baru"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7H17V17"/>
            </svg>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{
              fontSize: '20px',
              color: 'white'
            }}>
              Buat Catatan Baru
            </span>
            <button
              onClick={() => setShowNewNoteForm(true)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px'
              }}
              title="Buat Catatan Baru"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7H17V17"/>
            </svg>
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Logout"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '160px 20px 100px',
        boxSizing: 'border-box'
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '100px',
            fontSize: '26px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: 'white'
          }}>
            Memuat catatan...
          </div>
        ) : notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '120px 20px',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}>
            <div style={{
              fontSize: '32px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: 'white',
              marginBottom: '20px'
            }}>
              Belum ada catatan
            </div>
            <div style={{
              fontSize: '24px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: 'white'
            }}>
              Buat catatan pertama Anda
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '80px',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}>
            {notes.map((note) => {
              const videoEmbedUrl = getVideoEmbedUrl(note.link);
              const isSaved = note.savedBy && note.savedBy.includes(user?.uid);
              const userCanEdit = canEditNote(note);
              const userIsOwner = isNoteOwner(note);
              
              return (
                <div
                  key={note.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    position: 'relative'
                  }}
                >
                  {/* Category with sorting indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: '#888',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      {note.category}
                    </div>
                    
                    {/* Collaborate Badge - Minimalist */}
                    {note.isCollaborative && <CollaborateBadge />}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: '42px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: '1.2',
                    color: 'white',
                    fontWeight: '500',
                    letterSpacing: '-0.5px'
                  }}>
                    {note.title}
                  </div>

                  {/* Description */}
                  {note.description && (
                    <div style={{
                      fontSize: '18px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      lineHeight: '1.6',
                      color: '#CCC',
                      marginTop: '10px'
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
                          maxWidth: '600px',
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
                          height: 0,
                          overflow: 'hidden',
                          backgroundColor: '#000',
                          borderRadius: '4px'
                        }}>
                          <iframe
                            src={videoEmbedUrl}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                            maxWidth: '600px',
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

                  {/* Collaborator List - Minimalist, no borders, with verified badge */}
                  {note.collaborators && note.collaboratorNames && (
                    <CollaboratorList 
                      collaborators={note.collaborators}
                      collaboratorNames={note.collaboratorNames}
                      currentUserEmail={userEmail}
                    />
                  )}

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #222'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '14px',
                      color: '#888'
                    }}>
                      <span>{formatDate(note.updatedAt)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        oleh {note.userName}
                        <VerifiedBadge />
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
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: isSaved ? '#FFD700' : '#888',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? "#FFD700" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                        </svg>
                        {isSaved ? 'Disimpan' : 'Simpan'}
                      </button>

                      {groups.length > 0 && (
                        <button
                          onClick={() => handleShareToGroup(note.id!)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#888',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
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
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#888',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="8.5" cy="7" r="4"/>
                            <line x1="20" y1="8" x2="20" y2="14"/>
                            <line x1="23" y1="11" x2="17" y2="11"/>
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
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#888',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
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
                            color: '#888',
                            textDecoration: 'none',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 17l9.2-9.2M17 17V7H7"/>
                          </svg>
                          Buka
                        </a>
                      )}
                      
                      {note.userId === user?.uid && (
                        <button
                          onClick={() => handleDeleteNote(note.id!)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#888',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
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
        bottom: '40px',
        left: '40px',
        zIndex: 99
      }}>
        <a
          href="/"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '24px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 7L7 17M17 17V7H7"/>
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
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '30px'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '700px',
            padding: '60px'
          }}>
            <div style={{
              fontSize: '36px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              marginBottom: '40px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Buat Catatan Baru
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="Judul Catatan"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '24px',
                  outline: 'none'
                }}
              />

              <select
                value={newNote.category}
                onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '20px',
                  outline: 'none'
                }}
              >
                <option value="" style={{ backgroundColor: 'black' }}>Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category} style={{ backgroundColor: 'black' }}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={newNote.link}
                onChange={(e) => setNewNote({...newNote, link: e.target.value})}
                placeholder="Link (YouTube, Vimeo, dll.)"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '20px',
                  outline: 'none'
                }}
              />

              <textarea
                value={newNote.description}
                onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                placeholder="Deskripsi"
                rows={6}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '18px',
                  outline: 'none',
                  resize: 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginTop: '40px'
              }}>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    color: 'white',
                    fontSize: '16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateNote}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: 'white',
                    border: 'none',
                    color: 'black',
                    fontSize: '16px',
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
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '30px'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '700px',
            padding: '60px'
          }}>
            <div style={{
              fontSize: '36px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              marginBottom: '40px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Edit Catatan
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}>
              <input
                type="text"
                value={editNote.title}
                onChange={(e) => setEditNote({...editNote, title: e.target.value})}
                placeholder="Judul Catatan"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '24px',
                  outline: 'none'
                }}
              />

              <select
                value={editNote.category}
                onChange={(e) => setEditNote({...editNote, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '20px',
                  outline: 'none'
                }}
              >
                <option value="" style={{ backgroundColor: 'black' }}>Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category} style={{ backgroundColor: 'black' }}>
                    {category}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={editNote.link}
                onChange={(e) => setEditNote({...editNote, link: e.target.value})}
                placeholder="Link"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '20px',
                  outline: 'none'
                }}
              />

              <textarea
                value={editNote.description}
                onChange={(e) => setEditNote({...editNote, description: e.target.value})}
                placeholder="Deskripsi"
                rows={6}
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid #333',
                  color: 'white',
                  fontSize: '18px',
                  outline: 'none',
                  resize: 'none'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginTop: '40px'
              }}>
                <button
                  onClick={() => {
                    setShowEditNoteModal(false);
                    setCurrentNote(null);
                  }}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #333',
                    color: 'white',
                    fontSize: '16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleEditNote}
                  style={{
                    padding: '12px 30px',
                    backgroundColor: 'white',
                    border: 'none',
                    color: 'black',
                    fontSize: '16px',
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
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '30px'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '400px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '28px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              marginBottom: '30px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Buat Grup Baru
            </div>

            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nama Grup"
              style={{
                width: '100%',
                padding: '15px 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #333',
                color: 'white',
                fontSize: '18px',
                outline: 'none',
                marginBottom: '30px'
              }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px'
            }}>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setNewGroupName("");
                }}
                style={{
                  padding: '10px 25px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  color: 'white',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleCreateGroup}
                style={{
                  padding: '10px 25px',
                  backgroundColor: 'white',
                  border: 'none',
                  color: 'black',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Buat
              </button>
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
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '30px'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '400px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '28px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              marginBottom: '10px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Undang ke Grup
            </div>
            <div style={{
              fontSize: '16px',
              color: '#888',
              marginBottom: '30px'
            }}>
              {currentGroup?.name}
            </div>

            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '15px 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #333',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                marginBottom: '30px'
              }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px'
            }}>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                }}
                style={{
                  padding: '10px 25px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  color: 'white',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleInviteUser}
                style={{
                  padding: '10px 25px',
                  backgroundColor: 'white',
                  border: 'none',
                  color: 'black',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Kirim
              </button>
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
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '30px'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '400px',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '28px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              marginBottom: '10px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Undang Kolaborator
            </div>
            <div style={{
              fontSize: '16px',
              color: '#888',
              marginBottom: '30px'
            }}>
              {currentNote.title}
            </div>

            {currentNote.collaborators && currentNote.collaborators.length > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#111',
                borderRadius: '4px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '10px'
                }}>
                  Kolaborator saat ini:
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {Object.entries(currentNote.collaboratorNames || {})
                    .filter(([id]) => id !== user?.uid)
                    .map(([id, name]) => (
                      <div key={id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                        color: '#CCC'
                      }}>
                        <span>{name}</span>
                        <VerifiedBadge size={12} />
                      </div>
                    ))}
                </div>
              </div>
            )}

            <input
              type="email"
              value={collaborateEmail}
              onChange={(e) => setCollaborateEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '15px 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid #333',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                marginBottom: '30px'
              }}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '15px'
            }}>
              <button
                onClick={() => {
                  setShowCollaborateModal(false);
                  setCollaborateEmail("");
                  setCurrentNote(null);
                }}
                style={{
                  padding: '10px 25px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  color: 'white',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleInviteCollaborator}
                style={{
                  padding: '10px 25px',
                  backgroundColor: 'white',
                  border: 'none',
                  color: 'black',
                  fontSize: '14px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
