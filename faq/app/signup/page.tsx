'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/apiClient";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== ICONS =====
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

// ===== PRELOADER =====
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

export default function SignUpPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  const [showMain, setShowMain] = useState(false);
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
      if (menuOverlayRef.current) {
        gsap.fromTo(menuOverlayRef.current, { y: "-100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.6 });
      }
      if (plusIconRef.current) gsap.to(plusIconRef.current, { rotation: 45, duration: 0.4 });
    } else {
      if (menuOverlayRef.current) {
        gsap.to(menuOverlayRef.current, { y: "-100%", opacity: 0, duration: 0.5, onComplete: () => setIsMenuOpen(false) });
      } else setIsMenuOpen(false);
      if (plusIconRef.current) gsap.to(plusIconRef.current, { rotation: 0, duration: 0.4 });
    }
  };

  const toggleAgreement = () => {
    setShowAgreement(!showAgreement);
    if (!showAgreement && agreementRef.current) {
      gsap.fromTo(agreementRef.current, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5 });
    } else if (agreementRef.current) {
      gsap.to(agreementRef.current, { height: 0, opacity: 0, duration: 0.4 });
    }
  };

  // ===== HANDLE SIGN UP — REST API + Client SDK Login =====
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError("Anda harus menyetujui Pernyataan Persetujuan"); return; }
    setIsLoading(true);
    setError("");

    try {
      // 1. Signup via REST API
      const result = await apiRequest<{ uid: string; idToken: string }>(
        "/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        }
      );

      if (!result.success) {
        setError(result.error || "Gagal membuat akun");
        setIsLoading(false);
        return;
      }

      // 2. Login ke Firebase Client untuk set session
      if (auth) {
        try {
          await signInWithEmailAndPassword(auth, formData.email, formData.password);
          console.log("✅ Auto-login berhasil, uid:", auth.currentUser?.uid);
        } catch (loginErr: any) {
          console.warn("Auto-login gagal, user perlu login manual:", loginErr.message);
        }
      }

      // 3. Tampilkan PIN screen
      setShowPinScreen(true);
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Gagal membuat akun");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== HANDLE PIN SUBMIT =====
  const handlePinSubmit = async () => {
    if (pin.length !== 6) { setPinError("PIN harus 6 digit"); return; }
    if (pin !== pinConfirm) { setPinError("PIN tidak cocok"); return; }
    setPinError("");

    if (!auth?.currentUser) {
      setPinError("Sesi tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken();

      const result = await apiRequest("/auth/save-pin", {
        method: "POST",
        body: JSON.stringify({ idToken, pin }),
      });

      if (!result.success) {
        setPinError(result.error || "Gagal menyimpan PIN");
        return;
      }

      router.push("/");
    } catch (error: any) {
      setPinError(error.message || "Gagal menyimpan PIN");
    }
  };

  if (!isMounted || !showMain) return <Preloader onComplete={handlePreloaderComplete} />;

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#ffffff", margin: 0, padding: 0,
      position: "relative", fontFamily: FONT_FAMILY, overflowX: "hidden",
    }}>
      {/* HEADER */}
      <div style={{
        position: "fixed", top: "40px", left: "40px", right: "40px", zIndex: 101,
        display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", pointerEvents: "auto", opacity: isMenuOpen ? 0 : 1 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{ fontSize: "48px", fontWeight: 700, color: "#000000", letterSpacing: "-0.03em", margin: 0, lineHeight: 1 }}>
              Menuru
            </h1>
          </Link>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px",
          padding: "0 16px", borderRadius: "12px", pointerEvents: "auto", zIndex: 102,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ShoppingBag size={20} />
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC" }}>Shop</span>
            </Link>
            <Link href="/profile" style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC" }}>About</Link>
            <Link href="/signin" style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC" }}>Sign In</Link>
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
          {!showPinScreen ? (
            <>
              <h1 style={{
                fontSize: isMobile ? "80px" : "200px", fontWeight: 700, color: "#0D3CFC",
                letterSpacing: "-0.05em", lineHeight: 1, margin: "0 0 10px 0", wordBreak: "break-word",
              }}>
                Sign Up
              </h1>
              <p style={{ fontSize: "18px", color: "#666", marginBottom: "32px" }}>
                Create your account to join the Menuru community
              </p>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ color: "#0D3CFC", fontSize: "15px", marginBottom: "16px" }}>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSignUp} style={{ width: "100%" }}>
                <input type="text" placeholder="Full Name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                  style={{ width: "100%", padding: "16px 20px", border: "2px solid #e8e8e8", borderRadius: "12px", fontSize: "16px", marginBottom: "16px", outline: "none", fontFamily: FONT_FAMILY }} />

                <input type="email" placeholder="Email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                  style={{ width: "100%", padding: "16px 20px", border: "2px solid #e8e8e8", borderRadius: "12px", fontSize: "16px", marginBottom: "16px", outline: "none", fontFamily: FONT_FAMILY }} />

                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required minLength={6}
                    style={{ width: "100%", padding: "16px 50px 16px 20px", border: "2px solid #e8e8e8", borderRadius: "12px", fontSize: "16px", outline: "none", fontFamily: FONT_FAMILY }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                  <input type="checkbox" id="agree" checked={agreed} onChange={() => setAgreed(!agreed)}
                    style={{ width: "20px", height: "20px", marginTop: "2px", accentColor: "#0D3CFC", cursor: "pointer" }} />
                  <label htmlFor="agree" onClick={toggleAgreement}
                    style={{ fontSize: "16px", color: "#0D3CFC", cursor: "pointer", lineHeight: 1.5 }}>
                    Saya menyetujui <strong>Pernyataan Persetujuan</strong>
                  </label>
                </div>

                <div ref={agreementRef} style={{ overflow: "hidden", height: 0, opacity: 0 }}>
                  <div style={{ padding: "20px 0", fontSize: "18px", color: "#1a1a1a", lineHeight: 1.8, maxHeight: "400px", overflowY: "auto" }}>
                    <h3 style={{ fontSize: "24px", color: "#0D3CFC" }}>Pernyataan Persetujuan</h3>
                    <p><strong>1. Pengumpulan Data</strong></p>
                    <p style={{ marginLeft: "20px" }}>1.1 Kami mengumpulkan data nama, email, dan informasi profil.</p>
                    <p style={{ marginLeft: "20px" }}>1.2 Data digunakan untuk mengelola akun.</p>
                    <p><strong>2. Penggunaan Layanan</strong></p>
                    <p style={{ marginLeft: "20px" }}>2.1 Gunakan layanan sesuai ketentuan.</p>
                    <p><strong>3. Keamanan</strong></p>
                    <p style={{ marginLeft: "20px" }}>3.1 Data dilindungi enkripsi.</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px", fontSize: "14px", color: "#666" }}>
                  <span>Dengan mendaftar, Anda menyetujui</span>
                  <Link href="/privacy-policy" style={{ color: "#0D3CFC", textDecoration: "underline" }}>Kebijakan Privasi</Link>
                  <span style={{ color: "#ccc" }}>•</span>
                  <Link href="/terms-of-service" style={{ color: "#0D3CFC", textDecoration: "underline" }}>Ketentuan Layanan</Link>
                </div>

                <motion.button type="submit" disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  style={{
                    width: "100%", padding: "16px 20px",
                    backgroundColor: isLoading ? "#ccc" : "#0D3CFC", color: "#fff",
                    border: "none", borderRadius: "12px", fontSize: "18px",
                    fontWeight: 600, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY,
                  }}>
                  {isLoading ? "Creating Account..." : "Get Started"}
                </motion.button>
              </form>

              <div style={{ textAlign: "center", fontSize: "16px", color: "#666", marginTop: "16px" }}>
                Already have an account?{" "}
                <Link href="/signin" style={{ color: "#0D3CFC", textDecoration: "underline", fontWeight: 500 }}>Sign in</Link>
              </div>

              <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
                <Link href="/pusat-bantuan" style={{ color: "#0D3CFC", fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <HelpDeskIcon size={18} />
                  <span>Pusat Bantuan</span>
                </Link>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <h2 style={{ fontSize: "36px", fontWeight: 600, color: "#0D3CFC", marginBottom: "8px" }}>Buat PIN 6 Digit</h2>
              <p style={{ fontSize: "18px", color: "#666", marginBottom: "32px" }}>Buat PIN 6 digit untuk keamanan tambahan</p>

              <div style={{ display: "flex", gap: "24px", width: "100%", maxWidth: "400px", marginBottom: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", color: "#666", display: "block", marginBottom: "4px" }}>PIN</label>
                  <input type="password" maxLength={6} value={pin}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setPin(v); }}
                    style={{ width: "100%", padding: "20px", fontSize: "32px", textAlign: "center", border: "2px solid #e8e8e8", borderRadius: "12px", letterSpacing: "8px", outline: "none", fontFamily: FONT_FAMILY }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", color: "#666", display: "block", marginBottom: "4px" }}>Konfirmasi PIN</label>
                  <input type="password" maxLength={6} value={pinConfirm}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); if (v.length <= 6) setPinConfirm(v); }}
                    style={{ width: "100%", padding: "20px", fontSize: "32px", textAlign: "center", border: "2px solid #e8e8e8", borderRadius: "12px", letterSpacing: "8px", outline: "none", fontFamily: FONT_FAMILY }} />
                </div>
              </div>

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
                  Simpan PIN
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
