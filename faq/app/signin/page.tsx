'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/apiClient";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// Ikon (sama seperti signup - copy dari atas)
const ShoppingBag = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 6H18L19 18H5L6 6Z" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 10V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V10" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SouthEastArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7M17 17V7H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NorthWestArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 17L7 7M7 17V7H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldCheck = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L3 6V12C3 16.97 6.84 21.67 12 22C17.16 21.67 21 16.97 21 12V6L12 2Z" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    {open ? (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </>
    ) : (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const HelpDeskIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 15C5 13.8954 5.89543 13 7 13H8C9.10457 13 10 13.8954 10 15V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V15Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M19 15C19 13.8954 18.1046 13 17 13H16C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H17C18.1046 19 19 18.1046 19 17V15Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, { opacity: 0, duration: 0.6, onComplete });
        }
      },
    });
    gsap.set(textRef.current, { y: 100, opacity: 0 });
    tl.to(textRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.6 })
      .to(textRef.current, {
        opacity: 0, y: -20, scale: 0.9, duration: 0.4,
        onComplete: () => { if (textRef.current) textRef.current.textContent = "Note"; },
      })
      .to(textRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.8 })
      .to(textRef.current, { scale: 0.3, opacity: 0, duration: 0.7 })
      .to(preloaderRef.current, { scale: 0.95, opacity: 0.8, duration: 0.3 }, "-=0.3");
  }, [onComplete]);

  return (
    <div ref={preloaderRef} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "#ffffff", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 9999, fontFamily: FONT_FAMILY,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
        <span style={{ fontSize: "100px", fontWeight: 700, color: "#0D3CFC" }}>Menuru</span>
        <span ref={textRef} style={{ fontSize: "50px", fontWeight: 600, color: "#000000", display: "inline-block" }}>Shop</span>
      </div>
    </div>
  );
};

export default function SignInPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [showMain, setShowMain] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [isNewPin, setIsNewPin] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);
  const handlePreloaderComplete = () => setShowMain(true);

  useEffect(() => {
    if (!showMain) return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [showMain]);

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (menuOverlayRef.current) gsap.fromTo(menuOverlayRef.current, { y: "-100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.6 });
      if (plusIconRef.current) gsap.to(plusIconRef.current, { rotation: 45, duration: 0.4 });
    } else {
      if (menuOverlayRef.current) gsap.to(menuOverlayRef.current, { y: "-100%", opacity: 0, duration: 0.5, onComplete: () => setIsMenuOpen(false) });
      else setIsMenuOpen(false);
      if (plusIconRef.current) gsap.to(plusIconRef.current, { rotation: 0, duration: 0.4 });
    }
  };

  useEffect(() => {
    if (!showMain || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        const result = await apiRequest<{ user: any }>("/auth/signin", {
          method: "POST",
          body: JSON.stringify({ idToken }),
        });

        if (result.success && result.data) {
          setTempUser(currentUser);
          if (result.data.user.hasPin) {
            setShowPinScreen(true);
            setIsNewPin(false);
          } else {
            setShowPinScreen(true);
            setIsNewPin(true);
          }
          setUser(null);
        }
      } else {
        setUser(null);
        setShowPinScreen(false);
        setTempUser(null);
      }
    });
    return () => unsubscribe();
  }, [showMain]);

  const handlePinSubmit = async () => {
    if (!auth?.currentUser) return;
    const idToken = await auth.currentUser.getIdToken();

    if (isNewPin) {
      if (pin.length !== 6) { setPinError("PIN harus 6 digit"); return; }
      if (pin !== pinConfirm) { setPinError("PIN tidak cocok"); return; }
      setPinError("");

      const result = await apiRequest("/auth/save-pin", {
        method: "POST",
        body: JSON.stringify({ idToken, pin }),
      });

      if (!result.success) { setPinError(result.error || "Gagal menyimpan PIN"); return; }
      setUser(tempUser);
      setShowPinScreen(false);
      router.push("/");
    } else {
      if (pin.length !== 6) { setPinError("PIN harus 6 digit"); return; }
      setPinError("");

      const result = await apiRequest("/auth/verify-pin", {
        method: "POST",
        body: JSON.stringify({ idToken, pin }),
      });

      if (!result.success) { setPinError(result.error || "PIN salah"); return; }
      setUser(tempUser);
      setShowPinScreen(false);
      router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      setError(err.message || "Login Google gagal");
    } finally { setLoading(false); }
  };

  const handleGitHubLogin = async () => {
    if (!auth) return;
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
    } catch (err: any) {
      setError(err.message || "Login GitHub gagal");
    } finally { setLoading(false); }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const map: Record<string, string> = {
        "auth/invalid-email": "Email tidak valid",
        "auth/user-not-found": "Akun tidak ditemukan",
        "auth/wrong-password": "Password salah",
        "auth/invalid-credential": "Email atau password salah",
      };
      setError(map[err.code] || "Login gagal");
    } finally { setLoading(false); }
  };

  if (!isMounted || !showMain) return <Preloader onComplete={handlePreloaderComplete} />;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY, position: "relative" }}>
      {/* HEADER */}
      <div style={{
        position: "fixed", top: "40px", left: "40px", right: "40px", zIndex: 101,
        display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none",
      }}>
        <Link href="/" style={{ pointerEvents: "auto", opacity: isMenuOpen ? 0 : 1 }}>
          <h1 style={{ fontSize: "48px", fontWeight: 700, color: "#000000", letterSpacing: "-0.03em", margin: 0 }}>Menuru</h1>
        </Link>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", pointerEvents: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ShoppingBag size={20} />
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC" }}>Shop</span>
            </Link>
            <Link href="/profile" style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC" }}>About</Link>
            <Link href="/signup" style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC" }}>Sign Up</Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={28} />
              <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", lineHeight: 1 }}>Anti-Fraud</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={28} />
              <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", lineHeight: 1 }}>Anti-Bot</span>
            </div>
            <Link href="/pusat-bantuan" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px",
            }}>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000" }}>Pusat Bantuan</span>
              <div style={{ background: "#000000", borderRadius: "4px", padding: "4px", color: "#fff" }}>
                <NorthWestArrow size={24} />
              </div>
            </Link>
            <div onClick={toggleMenu} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer",
            }}>
              <div style={{ background: "#000000", borderRadius: "4px", padding: "4px", color: "#fff" }}>
                <span ref={plusIconRef} style={{ fontSize: "24px", lineHeight: 1, display: "inline-block" }}>
                  {isMenuOpen ? "✕" : "+"}
                </span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000" }}>
                {isMenuOpen ? "Close" : "Menu"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div ref={menuOverlayRef} style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "#0D3CFC", zIndex: 100,
        display: isMenuOpen ? "flex" : "none",
        transform: "translateY(-100%)", opacity: 0, padding: "40px",
      }}>
        <h1 style={{ fontSize: "48px", fontWeight: 700, color: "#ffffff", margin: 0, position: "absolute", top: "40px", left: "40px" }}>
          Menuru
        </h1>
      </div>

      {/* KONTEN */}
      <div style={{
        marginTop: "180px", padding: "0 40px 80px", width: "100%", maxWidth: "1400px",
        marginLeft: "auto", marginRight: "auto",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "40px" : "80px", justifyContent: "center", minHeight: "calc(100vh - 260px)",
      }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ flex: isMobile ? "1" : "0 0 55%", maxWidth: isMobile ? "100%" : "600px" }}
        >
          {!showPinScreen && !user ? (
            <>
              <h1 style={{
                fontSize: isMobile ? "80px" : "200px", fontWeight: 700, color: "#0D3CFC",
                letterSpacing: "-0.05em", lineHeight: 1, margin: "0 0 10px 0", wordBreak: "break-word",
              }}>
                Sign In
              </h1>
              <p style={{ fontSize: "18px", color: "#666", marginBottom: "32px" }}>
                Welcome back! Sign in to your account
              </p>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ color: "#0D3CFC", fontSize: "15px", marginBottom: "16px" }}>
                  {error}
                </motion.div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                <button onClick={handleGoogleLogin} disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px",
                    border: "2px solid #e8e8e8", borderRadius: "12px", background: "#fff",
                    cursor: loading ? "not-allowed" : "pointer", width: "100%", fontSize: "16px", color: "#333",
                  }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button onClick={handleGitHubLogin} disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px",
                    border: "2px solid #e8e8e8", borderRadius: "12px", background: "#fff",
                    cursor: loading ? "not-allowed" : "pointer", width: "100%", fontSize: "16px", color: "#333",
                  }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#333" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e8e8e8" }} />
                <span style={{ color: "#999", fontSize: "14px" }}>or</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e8e8e8" }} />
              </div>

              <form onSubmit={handleEmailLogin} style={{ width: "100%" }}>
                <input type="email" placeholder="Email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required
                  style={{ width: "100%", padding: "16px 20px", border: "2px solid #e8e8e8", borderRadius: "12px", fontSize: "16px", marginBottom: "16px", outline: "none", fontFamily: FONT_FAMILY }} />

                <div style={{ position: "relative", marginBottom: "24px" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    style={{ width: "100%", padding: "16px 50px 16px 20px", border: "2px solid #e8e8e8", borderRadius: "12px", fontSize: "16px", outline: "none", fontFamily: FONT_FAMILY }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{
                    width: "100%", padding: "16px 20px",
                    backgroundColor: loading ? "#ccc" : "#0D3CFC", color: "#fff",
                    border: "none", borderRadius: "12px", fontSize: "18px",
                    fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY,
                  }}>
                  {loading ? "Signing In..." : "Sign In"}
                </motion.button>
              </form>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={() => router.push("/forgot-password")}
                  style={{ background: "none", border: "none", color: "#0D3CFC", fontSize: "15px", cursor: "pointer", textDecoration: "underline" }}>
                  Forgot password?
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#666", fontSize: "15px" }}>Don't have an account?</span>
                  <button onClick={() => router.push("/signup")}
                    style={{ background: "none", border: "none", color: "#0D3CFC", fontSize: "15px", fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}>
                    Sign up
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
                <Link href="/pusat-bantuan" style={{ color: "#0D3CFC", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <HelpDeskIcon size={18} />
                  <span>Pusat Bantuan</span>
                </Link>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <h2 style={{ fontSize: "36px", fontWeight: 600, color: "#0D3CFC", marginBottom: "8px" }}>
                {isNewPin ? "Buat PIN 6 Digit" : "Masukkan PIN"}
              </h2>
              <p style={{ fontSize: "18px", color: "#666", marginBottom: "32px" }}>
                {isNewPin ? "Buat PIN untuk keamanan tambahan" : "Masukkan PIN 6 digit Anda"}
              </p>

              {isNewPin ? (
                <div style={{ display: "flex", gap: "24px", width: "100%", maxWidth: "400px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "14px", color: "#666", display: "block", marginBottom: "4px" }}>PIN</label>
                    <input type="password" maxLength={6} value={pin}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setPin(v); }}
                      style={{ width: "100%", padding: "20px", fontSize: "32px", textAlign: "center", border: "2px solid #e8e8e8", borderRadius: "12px", letterSpacing: "8px", outline: "none" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "14px", color: "#666", display: "block", marginBottom: "4px" }}>Konfirmasi</label>
                    <input type="password" maxLength={6} value={pinConfirm}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setPinConfirm(v); }}
                      style={{ width: "100%", padding: "20px", fontSize: "32px", textAlign: "center", border: "2px solid #e8e8e8", borderRadius: "12px", letterSpacing: "8px", outline: "none" }} />
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", maxWidth: "200px", marginBottom: "16px" }}>
                  <input type="password" maxLength={6} value={pin}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setPin(v); }}
                    style={{ width: "100%", padding: "20px", fontSize: "32px", textAlign: "center", border: "2px solid #e8e8e8", borderRadius: "12px", letterSpacing: "8px", outline: "none" }} />
                </div>
              )}

              {pinError && <div style={{ color: "#0D3CFC", fontSize: "16px", marginBottom: "16px" }}>{pinError}</div>}

              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setPin(""); setPinConfirm(""); setPinError(""); }}
                  style={{ padding: "12px 28px", backgroundColor: "transparent", color: "#666", border: "2px solid #ddd", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}>
                  Reset
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handlePinSubmit}
                  style={{ padding: "12px 28px", backgroundColor: "#0D3CFC", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}>
                  {isNewPin ? "Simpan PIN" : "Verifikasi"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
