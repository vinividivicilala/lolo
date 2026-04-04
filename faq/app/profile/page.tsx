
'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updateEmail,
  deleteUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  writeBatch,
  where,
  deleteDoc,
  getDocs
} from "firebase/firestore";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  auth = getAuth(app);
  db = getFirestore(app);
}

// Providers untuk login
const githubProvider = new GithubAuthProvider();
const googleProvider = new GoogleAuthProvider();

interface UserStats {
  totalLogins: number;
  lastLogin: Date;
  loginCount: number;
  userName: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [totalNotesCount, setTotalNotesCount] = useState(0);
  const [totalDonasiUser, setTotalDonasiUser] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Load user stats
  const loadUserStats = async (userId: string) => {
    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);
      if (userStatsDoc.exists()) {
        const data = userStatsDoc.data();
        setUserStats({
          totalLogins: data.totalLogins || 0,
          lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : new Date(),
          loginCount: data.loginCount || 0,
          userName: data.userName || userDisplayName
        });
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  // Load total notes count
  const loadTotalNotes = async (userId: string) => {
    try {
      const notesRef = collection(db, 'userNotes');
      const q = query(notesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      setTotalNotesCount(querySnapshot.size);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // Load total donations
  const loadTotalDonations = async (userId: string) => {
    try {
      const donationsRef = collection(db, 'donationEvents');
      const querySnapshot = await getDocs(donationsRef);
      let total = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const donors = data.donors || [];
        const userDonations = donors.filter((d: any) => d.userId === userId);
        userDonations.forEach((donation: any) => {
          total += donation.amount || 0;
        });
      });
      setTotalDonasiUser(total);
    } catch (error) {
      console.error("Error loading donations:", error);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        setUserDisplayName(name);
        await loadUserStats(currentUser.uid);
        await loadTotalNotes(currentUser.uid);
        await loadTotalDonations(currentUser.uid);
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
      fontFamily: 'Helvetica, Arial, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.02) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(255,255,255,0.02) 0%, transparent 40%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.005) 0px, rgba(255,255,255,0.005) 2px, transparent 2px, transparent 20px)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header dengan NORTH WEST ARROW di kiri */}
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* NORTH WEST ARROW SVG - di sisi kiri */}
        <motion.div
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            padding: '0.5rem'
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

        {/* Title */}
        <div style={{
          fontSize: isMobile ? '1.2rem' : '1.5rem',
          fontWeight: '300',
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>
          Profile
        </div>

        {/* Empty div untuk spacing */}
        <div style={{ width: '80px' }} />
      </div>

      {/* Blinking dot pemancar di sisi kanan */}
      <motion.div
        animate={{
          opacity: [1, 0.3, 1],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'fixed',
          top: '50%',
          right: isMobile ? '1rem' : '2rem',
          transform: 'translateY(-50%)',
          width: isMobile ? '8px' : '12px',
          height: isMobile ? '8px' : '12px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)',
          zIndex: 20
        }}
      />

      {/* Main Content */}
      <div style={{
        padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            style={{
              width: isMobile ? '100px' : '120px',
              height: isMobile ? '100px' : '120px',
              borderRadius: '50%',
              margin: '0 auto 1.5rem auto',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}
          >
            <span style={{
              fontSize: isMobile ? '3rem' : '3.5rem',
              fontWeight: '300'
            }}>
              {user ? userDisplayName.charAt(0).toUpperCase() : '?'}
            </span>
          </motion.div>

          <h1 style={{
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: '300',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            {user ? userDisplayName : 'Guest User'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            marginTop: '0.5rem'
          }}>
            {user ? user.email : 'Not signed in'}
          </p>
        </motion.div>

        {/* Profile Info Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}
        >
          {/* Member Since */}
          <div style={{
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.8rem',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                Member Since
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.7rem',
                fontFamily: 'monospace'
              }}>
                01
              </span>
            </div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: '300'
            }}>
              {user && user.metadata?.creationTime 
                ? new Date(user.metadata.creationTime).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : '2024'}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1rem'
          }}>
            {[
              { label: 'Total Notes', value: totalNotesCount, delay: 0.5 },
              { label: 'Total Logins', value: userStats?.loginCount || 0, delay: 0.55 },
              { label: 'Total Donasi', value: totalDonasiUser, delay: 0.6, isRupiah: true }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay }}
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 0,
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '300',
                  marginBottom: '0.5rem'
                }}>
                  {stat.isRupiah ? formatRupiah(stat.value) : stat.value}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.8rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1rem'
            }}
          >
            {!user ? (
              <motion.button
                onClick={() => router.push('/signin')}
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                Sign In
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={() => router.push('/notes')}
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span>My Notes</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 7h10v10" />
                    <path d="M17 7L7 17" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={() => router.push('/donatur')}
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span>Donation History</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 7h10v10" />
                    <path d="M17 7L7 17" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    marginTop: '1rem'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <span>Logout</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div style={{
        padding: isMobile ? '1.5rem' : '2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.8rem',
        letterSpacing: '1px',
        marginTop: '2rem'
      }}>
        MENURU — Profile
      </div>
    </div>
  );
}
