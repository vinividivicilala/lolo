'use client';

import React, { useState, useEffect, useRef } from "react";
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
        fontSize: '18px'
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
        padding: '25px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: 100,
      }}>
        {/* Tombol halaman utama */}
        <button
          onClick={() => router.push('/')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            padding: '10px 0',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 7l-9.2 9.2M7 17V7h10"/>
          </svg>
          Halaman Utama
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '25px'
        }}>
          <div style={{
            fontSize: '24px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: 'white'
          }}>
            {userDisplayName}
          </div>
          
          <button
            onClick={() => setShowNewNoteForm(true)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              padding: '10px',
              cursor: 'pointer',
              fontSize: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        padding: '120px 20px 50px',
        boxSizing: 'border-box'
      }}>
        {/* Daftar catatan */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '80px',
            fontSize: '20px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: '#888'
          }}>
            Memuat catatan...
          </div>
        ) : notes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}>
            <div style={{
              fontSize: '22px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: '#888',
              marginBottom: '15px'
            }}>
              Belum ada catatan
            </div>
            <div style={{
              fontSize: '18px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              color: '#555'
            }}>
              Buat catatan pertama Anda
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '50px',
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
                    gap: '15px',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  {/* Kategori */}
                  {note.category && (
                    <div style={{
                      fontSize: '18px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: '#888',
                      marginBottom: '5px'
                    }}>
                      {note.category}
                    </div>
                  )}

                  {/* Judul */}
                  <div style={{
                    fontSize: '36px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: '1.3',
                    color: 'white'
                  }}>
                    {note.title}
                  </div>

                  {/* Deskripsi */}
                  {note.description && (
                    <div style={{
                      fontSize: '20px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      lineHeight: '1.6',
                      color: '#ccc',
                      marginTop: '15px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {note.description}
                    </div>
                  )}

                  {/* Video Player */}
                  {videoEmbedUrl && (
                    <div style={{
                      margin: '20px 0',
                      position: 'relative'
                    }}>
                      {/* YouTube Embed */}
                      {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (
                        <div style={{
                          position: 'relative',
                          paddingBottom: '56.25%', // 16:9 aspect ratio
                          height: 0,
                          overflow: 'hidden',
                          backgroundColor: '#000'
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
                        // Native video player untuk file video langsung
                        <div style={{
                          position: 'relative',
                          backgroundColor: '#000'
                        }}>
                          <video
                            ref={(el) => {
                              if (note.id) videoRefs.current[note.id] = el;
                            }}
                            src={videoEmbedUrl}
                            style={{
                              width: '100%',
                              maxWidth: '560px',
                              height: 'auto',
                              aspectRatio: '16/9',
                              backgroundColor: '#000',
                              cursor: 'pointer'
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
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
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
                    marginTop: '20px',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    <span style={{
                      fontSize: '16px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      color: '#888'
                    }}>
                      {formatDate(note.updatedAt)}
                    </span>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
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
                            gap: '8px',
                            fontSize: '16px',
                            fontFamily: 'Helvetica, Arial, sans-serif'
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
                          fontSize: '22px',
                          cursor: 'pointer',
                          padding: '0',
                          width: '30px',
                          height: '30px',
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
          padding: '20px',
          fontFamily: 'Helvetica, Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'black',
            width: '100%',
            maxWidth: '600px',
            padding: '50px',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}>
            <div style={{
              marginBottom: '40px',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              <div style={{
                fontSize: '28px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                marginBottom: '15px',
                color: 'white'
              }}>
                Buat Catatan Baru
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px',
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
                    padding: '15px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '32px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: '1.3'
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
                    padding: '15px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#888',
                    fontSize: '20px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 15px center',
                    backgroundSize: '20px'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'black', color: 'white', fontSize: '16px' }}>
                    Pilih Kategori
                  </option>
                  {categories.map((category) => (
                    <option 
                      key={category} 
                      value={category}
                      style={{ backgroundColor: 'black', color: 'white', fontSize: '16px' }}
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
                    padding: '15px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#888',
                    fontSize: '20px',
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
                  placeholder="Deskripsi Catatan"
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ccc',
                    fontSize: '20px',
                    outline: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    resize: 'none',
                    lineHeight: '1.6'
                  }}
                />
              </div>

              {/* Tombol aksi */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '20px',
                marginTop: '40px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    padding: '12px 25px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#888',
                    fontSize: '18px',
                    cursor: 'pointer',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateNote}
                  style={{
                    padding: '12px 25px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}
                >
                  Simpan Catatan
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
