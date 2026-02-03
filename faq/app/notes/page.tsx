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

export default function NotesPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
      year: 'numeric'
    });
  };

  // Fungsi untuk mendapatkan preview dari link
  const getLinkPreview = (link: string) => {
    if (!link) return null;
    
    try {
      const url = new URL(link);
      const domain = url.hostname;
      
      // Untuk YouTube
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        return `https://img.youtube.com/vi/${videoId}/0.jpg`;
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
      }}>
        Loading Notes...
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
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'black',
        borderBottom: '1px solid #333',
        zIndex: 100,
      }}>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
        }}>
          CATATAN
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <button
            onClick={() => setShowNewNoteForm(true)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            TAMBAH
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17l9.2-9.2M17 17V7H7"/>
            </svg>
          </button>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid white',
              color: 'white',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '6rem 2rem 2rem',
        boxSizing: 'border-box',
      }}>
        {/* Form buat catatan baru */}
        {showNewNoteForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
          }}>
            <div style={{
              backgroundColor: '#111',
              border: '1px solid #333',
              width: '100%',
              maxWidth: '600px',
              padding: '2rem',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}>
                  BUAT CATATAN BARU
                </div>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0',
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}>
                {/* Input judul */}
                <div>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    placeholder="JUDUL"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'black',
                      border: '1px solid #333',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                    }}
                  />
                </div>

                {/* Input kategori */}
                <div>
                  <input
                    type="text"
                    value={newNote.category}
                    onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                    placeholder="KATEGORI"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'black',
                      border: '1px solid #333',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                    }}
                  />
                </div>

                {/* Input link */}
                <div>
                  <input
                    type="text"
                    value={newNote.link}
                    onChange={(e) => setNewNote({...newNote, link: e.target.value})}
                    placeholder="LINK"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'black',
                      border: '1px solid #333',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                    }}
                  />
                </div>

                {/* Input deskripsi */}
                <div>
                  <textarea
                    value={newNote.description}
                    onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                    placeholder="DESKRIPSI"
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'black',
                      border: '1px solid #333',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Tombol aksi */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '1rem',
                  marginTop: '1rem',
                }}>
                  <button
                    onClick={handleCreateNote}
                    style={{
                      padding: '1rem 2rem',
                      backgroundColor: 'black',
                      border: '1px solid white',
                      color: 'white',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    SIMPAN
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17l9.2-9.2M17 17V7H7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daftar catatan */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '3rem',
            fontSize: '1rem',
          }}>
            MEMUAT CATATAN...
          </div>
        ) : notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            fontSize: '1.2rem',
          }}>
            BELUM ADA CATATAN
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}>
            {notes.map((note) => {
              const linkPreview = getLinkPreview(note.link);
              
              return (
                <div
                  key={note.id}
                  style={{
                    border: '1px solid #333',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Header catatan */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                      }}>
                        {note.title}
                      </div>
                      {note.category && (
                        <div style={{
                          fontSize: '1rem',
                          color: '#888',
                          marginBottom: '0.5rem',
                        }}>
                          {note.category}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteNote(note.id!)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Link preview */}
                  {linkPreview && (
                    <div style={{
                      margin: '1rem 0',
                    }}>
                      <img
                        src={linkPreview}
                        alt="Link preview"
                        style={{
                          width: '100%',
                          maxWidth: '400px',
                          height: 'auto',
                          border: '1px solid #333',
                        }}
                      />
                      {note.link && (
                        <a
                          href={note.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#888',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem',
                            display: 'block',
                            textDecoration: 'none',
                          }}
                        >
                          {note.link}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Deskripsi */}
                  {note.description && (
                    <div style={{
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {note.description}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #333',
                    fontSize: '0.9rem',
                    color: '#888',
                  }}>
                    <span>
                      {formatDate(note.updatedAt)}
                    </span>
                    
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
                          border: '1px solid white',
                          padding: '0.5rem 1rem',
                        }}
                      >
                        BUKA LINK
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17l9.2-9.2M17 17V7H7"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
