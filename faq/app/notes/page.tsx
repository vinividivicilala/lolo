'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  onAuthStateChanged
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
  categoryColor?: string;
}

export default function NotesPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({ 
    title: "", 
    category: "", 
    link: "", 
    description: "" 
  });
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);

  // Warna untuk kategori
  const categoryColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#84CC16", "#6366F1"
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

  // Buat catatan baru
  const handleCreateNote = async () => {
    if (!user || !db || !newNote.title.trim()) {
      alert("Judul catatan harus diisi");
      return;
    }

    try {
      // Pilih warna acak untuk kategori
      const randomColor = categoryColors[Math.floor(Math.random() * categoryColors.length)];
      
      const noteData = {
        title: newNote.title.trim(),
        category: newNote.category.trim(),
        link: newNote.link.trim(),
        description: newNote.description.trim(),
        userId: user.uid,
        categoryColor: randomColor,
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

  // Fungsi untuk mendapatkan preview dari link
  const getLinkPreview = (link: string) => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      
      // Untuk YouTube
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
        fontSize: '1rem'
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
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          letterSpacing: '-0.5px'
        }}>
          Menuru
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1rem',
            color: '#888'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '1rem'
            }}>
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span>{userDisplayName}</span>
          </div>
          
          <button
            onClick={() => setShowNewNoteForm(true)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '7rem 1rem 2rem',
        boxSizing: 'border-box'
      }}>
        {/* Daftar catatan */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '3rem',
            fontSize: '1rem',
            color: '#888'
          }}>
            Memuat catatan...
          </div>
        ) : notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem'
          }}>
            <div style={{
              fontSize: '1.2rem',
              color: '#888',
              marginBottom: '1rem'
            }}>
              Belum ada catatan
            </div>
            <div style={{
              fontSize: '1rem',
              color: '#555'
            }}>
              Buat catatan pertama Anda
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3rem'
          }}>
            {notes.map((note) => {
              const linkPreview = getLinkPreview(note.link);
              
              return (
                <div
                  key={note.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  {/* Judul */}
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    lineHeight: 1.2
                  }}>
                    {note.title}
                  </div>

                  {/* Kategori dengan label warna */}
                  {note.category && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.25rem'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: note.categoryColor || '#3B82F6'
                      }} />
                      <span style={{
                        fontSize: '1rem',
                        color: note.categoryColor || '#3B82F6',
                        fontWeight: '500'
                      }}>
                        {note.category}
                      </span>
                    </div>
                  )}

                  {/* Deskripsi */}
                  {note.description && (
                    <div style={{
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      color: '#ccc',
                      marginTop: '0.5rem',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {note.description}
                    </div>
                  )}

                  {/* Link preview */}
                  {linkPreview && (
                    <div style={{
                      margin: '1rem 0'
                    }}>
                      <img
                        src={linkPreview}
                        alt="Link preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        style={{
                          width: '100%',
                          maxWidth: '560px',
                          height: 'auto',
                          aspectRatio: '16/9',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}

                  {/* Footer dengan tanggal dan tombol link */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#888'
                    }}>
                      {formatDate(note.updatedAt)}
                    </span>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
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
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                          }}
                        >
                          Buka Link
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 17l9.2-9.2M17 17V7H7"/>
                          </svg>
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleDeleteNote(note.id!)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#888',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
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
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '600px',
            padding: '2.5rem'
          }}>
            <div style={{
              marginBottom: '2.5rem'
            }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                Buat Catatan Baru
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Input judul */}
              <div>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Judul"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '2.5rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: 'bold',
                    lineHeight: 1.2
                  }}
                />
              </div>

              {/* Input kategori */}
              <div>
                <input
                  type="text"
                  value={newNote.category}
                  onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                  placeholder="Kategori"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#888',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              {/* Input link */}
              <div>
                <input
                  type="text"
                  value={newNote.link}
                  onChange={(e) => setNewNote({...newNote, link: e.target.value})}
                  placeholder="Link (YouTube, dll.)"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#888',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                />
              </div>

              {/* Input deskripsi */}
              <div>
                <textarea
                  value={newNote.description}
                  onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                  placeholder="Deskripsi"
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ccc',
                    fontSize: '1.1rem',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    resize: 'none',
                    lineHeight: 1.6
                  }}
                />
              </div>

              {/* Tombol aksi */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#888',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateNote}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Simpan
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
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
