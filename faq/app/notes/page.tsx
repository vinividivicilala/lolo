'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotesPage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    // Load notes from localStorage
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    return () => clearTimeout(timer);
  }, []);

  const addNote = () => {
    if (newNote.trim()) {
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNewNote("");
    }
  };

  const deleteNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const navigateToHome = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <AnimatePresence>
        {showLoading && (
          <LoadingAnimation />
        )}
      </AnimatePresence>

      {/* Main Content After Loading */}
      <AnimatePresence>
        {!showLoading && (
          <motion.div
            style={{
              padding: '2rem',
              maxWidth: '800px',
              margin: '0 auto',
              minHeight: '100vh'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Header */}
            <motion.div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: "'Noto Sans JP', sans-serif",
                margin: 0
              }}>
                私のノート
              </h1>
              
              <motion.button
                onClick={navigateToHome}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: 'black',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  whiteSpace: 'nowrap'
                }}
                whileHover={{ scale: 1.05, backgroundColor: '#f0f0f0' }}
                whileTap={{ scale: 0.95 }}
              >
                ホームへ戻る
              </motion.button>
            </motion.div>

            {/* Add Note Form */}
            <motion.div
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="新しいノートを入力..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  resize: 'vertical',
                  marginBottom: '1rem'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    addNote();
                  }
                }}
              />
              <motion.button
                onClick={addNote}
                disabled={!newNote.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: newNote.trim() ? 'black' : 'rgba(0,0,0,0.5)',
                  backgroundColor: newNote.trim() ? 'white' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: newNote.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: "'Noto Sans JP', sans-serif"
                }}
                whileHover={newNote.trim() ? { scale: 1.05, backgroundColor: '#f0f0f0' } : {}}
                whileTap={newNote.trim() ? { scale: 0.95 } : {}}
              >
                ノートを追加
              </motion.button>
            </motion.div>

            {/* Notes List */}
            <motion.div
              style={{
                display: 'grid',
                gap: '1rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {notes.map((note, index) => (
                <motion.div
                  key={index}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    position: 'relative'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    scale: 1.02 
                  }}
                >
                  <p style={{
                    color: 'white',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    fontFamily: "'Noto Sans JP', sans-serif",
                    margin: 0,
                    marginRight: '60px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {note}
                  </p>
                  <motion.button
                    onClick={() => deleteNote(index)}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: 'rgba(255,0,0,0.2)',
                      color: '#ff6b6b',
                      border: '1px solid rgba(255,0,0,0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontFamily: "'Noto Sans JP', sans-serif"
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255,0,0,0.3)',
                      scale: 1.1 
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    削除
                  </motion.button>
                </motion.div>
              ))}
              
              {notes.length === 0 && (
                <motion.div
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'Noto Sans JP', sans-serif"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  ノートがありません。新しいノートを追加してください。
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font import */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
      `}</style>
    </div>
  );
}

// Komponen Loading untuk halaman notes
function LoadingAnimation() {
  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: 10
      }}
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.6, ease: "easeInOut" }
      }}
    >
      <motion.div
        style={{
          fontSize: '4rem',
          fontWeight: '900',
          color: 'white',
          fontFamily: "'Noto Sans JP', sans-serif",
          textAlign: 'center',
          letterSpacing: '8px',
          position: 'relative'
        }}
        initial={{ 
          scale: 0.5, 
          opacity: 0, 
          rotateY: 180,
          filter: 'blur(20px)'
        }}
        animate={{ 
          scale: [0.8, 1.1, 1],
          opacity: [0, 1, 1],
          rotateY: [180, 0, 0],
          filter: ['blur(20px)', 'blur(5px)', 'blur(0px)'],
          textShadow: [
            '0 0 0px rgba(255,255,255,0)',
            '0 0 30px rgba(255,255,255,0.8)',
            '0 0 20px rgba(255,255,255,0.4)'
          ]
        }}
        transition={{ 
          duration: 2,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        私のノート
        
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            filter: 'blur(30px)',
            zIndex: -1
          }}
          animate={{
            scale: [0.8, 1.2, 0.9],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
        />
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: 'rgba(255,255,255,0.1)',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        メモ
      </motion.div>
    </motion.div>
  );
}