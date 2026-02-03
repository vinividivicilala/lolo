'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

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

interface Note {
  id?: string;
  title: string;
  category: string;
  link: string;
  description: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
}

interface Group {
  id?: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: any;
}

export default function NotesPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [newNote, setNewNote] = useState({ 
    title: "", 
    category: "", 
    link: "", 
    description: "" 
  });
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Kategori yang tersedia
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

  // 1. Inisialisasi Firebase di client side
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

  // 2. Cek auth state setelah Firebase siap
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || 
                    currentUser.email?.split('@')[0] || 
                    'User';
        setUserDisplayName(name);
        loadUserNotes(currentUser.uid);
        loadUserGroups(currentUser.uid);
      } else {
        router.push('/');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth, router]);

  // Load catatan user
  const loadUserNotes = (userId: string) => {
    if (!db) {
      console.log('Database not ready yet');
      return;
    }
    
    setIsLoading(true);
    try {
      const notesRef = collection(db, 'userNotes');
      const q = query(notesRef, orderBy('updatedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notesData: Note[] = [];
        querySnapshot.forEach((doc) => {
          const noteData = doc.data() as Note;
          if (noteData.userId === userId) {
            notesData.push({
              id: doc.id,
              ...noteData
            });
          }
        });
        setNotes(notesData);
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading notes:", error);
      setIsLoading(false);
      return () => {};
    }
  };

  // Load grup user
  const loadUserGroups = async (userId: string) => {
    if (!db) return;

    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef);
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const groupsData: Group[] = [];
        querySnapshot.forEach((doc) => {
          const groupData = doc.data() as Group;
          if (groupData.members.includes(userId)) {
            groupsData.push({
              id: doc.id,
              ...groupData
            });
          }
        });
        setGroups(groupsData);
        
        // Set group pertama sebagai current group jika ada
        if (groupsData.length > 0 && !currentGroup) {
          setCurrentGroup(groupsData[0]);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  // Buat grup baru
  const handleCreateGroup = async () => {
    if (!user || !db || !newGroupName.trim()) {
      alert("Nama grup harus diisi");
      return;
    }

    try {
      const groupData = {
        name: newGroupName.trim(),
        ownerId: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'groups'), groupData);
      
      setNewGroupName("");
      setShowGroupModal(false);
      
      alert("Grup berhasil dibuat!");
      
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Gagal membuat grup. Silakan coba lagi.");
    }
  };

  // Invite user ke grup
  const handleInviteUser = async () => {
    if (!user || !db || !currentGroup || !inviteEmail.trim()) {
      alert("Email harus diisi");
      return;
    }

    // Dalam implementasi nyata, Anda perlu:
    // 1. Cari user berdasarkan email di Firebase Auth
    // 2. Dapatkan UID-nya
    // 3. Tambahkan ke array members grup
    
    try {
      // Simulasi - untuk implementasi nyata, gunakan Firebase Auth untuk mencari user
      alert(`Fitur invite untuk email: ${inviteEmail}\n\nUntuk implementasi lengkap:\n1. Gunakan Firebase Auth untuk mencari user\n2. Dapatkan UID user\n3. Tambahkan ke grup dengan updateDoc`);
      
      setInviteEmail("");
      setShowInviteModal(false);
      
    } catch (error) {
      console.error("Error inviting user:", error);
      alert("Gagal mengundang user.");
    }
  };

  // Buat catatan baru
  const handleCreateNote = async () => {
    if (!user || !db || !newNote.title.trim()) {
      alert("Judul catatan harus diisi");
      return;
    }

    try {
      const noteData = {
        title: newNote.title.trim(),
        category: newNote.category.trim(),
        link: newNote.link.trim(),
        description: newNote.description.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'userNotes'), noteData);
      
      setNewNote({ title: "", category: "", link: "", description: "" });
      setShowNewNoteForm(false);
      
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Gagal membuat catatan. Silakan coba lagi.");
    }
  };

  // Hapus catatan
  const handleDeleteNote = async (noteId: string) => {
    if (!db) return;
    
    if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      try {
        await deleteDoc(doc(db, 'userNotes', noteId));
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Gagal menghapus catatan.");
      }
    }
  };

  // Logout
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

  // Format tanggal
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "Kemarin";
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    }
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fungsi untuk mendapatkan embed URL video
  const getVideoEmbedUrl = (link: string) => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      
      // YouTube
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
        }
      }
      
      // Vimeo
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
        }
      }
      
      // Video file langsung (MP4, WebM, etc.)
      if (link.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) {
        return link;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Fungsi untuk menampilkan thumbnail
  const getVideoThumbnail = (link: string) => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      
      // YouTube thumbnail
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Fungsi untuk mengontrol video
  const togglePlayPause = (noteId: string) => {
    const video = videoRefs.current[noteId];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  // Loading state sebelum Firebase siap
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
        borderBottom: '1px solid #333'
      }}>
        {/* Judul Website - KIRI ATAS - DIPERBESAR */}
        <div style={{
          fontSize: '42px', // DIPERBESAR dari 28px
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontWeight: 'bold',
          color: 'white',
          letterSpacing: '1px'
        }}>
          Menuru
        </div>

        {/* Nama User dan Tombol - KANAN ATAS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '30px'
        }}>
          {/* Nama User - DIPERBESAR */}
          <div style={{
            fontSize: '32px', // DIPERBESAR dari 24px
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {userDisplayName}
          </div>
          
          {/* Grup Selector */}
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
                  border: '1px solid #555',
                  color: 'white',
                  fontSize: '18px',
                  outline: 'none',
                  borderRadius: '8px',
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
              
              {/* Tombol Invite ke Grup */}
              <button
                onClick={() => setShowInviteModal(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #555',
                  color: 'white',
                  padding: '10px 15px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Invite
              </button>
            </div>
          )}
          
          {/* Tombol Buat Grup */}
          <button
            onClick={() => setShowGroupModal(true)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #555',
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              fontSize: '18px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Buat Grup
          </button>
          
          {/* Tombol Tambah Catatan */}
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
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #555',
              color: 'white',
              padding: '10px 15px',
              cursor: 'pointer',
              fontSize: '18px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Tombol Halaman Utama - KIRI BAWAH */}
      <button
        onClick={() => router.push('/')}
        style={{
          position: 'fixed',
          bottom: '40px',
          left: '40px',
          backgroundColor: 'transparent',
          border: '1px solid #555',
          color: 'white',
          padding: '15px 25px',
          cursor: 'pointer',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          zIndex: 99,
          borderRadius: '8px'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 17l9.2-9.2M17 17V7H7"/>
        </svg>
        Halaman Utama
      </button>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '160px 20px 100px',
        boxSizing: 'border-box'
      }}>
        {/* Daftar catatan */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '100px',
            fontSize: '26px', // DIPERBESAR
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: 'white' // WARNA PUTIH
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
              fontSize: '32px', // DIPERBESAR
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: 'white', // WARNA PUTIH
              marginBottom: '20px'
            }}>
              Belum ada catatan
            </div>
            <div style={{
              fontSize: '24px', // DIPERBESAR
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: 'white' // WARNA PUTIH
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
              const videoThumbnail = getVideoThumbnail(note.link);
              
              return (
                <div
                  key={note.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    borderBottom: '1px solid #333',
                    paddingBottom: '40px'
                  }}
                >
                  {/* Kategori - DIPERBESAR */}
                  {note.category && (
                    <div style={{
                      fontSize: '28px', // DIPERBESAR dari 20px
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: 'white', // WARNA PUTIH
                      marginBottom: '15px',
                      fontWeight: '600'
                    }}>
                      {note.category}
                    </div>
                  )}

                  {/* Judul - DIPERBESAR */}
                  <div style={{
                    fontSize: '48px', // DIPERBESAR dari 40px
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: '1.3',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {note.title}
                  </div>

                  {/* Deskripsi - DIPERBESAR */}
                  {note.description && (
                    <div style={{
                      fontSize: '28px', // DIPERBESAR dari 22px
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      lineHeight: '1.6',
                      color: 'white', // WARNA PUTIH
                      marginTop: '25px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {note.description}
                    </div>
                  )}

                  {/* Video Player */}
                  {videoEmbedUrl && (
                    <div style={{
                      margin: '30px 0',
                      position: 'relative'
                    }}>
                      {/* YouTube/Vimeo Embed */}
                      {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (
                        <div style={{
                          position: 'relative',
                          paddingBottom: '56.25%',
                          height: 0,
                          overflow: 'hidden',
                          backgroundColor: '#000',
                          borderRadius: '12px'
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
                              borderRadius: '12px'
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div style={{
                          position: 'relative',
                          backgroundColor: '#000',
                          borderRadius: '12px'
                        }}>
                          <video
                            ref={(el) => {
                              if (note.id) videoRefs.current[note.id] = el;
                            }}
                            src={videoEmbedUrl}
                            style={{
                              width: '100%',
                              maxWidth: '600px',
                              height: 'auto',
                              aspectRatio: '16/9',
                              backgroundColor: '#000',
                              cursor: 'pointer',
                              borderRadius: '12px'
                            }}
                            onClick={() => togglePlayPause(note.id!)}
                            controls
                            poster={videoThumbnail || undefined}
                          />
                          {!videoThumbnail && (
                            <button
                              onClick={() => togglePlayPause(note.id!)}
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer dengan tanggal dan tombol */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '30px',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    <span style={{
                      fontSize: '22px', // DIPERBESAR
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: 'white' // WARNA PUTIH
                    }}>
                      {formatDate(note.updatedAt)}
                    </span>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '30px',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {note.link && (
                        <a
                          href={note.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'white',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '22px', // DIPERBESAR
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            border: '1px solid #555',
                            padding: '10px 20px',
                            borderRadius: '8px'
                          }}
                        >
                          Buka Link
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 17l9.2-9.2M17 17V7H7"/>
                          </svg>
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleDeleteNote(note.id!)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #555',
                          color: 'white',
                          fontSize: '32px', // DIPERBESAR
                          cursor: 'pointer',
                          padding: '5px 15px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Helvetica, Arial, sans-serif'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal buat catatan baru */}
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
          padding: '30px',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '700px',
            padding: '60px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            border: '1px solid #333',
            borderRadius: '12px'
          }}>
            <div style={{
              marginBottom: '50px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '36px', // DIPERBESAR
                fontFamily: 'Helvetica, Arial, sans-serif',
                marginBottom: '20px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                Buat Catatan Baru
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              {/* Input judul */}
              <div>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Judul Catatan"
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '32px', // DIPERBESAR
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: '1.3',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Input kategori - Dropdown */}
              <div>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '24px', // DIPERBESAR
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 20px center',
                    backgroundSize: '24px',
                    borderRadius: '8px'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'black', color: 'white', fontSize: '20px' }}>
                    Pilih Kategori
                  </option>
                  {categories.map((category) => (
                    <option 
                      key={category} 
                      value={category}
                      style={{ backgroundColor: 'black', color: 'white', fontSize: '20px' }}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input link video */}
              <div>
                <input
                  type="text"
                  value={newNote.link}
                  onChange={(e) => setNewNote({...newNote, link: e.target.value})}
                  placeholder="Link Video (YouTube, Vimeo, MP4, dll.)"
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '24px', // DIPERBESAR
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Input deskripsi */}
              <div>
                <textarea
                  value={newNote.description}
                  onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                  placeholder="Deskripsi Catatan"
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '20px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '24px', // DIPERBESAR
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    resize: 'none',
                    lineHeight: '1.6',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Tombol aksi */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '25px',
                marginTop: '50px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '22px', // DIPERBESAR
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    borderRadius: '8px'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateNote}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '22px', // DIPERBESAR
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    borderRadius: '8px'
                  }}
                >
                  Simpan Catatan
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal buat grup baru */}
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
          padding: '30px',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '500px',
            padding: '50px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            border: '1px solid #333',
            borderRadius: '12px'
          }}>
            <div style={{
              marginBottom: '40px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '32px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                marginBottom: '20px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                Buat Grup Baru
              </div>
              <div style={{
                fontSize: '20px',
                color: '#ccc'
              }}>
                Buat grup untuk berbagi catatan dengan teman-teman
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nama Grup"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #555',
                  color: 'white',
                  fontSize: '24px',
                  outline: 'none',
                  borderRadius: '8px'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginTop: '30px'
              }}>
                <button
                  onClick={() => {
                    setShowGroupModal(false);
                    setNewGroupName("");
                  }}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    borderRadius: '8px'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateGroup}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  Buat Grup
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal invite user */}
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
          padding: '30px',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '500px',
            padding: '50px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            border: '1px solid #333',
            borderRadius: '12px'
          }}>
            <div style={{
              marginBottom: '40px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '32px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                marginBottom: '20px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                Invite ke Grup
              </div>
              <div style={{
                fontSize: '20px',
                color: '#ccc'
              }}>
                Undang user lain ke grup: <strong>{currentGroup?.name}</strong>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px'
            }}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email user yang ingin diundang"
                style={{
                  width: '100%',
                  padding: '20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #555',
                  color: 'white',
                  fontSize: '20px',
                  outline: 'none',
                  borderRadius: '8px'
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginTop: '30px'
              }}>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                  }}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    borderRadius: '8px'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleInviteUser}
                  style={{
                    padding: '15px 30px',
                    backgroundColor: 'transparent',
                    border: '1px solid #555',
                    color: 'white',
                    fontSize: '20px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  Kirim Undangan
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
