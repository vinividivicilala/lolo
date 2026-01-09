'use client';

import React, { useState, useEffect } from "react";
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
  deleteDoc
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app"; // ✅ IMPORT INI

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
  content: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
  color?: string;
}

export default function NotesPage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", color: "#3B82F6" });
  const [auth, setAuth] = useState<any>(null); // ✅ State untuk auth
  const [db, setDb] = useState<any>(null); // ✅ State untuk db

  // Warna yang tersedia untuk catatan
  const noteColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#6366F1"
  ];

  // 1. Inisialisasi Firebase di client side
  useEffect(() => {
    // Pastikan hanya berjalan di browser
    if (typeof window === 'undefined') return;

    try {
      // Inisialisasi Firebase
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized');
      } else {
        app = getApps()[0];
        console.log('Using existing Firebase app');
      }
      
      // Setup auth dan db
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
      } else {
        // Redirect ke home jika belum login
        router.push('/');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [auth, router]);

  // 3. Cek ukuran layar
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

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
          // Hanya tampilkan catatan milik user ini
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

  // Buat catatan baru
  const handleCreateNote = async () => {
    if (!user || !db || !newNote.title.trim() || !newNote.content.trim()) {
      alert("Judul dan konten catatan harus diisi");
      return;
    }

    try {
      const noteData = {
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        userId: user.uid,
        color: newNote.color,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'userNotes'), noteData);
      
      // Reset form
      setNewNote({ title: "", content: "", color: "#3B82F6" });
      setShowNewNoteForm(false);
      
      alert("Catatan berhasil dibuat!");
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
        alert("Catatan berhasil dihapus!");
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Gagal menghapus catatan.");
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Format tanggal
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    
    const date = timestamp.toDate();
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: '#3B82F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div>Loading Notes...</div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render UI
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'Helvetica, Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1rem' : '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Tombol kembali */}
        <motion.button
          onClick={() => router.push('/')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          Kembali
        </motion.button>

        {/* Judul halaman */}
        <div style={{
          color: 'white',
          fontSize: isMobile ? '1.3rem' : '1.8rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          CATATAN SAYA
        </div>

        {/* Info user */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#0050B7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              color: 'white'
            }}>
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span style={{
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {userDisplayName}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '6rem 1rem 2rem' : '7rem 2rem 3rem',
        boxSizing: 'border-box'
      }}>
        {/* Header catatan */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              color: 'white',
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              fontWeight: '600',
              margin: '0 0 0.5rem 0'
            }}>
              Catatan Pribadi
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              fontSize: '0.95rem'
            }}>
              {notes.length} catatan tersimpan
            </p>
          </div>

          {/* Tombol buat catatan baru */}
          <motion.button
            onClick={() => setShowNewNoteForm(true)}
            style={{
              backgroundColor: '#0050B7',
              color: 'white',
              border: 'none',
              padding: isMobile ? '0.8rem 1.2rem' : '1rem 1.8rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            whileHover={{ backgroundColor: '#0066CC', scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Catatan Baru
          </motion.button>
        </div>

        {/* Form buat catatan baru */}
        {showNewNoteForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: '600',
                margin: 0
              }}>
                Buat Catatan Baru
              </h3>
              <button
                onClick={() => setShowNewNoteForm(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Pilih warna */}
              <div>
                <label style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Pilih Warna
                </label>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {noteColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewNote({...newNote, color})}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: newNote.color === color ? '3px solid white' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Input judul */}
              <div>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Judul catatan..."
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1.1rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              {/* Input konten */}
              <div>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="Tulis catatan Anda di sini..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Tombol aksi */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateNote}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: '#0050B7',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Daftar catatan */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '3rem'
          }}>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '1rem'
            }}>
              Memuat catatan...
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: 'rgba(255,255,255,0.5)'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.5, marginBottom: '1rem' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h3 style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.5rem',
              fontWeight: '400',
              margin: '0 0 0.5rem 0'
            }}>
              Belum ada catatan
            </h3>
            <p style={{ margin: 0 }}>
              Buat catatan pertama Anda untuk mulai menyimpan ide dan pemikiran.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  backgroundColor: `${note.color}20`,
                  border: `2px solid ${note.color}`,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  position: 'relative',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header catatan */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    margin: 0,
                    flex: 1
                  }}>
                    {note.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteNote(note.id!)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>

                {/* Konten catatan */}
                <div style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: '1rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {note.content}
                </div>

                {/* Footer catatan */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <span style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem'
                  }}>
                    {formatDate(note.updatedAt)}
                  </span>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: note.color
                  }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
