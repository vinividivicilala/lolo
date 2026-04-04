'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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

let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        setUserDisplayName(name);
      } else {
        setUser(null);
        setUserDisplayName("");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderTopColor: 'white',
            borderRadius: '50%'
          }}
        />
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
      fontFamily: 'Helvetica, Arial, sans-serif'
    }}>
      {/* Header hanya dengan tombol back dan tanda panah */}
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        backgroundColor: 'black',
        zIndex: 10
      }}>
        {/* NORTH WEST ARROW - tombol back */}
        <motion.div
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            width: 'fit-content'
          }}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width={isMobile ? "28" : "32"}
            height={isMobile ? "28" : "32"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 7L7 17" />
            <path d="M7 7h10v10" />
          </svg>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '300',
            letterSpacing: '1px'
          }}>
            Back
          </span>
        </motion.div>
      </div>

      {/* Konten profile sederhana */}
      <div style={{
        padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Avatar */}
        <div style={{
          width: isMobile ? '80px' : '100px',
          height: isMobile ? '80px' : '100px',
          borderRadius: '50%',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.05)'
        }}>
          <span style={{
            fontSize: isMobile ? '2.5rem' : '3rem',
            fontWeight: '300'
          }}>
            {user ? userDisplayName.charAt(0).toUpperCase() : '?'}
          </span>
        </div>

        {/* Nama dan Email */}
        <h1 style={{
          fontSize: isMobile ? '1.8rem' : '2.5rem',
          fontWeight: '300',
          margin: 0,
          color: 'white'
        }}>
          {user ? userDisplayName : 'Guest User'}
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.9rem',
          marginTop: '0.5rem',
          marginBottom: '2rem'
        }}>
          {user ? user.email : 'Not signed in'}
        </p>

        {/* Tombol Logout (hanya jika user login) */}
        {user && (
          <motion.button
            onClick={handleLogout}
            style={{
              padding: '0.8rem 2rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            Logout
          </motion.button>
        )}

        {/* Tombol Sign In jika belum login */}
        {!user && (
          <motion.button
            onClick={() => router.push('/signin')}
            style={{
              padding: '0.8rem 2rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            Sign In
          </motion.button>
        )}
      </div>
    </div>
  );
}
