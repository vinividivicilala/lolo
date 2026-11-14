'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  getDoc,
  setDoc,
  limit,
} from "firebase/firestore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Physics2DPlugin);
}

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9",
};

let app: any = null;
let auth: any = null;
let db: any = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// ===== ENCRYPTION =====
const ENCRYPTION_KEY_BASE64 = "bWVudXJ1LXNlY3JldC1rZXktMjAyNi0zMmJ5dGVzISEh";
const IV_LENGTH = 12;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
  return btoa(binary);
}

let cryptoKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey;
  const keyData = base64ToUint8Array(ENCRYPTION_KEY_BASE64);
  const keyBytes = keyData.slice(0, 32);
  cryptoKey = await window.crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  return cryptoKey;
}

async function encryptMessage(text: string): Promise<string> {
  try {
    if (typeof window === "undefined" || !window.crypto) return `encrypted:${btoa(unescape(encodeURIComponent(text)))}`;
    const key = await getCryptoKey();
    const data = new TextEncoder().encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, data);
    const encArr = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encArr.length);
    combined.set(iv, 0);
    combined.set(encArr, iv.length);
    return `encrypted:${uint8ArrayToBase64(combined)}`;
  } catch (e) {
    return `plain:${btoa(unescape(encodeURIComponent(text)))}`;
  }
}

async function decryptMessage(encrypted: string): Promise<string> {
  try {
    if (typeof window === "undefined" || !window.crypto) {
      if (encrypted.startsWith("encrypted:")) return decodeURIComponent(escape(atob(encrypted.substring(10))));
      return encrypted;
    }
    if (encrypted.startsWith("plain:")) return decodeURIComponent(escape(atob(encrypted.substring(6))));
    if (!encrypted.startsWith("encrypted:")) return encrypted;
    const combined = base64ToUint8Array(encrypted.substring(10));
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);
    const key = await getCryptoKey();
    const dec = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, data);
    return new TextDecoder().decode(dec);
  } catch {
    if (encrypted.startsWith("encrypted:") || encrypted.startsWith("plain:")) {
      try {
        const enc = encrypted.includes(":") ? encrypted.split(":")[1] : encrypted;
        return decodeURIComponent(escape(atob(enc)));
      } catch {
        return "[Message cannot be decrypted]";
      }
    }
    return encrypted;
  }
}

// ===== ANTI-BOT KEYWORDS =====
const BAN_KEYWORDS = {
  JUDOL: ["judi","slot","poker","casino","roulette","blackjack","baccarat","togel","toto","4d","3d","2d","colok","macau","singapore","hongkong","sydney","bandar","bookie","odds","bet","taruhan","jackpot","progressive","bonus","deposit","withdraw","wd","live casino","online casino","gambling","judol","slot online","maxwin","scatter","wild","free spin","situs judi","agen judi","bo","qq","domino","capsa","ceme","taruhan bola","sportsbook","parlay","mix parlay","over under","handicap","1x2"],
  PHISHING: ["phishing","scam","fraud","penipuan","tipu","rekening","transfer","minta uang","pinjam uang","kartu kredit","kartu atm","pin","password","otp","verifikasi","validasi","konfirmasi","akun bank","nomor rekening","no rek","rek","minta kirim","kirim ke","bayar ke","setor ke","investasi bodong","money game","ponzi","phising","pishing","data pribadi","informasi pribadi","ktp","nik","kk","akte","ijazah","transkrip","password bank","m-banking","mobile banking","internet banking","i-banking","e-banking"],
  MALICIOUS: ["<script","javascript:","onclick","onload","eval(","document.","window.","alert(","prompt(","confirm(","function","var ","const ","let ","=>","===","!==","localStorage","sessionStorage","document.cookie","fetch(","XMLHttpRequest","$.ajax","axios.","require(","import ","export ","module.exports"],
  SUSPICIOUS_LINKS: ["bit.ly","tinyurl","shorturl","rb.gy","cutt.ly","t.co","ow.ly","buff.ly","adf.ly","shorte.st","goo.gl","is.gd","v.gd","migre.me","tiny.cc","short.link",".xyz",".top",".club",".online",".site",".win",".bid",".loan",".date",".download",".stream",".watch",".free",".click",".biz",".info",".name",".pro",".tech",".store",".shop",".live",".app",".dev",".work",".cloud",".host"],
};

function containsBannedContent(text: string): { isBanned: boolean; reason: string } {
  const lowerText = text.toLowerCase();
  for (const k of BAN_KEYWORDS.JUDOL) if (lowerText.includes(k)) return { isBanned: true, reason: `Online Gambling (${k})` };
  for (const k of BAN_KEYWORDS.PHISHING) if (lowerText.includes(k)) return { isBanned: true, reason: `Phishing/Scam (${k})` };
  for (const k of BAN_KEYWORDS.MALICIOUS) if (lowerText.includes(k)) return { isBanned: true, reason: `Malicious Content (${k})` };
  for (const k of BAN_KEYWORDS.SUSPICIOUS_LINKS) if (lowerText.includes(k)) return { isBanned: true, reason: `Suspicious Link (${k})` };
  if (/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(lowerText)) return { isBanned: true, reason: "Suspicious IP Address" };
  if (/[0-9]{10,}/.test(lowerText)) return { isBanned: true, reason: "Suspicious Number" };
  for (const p of [/kirim ke rek/i, /transfer ke/i, /bayar ke/i, /setor ke/i, /minta kirim/i, /mohon kirim/i, /tolong kirim/i]) if (p.test(lowerText)) return { isBanned: true, reason: "Transfer/Payment Request" };
  return { isBanned: false, reason: "" };
}

const KENDALA_KEYWORDS = ["kendala","masalah","error","bug","tidak bisa","gagal","rusak","bermasalah","terkendala","help","tolong","bantuan","issue","crash","not working","tidak berfungsi","stuck","macet","lemot","lambat","susah","sulit","bingung","tidak jelas","tidak paham","butuh bantuan","mohon bantuan","problem","trouble","fail","failed"];
function containsKendala(text: string): boolean {
  const lowerText = text.toLowerCase();
  return KENDALA_KEYWORDS.some((k) => lowerText.includes(k));
}

async function banUserPermanent(userId: string, userEmail: string, userName: string, reason: string, message: string) {
  if (!db) return;
  try {
    const now = new Date().toISOString();
    await setDoc(doc(db, "bot_blocks", userId), { userId, userEmail, userName, isBlocked: true, blockedAt: now, blockedReason: reason, blockedMessage: message, canCreateTicket: false, canSendMessage: false, violations: [{ type: "BANNED", reason, timestamp: now, message, confidence: 100 }], totalViolations: 1, warningCount: 0, firstViolation: now, lastViolation: now });
    await updateDoc(doc(db, "users", userId), { botBlocked: true, botBlockedAt: serverTimestamp(), botBlockedReason: reason, botBlockedMessage: message, canCreateTicket: false, canSendMessage: false });
    await addDoc(collection(db, "bot_violations_log"), { userId, userEmail, userName, violation: { type: "BANNED", reason, timestamp: now, message, confidence: 100 }, timestamp: serverTimestamp(), resolved: false, isBan: true });
  } catch (error) { console.error("Error banning user:", error); }
}

async function checkBanStatus(userId: string): Promise<any> {
  if (!db) return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
  try {
    const botDoc = await getDoc(doc(db, "bot_blocks", userId));
    if (botDoc.exists()) {
      const d = botDoc.data();
      return { isBanned: d.isBlocked || false, reason: d.blockedReason || "", message: d.blockedMessage || "", canCreateTicket: d.canCreateTicket !== false, canSendMessage: d.canSendMessage !== false };
    }
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const u = userDoc.data();
      if (u.botBlocked === true) return { isBanned: true, reason: u.botBlockedReason || "Blocked by system", message: u.botBlockedMessage || "", canCreateTicket: u.canCreateTicket !== false, canSendMessage: u.canSendMessage !== false };
    }
    return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
  } catch { return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true }; }
}

// ===== TOTP =====
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(bytes: Uint8Array): string {
  let bits = 0, value = 0, output = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) { output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}
function base32Decode(input: string): Uint8Array {
  const cleaned = input.replace(/=+$/g, "").toUpperCase();
  const bytes: number[] = [];
  let bits = 0, value = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(bytes);
}
function generateSecret(length = 20): string {
  const random = new Uint8Array(length);
  if (typeof window !== "undefined" && window.crypto) window.crypto.getRandomValues(random);
  else for (let i = 0; i < length; i++) random[i] = Math.floor(Math.random() * 256);
  return base32Encode(random);
}
async function hotp(secret: string, counter: number, digits = 6): Promise<string> {
  const keyBytes = base32Decode(secret);
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) { counterBytes[i] = temp & 0xff; temp = Math.floor(temp / 256); }
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    let hash = 0;
    for (let i = 0; i < keyBytes.length; i++) hash = (hash * 31 + keyBytes[i]) >>> 0;
    for (let i = 0; i < 8; i++) hash = (hash * 31 + counterBytes[i]) >>> 0;
    return String(hash % Math.pow(10, digits)).padStart(digits, "0");
  }
  const cryptoKey = await window.crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = await window.crypto.subtle.sign("HMAC", cryptoKey, counterBytes);
  const h = new Uint8Array(sig);
  const offset = h[h.length - 1] & 0x0f;
  const code = ((h[offset] & 0x7f) << 24) | ((h[offset + 1] & 0xff) << 16) | ((h[offset + 2] & 0xff) << 8) | (h[offset + 3] & 0xff);
  return String(code % Math.pow(10, digits)).padStart(digits, "0");
}
async function totp(secret: string): Promise<string> {
  const counter = Math.floor(Math.floor(Date.now() / 1000) / 30);
  return hotp(secret, counter, 6);
}
async function verifyTotp(secret: string, token: string, window_ = 1): Promise<boolean> {
  const clean = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const counter = Math.floor(Math.floor(Date.now() / 1000) / 30);
  for (let i = -window_; i <= window_; i++) if ((await hotp(secret, counter + i, 6)) === clean) return true;
  return false;
}
function buildOtpAuthUri(secret: string, label: string, issuer: string): string {
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${label}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
function qrImageUrl(data: string, size = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=0`;
}
function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const raw = new Uint8Array(5);
    if (typeof window !== "undefined" && window.crypto) window.crypto.getRandomValues(raw);
    else for (let j = 0; j < 5; j++) raw[j] = Math.floor(Math.random() * 256);
    let hex = "";
    for (let j = 0; j < raw.length; j++) hex += raw[j].toString(16).padStart(2, "0");
    codes.push(hex.toUpperCase().match(/.{1,4}/g)?.join("-") || hex.toUpperCase());
  }
  return codes;
}

// ===== PASSKEY / WEBAUTHN HELPERS =====
function bufToB64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64UrlToBuf(b64url: string): ArrayBuffer {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
function randomChallenge(len = 32): Uint8Array {
  const c = new Uint8Array(len);
  if (typeof window !== "undefined" && window.crypto) window.crypto.getRandomValues(c);
  else for (let i = 0; i < len; i++) c[i] = Math.floor(Math.random() * 256);
  return c;
}
function supportsWebAuthn(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.PublicKeyCredential && navigator.credentials);
}
async function platformAuthenticatorAvailable(): Promise<boolean> {
  try {
    if (!supportsWebAuthn()) return false;
    const anyCred = window.PublicKeyCredential as any;
    if (anyCred.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await anyCred.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

// ===== CONSTANTS =====
const FONT_FAMILY = "'Plus Jakarta Sans'";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";
const OWNER_NAME = "Farid Ardiansyah";
const OWNER_EMAIL = "faridardiansyah061@gmail.com";
const TOUR_STORAGE_KEY = "menuru_livechat_tour_completed_v1";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const LIME = "#E3FB96";
const GREEN = "#4ADE80";
const MINT = "#00E3AA";
const RED = "#DC2626";
const STORE_LINK = "https://apps.microsoft.com/detail/9nv1fg4b6xvn?hl=id-ID&gl=ID";
const FARID_LINK = "https://farid-ardiansyah.netlify.app/";
const SECURITY_ISSUER = "Menuru Security Center";
const RP_NAME = "Menuru";

const FOOTER_GALLERY_IMAGES = ["/images/a1.JPG","/images/a2.JPG","/images/a3.JPG","/images/a4.JPG","/images/a5.JPG","/images/a6.JPG","/images/a71.JPG"];
const NOTES_CATEGORIES = ["Makanan","Minuman","Coding","Teknologi","Pendidikan","Kesehatan","Olahraga","Seni","Musik","Bisnis","Keuangan","Traveling","Otomotif","Game","Fashion"];
const STATUS_STYLES: any = {
  waiting: { label: "Waiting", bg: WHITE, text: BLUE, border: BLUE },
  active: { label: "Active", bg: WHITE, text: BLUE, border: BLUE },
  resolved: { label: "Resolved", bg: WHITE, text: BLUE, border: BLUE },
  closed: { label: "Closed", bg: WHITE, text: BLUE, border: BLUE },
};
const TOPIC_STYLES: any = {
  "Product Inquiry": { bg: WHITE, text: BLUE, border: BLUE },
  "Technical Support": { bg: WHITE, text: BLUE, border: BLUE },
  "Account Issues": { bg: WHITE, text: BLUE, border: BLUE },
  "Donation": { bg: WHITE, text: BLUE, border: BLUE },
  "Partnership": { bg: WHITE, text: BLUE, border: BLUE },
  "Other": { bg: WHITE, text: BLUE, border: BLUE },
};

// ===== ICONS =====
const NorthEastArrow = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const LogoutIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12H9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const CheckIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const DoubleCheckIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M1 12L5 16L13 8" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M11 12L15 16L23 8" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ClockIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" /><path d="M12 6V12L16 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ErrorIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" /><path d="M12 8V12" stroke={color} strokeWidth="2.5" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill={color} /></svg>
);
const SearchIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PlusIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" /></svg>
);
const CloseIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PeopleIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const AgentIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 21V19C5 16.7909 6.79086 15 9 15H15C17.2091 15 19 16.7909 19 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3L18 5L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 5H14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const StriperIcon = ({ size = 22, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" /><path d="M3 12H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" /><path d="M3 18H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" /></svg>
);
const TrustIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const CareerIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 13H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ResourcesIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 4H10C11.1046 4 12 4.89543 12 6V20C12 18.8954 11.1046 18 10 18H4V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 4H14C12.8954 4 12 4.89543 12 6V20C12 18.8954 12.8954 18 14 18H20V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const DocsIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 13H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 17H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const BrandIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20.59 13.41L11 3.83C10.6 3.43 10.06 3.2 9.5 3.2H4C2.9 3.2 2 4.1 2 5.2V10.7C2 11.26 2.22 11.8 2.63 12.2L12.21 21.79C13 22.57 14.27 22.57 15.06 21.79L20.59 16.26C21.37 15.47 21.37 14.2 20.59 13.41Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7" cy="7" r="1.5" fill={color} /></svg>
);
const ReplyIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 17L4 12L9 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 12H14C17.3137 12 20 14.6863 20 18V19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ShieldBanIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 9L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" /><path d="M15 9L9 15" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>
);
const ShieldLockIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="9" y="11" width="6" height="5" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11V9C10 8 10.5 7 12 7C13.5 7 14 8 14 9V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const KeyIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="8" cy="15" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.85 12.15L19 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18 5L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 8L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const InviteIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M20 8V14" stroke={color} strokeWidth="2" strokeLinecap="round" /><path d="M23 11H17" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>
);
const WindowsIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="9" height="9" fill={color} /><rect x="13" y="2" width="9" height="9" fill={color} /><rect x="2" y="13" width="9" height="9" fill={color} /><rect x="13" y="13" width="9" height="9" fill={color} /></svg>
);
const MicrosoftStoreIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block" }}>
    <path d="M9 3.5C9 2.67157 9.67157 2 10.5 2H13.5C14.3284 2 15 2.67157 15 3.5V5H9V3.5Z" fill="#0078D4" />
    <path d="M4 5H20C20.5523 5 21 5.44772 21 6V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V6C3 5.44772 3.44772 5 4 5Z" fill="#0078D4" />
    <rect x="6" y="8" width="5" height="5" fill="#F25022" /><rect x="13" y="8" width="5" height="5" fill="#7FBA00" /><rect x="6" y="14" width="5" height="5" fill="#00A4EF" /><rect x="13" y="14" width="5" height="5" fill="#FFB900" />
  </svg>
);

const VerifiedBadgeWhite = ({ size = 16 }: { size?: number }) => (
  <span style={{ position: "relative", display: "inline-block", marginLeft: "4px", verticalAlign: "middle" }}>
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path fill="#FFFFFF" d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" />
    </svg>
  </span>
);
const VerifiedBadgeBlue = ({ size = 16 }: { size?: number }) => (
  <span style={{ position: "relative", display: "inline-block", marginLeft: "4px", verticalAlign: "middle" }}>
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path fill={BLUE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" />
    </svg>
  </span>
);
const BlinkingDot = ({ size = 10, color = BLUE }: { size?: number; color?: string }) => (
  <span style={{ display: "inline-block", width: `${size}px`, height: `${size}px`, borderRadius: "50%", backgroundColor: color, flexShrink: 0, animation: "blinking-dot 1s ease-in-out infinite" }} />
);
const StabiloBadge = ({ label, bg, text, border, size = "sm" }: { label: string; bg: string; text: string; border: string; size?: "sm" | "md" }) => {
  const isSmall = size === "sm";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: isSmall ? "3px 9px" : "4px 11px", borderRadius: "4px", border: `1.5px solid ${border}`, backgroundColor: bg, color: text, fontSize: isSmall ? "10px" : "11px", fontWeight: 800, letterSpacing: "0.6px", textTransform: "uppercase", fontFamily: FONT_FAMILY, lineHeight: 1.3, whiteSpace: "nowrap" }}>{label}</span>
  );
};

const footerLinks = [
  { title: "Get in Touch", links: ["Contact Us", "Instagram", "Live Chat"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"] },
  { title: "Attention", links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Cookies Policy", "Help Center"] },
];

// ===== INTERFACES =====
interface Ticket { id: string; userId: string; userName: string; userEmail: string; userPhoto?: string; agentId?: string; agentName?: string; status: "waiting" | "active" | "resolved" | "closed"; topic: string; createdAt: any; lastMessage?: string; lastMessageTime?: any; lastMessageSender?: string; unreadCount: number; typing: boolean; typingUserId?: string | null; typingUserName?: string | null; isAnnouncement?: boolean; isBroadcast?: boolean; isBanned?: boolean; banReason?: string; banMessage?: string; }
interface ChatMessage { id: string; senderId: string; senderName: string; text: string; timestamp: any; read: boolean; isEncrypted?: boolean; isBotDetected?: boolean; deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed"; replyTo?: { messageId: string; senderName: string; text: string } | null; }
interface OnlineUser { uid: string; displayName: string; email: string; photoURL?: string; online: boolean; lastSeen?: any; isAgent?: boolean; isAnonymous?: boolean; }
interface LastMessagePreview { text: string; senderName: string; timestamp: any; isFromAgent: boolean; }
interface TourStep { target: string; title: string; content: string; position?: "top" | "bottom" | "left" | "right"; isLoginStep?: boolean; }
interface AppealMessage { id: string; senderId: string; senderName: string; text: string; timestamp: any; read: boolean; isEncrypted?: boolean; deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed"; replyTo?: { messageId: string; senderName: string; text: string } | null; }
interface AppealTicket { id: string; userId: string; userName: string; userEmail: string; userPhoto?: string; agentId?: string; agentName?: string; status: "waiting" | "active" | "resolved" | "closed"; topic: string; banReason: string; banMessage: string; createdAt: any; lastMessage?: string; lastMessageTime?: any; lastMessageSender?: string; unreadCount: number; typing: boolean; typingUserId?: string | null; typingUserName?: string | null; }
interface NoteEntry { id: string; userId: string; userName: string; userEmail: string; userPhoto?: string; text?: string; category?: string; title?: string; descriptionHtml?: string; description?: string; link?: string; hasKendala?: boolean; adminTagged?: boolean; createdAt: any; updatedAt?: any; labelColor?: string; savedBy?: string[]; collaborators?: string[]; collaboratorNames?: { [key: string]: string }; collaboratorEmails?: { [key: string]: string }; isAnonymous?: boolean; }
interface InviteUser { uid: string; displayName: string; email: string; photoURL?: string; isAnonymous?: boolean; }
interface NoteInvitation { id: string; noteId: string; noteTitle: string; inviterId: string; inviterName: string; inviterEmail: string; inviteeId: string; inviteeEmail: string; status: "pending" | "accepted" | "declined"; createdAt: any; }
interface PasskeyRecord { id: string; credentialId: string; name: string; createdAt: number; transports?: string[]; }

// ===== FARID VERIFIED PANEL =====
const FaridVerifiedPanel = ({ open, anchorRect, onClose }: { open: boolean; anchorRect: DOMRect | null; onClose: () => void; }) => {
  const [phase, setPhase] = useState<"loading" | "expand" | "fullpage">("loading");
  const panelRef = useRef<HTMLDivElement>(null);
  const fullPageRef = useRef<HTMLDivElement>(null);
  const closeIconRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase("loading");
      setIsClosing(false);
      const timer = setTimeout(() => setPhase("expand"), 1800);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== "expand" || !panelRef.current || !fullPageRef.current || !anchorRect) return;
    const panel = panelRef.current;
    const full = fullPageRef.current;
    gsap.set(panel, { position: "fixed", top: anchorRect.top, left: anchorRect.left, width: anchorRect.width, height: anchorRect.height, borderRadius: "6px", opacity: 1, zIndex: 9800 });
    gsap.set(full, { opacity: 0, zIndex: 9799 });
    const tl = gsap.timeline({ onComplete: () => setPhase("fullpage") });
    tl.to(panel, { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: "0px", duration: 0.7, ease: "power4.inOut" })
      .to(full, { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.35");
    return () => tl.kill();
  }, [phase, anchorRect]);

  const handleIconEnter = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 45, scale: 1.2, duration: 0.3, ease: "power2.out" }); };
  const handleIconLeave = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 0, scale: 1, duration: 0.3, ease: "power2.out" }); };
  const handleClose = () => {
    if (isClosing || !fullPageRef.current) return;
    setIsClosing(true);
    if (closeIconRef.current) gsap.to(closeIconRef.current, { rotation: 90, scale: 0, duration: 0.4, ease: "back.in(1.7)" });
    gsap.to(fullPageRef.current, { opacity: 0, y: 40, duration: 0.4, ease: "power3.in", onComplete: () => { setIsClosing(false); onClose(); } });
  };

  if (!open) return null;

  return (
    <>
      {(phase === "loading" || phase === "expand") && (
        <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 9700, background: "rgba(0,0,0,0.25)", pointerEvents: "auto" }} />
      )}
      {(phase === "loading" || phase === "expand") && anchorRect && (
        <div ref={panelRef} style={{ position: "fixed", top: anchorRect.top, left: anchorRect.left, width: anchorRect.width, height: anchorRect.height, backgroundColor: BLUE, border: `2px solid ${WHITE}`, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(13,60,252,0.55)", zIndex: 9800, pointerEvents: "auto", overflow: "hidden" }}>
          {phase === "loading" && (
            <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 40 40" style={{ animation: "verifiedPop 1.8s ease-in-out forwards" }}>
                <g style={{ transformOrigin: "center center" }}>
                  <path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" />
                  <path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: "drawCheck 0.8s ease-out 0.8s forwards" }} />
                </g>
              </svg>
            </div>
          )}
          {phase === "expand" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
                <path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" />
                <path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "11px", fontWeight: 800, color: WHITE, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>Verified</span>
            </div>
          )}
        </div>
      )}
      {(phase === "expand" || phase === "fullpage") && (
        <div ref={fullPageRef} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: BLUE, zIndex: 9799, display: phase === "fullpage" ? "flex" : "none", flexDirection: "column", fontFamily: FONT_FAMILY, color: WHITE, overflow: "hidden", opacity: 0 }}>
          <div style={{ padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <svg width="32" height="32" viewBox="0 0 40 40">
                <path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" />
                <path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span style={{ fontSize: "28px", fontWeight: 800, color: WHITE, letterSpacing: "-0.02em" }}>Verified</span>
            </div>
            <button onClick={handleClose} onMouseEnter={handleIconEnter} onMouseLeave={handleIconLeave} disabled={isClosing} style={{ background: WHITE, border: "none", color: BLUE, borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: isClosing ? "not-allowed" : "pointer" }}>
              <div ref={closeIconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><PlusIcon size={26} color={BLUE} /></div>
            </button>
          </div>
          <div style={{ flex: 1, padding: "20px 40px", display: "flex", flexDirection: "column", overflowY: "auto", gap: "24px" }}>
            <div style={{ backgroundColor: WHITE, borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              <h2 style={{ fontSize: "48px", fontWeight: 800, margin: 0, color: BLUE, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Farid Ardiansyah</h2>
              <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: BLUE, lineHeight: 1.6, maxWidth: "700px", opacity: 0.9 }}>Website ini dibangun dan dikembangkan oleh Farid Ardiansyah. Verified developer & owner of Menuru. Semua fitur, sistem, dan infrastruktur di platform ini dikelola secara langsung.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a href={FARID_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 22px", backgroundColor: BLUE, color: WHITE, borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em" }}>Kunjungi Portofolio<NorthEastArrow size={16} color={WHITE} /></a>
                <a href={`mailto:${OWNER_EMAIL}`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 22px", backgroundColor: "transparent", border: `2px solid ${BLUE}`, color: BLUE, borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em" }}>Hubungi Email</a>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", maxWidth: "900px" }}>
              {[{ label: "Nama", value: OWNER_NAME },{ label: "Email", value: OWNER_EMAIL },{ label: "Peran", value: "Founder & Developer" },{ label: "Status", value: "Verified" }].map((item, i) => (
                <div key={i} style={{ backgroundColor: WHITE, borderRadius: "16px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: BLUE, opacity: 0.6 }}>{item.label}</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: BLUE, wordBreak: "break-word" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", paddingTop: "20px", width: "100%", overflow: "hidden", textAlign: "left", lineHeight: 0.85 }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "450px", fontWeight: 400, color: WHITE, letterSpacing: "-0.05em", lineHeight: 0.85, display: "block", userSelect: "none", whiteSpace: "nowrap" }}>Menuru</span>
            </div>
            <div style={{ width: "100%", overflow: "hidden", textAlign: "left", lineHeight: 0.85, marginBottom: "20px" }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "450px", fontWeight: 400, color: WHITE, letterSpacing: "-0.05em", lineHeight: 0.85, display: "block", userSelect: "none", whiteSpace: "nowrap" }}>2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ===== TOP BANNER =====
const TopBanner = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const handleClickFarid = (e: React.MouseEvent) => {
    e.preventDefault();
    if (showPanel) { setShowPanel(false); return; }
    if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect());
    setShowPanel(true);
  };
  const handleClose = () => setShowPanel(false);
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9100, height: "44px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px", fontFamily: FONT_FAMILY }}>
        <span style={{ color: WHITE, fontSize: "14px", fontWeight: 600, letterSpacing: "0.02em", textAlign: "center", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Website this is build the develope{" "}
          <button ref={btnRef} onClick={handleClickFarid} style={{ color: BLUE, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: WHITE, padding: "2px 8px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "14px", lineHeight: 1.4, transition: "transform 0.2s ease, box-shadow 0.2s ease" }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.2)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}>
            Farid Ardiansyah
            <VerifiedBadgeBlue size={16} />
          </button>
        </span>
      </div>
      <FaridVerifiedPanel open={showPanel} anchorRect={anchorRect} onClose={handleClose} />
    </>
  );
};

// ===== HERO TITLE =====
const HeroMenuruTitle = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  useEffect(() => {
    if (!isMounted || !titleRef.current) return;
    const title = titleRef.current;
    const ctx = gsap.context(() => {
      const split = new SplitText(title, { type: "chars", charsClass: "hero-menuru-char" });
      gsap.set(split.chars, { opacity: 0, y: 220, rotationX: -90, scale: 0.4, transformOrigin: "50% 100%", force3D: true });
      gsap.to(split.chars, { opacity: 1, y: 0, rotationX: 0, scale: 1, duration: 1.4, stagger: 0.09, ease: "back.out(1.8)", delay: 0.2 });
      return () => split.revert();
    }, containerRef);
    return () => ctx.revert();
  }, [isMounted]);
  return (
    <div ref={containerRef} style={{ width: "100%", paddingTop: "120px", paddingBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", backgroundColor: WHITE }}>
      <h1 ref={titleRef} style={{ fontFamily: FONT_FAMILY, fontSize: "600px", fontWeight: 400, color: BLUE, letterSpacing: "-0.05em", lineHeight: 0.85, margin: 0, textAlign: "center", userSelect: "none", whiteSpace: "nowrap", display: "inline-block", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>Menuru</h1>
    </div>
  );
};

// ===== FOOTER =====
const FooterSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !titleRef.current || !containerRef.current) return;
    const title = titleRef.current;
    let split: any = null;
    let ctx: any = null;
    const setup = () => {
      split = new SplitText(title, { type: "chars", charsClass: "footer-menuru-char" });
      ctx = gsap.context(() => {
        gsap.set(split.chars, { yPercent: 120, opacity: 0, rotationX: -90, transformOrigin: "50% 100%", force3D: true });
        gsap.to(split.chars, { yPercent: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.08, ease: "back.out(1.7)", scrollTrigger: { trigger: containerRef.current, start: "top 90%", end: "top 40%", scrub: 1, toggleActions: "play none none reverse", invalidateOnRefresh: true } });
      }, containerRef);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(setup, 50));
    else setTimeout(setup, 200);
    return () => { if (ctx) ctx.revert(); if (split && split.revert) split.revert(); };
  }, []);
  useEffect(() => {
    if (typeof window === "undefined" || !galleryRef.current) return;
    const items = galleryRef.current.querySelectorAll(".footer-gallery-item");
    if (items.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(items, { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.1, ease: "back.out(1.5)", scrollTrigger: { trigger: galleryRef.current, start: "top 95%", toggleActions: "play none none reverse" } });
    }, galleryRef);
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 600);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1500);
    return () => { window.removeEventListener("load", onLoad); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "calc(100% - 40px)", margin: "100px auto 20px auto", backgroundColor: BLUE, borderRadius: "32px", padding: "60px 40px 40px 40px", position: "relative", overflow: "hidden", boxSizing: "border-box", color: WHITE }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: "1400px", margin: "0 auto", gap: "40px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        {footerLinks.map((section, idx) => (
          <div key={idx} style={{ flex: "1", minWidth: "200px" }}>
            <h3 style={{ fontFamily: FONT_FAMILY, fontSize: "28px", fontWeight: 700, color: WHITE, margin: 0, marginBottom: "16px", letterSpacing: "-0.01em" }}>{section.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {section.links.map((link, linkIdx) => {
                let linkHref = "#";
                let isAttention = false;
                let isStories = false;
                if (link === "Contact Us") linkHref = "/contact";
                else if (link === "Live Chat") linkHref = "/live-chat";
                else if (link === "Live Chat Agent") linkHref = "/live-chat-agent";
                else if (link === "Help Center") linkHref = "/pusat-bantuan";
                else if (link === "About Us") { linkHref = "/profile"; isAttention = true; }
                else if (link === "Privacy Policy") { linkHref = "/privacy-policy"; isAttention = true; }
                else if (link === "Terms & Conditions") { linkHref = "/terms-of-services"; isAttention = true; }
                else if (link === "Terms of Use") { linkHref = "/notfounds"; isAttention = true; }
                else if (link === "Cookies Policy") { linkHref = "/notfounds"; isAttention = true; }
                else if (link === "Stories") { linkHref = "/notfounds"; isStories = true; }
                else if (link === "Shop") linkHref = "/notfounds";
                else if (link === "Note") linkHref = "/notes";
                else if (link === "Calendar") linkHref = "/notfounds";
                else if (link === "Blog") linkHref = "/notfounds";
                else if (link === "Donation") linkHref = "/notfounds";
                else if (link === "Community") linkHref = "/notfounds";
                else if (link === "Instagram") linkHref = "https://instagram.com/menuru";
                return (
                  <div key={linkIdx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link href={linkHref} style={{ textDecoration: "none" }}><span style={{ fontFamily: FONT_FAMILY, fontSize: "20px", fontWeight: 500, color: WHITE, letterSpacing: "-0.01em", cursor: "pointer" }}>{link}</span></Link>
                    {isAttention && <span style={{ backgroundColor: WHITE, border: `1.5px solid ${WHITE}`, color: BLUE, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase", display: "inline-block" }}>Updated</span>}
                    {isStories && <span style={{ backgroundColor: WHITE, border: `1.5px solid ${WHITE}`, color: BLUE, padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase", display: "inline-block" }}>New</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ flex: "0 0 auto", minWidth: "200px" }}>
          <a href={STORE_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", cursor: "pointer", padding: "14px 22px", backgroundColor: RED, borderRadius: "12px", boxShadow: "0 6px 24px rgba(220,38,38,0.35)", transition: "transform 0.2s ease, boxShadow 0.2s ease", pointerEvents: "auto" }}>
            <WindowsIcon size={24} color={WHITE} />
            <span style={{ fontFamily: FONT_FAMILY, fontSize: "18px", fontWeight: 700, color: WHITE, letterSpacing: "-0.01em", lineHeight: 1.2, whiteSpace: "nowrap" }}>Download for Windows</span>
          </a>
        </div>
      </div>
      <div style={{ maxWidth: "1400px", margin: "40px auto 0 auto", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.2)", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 400, color: WHITE, margin: 0, textAlign: "center", letterSpacing: "0.01em", opacity: 0.8 }}>Terms and conditions apply. By using this website, you agree to our Terms of Use and Privacy Policy.</p>
      </div>
      <div style={{ marginTop: "40px", marginBottom: "24px", position: "relative", zIndex: 1 }}>
        <a href={STORE_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "12px", textDecoration: "none", cursor: "pointer", padding: "14px 22px", backgroundColor: WHITE, borderRadius: "14px", boxShadow: "0 6px 24px rgba(0,0,0,0.12)", transition: "transform 0.2s ease, boxShadow 0.2s ease", pointerEvents: "auto" }}>
          <MicrosoftStoreIcon size={36} />
          <span style={{ fontFamily: FONT_FAMILY, fontSize: "24px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Unduh Menuru</span>
        </a>
      </div>
      <div ref={galleryRef} className="footer-gallery-row" style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "12px", alignItems: "end", marginBottom: "20px", width: "100%", pointerEvents: "none" }}>
        {FOOTER_GALLERY_IMAGES.map((src, i) => (
          <div key={i} className="footer-gallery-item" style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", height: "clamp(180px, 22vw, 360px)", overflow: "visible" }}>
            <img src={src} alt={`footer-gallery-${i + 1}`} className="footer-gallery-img" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom center", display: "block", mixBlendMode: "screen", userSelect: "none", pointerEvents: "none", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.28))" }} draggable={false} />
          </div>
        ))}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <span ref={titleRef} style={{ fontFamily: FONT_FAMILY, fontSize: "600px", fontWeight: 400, color: WHITE, letterSpacing: "-0.05em", lineHeight: "0.85", display: "block", textAlign: "left", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", willChange: "transform, opacity", whiteSpace: "nowrap", margin: 0, padding: 0, overflow: "visible", position: "relative", pointerEvents: "none" }}>Menuru</span>
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: "16px", fontWeight: 400, color: WHITE, letterSpacing: "0.01em", opacity: 0.85 }}>2024 - 2026 Menuru. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

// ===== NAVBAR BUTTON =====
const NavbarButton = ({ label, panelTitle, panelDescription, panelImage, panelRightTitle, panelRightDescription, iconType, bigPanelWidth = 850, bigPanelHeight = 260, buttonColor = BLUE, buttonHoverColor = "#000000", panelColor = BLUE, iconButtonColor = "#000000", iconButtonHoverColor = BLUE, panelBoxColor = "rgba(255,255,255,0.12)", panelBoxBorder = "rgba(255,255,255,0.25)", labelTextColor = "#ffffff", labelTextHoverColor = "#ffffff", titleTextColor = "#ffffff", descriptionTextColor = "rgba(255,255,255,0.9)", iconComponent = null, isResources = false }: any) => {
  const [open, setOpen] = useState(false);
  const linesTopRef = useRef<SVGLineElement>(null);
  const linesBottomRef = useRef<SVGLineElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleEnter = () => { if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; } setOpen(true); };
  const handleLeave = () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = setTimeout(() => setOpen(false), 250); };
  useEffect(() => () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }, []);
  useEffect(() => {
    if (!linesTopRef.current || !linesBottomRef.current) return;
    if (open) { gsap.to(linesTopRef.current, { y: 2, duration: 0.35, ease: "power2.out" }); gsap.to(linesBottomRef.current, { y: -2, duration: 0.35, ease: "power2.out" }); }
    else { gsap.to(linesTopRef.current, { y: 0, duration: 0.35, ease: "power2.out" }); gsap.to(linesBottomRef.current, { y: 0, duration: 0.35, ease: "power2.out" }); }
  }, [open]);
  useEffect(() => {
    if (!panelRef.current) return;
    if (open) gsap.fromTo(panelRef.current, { opacity: 0, y: -20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" });
    else gsap.to(panelRef.current, { opacity: 0, y: -20, scale: 0.96, duration: 0.25, ease: "power2.in" });
  }, [open]);
  const strokeColor = open ? labelTextHoverColor : labelTextColor;
  return (
    <div style={{ position: "relative" }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", backgroundColor: open ? buttonHoverColor : buttonColor, backdropFilter: "blur(20px)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.18)", boxShadow: open ? "0 8px 24px rgba(0,0,0,0.35)" : `0 8px 24px ${buttonColor}55`, transition: "background-color 0.25s ease", cursor: "pointer", position: "relative", zIndex: 2 }}>
        <span style={{ color: open ? labelTextHoverColor : labelTextColor, fontSize: "13px", fontWeight: 600, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", backgroundColor: open ? iconButtonHoverColor : iconButtonColor, borderRadius: "6px" }}>
          {iconComponent ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><StriperIcon size={13} color={strokeColor} /></div> : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
              <line ref={linesTopRef} x1="4" y1="7" x2="20" y2="7" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
              <line ref={linesBottomRef} x1="4" y1="17" x2="20" y2="17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>
      {open && (
        <div ref={panelRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={{ position: "absolute", top: "calc(100% + 10px)", left: "0px", width: `${bigPanelWidth}px`, minHeight: `${bigPanelHeight}px`, backgroundColor: panelColor, backdropFilter: "blur(24px)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", boxShadow: `0 8px 32px ${panelColor}55`, zIndex: 1, fontFamily: FONT_FAMILY, color: titleTextColor, padding: "22px 26px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {isResources ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><DocsIcon size={22} color={titleTextColor} /><span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Docs</span></div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>Complete documentation of product guides, API, and Menuru tutorials.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><BrandIcon size={22} color={titleTextColor} /><span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand</span></div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>Visual assets, logos, and Menuru brand identity guidelines.</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {iconComponent ? iconComponent : iconType === "trust" ? <TrustIcon size={26} color={titleTextColor} /> : iconType === "career" ? <CareerIcon size={26} color={titleTextColor} /> : <ResourcesIcon size={26} color={titleTextColor} />}
                  <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelTitle}</span>
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>{panelDescription}</p>
              </>
            )}
          </div>
          <div style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <img src={panelImage} alt={panelTitle} style={{ width: "100%", height: "170px", objectFit: "contain", display: "block", borderRadius: "10px" }} />
              <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelRightTitle}</span>
              <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>{panelRightDescription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeftNavbar = ({ shifted }: { shifted: boolean }) => {
  return (
    <div style={{ position: "fixed", top: "64px", left: shifted ? "340px" : "60px", zIndex: 9000, display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT_FAMILY, transition: "left 0.6s cubic-bezier(0.65, 0, 0.35, 1)", willChange: "left" }}>
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", marginRight: "16px" }}>
        <img src="/images/gfssa.jpg" alt="Menuru" style={{ height: "60px", width: "auto", maxWidth: "none", objectFit: "contain", display: "block", flexShrink: 0, mixBlendMode: "multiply" }} />
        <span style={{ color: BLUE, fontSize: "60px", fontWeight: 700, letterSpacing: "-0.03em", fontFamily: FONT_FAMILY, lineHeight: 1, whiteSpace: "nowrap" }}>Menuru</span>
      </Link>
      <NavbarButton label="Teams" panelTitle="Trust" panelDescription="Your security and privacy are our top priorities with end-to-end encryption." panelImage="/images/p0l.jpg" panelRightTitle="Why Trust Us" panelRightDescription="Our systems are monitored 24/7 to protect your data." iconType="trust" bigPanelWidth={850} bigPanelHeight={260} />
      <NavbarButton label="Individual" panelTitle="Careers" panelDescription="Join our team and build a meaningful career in a supportive environment." panelImage="/images/xxz.jpg" panelRightTitle="Life at Menuru" panelRightDescription="A collaborative, flexible work culture with plenty of opportunities to grow together." iconType="career" bigPanelWidth={850} bigPanelHeight={260} />
      <NavbarButton label="Resources" panelTitle="Docs & Brand" panelDescription="Access complete documentation and Menuru brand assets in one place." panelImage="/images/p0l.jpg" panelRightTitle="Docs & Brand" panelRightDescription="Guides, visual assets, and official Menuru brand references." iconType="resources" iconComponent={<StriperIcon size={22} color="#ffffff" />} bigPanelWidth={850} bigPanelHeight={340} buttonColor={BLUE} buttonHoverColor={BLUE} panelColor="#000000" iconButtonColor="#000000" iconButtonHoverColor="#000000" panelBoxColor="rgba(255,255,255,0.12)" panelBoxBorder="rgba(255,255,255,0.25)" labelTextColor="#ffffff" labelTextHoverColor="#ffffff" titleTextColor="#ffffff" descriptionTextColor="rgba(255,255,255,0.92)" isResources={true} />
    </div>
  );
};

// ===== SECURITY CENTER (Google Authenticator Tab - 1x Setup) =====
const GoogleAuthenticatorTab = ({ user, db }: { user: any; db: any }) => {
  const [step, setStep] = useState<"loading" | "intro" | "install" | "setup" | "verify" | "success" | "active" | "disable">("loading");
  const [secret, setSecret] = useState<string>("");
  const [otpUri, setOtpUri] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [currentCodePreview, setCurrentCodePreview] = useState<string>("");
  const [countdown, setCountdown] = useState(30);
  const [showSecret, setShowSecret] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user || !db) { setStep("intro"); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.twoFactorEnabled === true && d.totpSecret) {
            setEnabled(true);
            setSecret(d.totpSecret);
            setRecoveryCodes(Array.isArray(d.totpRecoveryCodes) ? d.totpRecoveryCodes : []);
            if (active) setStep("active");
            return;
          }
        }
      } catch (e) { console.error(e); }
      if (active) setStep("intro");
    })();
    return () => { active = false; };
  }, [user, db]);

  useEffect(() => { if ((step === "setup" || step === "verify") && !secret) setSecret(generateSecret(20)); }, [step, secret]);
  useEffect(() => { if (!secret) return; setOtpUri(buildOtpAuthUri(secret, user?.email || user?.displayName || "user", SECURITY_ISSUER)); }, [secret, user]);

  useEffect(() => {
    if (step !== "active" && step !== "setup" && step !== "verify") return;
    if (!secret) return;
    let mounted = true;
    const tick = async () => {
      try { const code = await totp(secret); if (mounted) setCurrentCodePreview(code); } catch {}
      const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
      if (mounted) setCountdown(remaining);
    };
    tick();
    const int = setInterval(tick, 1000);
    return () => { mounted = false; clearInterval(int); };
  }, [step, secret]);

  useEffect(() => { if (ref.current) gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }); }, [step]);

  const handleVerify = async () => {
    if (!user || !db || !secret) return;
    if (!/^\d{6}$/.test(token.replace(/\s+/g, ""))) { setError("Kode harus 6 digit angka."); return; }
    setBusy(true); setError("");
    try {
      const ok = await verifyTotp(secret, token);
      if (!ok) { setError("Kode OTP salah atau kadaluarsa."); setBusy(false); return; }
      const codes = generateRecoveryCodes(8);
      await updateDoc(doc(db, "users", user.uid), { twoFactorEnabled: true, totpSecret: secret, totpRecoveryCodes: codes, twoFactorEnabledAt: serverTimestamp() });
      setRecoveryCodes(codes); setEnabled(true); setStep("success");
    } catch (e) { console.error(e); setError("Gagal menyimpan pengaturan 2FA."); }
    finally { setBusy(false); }
  };

  const handleDisableVerify = async () => {
    if (!user || !db || !secret) return;
    if (!/^\d{6}$/.test(token.replace(/\s+/g, ""))) { setError("Kode harus 6 digit angka."); return; }
    setBusy(true); setError("");
    try {
      const ok = await verifyTotp(secret, token);
      if (!ok) { setError("Kode OTP salah atau kadaluarsa."); setBusy(false); return; }
      await updateDoc(doc(db, "users", user.uid), { twoFactorEnabled: false, totpSecret: "", totpRecoveryCodes: [], twoFactorDisabledAt: serverTimestamp() });
      setEnabled(false); setSecret(""); setRecoveryCodes([]); setToken(""); setStep("intro");
    } catch (e) { console.error(e); setError("Gagal menonaktifkan 2FA."); }
    finally { setBusy(false); }
  };

  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); } catch {} };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: "10px", border: `2px solid ${BLUE}40`, fontSize: "16px", fontFamily: FONT_FAMILY, outline: "none", color: BLUE, fontWeight: 600, letterSpacing: "0.15em", textAlign: "center", background: WHITE };
  const primaryBtn: React.CSSProperties = { padding: "12px 22px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em", cursor: "pointer", fontFamily: FONT_FAMILY, display: "inline-flex", alignItems: "center", gap: "8px" };
  const ghostBtn: React.CSSProperties = { padding: "12px 22px", backgroundColor: "transparent", color: BLUE, border: `2px solid ${BLUE}`, borderRadius: "10px", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em", cursor: "pointer", fontFamily: FONT_FAMILY, display: "inline-flex", alignItems: "center", gap: "8px" };
  const cardStyle: React.CSSProperties = { backgroundColor: "#F0F4FF", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" };

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {step === "loading" && <div style={{ padding: "40px", textAlign: "center", color: BLUE }}>Memuat...</div>}

      {step === "intro" && (
        <>
          <div style={{ ...cardStyle, background: BLUE }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <ShieldLockIcon size={36} color={WHITE} />
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: WHITE }}>Google Authenticator</div>
                <div style={{ fontSize: "13px", color: WHITE, opacity: 0.85 }}>Setup sekali, berlaku selamanya</div>
              </div>
            </div>
            <p style={{ margin: 0, color: WHITE, fontSize: "14px", lineHeight: 1.6, opacity: 0.95 }}>
              Google Authenticator menambahkan lapisan keamanan ekstra dengan kode 6 digit yang berubah setiap 30 detik. Setup dilakukan <strong>sekali saja</strong>; setelah aktif, secret tidak bisa diganti tanpa menonaktifkan terlebih dahulu.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
              {!enabled ? (
                <button onClick={() => setStep("install")} style={{ ...primaryBtn, backgroundColor: WHITE, color: BLUE }}>Setup Google Authenticator<NorthEastArrow size={16} color={BLUE} /></button>
              ) : (
                <>
                  <button onClick={() => setStep("active")} style={{ ...primaryBtn, backgroundColor: WHITE, color: BLUE }}>Lihat Status</button>
                  <button onClick={() => { setToken(""); setError(""); setStep("disable"); }} style={{ ...ghostBtn, borderColor: WHITE, color: WHITE }}>Nonaktifkan</button>
                </>
              )}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><TrustIcon size={22} color={BLUE} /><span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Kenapa Google Authenticator?</span></div>
            <ul style={{ margin: 0, paddingLeft: "20px", color: BLUE, fontSize: "14px", lineHeight: 1.7 }}>
              <li>Kode OTP 6 digit berganti tiap 30 detik.</li>
              <li>Bekerja offline, tidak butuh internet.</li>
              <li>Standar TOTP (RFC 6238).</li>
              <li>Recovery codes sebagai backup.</li>
              <li><strong>Setup hanya 1 kali</strong> — permanen sampai dinonaktifkan manual.</li>
            </ul>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><ClockIcon size={20} color={BLUE} /><span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Status</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", backgroundColor: enabled ? GREEN : "#f59e0b" }} />
              <span style={{ color: BLUE, fontWeight: 700, fontSize: "14px" }}>{enabled ? "Aktif & Terkunci" : "Belum Aktif"}</span>
            </div>
            {enabled && currentCodePreview && <div style={{ color: BLUE, fontSize: "13px", opacity: 0.8 }}>Kode saat ini: <strong>{currentCodePreview}</strong> (sisa {countdown}s)</div>}
          </div>
        </>
      )}

      {step === "install" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}><h3 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE }}>1. Install Google Authenticator</h3></div>
          <div style={cardStyle}>
            <p style={{ margin: 0, color: BLUE, fontSize: "14px", lineHeight: 1.7 }}>Unduh <strong>Google Authenticator</strong> dari toko resmi.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ backgroundColor: WHITE, border: `2px solid ${BLUE}`, borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: BLUE, opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Android</span>
                  <span style={{ fontSize: "16px", color: BLUE, fontWeight: 800 }}>Google Play Store</span>
                </div>
              </a>
              <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ backgroundColor: WHITE, border: `2px solid ${BLUE}`, borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: BLUE, opacity: 0.7, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>iOS</span>
                  <span style={{ fontSize: "16px", color: BLUE, fontWeight: 800 }}>Apple App Store</span>
                </div>
              </a>
            </div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Langkah:</span>
            <ol style={{ margin: 0, paddingLeft: "20px", color: BLUE, fontSize: "14px", lineHeight: 1.8 }}>
              <li>Buka Play Store / App Store.</li>
              <li>Cari "Google Authenticator" (Google LLC).</li>
              <li>Tap Install, tunggu selesai.</li>
              <li>Buka aplikasi.</li>
              <li>Kembali ke sini dan lanjutkan.</li>
            </ol>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => setStep("setup")} style={primaryBtn}>Sudah Install, Lanjut<NorthEastArrow size={16} color={WHITE} /></button>
              <button onClick={() => setStep("intro")} style={ghostBtn}>Kembali</button>
            </div>
          </div>
        </>
      )}

      {step === "setup" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><h3 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE }}>2. Scan QR Code</h3></div>
          <div style={cardStyle}>
            <p style={{ margin: 0, color: BLUE, fontSize: "14px", lineHeight: 1.7 }}>Buka Google Authenticator → tap <strong>+</strong> → <strong>Scan QR code</strong>.</p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {otpUri ? (
                <div style={{ backgroundColor: WHITE, padding: "14px", borderRadius: "16px", border: `2px solid ${BLUE}` }}>
                  <img src={qrImageUrl(otpUri, 240)} alt="QR" width={240} height={240} style={{ display: "block", borderRadius: "8px" }} />
                </div>
              ) : <div style={{ padding: "30px", color: BLUE }}>Membuat QR...</div>}
            </div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Input manual:</span>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: WHITE, border: `1.5px solid ${BLUE}30`, borderRadius: "10px", padding: "10px 14px", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: BLUE, opacity: 0.7, fontWeight: 700 }}>Key</span>
              <span style={{ fontSize: "13px", color: BLUE, fontWeight: 800, letterSpacing: "0.1em", wordBreak: "break-all", textAlign: "right" }}>{showSecret ? secret : "•".repeat(secret.length || 16)}</span>
              <button onClick={() => setShowSecret((v) => !v)} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", fontSize: "12px", fontWeight: 800 }}>{showSecret ? "Sembunyikan" : "Lihat"}</button>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => copy(secret)} style={ghostBtn}>Copy Key</button>
              <button onClick={() => setStep("verify")} style={primaryBtn}>Lanjut Verifikasi<NorthEastArrow size={16} color={WHITE} /></button>
            </div>
          </div>
        </>
      )}

      {step === "verify" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><h3 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE }}>3. Verifikasi OTP</h3></div>
          <div style={cardStyle}>
            <p style={{ margin: 0, color: BLUE, fontSize: "14px", lineHeight: 1.7 }}>Masukkan kode 6 digit dari Google Authenticator.</p>
            <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/[^\d\s]/g, "").slice(0, 6))} placeholder="123456" maxLength={6} inputMode="numeric" style={inputStyle} />
            {currentCodePreview && <div style={{ color: BLUE, fontSize: "12px", opacity: 0.7, textAlign: "center" }}>Preview: <strong>{currentCodePreview}</strong> — sisa {countdown}s</div>}
            {error && <div style={{ color: RED, fontSize: "13px", fontWeight: 700 }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handleVerify} disabled={busy || token.length !== 6} style={{ ...primaryBtn, opacity: busy || token.length !== 6 ? 0.6 : 1, cursor: busy || token.length !== 6 ? "not-allowed" : "pointer" }}>{busy ? "Memverifikasi..." : "Verifikasi & Aktifkan"}<CheckIcon size={14} color={WHITE} /></button>
              <button onClick={() => { setError(""); setStep("setup"); }} style={ghostBtn}>Kembali</button>
            </div>
          </div>
        </>
      )}

      {step === "success" && (
        <>
          <div style={{ ...cardStyle, background: BLUE }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <TrustIcon size={36} color={WHITE} />
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: WHITE }}>2FA Berhasil Aktif</div>
                <div style={{ fontSize: "13px", color: WHITE, opacity: 0.85 }}>Simpan recovery codes di tempat aman.</div>
              </div>
            </div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Recovery Codes</span>
            <p style={{ margin: 0, color: BLUE, fontSize: "13px", lineHeight: 1.6 }}>Setiap kode hanya bisa dipakai sekali. Simpan di password manager.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {recoveryCodes.map((c, i) => (
                <div key={i} style={{ backgroundColor: WHITE, border: `1.5px solid ${BLUE}`, borderRadius: "10px", padding: "10px 12px", fontSize: "14px", fontWeight: 800, color: BLUE, letterSpacing: "0.08em", fontFamily: "monospace" }}>{c}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => copy(recoveryCodes.join("\n"))} style={ghostBtn}>Copy Semua</button>
              <button onClick={() => setStep("active")} style={primaryBtn}>Selesai<CheckIcon size={14} color={WHITE} /></button>
            </div>
          </div>
        </>
      )}

      {step === "active" && (
        <>
          <div style={{ ...cardStyle, background: BLUE }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <TrustIcon size={36} color={WHITE} />
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: WHITE }}>2FA Aktif</div>
                <div style={{ fontSize: "13px", color: WHITE, opacity: 0.85 }}>Setup permanen — 1x saja sampai dinonaktifkan manual.</div>
              </div>
            </div>
            {currentCodePreview && (
              <div style={{ backgroundColor: WHITE, borderRadius: "12px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", color: BLUE, opacity: 0.6, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Kode saat ini</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: BLUE, letterSpacing: "0.15em" }}>{currentCodePreview}</div>
                </div>
                <div style={{ color: BLUE, fontWeight: 800, fontSize: "14px" }}>{countdown}s</div>
              </div>
            )}
            <button onClick={() => { setToken(""); setError(""); setStep("disable"); }} style={{ ...primaryBtn, backgroundColor: WHITE, color: RED }}>Nonaktifkan 2FA</button>
          </div>
          <div style={cardStyle}>
            <span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Recovery Codes ({recoveryCodes.length})</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {recoveryCodes.map((c, i) => (
                <div key={i} style={{ backgroundColor: WHITE, border: `1.5px solid ${BLUE}`, borderRadius: "10px", padding: "10px 12px", fontSize: "14px", fontWeight: 800, color: BLUE, letterSpacing: "0.08em", fontFamily: "monospace" }}>{c}</div>
              ))}
            </div>
            <button onClick={() => copy(recoveryCodes.join("\n"))} style={ghostBtn}>Copy Semua</button>
          </div>
        </>
      )}

      {step === "disable" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><h3 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE }}>Nonaktifkan 2FA</h3></div>
          <div style={cardStyle}>
            <p style={{ margin: 0, color: BLUE, fontSize: "14px", lineHeight: 1.7 }}>Masukkan kode 6 digit untuk konfirmasi nonaktifkan.</p>
            <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/[^\d\s]/g, "").slice(0, 6))} placeholder="123456" maxLength={6} inputMode="numeric" style={inputStyle} />
            {error && <div style={{ color: RED, fontSize: "13px", fontWeight: 700 }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handleDisableVerify} disabled={busy || token.length !== 6} style={{ ...primaryBtn, backgroundColor: RED, opacity: busy || token.length !== 6 ? 0.6 : 1, cursor: busy || token.length !== 6 ? "not-allowed" : "pointer" }}>{busy ? "Memproses..." : "Nonaktifkan"}</button>
              <button onClick={() => setStep("active")} style={ghostBtn}>Batal</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===== SECURITY CENTER (Passkey Tab) =====
const PasskeyTab = ({ user, db }: { user: any; db: any }) => {
  const [step, setStep] = useState<"loading" | "intro" | "register" | "verify" | "done">("loading");
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [deviceName, setDeviceName] = useState<string>("");
  const [platformAvailable, setPlatformAvailable] = useState<boolean | null>(null);
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean>(true);
  const [registeredCredential, setRegisteredCredential] = useState<string>("");

  useEffect(() => {
    (async () => {
      const supported = supportsWebAuthn();
      setWebAuthnSupported(supported);
      if (supported) setPlatformAvailable(await platformAuthenticatorAvailable());
      if (!user || !db) { setStep("intro"); return; }
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (Array.isArray(d.passkeys)) {
            setPasskeys(d.passkeys);
          }
        }
      } catch (e) { console.error(e); }
      setStep("intro");
    })();
  }, [user, db]);

  const deviceSuggestion = () => {
    if (typeof navigator === "undefined") return "My Device";
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iPhone / iPad";
    if (/Macintosh/i.test(ua)) return "MacBook / iMac";
    if (/Android/i.test(ua)) return "Android Device";
    if (/Windows/i.test(ua)) return "Windows Laptop";
    return "My Device";
  };

  useEffect(() => { if (!deviceName) setDeviceName(deviceSuggestion()); }, [deviceName]);

  const handleRegister = async () => {
    if (!user || !db) { setError("Anda harus login dulu."); return; }
    if (!supportsWebAuthn()) { setError("Browser tidak mendukung WebAuthn."); return; }
    setBusy(true); setError("");
    try {
      const challenge = randomChallenge(32);
      const userId = new TextEncoder().encode(user.uid);
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { name: RP_NAME, id: window.location.hostname },
        user: {
          id: userId,
          name: user.email || user.uid,
          displayName: user.displayName || user.email || "User",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        timeout: 60000,
        attestation: "none",
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "preferred",
        },
      };
      const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
      if (!credential) { setError("Registrasi dibatalkan."); setBusy(false); return; }
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = bufToB64Url(credential.rawId);
      const clientDataJSON = bufToB64Url(response.clientDataJSON);
      const attestationObject = bufToB64Url(response.attestationObject);
      const transports = (response as any).getTransports ? (response as any).getTransports() : [];
      const newPasskey: PasskeyRecord = {
        id: `pk_${Date.now()}`,
        credentialId,
        name: deviceName.trim() || "My Device",
        createdAt: Date.now(),
        transports,
      };
      const updatedList = [...passkeys, newPasskey];
      await updateDoc(doc(db, "users", user.uid), {
        passkeys: updatedList,
        passkeyRegisteredAt: serverTimestamp(),
        lastPasskeyAttestation: { clientDataJSON, attestationObject },
      });
      setPasskeys(updatedList);
      setRegisteredCredential(credentialId);
      setStep("done");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "";
      if (msg.includes("not allowed") || e?.name === "NotAllowedError") setError("Registrasi dibatalkan atau ditolak browser.");
      else if (msg.includes("security") || e?.name === "SecurityError") setError("Domain tidak valid untuk WebAuthn. Pastikan akses via https:// atau localhost.");
      else setError("Gagal mendaftarkan passkey: " + (msg || "Unknown error"));
    } finally { setBusy(false); }
  };

  const handleRemovePasskey = async (pkId: string) => {
    if (!user || !db) return;
    if (!confirm("Hapus passkey ini?")) return;
    const updated = passkeys.filter((p) => p.id !== pkId);
    await updateDoc(doc(db, "users", user.uid), { passkeys: updated });
    setPasskeys(updated);
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: "10px", border: `2px solid ${BLUE}40`, fontSize: "14px", fontFamily: FONT_FAMILY, outline: "none", color: BLUE, fontWeight: 600, background: WHITE };
  const primaryBtn: React.CSSProperties = { padding: "12px 22px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em", cursor: "pointer", fontFamily: FONT_FAMILY, display: "inline-flex", alignItems: "center", gap: "8px" };
  const ghostBtn: React.CSSProperties = { padding: "12px 22px", backgroundColor: "transparent", color: BLUE, border: `2px solid ${BLUE}`, borderRadius: "10px", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em", cursor: "pointer", fontFamily: FONT_FAMILY, display: "inline-flex", alignItems: "center", gap: "8px" };
  const cardStyle: React.CSSProperties = { backgroundColor: "#F0F4FF", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {step === "loading" && <div style={{ padding: "40px", textAlign: "center", color: BLUE }}>Memuat...</div>}

      {step === "intro" && (
        <>
          <div style={{ ...cardStyle, background: BLUE }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <KeyIcon size={36} color={WHITE} />
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: WHITE }}>Passkey (WebAuthn)</div>
                <div style={{ fontSize: "13px", color: WHITE, opacity: 0.85 }}>Login tanpa password dengan biometrik / PIN</div>
              </div>
            </div>
            <p style={{ margin: 0, color: WHITE, fontSize: "14px", lineHeight: 1.6, opacity: 0.95 }}>
              Passkey menggunakan standar WebAuthn: fingerprint, Face ID, Windows Hello, PIN perangkat, atau security key USB. Data kriptografi tersimpan di perangkat Anda, tidak pernah dikirim ke server.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {!webAuthnSupported && <span style={{ padding: "6px 12px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>⚠️ Browser tidak mendukung WebAuthn</span>}
              {webAuthnSupported && platformAvailable === false && <span style={{ padding: "6px 12px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>⚠️ Platform authenticator tidak tersedia (biometrik)</span>}
              {webAuthnSupported && platformAvailable === true && <span style={{ padding: "6px 12px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>✓ Biometrik / platform authenticator tersedia</span>}
            </div>
            {passkeys.length > 0 ? (
              <button onClick={() => setStep("register")} style={{ ...primaryBtn, backgroundColor: WHITE, color: BLUE }}>Tambah Passkey Baru<NorthEastArrow size={16} color={BLUE} /></button>
            ) : (
              <button onClick={() => setStep("register")} style={{ ...primaryBtn, backgroundColor: WHITE, color: BLUE }} disabled={!webAuthnSupported}>Daftarkan Passkey Pertama<NorthEastArrow size={16} color={BLUE} /></button>
            )}
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><TrustIcon size={22} color={BLUE} /><span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Cara Kerja</span></div>
            <ol style={{ margin: 0, paddingLeft: "20px", color: BLUE, fontSize: "14px", lineHeight: 1.8 }}>
              <li>Daftar passkey sekali — perangkat membuat sepasang kunci (public + private).</li>
              <li>Public key disimpan di server (Firestore), private key tetap di perangkat.</li>
              <li>Saat login, server kirim challenge → perangkat verifikasi dengan biometrik → tanda tangan digital dikirim balik.</li>
              <li>Server verifikasi tanda tangan → login berhasil.</li>
            </ol>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Passkey Terdaftar ({passkeys.length})</span>
            </div>
            {passkeys.length === 0 ? (
              <div style={{ color: BLUE, fontSize: "13px", opacity: 0.7, padding: "10px 0" }}>Belum ada passkey terdaftar.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {passkeys.map((pk) => (
                  <div key={pk.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: WHITE, border: `1.5px solid ${BLUE}30`, borderRadius: "12px", padding: "12px 16px", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                      <KeyIcon size={20} color={BLUE} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ color: BLUE, fontWeight: 800, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pk.name}</div>
                        <div style={{ color: BLUE, opacity: 0.6, fontSize: "11px", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pk.credentialId.slice(0, 24)}...</div>
                        <div style={{ color: BLUE, opacity: 0.6, fontSize: "11px" }}>Didaftarkan: {new Date(pk.createdAt).toLocaleDateString("id-ID")}</div>
                      </div>
                    </div>
                    <button onClick={() => handleRemovePasskey(pk.id)} style={{ padding: "8px 14px", backgroundColor: "transparent", border: `1.5px solid ${RED}`, color: RED, borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: FONT_FAMILY }}>Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {step === "register" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><h3 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE }}>Daftarkan Passkey</h3></div>
          <div style={cardStyle}>
            <p style={{ margin: 0, color: BLUE, fontSize: "14px", lineHeight: 1.7 }}>Beri nama perangkat ini, lalu ikuti prompt biometrik dari browser Anda.</p>
            <div>
              <label style={{ color: BLUE, fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>Nama Perangkat</label>
              <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="Contoh: MacBook Pro, iPhone Farid" style={inputStyle} />
            </div>
            {error && <div style={{ color: RED, fontSize: "13px", fontWeight: 700, padding: "10px 14px", backgroundColor: "rgba(220,38,38,0.08)", borderRadius: "8px" }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handleRegister} disabled={busy || !webAuthnSupported || !deviceName.trim()} style={{ ...primaryBtn, opacity: busy || !webAuthnSupported || !deviceName.trim() ? 0.6 : 1, cursor: busy || !webAuthnSupported || !deviceName.trim() ? "not-allowed" : "pointer" }}>
                {busy ? "Membuka prompt perangkat..." : "Daftarkan Sekarang"}<KeyIcon size={14} color={WHITE} />
              </button>
              <button onClick={() => { setError(""); setStep("intro"); }} style={ghostBtn}>Batal</button>
            </div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontWeight: 800, color: BLUE, fontSize: "16px" }}>Tips</span>
            <ul style={{ margin: 0, paddingLeft: "20px", color: BLUE, fontSize: "13px", lineHeight: 1.7 }}>
              <li>Gunakan Chrome, Safari, Edge, atau Firefox terbaru.</li>
              <li>Pastikan situs diakses via <strong>https://</strong> atau <strong>localhost</strong>.</li>
              <li>Jika muncul opsi "Save to this device", pilih agar passkey tersimpan.</li>
              <li>Biometrik (Face ID / fingerprint) lebih aman daripada PIN.</li>
            </ul>
          </div>
        </>
      )}

      {step === "done" && (
        <>
          <div style={{ ...cardStyle, background: BLUE }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <CheckIcon size={36} color={WHITE} />
              <div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: WHITE }}>Passkey Terdaftar!</div>
                <div style={{ fontSize: "13px", color: WHITE, opacity: 0.85 }}>Sekarang Anda bisa login dengan biometrik.</div>
              </div>
            </div>
            <div style={{ backgroundColor: WHITE, borderRadius: "12px", padding: "12px 14px", fontSize: "12px", color: BLUE, fontFamily: "monospace", wordBreak: "break-all" }}>
              Credential ID: {registeredCredential.slice(0, 40)}...
            </div>
            <button onClick={() => setStep("intro")} style={{ ...primaryBtn, backgroundColor: WHITE, color: BLUE }}>Selesai<CheckIcon size={14} color={BLUE} /></button>
          </div>
        </>
      )}
    </div>
  );
};

// ===== SECURITY CENTER (Tabs) =====
const SecurityCenterPanel = ({ user, db, onBack }: { user: any; db: any; onBack: () => void }) => {
  const [tab, setTab] = useState<"totp" | "passkey">("totp");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h2 style={{ fontSize: "26px", fontWeight: 800, margin: 0, color: BLUE }}>Menuru Security Center</h2>
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "6px", backgroundColor: "#F0F4FF", borderRadius: "12px" }}>
        <button onClick={() => setTab("totp")} style={{ flex: 1, padding: "10px 14px", backgroundColor: tab === "totp" ? BLUE : "transparent", color: tab === "totp" ? WHITE : BLUE, border: "none", borderRadius: "8px", fontFamily: FONT_FAMILY, fontSize: "13px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <ShieldLockIcon size={16} color={tab === "totp" ? WHITE : BLUE} />
          Google Authenticator
        </button>
        <button onClick={() => setTab("passkey")} style={{ flex: 1, padding: "10px 14px", backgroundColor: tab === "passkey" ? BLUE : "transparent", color: tab === "passkey" ? WHITE : BLUE, border: "none", borderRadius: "8px", fontFamily: FONT_FAMILY, fontSize: "13px", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <KeyIcon size={16} color={tab === "passkey" ? WHITE : BLUE} />
          Passkey
        </button>
      </div>

      {tab === "totp" ? <GoogleAuthenticatorTab user={user} db={db} /> : <PasskeyTab user={user} db={db} />}
    </div>
  );
};

// ===== DASHBOARD OVERLAY =====
const DashboardOverlay = ({ user, db, onClose }: { user: any; db: any; onClose: () => void; }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeIconRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "security">("main");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passkeyCount, setPasskeyCount] = useState(0);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setIsAnonymous(d.isAnonymous === true);
        setTwoFactorEnabled(d.twoFactorEnabled === true);
        setPasskeyCount(Array.isArray(d.passkeys) ? d.passkeys.length : 0);
      }
      setLoading(false);
    }).catch((err) => { console.error(err); setLoading(false); });
  }, [user, db, activeTab]);

  useEffect(() => {
    if (!overlayRef.current) return;
    gsap.fromTo(overlayRef.current, { x: "100%" }, { x: "0%", duration: 0.7, ease: "power4.out" });
  }, []);

  const handleIconEnter = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 45, scale: 1.2, duration: 0.3, ease: "power2.out" }); };
  const handleIconLeave = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 0, scale: 1, duration: 0.3, ease: "power2.out" }); };
  const handleClose = () => {
    if (isClosing || !overlayRef.current) return;
    setIsClosing(true);
    if (closeIconRef.current) gsap.to(closeIconRef.current, { rotation: 90, scale: 0, duration: 0.4, ease: "back.in(1.7)" });
    gsap.to(overlayRef.current, { x: "100%", duration: 0.5, ease: "power3.in", delay: 0.2, onComplete: () => onClose() });
  };

  const handleToggleAnonymous = async () => {
    if (!user || !db || saving) return;
    setSaving(true);
    const nv = !isAnonymous;
    try { await updateDoc(doc(db, "users", user.uid), { isAnonymous: nv }); setIsAnonymous(nv); }
    catch { alert("Gagal menyimpan pengaturan."); }
    finally { setSaving(false); }
  };

  const displayName = isAnonymous ? "Anonim" : user?.displayName || user?.email?.split("@")[0] || "User";
  const gmailEmail = user?.email || "Email tidak tersedia";
  const headerTitle = activeTab === "main" ? "Dashboard" : activeTab === "settings" ? "Pengaturan Privasi" : "Security Center";

  return (
    <div ref={overlayRef} style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "600px", backgroundColor: WHITE, zIndex: 9998, display: "flex", flexDirection: "column", fontFamily: FONT_FAMILY, color: BLUE, boxShadow: "-10px 0 40px rgba(0,0,0,0.2)", overflow: "hidden" }}>
      <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {(activeTab === "settings" || activeTab === "security") && (
            <button onClick={() => setActiveTab("main")} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
          <h2 style={{ fontSize: "28px", fontWeight: 800, margin: 0, color: BLUE }}>{headerTitle}</h2>
        </div>
        <button onClick={handleClose} onMouseEnter={handleIconEnter} onMouseLeave={handleIconLeave} disabled={isClosing} style={{ background: BLUE, border: "none", color: WHITE, borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: isClosing ? "not-allowed" : "pointer" }}>
          <div ref={closeIconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><PlusIcon size={24} color={WHITE} /></div>
        </button>
      </div>

      <div style={{ padding: "24px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {activeTab === "security" ? (
          <SecurityCenterPanel user={user} db={db} onBack={() => setActiveTab("main")} />
        ) : activeTab === "main" ? (
          <>
            <div style={{ backgroundColor: BLUE, borderRadius: "24px", padding: "24px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "8px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {user?.photoURL && !isAnonymous ? <img src={user.photoURL} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "28px", fontWeight: 800, color: BLUE }}>{displayName.charAt(0).toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: WHITE, wordBreak: "break-word" }}>{displayName}</h3>
                  <p style={{ fontSize: "14px", margin: 0, color: "rgba(255,255,255,0.8)", wordBreak: "break-word" }}>{gmailEmail}</p>
                </div>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: 0 }}>Selamat datang di Dashboard Anda. Kelola pengaturan akun dan aktivitas Anda di sini.</p>
            </div>

            <div style={{ backgroundColor: BLUE, borderRadius: "24px", padding: "24px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><TrustIcon size={24} color={BLUE} /></div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: WHITE }}>Pengaturan Privasi</h3>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: 0 }}>Atur privasi akun Anda, termasuk menyembunyikan nama asli dan menampilkan diri sebagai anonim.</p>
              <button onClick={() => setActiveTab("settings")} style={{ alignSelf: "flex-start", padding: "10px 20px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "8px" }}>Buka Pengaturan</button>
            </div>

            <div style={{ backgroundColor: BLUE, borderRadius: "24px", padding: "24px", marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldLockIcon size={24} color={BLUE} /></div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: WHITE }}>Menuru Security Center</h3>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(255,255,255,0.9)", margin: 0 }}>Aktifkan Google Authenticator (setup 1x permanen) dan Passkey (WebAuthn) untuk perlindungan berlapis.</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px", color: WHITE, fontSize: "12px", fontWeight: 700 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: twoFactorEnabled ? GREEN : "#f59e0b" }} />
                  Google Auth: {twoFactorEnabled ? "Aktif" : "Belum"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px", color: WHITE, fontSize: "12px", fontWeight: 700 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: passkeyCount > 0 ? GREEN : "#f59e0b" }} />
                  Passkey: {passkeyCount} terdaftar
                </span>
              </div>
              <button onClick={() => setActiveTab("security")} style={{ alignSelf: "flex-start", padding: "10px 20px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "8px" }}>Buka Security Center</button>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "40px", textAlign: "center", overflow: "hidden" }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "250px", fontWeight: 400, color: BLUE, letterSpacing: "-0.05em", lineHeight: 0.8, display: "block", userSelect: "none" }}>Menuru</span>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", flex: 1 }}>
            <div style={{ backgroundColor: "#F0F4FF", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "8px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {user?.photoURL && !isAnonymous ? <img src={user.photoURL} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "28px", fontWeight: 800, color: WHITE }}>{displayName.charAt(0).toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE, wordBreak: "break-word" }}>{displayName}</h3>
                  <p style={{ fontSize: "14px", margin: 0, color: BLUE, opacity: 0.8, wordBreak: "break-word" }}>{gmailEmail}</p>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: "#F0F4FF", borderRadius: "24px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}><TrustIcon size={24} color={WHITE} /></div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: BLUE }}>Sembunyikan Nama (Anonim)</h3>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: BLUE, margin: 0 }}>Jika diaktifkan, nama Anda diganti menjadi <strong>"Anonim"</strong> di seluruh platform.</p>
              <button onClick={handleToggleAnonymous} disabled={saving || loading} style={{ alignSelf: "flex-start", padding: "12px 24px", backgroundColor: isAnonymous ? BLUE : "transparent", color: isAnonymous ? WHITE : BLUE, border: `2px solid ${BLUE}`, borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: saving || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                {saving ? "Menyimpan..." : isAnonymous ? "✓ Anonim Aktif" : "Aktifkan Anonim"}
              </button>
            </div>
            <div style={{ marginTop: "auto", paddingTop: "40px", textAlign: "left", overflow: "hidden", marginLeft: "-24px" }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "250px", fontWeight: 400, color: BLUE, letterSpacing: "-0.05em", lineHeight: 0.9, display: "block", userSelect: "none", textTransform: "lowercase" }}>ru 2026</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== RIGHT NAVBAR =====
const RightNavbar = ({ user, auth, db, onOpenDashboard }: { user: any; auth: any; db: any; onOpenDashboard: () => void; }) => {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "";
  const userIsAdmin = user?.email === ADMIN_EMAIL;
  const [isAnonymous, setIsAnonymous] = useState(false);
  useEffect(() => {
    if (!user || !db) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => { if (snap.exists()) setIsAnonymous(snap.data().isAnonymous === true); }).catch(() => {});
  }, [user, db]);
  const displayNameAnon = isAnonymous ? "Anonim" : displayName;
  const handleLogout = async () => {
    if (!auth) return;
    try { if (db && user) await updateDoc(doc(db, "users", user.uid), { online: false, lastSeen: serverTimestamp() }); await signOut(auth); }
    catch (e) { console.error(e); }
  };
  if (!user) {
    return (
      <div style={{ position: "fixed", top: "64px", right: "24px", zIndex: 9000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", fontFamily: FONT_FAMILY }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/signin" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 18px 10px 16px", backgroundColor: BLUE, borderRadius: "10px", border: `1px solid ${BLUE}`, boxShadow: "0 8px 24px rgba(13,60,252,0.35)", cursor: "pointer", transition: "transform 0.2s ease" }} onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}>
            <PeopleIcon size={20} color="#ffffff" />
            <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: "fixed", top: "64px", right: "24px", zIndex: 9000, fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", backgroundColor: BLUE, borderRadius: "10px", border: `1px solid ${BLUE}`, boxShadow: "0 8px 24px rgba(13,60,252,0.35)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", overflow: "hidden", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {photoURL && !isAnonymous ? <img src={photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} referrerPolicy="no-referrer" /> : <span style={{ fontSize: "16px", fontWeight: 800, color: BLUE }}>{displayNameAnon.charAt(0).toUpperCase()}</span>}
          </div>
          <span style={{ color: WHITE, fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>{displayNameAnon}{userIsAdmin && <VerifiedBadgeWhite size={18} />}</span>
        </div>
        <button onClick={onOpenDashboard} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: BLUE, color: WHITE, borderRadius: "10px", border: `1px solid ${BLUE}`, boxShadow: "0 8px 24px rgba(13,60,252,0.35)", fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Dashboard<NorthEastArrow size={16} color={WHITE} /></button>
        <button onClick={handleLogout} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: BLUE, color: WHITE, borderRadius: "10px", border: `1px solid ${BLUE}`, boxShadow: "0 8px 24px rgba(13,60,252,0.35)", fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Logout<LogoutIcon size={16} color={WHITE} /></button>
      </div>
    </div>
  );
};

// ===== ONBOARDING TOUR =====
const OnboardingTour = ({ steps, onComplete, isActive, currentStep, setCurrentStep }: any) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [arrowPos, setArrowPos] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const step = steps[currentStep];
  useEffect(() => {
    if (!isActive || !step) return;
    const updateRect = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        const tw = 340, th = 200, as = 14, gap = 14;
        let top = 0, left = 0;
        let arrow: "top" | "bottom" | "left" | "right" = "bottom";
        let pos = step.position || "bottom";
        const sb = window.innerHeight - rect.bottom, sa = rect.top, sr = window.innerWidth - rect.right, sl = rect.left;
        if (pos === "bottom" && sb < th + gap) pos = sa > sb ? "top" : "bottom";
        if (pos === "top" && sa < th + gap) pos = sb > sa ? "bottom" : "top";
        if (pos === "right" && sr < tw + gap) pos = sl > sr ? "left" : "right";
        if (pos === "left" && sl < tw + gap) pos = sr > sl ? "right" : "left";
        if (pos === "bottom") { top = rect.bottom + gap + as; left = rect.left + rect.width / 2 - tw / 2; arrow = "top"; }
        else if (pos === "top") { top = rect.top - th - gap - as; left = rect.left + rect.width / 2 - tw / 2; arrow = "bottom"; }
        else if (pos === "left") { top = rect.top + rect.height / 2 - th / 2; left = rect.left - tw - gap - as; arrow = "right"; }
        else if (pos === "right") { top = rect.top + rect.height / 2 - th / 2; left = rect.right + gap + as; arrow = "left"; }
        const pad = 12;
        if (left < pad) left = pad;
        if (left + tw > window.innerWidth - pad) left = window.innerWidth - tw - pad;
        if (top < pad) top = pad;
        if (top + th > window.innerHeight - pad) top = window.innerHeight - th - pad;
        setTooltipPos({ top, left });
        setArrowPos(arrow);
      } else setTargetRect(null);
    };
    updateRect();
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(updateRect, 400);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => { window.removeEventListener("resize", updateRect); window.removeEventListener("scroll", updateRect, true); clearTimeout(t); };
  }, [isActive, currentStep, step]);
  if (!isActive || !step) return null;
  const next = () => currentStep < steps.length - 1 ? setCurrentStep(currentStep + 1) : onComplete();
  const prev = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const skip = () => onComplete();
  const renderArrow = () => {
    const as = 14;
    const base: React.CSSProperties = { position: "absolute", width: 0, height: 0, borderStyle: "solid", pointerEvents: "none" };
    if (arrowPos === "top") return <div style={{ ...base, top: -as, left: "50%", marginLeft: -as, borderWidth: `0 ${as}px ${as}px ${as}px`, borderColor: `transparent transparent ${BLUE} transparent` }} />;
    if (arrowPos === "bottom") return <div style={{ ...base, bottom: -as, left: "50%", marginLeft: -as, borderWidth: `${as}px ${as}px 0 ${as}px`, borderColor: `${BLUE} transparent transparent transparent` }} />;
    if (arrowPos === "left") return <div style={{ ...base, left: -as, top: "50%", marginTop: -as, borderWidth: `${as}px ${as}px ${as}px 0`, borderColor: `transparent ${BLUE} transparent transparent` }} />;
    if (arrowPos === "right") return <div style={{ ...base, right: -as, top: "50%", marginTop: -as, borderWidth: `${as}px 0 ${as}px ${as}px`, borderColor: `transparent transparent transparent ${BLUE}` }} />;
    return null;
  };
  return (
    <>
      <div onClick={skip} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9998, pointerEvents: "auto" }} />
      {targetRect && <div style={{ position: "fixed", top: targetRect.top - 6, left: targetRect.left - 6, width: targetRect.width + 12, height: targetRect.height + 12, borderRadius: "12px", boxShadow: `0 0 0 9999px rgba(0,0,0,0.6), 0 0 0 3px ${BLUE}`, zIndex: 9999, pointerEvents: "none", transition: "all 0.3s ease" }} />}
      <div style={{ position: "fixed", top: tooltipPos.top, left: tooltipPos.left, width: "340px", backgroundColor: BLUE, borderRadius: "14px", padding: "22px 24px", zIndex: 10000, fontFamily: FONT_FAMILY, transition: "all 0.3s ease" }}>
        {renderArrow()}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: WHITE, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.9 }}>Step {currentStep + 1} of {steps.length}</span>
          <button onClick={skip} style={{ background: "transparent", border: "none", color: WHITE, cursor: "pointer", fontSize: "18px", fontFamily: FONT_FAMILY, padding: 0, lineHeight: 1, opacity: 0.9 }}>×</button>
        </div>
        <h4 style={{ fontSize: "18px", fontWeight: 700, color: WHITE, margin: 0, marginBottom: "8px" }}>{step.title}</h4>
        <p style={{ fontSize: "13px", fontWeight: 400, color: WHITE, margin: 0, marginBottom: "18px", lineHeight: 1.5, opacity: 0.95 }}>{step.content}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <button onClick={prev} disabled={currentStep === 0} style={{ padding: "7px 14px", backgroundColor: "transparent", color: currentStep === 0 ? "rgba(255,255,255,0.4)" : WHITE, border: currentStep === 0 ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${WHITE}`, borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: currentStep === 0 ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY }}>Back</button>
          <button onClick={skip} style={{ padding: "7px 14px", backgroundColor: "transparent", color: WHITE, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: FONT_FAMILY, opacity: 0.8 }}>Skip Tour</button>
          <button onClick={next} style={{ padding: "7px 18px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "6px" }}>{currentStep === steps.length - 1 ? "Finish" : "Next"}<NorthEastArrow size={14} color={BLUE} /></button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "14px" }}>
          {steps.map((_: any, i: number) => (<div key={i} style={{ width: i === currentStep ? "18px" : "6px", height: "6px", borderRadius: "3px", backgroundColor: i === currentStep ? WHITE : "rgba(255,255,255,0.35)", transition: "all 0.3s ease" }} />))}
        </div>
      </div>
    </>
  );
};

// ===== ROLLING NEW MESSAGE =====
const RollingNewMessage = ({ senderName, message }: { senderName: string; message: string; isFromAgent: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prevMessageRef = useRef<string>("");
  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    if (message === prevMessageRef.current) return;
    prevMessageRef.current = message;
    gsap.killTweensOf([containerRef.current, textRef.current]);
    gsap.set(containerRef.current, { height: 0, opacity: 0 });
    gsap.set(textRef.current, { yPercent: 120, opacity: 0, rotateX: -90, transformOrigin: "50% 100%" });
    const tl = gsap.timeline();
    tl.to(containerRef.current, { height: 24, opacity: 1, duration: 0.4, ease: "power2.out" }).to(textRef.current, { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: "back.out(1.7)" }, "-=0.2");
    return () => tl.kill();
  }, [message]);
  const safeMessage = typeof message === "string" ? message : "";
  return (
    <div ref={containerRef} style={{ overflow: "hidden", height: 0, opacity: 0, marginTop: 0, display: "flex", alignItems: "center", gap: "6px", fontFamily: FONT_FAMILY, fontSize: "13px", whiteSpace: "nowrap", paddingLeft: "4px" }}>
      <div ref={textRef} style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", width: "100%" }}>
        <span style={{ fontWeight: 700, color: BLUE, flexShrink: 0 }}>{senderName}</span>
        <span style={{ color: "#666", flexShrink: 0 }}>from</span>
        <span style={{ color: BLUE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic", fontWeight: 500 }}>{safeMessage.length > 60 ? safeMessage.substring(0, 60) + "..." : safeMessage}</span>
      </div>
    </div>
  );
};

// ===== CLOSE ROOM BUTTON =====
const CloseRoomButton = ({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (iconRef.current) gsap.fromTo(iconRef.current, { rotate: 0, scale: 0.7, opacity: 0 }, { rotate: 360, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" }); }, []);
  const handleEnter = () => { if (disabled) return; if (btnRef.current) gsap.to(btnRef.current, { scale: 1.08, duration: 0.25, ease: "power2.out" }); if (iconRef.current) gsap.to(iconRef.current, { rotate: "+=90", duration: 0.35, ease: "power2.out" }); };
  const handleLeave = () => { if (disabled) return; if (btnRef.current) gsap.to(btnRef.current, { scale: 1, duration: 0.25, ease: "power2.out" }); };
  const handleClick = () => { if (disabled) return; if (btnRef.current) gsap.timeline().to(btnRef.current, { scale: 0.92, duration: 0.12, ease: "power2.in" }).to(btnRef.current, { scale: 1, duration: 0.2, ease: "back.out(2)" }); onConfirm(); };
  return (
    <button ref={btnRef} onClick={handleClick} onMouseEnter={handleEnter} onMouseLeave={handleLeave} disabled={disabled} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: WHITE, border: `1.5px solid ${WHITE}`, borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer", padding: 0, opacity: disabled ? 0.4 : 1 }}>
      <div ref={iconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><CloseIcon size={16} color={BLUE} /></div>
    </button>
  );
};

// ===== BANNED BANNER =====
const BannedInfoBanner = ({ banReason, banMessage, onAppeal, hasAppeal }: { banReason: string; banMessage: string; onAppeal: () => void; hasAppeal: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) gsap.fromTo(ref.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }); }, []);
  return (
    <div ref={ref} style={{ backgroundColor: BLUE, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px", borderBottom: `2px solid ${WHITE}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><ShieldBanIcon size={28} color={WHITE} /><span style={{ fontSize: "18px", fontWeight: 800, color: WHITE, fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase" }}>Account Permanently Banned</span></div>
      <div style={{ fontSize: "14px", color: WHITE, fontFamily: FONT_FAMILY, lineHeight: 1.5, opacity: 0.95 }}><strong>Reason:</strong> {banReason || "Suspicious Activity"}</div>
      {banMessage && <div style={{ fontSize: "13px", color: WHITE, fontFamily: FONT_FAMILY, lineHeight: 1.5, opacity: 0.9, padding: "10px 14px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.3)" }}>{banMessage}</div>}
      {!hasAppeal && <button onClick={onAppeal} style={{ alignSelf: "flex-start", padding: "10px 20px", backgroundColor: WHITE, color: BLUE, border: `2px solid ${WHITE}`, borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: "pointer", fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: "4px" }}>Ajukan Banding</button>}
      {hasAppeal && <div style={{ alignSelf: "flex-start", padding: "8px 16px", backgroundColor: WHITE, color: BLUE, border: `1.5px solid ${WHITE}`, borderRadius: "8px", fontSize: "12px", fontWeight: 700, fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase" }}>Banding Sedang Diproses</div>}
    </div>
  );
};

// ===== APPEAL CHAT =====
const AppealChatRoom = ({ user, isAdmin, db, appealTicket, onClose }: any) => {
  const [messages, setMessages] = useState<AppealMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [replyTo, setReplyTo] = useState<AppealMessage | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { getCryptoKey().then(() => setEncryptionReady(true)).catch(() => setEncryptionReady(true)); }, []);
  useEffect(() => {
    if (!db || !appealTicket) return;
    const q = query(collection(db, "appeal_tickets", appealTicket.id, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, async (snap: any) => {
      const list: AppealMessage[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        let text = data.text || "";
        if (data.isEncrypted) { try { text = await decryptMessage(text); } catch { text = "[Encrypted]"; } }
        list.push({ id: d.id, ...data, text } as AppealMessage);
      }
      setMessages(list);
      requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; });
    });
    return () => unsub();
  }, [db, appealTicket]);
  useEffect(() => {
    if (!db || !appealTicket || !user) return;
    messages.filter((m) => m.senderId !== user.uid && !m.read).forEach(async (msg) => {
      await updateDoc(doc(db, "appeal_tickets", appealTicket.id, "messages", msg.id), { read: true, deliveryStatus: "read" });
    });
  }, [messages, appealTicket, db, user]);
  useEffect(() => {
    if (!db || !appealTicket) return;
    const unsub = onSnapshot(doc(db, "appeal_tickets", appealTicket.id), (snap: any) => {
      if (snap.exists()) { const d = snap.data(); setTyping(d.typing || false); setTypingUserName(d.typingUserName || null); }
    });
    return () => unsub();
  }, [db, appealTicket]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!appealTicket || !user || !db) return;
    const ref = doc(db, "appeal_tickets", appealTicket.id);
    if (value.length > 0) await updateDoc(ref, { typing: true, typingUserId: user.uid, typingUserName: user.displayName || user.email || "User" });
    else await updateDoc(ref, { typing: false, typingUserId: null, typingUserName: null });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => { await updateDoc(ref, { typing: false, typingUserId: null, typingUserName: null }); }, 2000);
  };

  const sendMessage = async () => {
    if (!db || !appealTicket || !messageText.trim() || !user || !encryptionReady) return;
    try {
      const ticketRef = doc(db, "appeal_tickets", appealTicket.id);
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
      const senderName = isAdmin ? AGENT_NAME : user.displayName || user.email || "User";
      const enc = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "appeal_tickets", appealTicket.id, "messages"), { senderId: user.uid, senderName, text: enc, timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: "sent", replyTo: replyTo ? { messageId: replyTo.id, senderName: replyTo.senderName, text: replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + "..." : replyTo.text } : null });
      await updateDoc(ticketRef, { lastMessage: messageText.trim(), lastMessageTime: serverTimestamp(), lastMessageSender: senderName, status: "active", agentId: isAdmin ? user.uid : appealTicket.agentId, agentName: isAdmin ? AGENT_NAME : appealTicket.agentName });
      setMessageText(""); setReplyTo(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (e) { console.error(e); alert("An error occurred."); }
  };

  const renderDeliveryStatus = (msg: AppealMessage, isMine: boolean) => {
    if (!isMine) return null;
    let label = "Sent"; let icon = <CheckIcon size={11} color="#ffffff" />;
    if (msg.read) { label = "Read"; icon = <DoubleCheckIcon size={11} color="#ffffff" />; }
    else if (msg.deliveryStatus === "delivered") { label = "Delivered"; icon = <DoubleCheckIcon size={11} color="#ffffff" />; }
    else if (msg.deliveryStatus === "sending") { label = "Sending"; icon = <ClockIcon size={11} color="#ffffff" />; }
    else if (msg.deliveryStatus === "failed") { label = "Failed"; icon = <ErrorIcon size={11} color="#ffffff" />; }
    return (<span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#ffffff", fontFamily: FONT_FAMILY, fontWeight: 500 }}>{label}{icon}</span>);
  };
  const formatTime = (t: any) => { if (!t) return ""; const d = t.toDate ? t.toDate() : new Date(t); return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: WHITE, borderRadius: "12px", overflow: "hidden", border: `2px solid ${BLUE}` }}>
      <div style={{ padding: "16px 20px", backgroundColor: BLUE, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "17px", color: WHITE, fontFamily: FONT_FAMILY, marginBottom: "4px" }}>{isAdmin ? `Banding: ${appealTicket.userName}` : "Chat Banding dengan Admin"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <StabiloBadge label="Banding" bg={WHITE} text={BLUE} border={WHITE} size="sm" />
            {typing && <span style={{ fontSize: "12px", color: WHITE, fontStyle: "italic", fontWeight: 700 }}>{typingUserName} is typing...</span>}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: `1.5px solid ${WHITE}`, color: WHITE, borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY }}>Tutup</button>
      </div>
      <div style={{ padding: "12px 20px", backgroundColor: "rgba(13,60,252,0.08)", borderBottom: `1px solid ${BLUE}30`, flexShrink: 0 }}>
        <div style={{ fontSize: "12px", color: BLUE, fontFamily: FONT_FAMILY, fontWeight: 600 }}><strong>Alasan banned:</strong> {appealTicket.banReason || "Suspicious Activity"}</div>
      </div>
      <div ref={chatRef} className="chat-messages-container" style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}>
        {messages.length === 0 ? <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "30px 0", fontFamily: FONT_FAMILY }}>Belum ada pesan.</div> : messages.map((msg, idx) => {
          const isMine = msg.senderId === user?.uid;
          return (
            <div key={msg.id || idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              <div style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: isMine ? BLUE : "#f4f4f5", color: isMine ? WHITE : BLACK, fontSize: "14px", fontFamily: FONT_FAMILY, wordBreak: "break-word", border: isMine ? "none" : "1px solid rgba(0,0,0,0.05)" }}>
                {!isMine && <div style={{ fontSize: "12px", fontWeight: 700, color: BLUE, marginBottom: "4px" }}>{msg.senderName}</div>}
                {msg.replyTo && <div style={{ padding: "6px 10px", backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "rgba(13,60,252,0.1)", borderLeft: `3px solid ${isMine ? WHITE : BLUE}`, borderRadius: "4px", marginBottom: "6px", fontSize: "11px", color: isMine ? WHITE : BLUE, fontStyle: "italic", fontFamily: FONT_FAMILY }}><strong>{msg.replyTo.senderName}:</strong> {msg.replyTo.text}</div>}
                <div>{msg.text}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginTop: "5px" }}>{renderDeliveryStatus(msg, isMine)}<span style={{ fontSize: "10px", color: isMine ? WHITE : "#999" }}>{formatTime(msg.timestamp)}</span></div>
              </div>
              <button onClick={() => setReplyTo(msg)} style={{ background: "transparent", border: "none", color: BLUE, fontSize: "10px", cursor: "pointer", fontFamily: FONT_FAMILY, fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px", alignSelf: isMine ? "flex-end" : "flex-start" }}><ReplyIcon size={10} color={BLUE} />Reply</button>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {replyTo && <div style={{ padding: "8px 20px", backgroundColor: "rgba(13,60,252,0.06)", borderTop: `1px solid ${BLUE}20`, display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}><ReplyIcon size={14} color={BLUE} /><div style={{ flex: 1, fontSize: "12px", color: BLUE, fontFamily: FONT_FAMILY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><strong>{replyTo.senderName}:</strong> {replyTo.text}</div><button onClick={() => setReplyTo(null)} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", fontSize: "16px", fontFamily: FONT_FAMILY, padding: 0, lineHeight: 1 }}>×</button></div>}
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${BLUE}20`, display: "flex", gap: "10px", backgroundColor: WHITE, flexShrink: 0 }}>
        <input type="text" value={messageText} onChange={handleTyping} onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey && messageText.trim()) { e.preventDefault(); sendMessage(); } }} placeholder="Tulis pesan banding..." style={{ flex: 1, padding: "12px 16px", border: `1px solid ${BLUE}40`, borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: FONT_FAMILY, backgroundColor: WHITE, color: BLUE }} />
        <button onClick={sendMessage} disabled={!messageText.trim()} style={{ padding: "12px 24px", backgroundColor: messageText.trim() ? BLUE : "#ccc", color: WHITE, border: "none", borderRadius: "10px", cursor: messageText.trim() ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY, fontSize: "13px", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>Kirim</button>
      </div>
    </div>
  );
};

// ===== LIVE CHAT AGENT =====
const LiveChatAgent = ({ user, isAdmin, db, auth, onOpenAppealChat, onOpenBannedAppealChat }: any) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [banMessage, setBanMessage] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [canCreateTicket, setCanCreateTicket] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [appealTickets, setAppealTickets] = useState<AppealTicket[]>([]);
  const [hasAppeal, setHasAppeal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [ticketPreviews, setTicketPreviews] = useState<{ [k: string]: LastMessagePreview[] }>({});
  const [ticketMsgCounts, setTicketMsgCounts] = useState<{ [k: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [latestRollingMessage, setLatestRollingMessage] = useState<LastMessagePreview | null>(null);
  const [rollingKey, setRollingKey] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveChatTitleRef = useRef<HTMLHeadingElement>(null);
  const prevLenRef = useRef<number>(0);
  const cacheRef = useRef<{ [k: string]: ChatMessage[] }>({});

  useEffect(() => {
    if (typeof window === "undefined" || !tickets.length) return;
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("ticket");
    if (!tid) return;
    const t = tickets.find((x) => x.id === tid);
    if (t) { setSelectedTicket(t); window.history.replaceState({}, "", "/live-chat-agent"); }
  }, [tickets]);

  const topics = ["Product Inquiry", "Technical Support", "Account Issues", "Donation", "Partnership", "Other"];
  const tourSteps: TourStep[] = [
    { target: "login-button", title: "Login First", content: "Login untuk mulai chat dengan agent.", position: "bottom", isLoginStep: true },
    { target: "livechat-title", title: "Live Chat Agent", content: "Bagian live chat dengan tim support.", position: "bottom" },
    { target: "online-panel", title: "Online Users", content: "Lihat siapa yang online sekarang.", position: "right" },
    { target: "chat-list", title: "Chat History", content: "Semua percakapan Anda muncul di sini.", position: "right" },
    { target: "search-bar", title: "Search Chats", content: "Cari chat berdasarkan nama atau isi pesan.", position: "bottom" },
    { target: "start-chat-button", title: "Start New Chat", content: "Klik untuk memulai chat baru.", position: "top" },
  ];

  useEffect(() => {
    setIsMounted(true);
    getCryptoKey().then(() => setEncryptionReady(true)).catch(() => setEncryptionReady(true));
  }, []);

  useEffect(() => {
    if (!isMounted || isAdmin) return;
    try { if (!localStorage.getItem(TOUR_STORAGE_KEY)) { const t = setTimeout(() => { setTourStep(0); setShowTour(true); }, 1500); return () => clearTimeout(t); } } catch {}
  }, [isMounted, isAdmin]);

  const completeTour = useCallback(() => { try { localStorage.setItem(TOUR_STORAGE_KEY, "true"); } catch {} setShowTour(false); setTourStep(0); }, []);

  useEffect(() => {
    if (!isMounted || !liveChatTitleRef.current) return;
    const split = new SplitText(liveChatTitleRef.current, { type: "chars", charsClass: "split-char-livechat" });
    gsap.fromTo(split.chars, { opacity: 0, y: 30, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, stagger: 0.05, ease: "back.out(1.2)", scrollTrigger: { trigger: liveChatTitleRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" } });
    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, [isMounted]);

  useEffect(() => {
    if (!user || !isMounted) { setCheckingBan(false); return; }
    (async () => {
      setCheckingBan(true);
      try {
        const s = await checkBanStatus(user.uid);
        if (s.isBanned) { setIsBanned(true); setBanReason(s.reason); setCanCreateTicket(s.canCreateTicket); setCanSendMessage(s.canSendMessage); setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${s.reason}`); }
        else { setIsBanned(false); setBanReason(""); setCanCreateTicket(true); setCanSendMessage(true); setBanMessage(null); }
      } catch (e) { console.error(e); } finally { setCheckingBan(false); }
    })();
  }, [user, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const unsub = onSnapshot(query(collection(db, "appeal_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(1)), (s: any) => setHasAppeal(!s.empty));
    return () => unsub();
  }, [db, user, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = isAdmin ? query(collection(db, "appeal_tickets"), orderBy("createdAt", "desc")) : query(collection(db, "appeal_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (s: any) => { const list: AppealTicket[] = []; s.forEach((d: any) => list.push({ id: d.id, ...d.data() } as AppealTicket)); setAppealTickets(list); });
    return () => unsub();
  }, [db, user, isAdmin, isMounted]);

  useEffect(() => {
    if (!db || !isMounted) return;
    const unsub = onSnapshot(query(collection(db, "users"), where("online", "==", true)), (s: any) => {
      const users: OnlineUser[] = [];
      s.forEach((d: any) => { const data = d.data(); const item: OnlineUser = { uid: d.id, displayName: data.displayName || data.name || data.email || "User", email: data.email || "", photoURL: data.photoURL || "", online: data.online || false, lastSeen: data.lastSeen, isAgent: data.email === ADMIN_EMAIL, isAnonymous: data.isAnonymous === true }; if (!item.isAgent) users.push(item); });
      setOnlineUsers(users);
    });
    return () => unsub();
  }, [db, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = isAdmin ? query(collection(db, "livechat_tickets"), orderBy("createdAt", "desc")) : query(collection(db, "livechat_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (s: any) => { const list: Ticket[] = []; s.forEach((d: any) => list.push({ id: d.id, ...d.data() } as Ticket)); setTickets(list); setSelectedTicket((p) => p ? list.find((t) => t.id === p.id) || p : p); });
    return () => unsub();
  }, [db, user, isAdmin, isMounted]);

  useEffect(() => {
    if (!db || !tickets.length || !isMounted) return;
    const unsubs: (() => void)[] = [];
    tickets.forEach((t) => {
      const q = query(collection(db, "livechat_tickets", t.id, "messages"), orderBy("timestamp", "desc"), limit(3));
      const u = onSnapshot(q, async (s: any) => {
        setTicketMsgCounts((p) => ({ ...p, [t.id]: s.size }));
        const prevs: LastMessagePreview[] = [];
        for (const d of s.docs) { const data = d.data(); let text = data.text || ""; if (data.isEncrypted) { try { text = await decryptMessage(text); } catch { text = "[Encrypted]"; } } prevs.push({ text, senderName: data.senderName || "User", timestamp: data.timestamp, isFromAgent: data.senderName === AGENT_NAME }); }
        setTicketPreviews((p) => ({ ...p, [t.id]: prevs }));
      });
      unsubs.push(u);
    });
    return () => unsubs.forEach((u) => u());
  }, [db, tickets, isMounted]);

  useEffect(() => {
    if (!db || !selectedTicket || !isMounted) return;
    const tid = selectedTicket.id;
    if (cacheRef.current[tid]) { setMessages(cacheRef.current[tid]); prevLenRef.current = cacheRef.current[tid].length; }
    const q = query(collection(db, "livechat_tickets", tid, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, async (s: any) => {
      const list: ChatMessage[] = [];
      for (const d of s.docs) { const data = d.data(); let text = data.text || ""; if (data.isEncrypted) { try { text = await decryptMessage(text); } catch { text = "[Encrypted]"; } } list.push({ id: d.id, ...data, text } as ChatMessage); }
      if (prevLenRef.current > 0 && list.length > prevLenRef.current) { const newest = list[list.length - 1]; if (newest) { setLatestRollingMessage({ text: newest.text, senderName: newest.senderName || "User", timestamp: newest.timestamp, isFromAgent: newest.senderName === AGENT_NAME }); setRollingKey((k) => k + 1); } }
      prevLenRef.current = list.length;
      cacheRef.current[tid] = list;
      setMessages(list);
      requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; });
    });
    return () => unsub();
  }, [db, selectedTicket, isMounted]);

  useEffect(() => { setLatestRollingMessage(null); prevLenRef.current = cacheRef.current[selectedTicket?.id || ""]?.length || 0; setShowCloseConfirm(false); setReplyTo(null); }, [selectedTicket?.id]);

  useEffect(() => {
    if (!db || !selectedTicket || !user || !isAdmin || !isMounted) return;
    messages.filter((m) => m.senderId !== user.uid && !m.read).forEach(async (msg) => { await updateDoc(doc(db, "livechat_tickets", selectedTicket.id, "messages", msg.id), { read: true, deliveryStatus: "read" }); });
  }, [messages, selectedTicket, db, user, isAdmin, isMounted]);

  const hasAuto = useRef(false);
  useEffect(() => {
    if (!user || isAdmin || !isMounted || hasAuto.current || selectedTicket) { if (selectedTicket) hasAuto.current = true; return; }
    const ut = tickets.filter((t) => t.userId === user.uid);
    if (!ut.length) return;
    const act = ut.find((t) => t.status === "waiting" || t.status === "active") || ut[0];
    setSelectedTicket(act); hasAuto.current = true;
  }, [tickets, user, isAdmin, selectedTicket, isMounted]);

  const generateTicketId = useCallback((createdAt: any): string => { if (!createdAt) return "#TICKET-0000"; const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt); return `#TICKET-${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`; }, []);
  const formatTime = useCallback((t: any) => { if (!t) return ""; const d = t.toDate ? t.toDate() : new Date(t); return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }, []);
  const getTyping = (t: Ticket | null) => t?.typing ? `${t.typingUserName || "Someone"} is typing...` : null;

  const filter = useCallback((list: Ticket[]) => {
    const q = searchQuery.trim().toLowerCase(); if (!q) return list;
    return list.filter((t) => t.userName?.toLowerCase().includes(q) || t.userEmail?.toLowerCase().includes(q) || t.topic?.toLowerCase().includes(q) || generateTicketId(t.createdAt).toLowerCase().includes(q) || (ticketPreviews[t.id] || []).some((p) => p.text?.toLowerCase().includes(q)));
  }, [searchQuery, ticketPreviews, generateTicketId]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value; setMessageText(v);
    if (!selectedTicket || !user || !db || isBanned) return;
    const ref = doc(db, "livechat_tickets", selectedTicket.id);
    if (v.length > 0) await updateDoc(ref, { typing: true, typingUserId: user.uid, typingUserName: isAdmin ? AGENT_NAME : user.displayName || user.email || "User" });
    else await updateDoc(ref, { typing: false, typingUserId: null, typingUserName: null });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => { await updateDoc(ref, { typing: false, typingUserId: null, typingUserName: null }); }, 2000);
  };

  const checkBanBefore = async (): Promise<boolean> => {
    if (!user) return true;
    try { const s = await checkBanStatus(user.uid); if (s.isBanned) { setIsBanned(true); setBanReason(s.reason); setCanCreateTicket(s.canCreateTicket); setCanSendMessage(s.canSendMessage); setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${s.reason}`); return true; } return false; } catch { return false; }
  };

  const startChat = async () => {
    if (!db || !user || !selectedTopic || await checkBanBefore()) { setShowStartChat(false); return; }
    if (!canCreateTicket) { setBanMessage("YOU DO NOT HAVE PERMISSION TO CREATE A NEW TICKET"); return; }
    if (!encryptionReady) { alert("Encryption is being initialized."); return; }
    if (tickets.some((t) => t.userId === user.uid && (t.status === "waiting" || t.status === "active") && !t.isAnnouncement && !t.isBroadcast)) { alert("You still have an active chat."); return; }
    try {
      const ref = await addDoc(collection(db, "livechat_tickets"), { userId: user.uid, userName: user.displayName || user.email || "User", userEmail: user.email, userPhoto: user.photoURL || "", status: "waiting", topic: selectedTopic, createdAt: serverTimestamp(), unreadCount: 0, typing: false, typingUserId: null, typingUserName: null, isAnnouncement: false, isBroadcast: false });
      const initial = `Hello, I would like to ask about: ${selectedTopic}`;
      await addDoc(collection(db, "livechat_tickets", ref.id, "messages"), { senderId: user.uid, senderName: user.displayName || user.email || "User", text: await encryptMessage(initial), timestamp: serverTimestamp(), read: false, isEncrypted: true, isBotDetected: false, deliveryStatus: "sent" });
      await updateDoc(ref, { lastMessage: initial, lastMessageTime: serverTimestamp(), lastMessageSender: user.displayName || user.email || "User" });
      setSelectedTopic(""); setShowStartChat(false); setBanMessage(null); hasAuto.current = false;
    } catch (e) { console.error(e); alert("An error occurred."); }
  };

  const sendMessage = async () => {
    if (!db || !selectedTicket || !messageText.trim() || !user) return;
    if (!isAdmin) {
      if (await checkBanBefore()) { setMessageText(""); return; }
      if (!canSendMessage) { setBanMessage("NO PERMISSION"); setMessageText(""); return; }
      const r = containsBannedContent(messageText);
      if (r.isBanned) { await banUserPermanent(user.uid, user.email || "", user.displayName || "User", r.reason, messageText); setIsBanned(true); setBanReason(r.reason); setCanCreateTicket(false); setCanSendMessage(false); setBanMessage(`BANNED\n\nReason: ${r.reason}`); setMessageText(""); return; }
    }
    if (!encryptionReady) { alert("Encryption init..."); return; }
    if (selectedTicket.status === "resolved" || selectedTicket.status === "closed") { alert("This chat is finished."); return; }
    try {
      const ref = doc(db, "livechat_tickets", selectedTicket.id);
      await updateDoc(ref, { typing: false, typingUserId: null, typingUserName: null });
      const senderName = isAdmin ? AGENT_NAME : user.displayName || user.email || "User";
      await addDoc(collection(db, "livechat_tickets", selectedTicket.id, "messages"), { senderId: user.uid, senderName, text: await encryptMessage(messageText.trim()), timestamp: serverTimestamp(), read: false, isEncrypted: true, isBotDetected: false, deliveryStatus: "sent", replyTo: replyTo ? { messageId: replyTo.id, senderName: replyTo.senderName, text: replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + "..." : replyTo.text } : null });
      await updateDoc(ref, { lastMessage: messageText.trim(), lastMessageTime: serverTimestamp(), lastMessageSender: senderName, ...(selectedTicket.status === "waiting" && { status: "active" }), ...(isAdmin && { agentId: user.uid, agentName: AGENT_NAME, status: selectedTicket.status === "waiting" ? "active" : selectedTicket.status }) });
      setMessageText(""); setBanMessage(null); setReplyTo(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (e) { console.error(e); alert("An error occurred."); }
  };

  const takeTicket = async (id: string) => { if (!db || !isAdmin || !user) return; try { await updateDoc(doc(db, "livechat_tickets", id), { agentId: user.uid, agentName: AGENT_NAME, status: "active" }); } catch {} };
  const resolveTicket = async (id: string) => { if (!db || !isAdmin) return; try { await updateDoc(doc(db, "livechat_tickets", id), { status: "resolved" }); } catch {} };
  const handleCloseRoom = async () => { if (!db || !selectedTicket) return; try { await updateDoc(doc(db, "livechat_tickets", selectedTicket.id), { status: "closed" }); setShowCloseConfirm(true); setTimeout(() => setShowCloseConfirm(false), 2200); } catch {} };

  const createAppealTicket = async () => {
    if (!db || !user || !isBanned) return;
    try {
      const exist = appealTickets.find((t) => t.userId === user.uid && t.status !== "closed" && t.status !== "resolved");
      if (exist) { onOpenBannedAppealChat(exist); return; }
      const ref = await addDoc(collection(db, "appeal_tickets"), { userId: user.uid, userName: user.displayName || user.email || "User", userEmail: user.email, userPhoto: user.photoURL || "", status: "waiting", topic: "Banding Banned", banReason, banMessage: banMessage || "", createdAt: serverTimestamp(), unreadCount: 0, typing: false, typingUserId: null, typingUserName: null });
      const init = `Saya mengajukan banding.\n\nAlasan: ${banReason}`;
      await addDoc(collection(db, "appeal_tickets", ref.id, "messages"), { senderId: user.uid, senderName: user.displayName || user.email || "User", text: await encryptMessage(init), timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: "sent" });
      await updateDoc(ref, { lastMessage: init, lastMessageTime: serverTimestamp(), lastMessageSender: user.displayName || user.email || "User" });
      onOpenBannedAppealChat({ id: ref.id, userId: user.uid, userName: user.displayName || user.email || "User", userEmail: user.email, status: "waiting", topic: "Banding Banned", banReason, banMessage: banMessage || "", createdAt: new Date(), unreadCount: 0, typing: false });
      setHasAppeal(true);
    } catch (e) { console.error(e); alert("Gagal membuat tiket banding."); }
  };

  const renderDeliveryStatus = (msg: ChatMessage, isMine: boolean) => {
    if (!isMine) return null;
    let label = "Sent"; let icon = <CheckIcon size={11} color="#ffffff" />;
    if (msg.read) { label = "Read"; icon = <DoubleCheckIcon size={11} color="#ffffff" />; }
    else if (msg.deliveryStatus === "delivered") { label = "Delivered"; icon = <DoubleCheckIcon size={11} color="#ffffff" />; }
    else if (msg.deliveryStatus === "sending") { label = "Sending"; icon = <ClockIcon size={11} color="#ffffff" />; }
    else if (msg.deliveryStatus === "failed") { label = "Failed"; icon = <ErrorIcon size={11} color="#ffffff" />; }
    return (<span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#ffffff", fontFamily: FONT_FAMILY, fontWeight: 500 }}>{label}{icon}</span>);
  };

  const renderOnlinePanel = () => {
    if (!isAdmin) return null;
    return (
      <div data-tour="online-panel" className="online-panel-container" style={{ width: "260px", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0, height: "700px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", backgroundColor: BLUE, color: WHITE, fontWeight: 700, fontSize: "14px", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}><span>Online Users</span><span style={{ fontSize: "11px", color: BLUE, padding: "2px 8px", borderRadius: "4px", backgroundColor: WHITE, border: `1.5px solid ${WHITE}`, fontWeight: 700, letterSpacing: "0.5px" }}>{onlineUsers.length}</span></div>
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          {onlineUsers.length === 0 ? <div style={{ padding: "30px 16px", textAlign: "center", color: "#999", fontSize: "13px", fontFamily: FONT_FAMILY }}>No users online</div> : onlineUsers.map((u) => {
            const dn = u.isAnonymous ? "Anonim" : u.displayName;
            return (
              <div key={u.uid} style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "10px", fontFamily: FONT_FAMILY }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: BLUE, color: WHITE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px", overflow: "hidden", flexShrink: 0 }}>{u.photoURL && !u.isAnonymous ? <img src={u.photoURL} alt={u.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <AgentIcon size={20} color={WHITE} />}</div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "13px", fontWeight: 700, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>{dn}</div><span style={{ display: "inline-block", fontSize: "10px", fontWeight: 800, color: BLUE, letterSpacing: "0.5px", textTransform: "uppercase" }}>Online</span></div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTicketPreview = (ticketId: string) => {
    const prevs = ticketPreviews[ticketId] || [];
    if (!prevs.length) return null;
    return (<div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>{[...prevs].reverse().map((p, i) => (<div key={i} style={{ fontSize: "11px", color: "#ffffff", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "4px" }}><span style={{ fontWeight: 700, color: "#ffffff", flexShrink: 0 }}>{p.senderName}:</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", color: "#ffffff" }}>{typeof p.text === "string" && p.text.length > 30 ? p.text.substring(0, 30) + "..." : p.text}</span></div>))}</div>);
  };

  const renderSearchBar = () => (
    <div data-tour="search-bar" style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", backgroundColor: "#ffffff", border: "1px solid #ffffff", borderRadius: "8px" }}>
        <SearchIcon size={14} color={BLUE} />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search chats or messages..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: BLUE, fontSize: "12px", fontFamily: FONT_FAMILY, padding: 0, caretColor: BLUE, fontWeight: 600 }} />
        {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", fontSize: "14px", padding: 0, lineHeight: 1, fontFamily: FONT_FAMILY, fontWeight: 700 }}>×</button>}
      </div>
    </div>
  );

  const renderAnnouncementSection = () => {
    if (!isAdmin) return null;
    const an = tickets.filter((t) => t.isAnnouncement && !t.isBroadcast);
    const br = tickets.filter((t) => t.isBroadcast);
    if (!an.length && !br.length) return null;
    return (
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {an.length > 0 && <div style={{ flex: "1 1 300px", backgroundColor: BLUE, borderRadius: "12px", padding: "16px 20px", color: WHITE, fontFamily: FONT_FAMILY }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}><div style={{ fontSize: "16px", fontWeight: 700 }}>Announcement</div><div style={{ fontSize: "10px", border: `1.5px solid ${WHITE}`, backgroundColor: WHITE, color: BLUE, padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>{an.length} ACTIVE</div></div>{an.slice(0, 3).map((t) => <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}><div style={{ fontSize: "13px", fontWeight: 600, color: WHITE }}>{t.userName}</div><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</div></div>)}</div>}
          {br.length > 0 && <div style={{ flex: "1 1 300px", backgroundColor: BLUE, borderRadius: "12px", padding: "16px 20px", color: WHITE, fontFamily: FONT_FAMILY }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}><div style={{ fontSize: "16px", fontWeight: 700 }}>Broadcasting</div><div style={{ fontSize: "10px", border: `1.5px solid ${WHITE}`, backgroundColor: WHITE, color: BLUE, padding: "2px 8px", borderRadius: "4px", fontWeight: 800 }}>{br.length} ACTIVE</div></div>{br.slice(0, 3).map((t) => <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}><div style={{ fontSize: "13px", fontWeight: 600, color: WHITE }}>{t.userName}</div><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</div></div>)}</div>}
        </div>
      </div>
    );
  };

  if (checkingBan) return (<div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>Live Chat Agent</h3><div style={{ padding: "20px", textAlign: "center", color: "#666", fontFamily: FONT_FAMILY }}>Checking account status...</div></div>);
  if (!isMounted) return <div style={{ minHeight: "100px" }} />;

  if (!user) return (<><OnboardingTour steps={tourSteps} onComplete={completeTour} isActive={showTour} currentStep={tourStep} setCurrentStep={setTourStep} /><div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 ref={liveChatTitleRef} data-tour="livechat-title" style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1, marginBottom: "20px" }}>Live Chat Agent</h3><p style={{ fontSize: "15px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "10px" }}>Please login to use Live Chat Agent</p><Link href="/" style={{ textDecoration: "none" }}><button data-tour="login-button" style={{ padding: "8px 20px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: FONT_FAMILY }}>Login</button></Link></div></>);

  if (!isAdmin && isBanned) return (<div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1, marginBottom: "20px" }}>Live Chat Agent</h3><BannedInfoBanner banReason={banReason} banMessage={banMessage || ""} onAppeal={createAppealTicket} hasAppeal={hasAppeal} />{appealTickets.length > 0 && <div style={{ marginTop: "20px" }}><div style={{ fontSize: "16px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: "12px" }}>Tiket Banding Anda</div>{appealTickets.map((t) => <div key={t.id} onClick={() => onOpenBannedAppealChat(t)} style={{ padding: "14px 16px", backgroundColor: BLUE, borderRadius: "10px", marginBottom: "8px", cursor: "pointer", fontFamily: FONT_FAMILY }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: "14px", fontWeight: 700, color: WHITE }}>Banding #{t.id.slice(-6)}</span><StabiloBadge label={t.status === "waiting" ? "Waiting" : t.status === "active" ? "Active" : "Closed"} bg={WHITE} text={BLUE} border={WHITE} size="sm" /></div><div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>{t.lastMessage || "Belum ada pesan"}</div></div>)}</div>}</div>);

  const userTickets = tickets.filter((t) => t.userId === user.uid);
  if (!isAdmin && userTickets.length === 0 && !showStartChat) return (<><OnboardingTour steps={tourSteps} onComplete={completeTour} isActive={showTour} currentStep={tourStep} setCurrentStep={setTourStep} /><div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 ref={liveChatTitleRef} data-tour="livechat-title" style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1, marginBottom: "20px" }}>Live Chat Agent</h3><p style={{ fontSize: "15px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "16px" }}>Need help? Chat directly with our agent.</p><button data-tour="start-chat-button" onClick={() => setShowStartChat(true)} style={{ padding: "10px 24px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: FONT_FAMILY }}>Start Live Chat</button></div></>);

  if (!isAdmin && showStartChat) return (<div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1, marginBottom: "20px" }}>Live Chat Agent</h3><div style={{ maxWidth: "400px" }}><div style={{ fontSize: "15px", marginBottom: "10px", fontFamily: FONT_FAMILY, fontWeight: 700, color: BLUE }}>Select your issue topic:</div><select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: `2px solid ${BLUE}`, borderRadius: "8px", fontSize: "15px", fontFamily: FONT_FAMILY, outline: "none", backgroundColor: WHITE, marginBottom: "14px", color: BLUE, fontWeight: 600 }}><option value="">-- Select topic --</option>{topics.map((t) => <option key={t} value={t}>{t}</option>)}</select><div style={{ display: "flex", gap: "10px" }}><button onClick={startChat} disabled={!selectedTopic} style={{ padding: "8px 20px", backgroundColor: selectedTopic ? BLUE : "#ccc", color: WHITE, border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: selectedTopic ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY }}>Start Chat</button><button onClick={() => setShowStartChat(false)} style={{ padding: "8px 20px", backgroundColor: "transparent", color: "#666", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: FONT_FAMILY }}>Cancel</button></div></div></div>);

  const waiting = filter(tickets.filter((t) => t.status === "waiting"));
  const active = filter(tickets.filter((t) => t.status === "active"));
  const resolved = filter(tickets.filter((t) => t.status === "resolved" || t.status === "closed"));
  const typingText = selectedTicket ? getTyping(selectedTicket) : null;
  const bannedInWaiting = waiting.filter((t) => t.isBanned);

  const renderListItem = (ticket: Ticket, opts?: { onExtraClick?: () => void }) => {
    const isAct = selectedTicket?.id === ticket.id;
    const ss = STATUS_STYLES[ticket.status] || STATUS_STYLES.active;
    const ts = TOPIC_STYLES[ticket.topic] || TOPIC_STYLES["Other"];
    return (
      <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); opts?.onExtraClick?.(); }} style={{ padding: "14px 16px", borderLeft: isAct ? `3px solid ${WHITE}` : "3px solid transparent", backgroundColor: isAct ? "rgba(255,255,255,0.14)" : "transparent", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: WHITE, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1 1 auto" }}>{ticket.userName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>{ticket.isBanned && <StabiloBadge label="BANNED" bg={WHITE} text={BLUE} border={WHITE} size="sm" />}<StabiloBadge label={ss.label} bg={ss.bg} text={ss.text} border={ss.border} size="sm" /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}><StabiloBadge label={ticket.topic} bg={ts.bg} text={ts.text} border={ts.border} size="sm" /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{ticketMsgCounts[ticket.id] || 0} msgs</span></div>
        {renderTicketPreview(ticket.id)}
        <div style={{ marginTop: "6px" }}><span style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)", fontWeight: 700, letterSpacing: "0.3px" }}>{generateTicketId(ticket.createdAt)}</span></div>
      </div>
    );
  };

  return (
    <>
      <OnboardingTour steps={tourSteps} onComplete={completeTour} isActive={showTour} currentStep={tourStep} setCurrentStep={setTourStep} />
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}><h3 ref={liveChatTitleRef} data-tour="livechat-title" style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>Live Chat Agent</h3></div>
        {renderAnnouncementSection()}
        <div style={{ display: "flex", gap: "16px", height: "700px", width: "100%", overflow: "hidden", borderRadius: "12px" }}>
          {renderOnlinePanel()}
          <div data-tour="chat-list" className="chat-list-container" style={{ width: "360px", backgroundColor: BLUE, borderRadius: "12px", overflow: "hidden", flexShrink: 0, height: "700px", color: WHITE, fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.15)", fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: BLUE, flexShrink: 0 }}><span style={{ color: WHITE, letterSpacing: "0.3px" }}>Chat History</span><span style={{ fontSize: "11px", color: BLUE, padding: "2px 8px", borderRadius: "4px", backgroundColor: WHITE, border: `1.5px solid ${WHITE}`, fontWeight: 800, letterSpacing: "0.5px" }}>{isAdmin ? tickets.length : userTickets.length}</span></div>
            {renderSearchBar()}
            <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
              {isAdmin ? (
                <>
                  {bannedInWaiting.length > 0 && <div><div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}><StabiloBadge label={`Banned (${bannedInWaiting.length})`} bg={WHITE} text={BLUE} border={WHITE} size="md" /></div>{bannedInWaiting.map((t) => renderListItem(t))}</div>}
                  {waiting.length > 0 && <div><div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}><StabiloBadge label={`Waiting (${waiting.length})`} bg={STATUS_STYLES.waiting.bg} text={STATUS_STYLES.waiting.text} border={STATUS_STYLES.waiting.border} size="md" /></div>{waiting.map((t) => renderListItem(t, { onExtraClick: () => takeTicket(t.id) }))}</div>}
                  {active.length > 0 && <div><div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}><StabiloBadge label={`Active (${active.length})`} bg={STATUS_STYLES.active.bg} text={STATUS_STYLES.active.text} border={STATUS_STYLES.active.border} size="md" /></div>{active.map((t) => renderListItem(t))}</div>}
                  {resolved.length > 0 && <div><div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}><StabiloBadge label={`Resolved (${resolved.length})`} bg={STATUS_STYLES.resolved.bg} text={STATUS_STYLES.resolved.text} border={STATUS_STYLES.resolved.border} size="md" /></div>{resolved.map((t) => renderListItem(t))}</div>}
                  {!waiting.length && !active.length && !resolved.length && !bannedInWaiting.length && <div style={{ padding: "30px 16px", textAlign: "center", color: WHITE, fontSize: "13px" }}>{searchQuery ? "No results found" : "No incoming chats"}</div>}
                </>
              ) : (
                <>
                  {filter(tickets.filter((t) => t.userId === user.uid)).map((t) => renderListItem(t))}
                  {!filter(tickets.filter((t) => t.userId === user.uid)).length && <div style={{ padding: "30px 16px", textAlign: "center", color: WHITE, fontSize: "13px" }}>{searchQuery ? "No results found" : "No chats yet"}</div>}
                </>
              )}
              {isAdmin && appealTickets.length > 0 && <div style={{ marginTop: "20px" }}><div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", borderTop: "1px solid rgba(255,255,255,0.15)" }}><StabiloBadge label={`Banding (${appealTickets.length})`} bg={WHITE} text={BLUE} border={WHITE} size="md" /></div>{appealTickets.map((t) => <div key={t.id} onClick={() => onOpenAppealChat(t)} style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}><span style={{ fontSize: "14px", fontWeight: 700, color: WHITE }}>{t.userName}</span><StabiloBadge label={t.status === "waiting" ? "Waiting" : t.status === "active" ? "Active" : "Closed"} bg={WHITE} text={BLUE} border={WHITE} size="sm" /></div><div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontFamily: FONT_FAMILY }}>{t.banReason || "Banding"}</div></div>)}</div>}
            </div>
            {!isAdmin && <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, backgroundColor: BLUE }}><button data-tour="start-chat-button" onClick={() => setShowStartChat(true)} style={{ width: "100%", padding: "10px", backgroundColor: WHITE, color: BLUE, border: `1.5px solid ${WHITE}`, borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: "pointer", fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase" }}>+ New Chat</button></div>}
          </div>
          <div style={{ flex: 1, backgroundColor: WHITE, borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", overflow: "hidden", height: "700px", minWidth: 0 }}>
            {selectedTicket ? (
              <>
                <div style={{ padding: "16px 20px", backgroundColor: BLUE, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, gap: "12px" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "17px", color: WHITE, fontFamily: FONT_FAMILY, marginBottom: "6px" }}>{selectedTicket.userName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <StabiloBadge label={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).label} bg={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).bg} text={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).text} border={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).border} size="sm" />
                      <StabiloBadge label={selectedTicket.topic} bg={(TOPIC_STYLES[selectedTicket.topic] || TOPIC_STYLES["Other"]).bg} text={(TOPIC_STYLES[selectedTicket.topic] || TOPIC_STYLES["Other"]).text} border={(TOPIC_STYLES[selectedTicket.topic] || TOPIC_STYLES["Other"]).border} size="sm" />
                      {selectedTicket.typing && selectedTicket.status !== "resolved" && <span style={{ fontSize: "12px", color: WHITE, fontStyle: "italic", fontWeight: 700 }}>{selectedTicket.typingUserName} is typing...</span>}
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: 700, letterSpacing: "0.3px" }}>{generateTicketId(selectedTicket.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {isAdmin && selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && <button onClick={() => resolveTicket(selectedTicket.id)} style={{ padding: "8px 16px", backgroundColor: WHITE, color: BLUE, border: `1.5px solid ${WHITE}`, borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer", fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase" }}>Resolve</button>}
                    {selectedTicket.status !== "closed" && <CloseRoomButton onConfirm={handleCloseRoom} />}
                  </div>
                </div>
                {showCloseConfirm && <div style={{ padding: "10px 20px", backgroundColor: WHITE, borderBottom: `1.5px solid ${BLUE}`, display: "flex", alignItems: "center", gap: "10px", fontFamily: FONT_FAMILY, flexShrink: 0 }}><span style={{ display: "inline-block", padding: "3px 9px", border: `1.5px solid ${BLUE}`, backgroundColor: WHITE, color: BLUE, fontSize: "10px", fontWeight: 800, letterSpacing: "0.5px", borderRadius: "4px", textTransform: "uppercase" }}>Peringatan</span><span style={{ fontSize: "13px", color: BLUE, fontWeight: 600 }}>Room ditutup. Buat room baru untuk melanjutkan.</span></div>}
                {!isAdmin && isBanned && <BannedInfoBanner banReason={banReason} banMessage={banMessage || ""} onAppeal={createAppealTicket} hasAppeal={hasAppeal} />}
                <div ref={chatRef} className="chat-messages-container" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}>
                  {messages.length === 0 ? <div style={{ textAlign: "center", color: "#999", fontSize: "15px", padding: "30px 0", fontFamily: FONT_FAMILY }}>No messages yet</div> : messages.map((msg, idx) => {
                    const isMine = msg.senderId === user.uid;
                    return (
                      <div key={msg.id || idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                        <div style={{ padding: "12px 16px", borderRadius: "12px", backgroundColor: isMine ? BLUE : "#f4f4f5", color: isMine ? WHITE : BLACK, fontSize: "15px", fontFamily: FONT_FAMILY, wordBreak: "break-word", border: isMine ? "none" : "1px solid rgba(0,0,0,0.05)" }}>
                          {!isMine && <div style={{ fontSize: "12px", fontWeight: 700, color: BLUE, marginBottom: "5px" }}>{msg.senderName}</div>}
                          {msg.replyTo && <div style={{ padding: "6px 10px", backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "rgba(13,60,252,0.1)", borderLeft: `3px solid ${isMine ? WHITE : BLUE}`, borderRadius: "4px", marginBottom: "6px", fontSize: "11px", color: isMine ? WHITE : BLUE, fontStyle: "italic", fontFamily: FONT_FAMILY }}><strong>{msg.replyTo.senderName}:</strong> {msg.replyTo.text}</div>}
                          <div>{msg.text}</div>
                          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginTop: "5px" }}>{renderDeliveryStatus(msg, isMine)}<span style={{ fontSize: "10px", color: isMine ? WHITE : "#999" }}>{formatTime(msg.timestamp)}</span></div>
                        </div>
                        <button onClick={() => setReplyTo(msg)} style={{ background: "transparent", border: "none", color: BLUE, fontSize: "10px", cursor: "pointer", fontFamily: FONT_FAMILY, fontWeight: 700, marginTop: "2px", display: "flex", alignItems: "center", gap: "4px", alignSelf: isMine ? "flex-end" : "flex-start" }}><ReplyIcon size={10} color={BLUE} />Reply</button>
                      </div>
                    );
                  })}
                  {typingText && selectedTicket.status !== "resolved" && <div style={{ alignSelf: "flex-start", fontSize: "14px", color: "#666", fontStyle: "italic", padding: "5px 10px", fontFamily: FONT_FAMILY }}>{typingText}</div>}
                  {latestRollingMessage && <div style={{ alignSelf: "flex-start", maxWidth: "100%", width: "100%", borderTop: `1px dashed ${BLUE}40`, paddingTop: "10px", marginTop: "6px" }}><RollingNewMessage key={rollingKey} senderName={latestRollingMessage.senderName} message={latestRollingMessage.text} isFromAgent={latestRollingMessage.isFromAgent} /></div>}
                  <div ref={messagesEndRef} />
                </div>
                {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" ? (
                  <>
                    {replyTo && <div style={{ padding: "8px 24px", backgroundColor: "rgba(13,60,252,0.06)", borderTop: `1px solid ${BLUE}20`, display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}><ReplyIcon size={14} color={BLUE} /><div style={{ flex: 1, fontSize: "12px", color: BLUE, fontFamily: FONT_FAMILY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><strong>{replyTo.senderName}:</strong> {replyTo.text}</div><button onClick={() => setReplyTo(null)} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", fontSize: "16px", fontFamily: FONT_FAMILY, padding: 0, lineHeight: 1 }}>×</button></div>}
                    <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "12px", backgroundColor: WHITE, flexShrink: 0 }}>
                      <input type="text" value={messageText} onChange={handleTyping} onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey && messageText.trim()) { e.preventDefault(); sendMessage(); } }} placeholder={selectedTicket.status === "waiting" && !isAdmin ? "Waiting for agent..." : "Type a message..."} disabled={selectedTicket.status === "waiting" && !isAdmin} style={{ flex: 1, padding: "12px 16px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "10px", fontSize: "15px", outline: "none", fontFamily: FONT_FAMILY, backgroundColor: selectedTicket.status === "waiting" && !isAdmin ? "#f5f5f5" : WHITE }} />
                      <button onClick={sendMessage} disabled={(selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim()} style={{ padding: "12px 24px", backgroundColor: (selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim() ? "#ccc" : BLUE, color: WHITE, border: "none", borderRadius: "10px", cursor: (selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim() ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>Send</button>
                    </div>
                  </>
                ) : <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#fafafa", textAlign: "center", fontFamily: FONT_FAMILY, fontSize: "13px", color: BLUE, flexShrink: 0, fontWeight: 700 }}>Room ini telah {selectedTicket.status === "closed" ? "ditutup" : "diselesaikan"}.</div>}
              </>
            ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "15px", fontFamily: FONT_FAMILY }}>Select a chat from the list on the left</div>}
          </div>
        </div>
      </div>
    </>
  );
};

// ===== MAIN PAGE =====
export default function HomePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [navbarShifted, setNavbarShifted] = useState(false);
  const [noteHovered, setNoteHovered] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);
  const [submittedNotes, setSubmittedNotes] = useState<NoteEntry[]>([]);
  const [inviteUsers, setInviteUsers] = useState<InviteUser[]>([]);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<{ [k: string]: boolean }>({});
  const [inviteToast, setInviteToast] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<NoteEntry[]>([]);
  const [hasSubmittedNote, setHasSubmittedNote] = useState(false);
  const [activeNoteUser, setActiveNoteUser] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<NoteInvitation[]>([]);
  const [adminAppealTicket, setAdminAppealTicket] = useState<AppealTicket | null>(null);
  const [showAdminAppealSection, setShowAdminAppealSection] = useState(false);
  const [bannedAppealTicket, setBannedAppealTicket] = useState<AppealTicket | null>(null);
  const [showBannedAppealSection, setShowBannedAppealSection] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const noteJoinRef = useRef<HTMLDivElement>(null);
  const notesSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!auth || !isMounted) return;
    const unsub = onAuthStateChanged(auth, async (cu: any) => {
      setUser(cu); setLoading(false);
      if (cu) { setIsAdmin(cu.email === ADMIN_EMAIL); try { await updateDoc(doc(db, "users", cu.uid), { online: true, lastSeen: serverTimestamp(), email: cu.email || "", displayName: cu.displayName || cu.email?.split("@")[0] || "User", photoURL: cu.photoURL || "" }); } catch (e) { console.error(e); } }
    });
    return () => unsub();
  }, [isMounted]);

  useEffect(() => {
    if (!db || !isMounted) return;
    const unsub = onSnapshot(query(collection(db, "users"), orderBy("lastSeen", "desc"), limit(50)), (s: any) => {
      const list: NoteEntry[] = [];
      s.forEach((d: any) => { const data = d.data(); list.push({ id: d.id, userId: d.id, userName: data.displayName || data.name || data.email?.split("@")[0] || "User", userEmail: data.email || "", userPhoto: data.photoURL || "", text: data.text || "", category: data.category || "", createdAt: data.createdAt || data.lastSeen || null, isAnonymous: data.isAnonymous === true } as NoteEntry); });
      setRegisteredUsers(list);
    });
    return () => unsub();
  }, [db, isMounted]);

  useEffect(() => {
    if (!db || !isMounted) return;
    const unsub = onSnapshot(query(collection(db, "users"), orderBy("lastSeen", "desc"), limit(200)), (s: any) => {
      const list: InviteUser[] = [];
      s.forEach((d: any) => { const data = d.data(); list.push({ uid: d.id, displayName: data.displayName || data.name || data.email?.split("@")[0] || "User", email: data.email || "", photoURL: data.photoURL || "", isAnonymous: data.isAnonymous === true }); });
      setInviteUsers(list);
    });
    return () => unsub();
  }, [db, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const unsub = onSnapshot(query(collection(db, "userNotes"), where("userId", "==", user.uid), limit(1)), (s: any) => setHasSubmittedNote(!s.empty));
    return () => unsub();
  }, [db, user, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const unsub = onSnapshot(query(collection(db, "userNotes"), where("userId", "==", user.uid), orderBy("updatedAt", "desc"), limit(50)), (s: any) => {
      const list: NoteEntry[] = [];
      s.forEach((d: any) => { const data = d.data(); list.push({ id: d.id, userId: data.userId, userName: data.userName || data.userEmail?.split("@")[0] || "User", userEmail: data.userEmail || "", userPhoto: data.userPhoto || "", title: data.title || "Tanpa Judul", description: data.description || "", descriptionHtml: data.descriptionHtml || "", category: data.category || "Lainnya", link: data.link || "", labelColor: data.labelColor || "", createdAt: data.createdAt, updatedAt: data.updatedAt } as NoteEntry); });
      setSubmittedNotes(list);
    });
    return () => unsub();
  }, [db, user, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const unsub = onSnapshot(query(collection(db, "note_invitations"), where("inviteeId", "==", user.uid), where("status", "==", "pending")), (s: any) => {
      const list: NoteInvitation[] = [];
      s.forEach((d: any) => list.push({ id: d.id, ...d.data() } as NoteInvitation));
      setPendingInvites(list);
    });
    return () => unsub();
  }, [db, user, isMounted]);

  useEffect(() => {
    if (!isMounted || loading) return;
    let killed = false;
    const pre = preloaderRef.current, tx = textRef.current, ct = counterRef.current, mn = mainPageRef.current;
    if (!pre || !tx || !ct || !mn) return;
    setShowMain(true);
    gsap.set(tx, { y: 100, opacity: 0 });
    gsap.set(ct, { opacity: 1, scale: 1, y: 0, xPercent: 0 });
    gsap.set(pre, { opacity: 1, scale: 1, xPercent: 0, display: "block" });
    gsap.set(mn, { xPercent: 100, opacity: 1, display: "flex" });
    const co = { value: 1 }; ct.textContent = "01";
    const tl = gsap.timeline();
    tl.to(tx, { y: 0, opacity: 1, duration: 1.0, ease: "back.out(1.7)" }).to(tx, { duration: 0.8 }).to(tx, { opacity: 0, y: -20, scale: 0.9, duration: 0.5, ease: "power2.out", onComplete: () => { if (tx) tx.textContent = "Note"; } }).to(tx, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.7)" }).to(tx, { duration: 1.2 });
    tl.to(co, { value: 100, duration: 6.5, ease: "power2.inOut", onUpdate: () => { if (ct) ct.textContent = String(Math.round(co.value)).padStart(2, "0"); } }, 0);
    tl.to(tx, { scale: 0.3, opacity: 0, duration: 0.8, ease: "power2.in" }).to(ct, { scale: 0.6, opacity: 0, duration: 0.8, ease: "power2.in" }, "-=0.8").to(pre, { xPercent: -100, duration: 1.2, ease: "power3.inOut", onComplete: () => { if (pre) pre.style.display = "none"; } }, "-=0.2").to(mn, { xPercent: 0, duration: 1.2, ease: "power3.inOut", onComplete: () => { if (killed) return; gsap.set(mn, { clearProps: "transform,willChange" }); setTimeout(() => ScrollTrigger.refresh(), 300); } }, "<");
    return () => { killed = true; tl.kill(); };
  }, [isMounted, loading]);

  useEffect(() => { if (!isMounted || !showMain || !noteJoinRef.current) return; const ctx = gsap.context(() => { gsap.fromTo(noteJoinRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: noteJoinRef.current, start: "top 85%", toggleActions: "play none none none", once: true } }); }, noteJoinRef); return () => ctx.revert(); }, [isMounted, showMain]);

  useEffect(() => { if (!isMounted || !showMain) return; const items = document.querySelectorAll(".note-user-fp"); if (!items.length) return; gsap.fromTo(items, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)" }); }, [isMounted, showMain, registeredUsers]);

  useEffect(() => { if (!activeNoteUser) return; const el = document.querySelector(`.note-user-name-${activeNoteUser}`); if (el) gsap.fromTo(el, { opacity: 0, x: -30, scale: 0.8 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }); }, [activeNoteUser]);
  useEffect(() => { if (!showNotesSection || !notesSectionRef.current) return; gsap.fromTo(notesSectionRef.current, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }); }, [showNotesSection]);

  const handleInvite = async (iu: InviteUser) => {
    if (!user) { setInviteToast("Silakan sign in terlebih dahulu"); setTimeout(() => setInviteToast(null), 2500); return; }
    try {
      await addDoc(collection(db, "note_invitations"), { inviterId: user.uid, inviterName: user.displayName || user.email?.split("@")[0] || "User", inviterEmail: user.email || "", inviteeId: iu.uid, inviteeEmail: iu.email || "", status: "pending", createdAt: serverTimestamp() });
      setInvitedUsers((p) => ({ ...p, [iu.uid]: true }));
      setInviteToast(`Undangan terkirim ke ${iu.isAnonymous ? "Anonim" : iu.displayName}`);
      setTimeout(() => setInviteToast(null), 2500);
    } catch { setInviteToast("Gagal mengirim undangan."); setTimeout(() => setInviteToast(null), 2500); }
  };

  const handleAccept = async (id: string) => { try { await updateDoc(doc(db, "note_invitations", id), { status: "accepted" }); setPendingInvites((p) => p.filter((i) => i.id !== id)); setInviteToast("Undangan diterima!"); setTimeout(() => setInviteToast(null), 2500); } catch {} };
  const handleDecline = async (id: string) => { try { await updateDoc(doc(db, "note_invitations", id), { status: "declined" }); setPendingInvites((p) => p.filter((i) => i.id !== id)); setInviteToast("Undangan ditolak."); setTimeout(() => setInviteToast(null), 2500); } catch {} };

  const filteredInvite = inviteUsers.filter((u) => { if (user && u.uid === user.uid) return false; const q = inviteSearch.trim().toLowerCase(); if (!q) return true; return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q); });
  const getByCat = (cat: string) => submittedNotes.filter((n) => n.category === cat);

  if (!isMounted || loading) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: FONT_FAMILY }}>
        <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
          <span style={{ fontSize: "100px", fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>Menuru</span>
          <span style={{ fontSize: "50px", fontWeight: 600, color: BLACK, fontFamily: FONT_FAMILY, letterSpacing: "-0.02em", display: "inline-block" }}>Shop</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Menuru Official | Home</title>
        <meta name="description" content="Menuru Brand from Love yourself" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content={BLUE} />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <meta property="og:title" content="Menuru Official | Home" />
        <meta property="og:description" content="Menuru Brand from Love yourself" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menuru Official | Home" />
        <meta name="twitter:description" content="Menuru Brand from Love yourself" />
        <meta name="twitter:image" content="/images/ai.jpg" />
      </Head>
      <div ref={wrapperRef} style={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: WHITE }}>
        <div ref={preloaderRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: WHITE, zIndex: 9999, fontFamily: FONT_FAMILY, overflow: "hidden", willChange: "transform" }}>
          <span ref={counterRef} style={{ position: "absolute", top: "10px", right: "40px", fontSize: "400px", fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.04em", lineHeight: 0.9, display: "inline-block", userSelect: "none", pointerEvents: "none" }}>01</span>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
              <span style={{ fontSize: "100px", fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>Menuru</span>
              <span ref={textRef} style={{ fontSize: "50px", fontWeight: 600, color: BLACK, fontFamily: FONT_FAMILY, letterSpacing: "-0.02em", display: "inline-block" }}>Shop</span>
            </div>
          </div>
        </div>
        {showDashboard && <DashboardOverlay user={user} db={db} onClose={() => setShowDashboard(false)} />}
        <div ref={mainPageRef} style={{ position: "relative", width: "100%", minHeight: "100vh", backgroundColor: WHITE, margin: 0, padding: 0, fontFamily: FONT_FAMILY, overflow: "visible", display: "flex", flexDirection: "column", willChange: "transform" }}>
          <TopBanner />
          <div style={{ position: "fixed", top: "44px", left: 0, width: "200px", height: "120px", pointerEvents: "none", zIndex: 8500, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", maskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }} />
          <div style={{ position: "fixed", top: "44px", right: 0, width: "200px", height: "120px", pointerEvents: "none", zIndex: 8500, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }} />
          <LeftNavbar shifted={navbarShifted} />
          <RightNavbar user={user} auth={auth} db={db} onOpenDashboard={() => setShowDashboard(true)} />
          <div style={{ marginTop: "44px" }}><HeroMenuruTitle /></div>
          <div style={{ width: "100%", padding: "0 40px", maxWidth: "1600px", margin: "0 auto", marginTop: "40px", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "60px", flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0, textAlign: "left" }}>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: "90px", fontWeight: 700, color: BLUE, letterSpacing: "-0.04em", lineHeight: 1.05, whiteSpace: "nowrap" }}>Brand Identities</div>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: "90px", fontWeight: 700, color: BLUE, letterSpacing: "-0.04em", lineHeight: 1.05, whiteSpace: "nowrap" }}>&amp; Campaigns</div>
              </div>
              <div style={{ flex: "1 1 0", minWidth: "300px", display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left", paddingTop: "20px" }}>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: "25px", fontWeight: 600, color: BLACK, letterSpacing: "-0.01em", lineHeight: 1.35, maxWidth: "700px" }}>Menuru Studio is a non-profit brand born from the founder&apos;s vision to assist the public at no cost</div>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: "25px", fontWeight: 600, color: BLACK, letterSpacing: "-0.01em", lineHeight: 1.35, maxWidth: "700px", marginTop: "4px" }}>Since our brand was established, we have helped people find exceptional solutions for their activities and created memorable features</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%", position: "relative", zIndex: 2, marginTop: "80px" }}>
            <h2 style={{ fontFamily: FONT_FAMILY, fontSize: "80px", fontWeight: 700, color: BLUE, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, marginBottom: "30px", textAlign: "left" }}>Features</h2>
            <div style={{ width: "100%", position: "relative", zIndex: 2, marginBottom: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "140px" }}>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: "90px", fontWeight: 700, color: BLUE, letterSpacing: "-0.04em", lineHeight: 1 }}>01</span>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: "90px", fontWeight: 700, color: BLACK, letterSpacing: "-0.04em", lineHeight: 1 }}>Notes</span>
                </div>
                <div style={{ marginLeft: "auto", marginRight: "360px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", marginTop: "-45px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 16px", backgroundColor: BLUE, color: WHITE, borderRadius: "4px", fontSize: "16px", fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: FONT_FAMILY, lineHeight: 1.3, whiteSpace: "nowrap" }}>Trust</span>
                  <p style={{ fontFamily: FONT_FAMILY, fontSize: "18px", fontWeight: 600, color: BLUE, letterSpacing: "-0.01em", lineHeight: 1.4, margin: 0, maxWidth: "420px", textAlign: "left" }}>Notes for the next era of technology system</p>
                </div>
              </div>
              <div style={{ position: "absolute", right: "40px", top: "0", display: "flex", alignItems: "center", justifyContent: "center", width: "120px", height: "120px", backgroundColor: BLUE, borderRadius: "20px", flexShrink: 0 }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            <div style={{ position: "relative", width: "100%", height: "420px", marginBottom: "60px", zIndex: 1 }} onMouseEnter={() => setNoteHovered(true)} onMouseLeave={() => setNoteHovered(false)}>
              <div style={{ position: "absolute", top: "0px", left: "260px", right: "360px", height: "420px", backgroundColor: BLUE, borderRadius: "24px", border: `2px solid ${BLUE}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/images/plj.JPG" alt="Note" style={{ maxWidth: "95%", maxHeight: "95%", width: "auto", height: "auto", objectFit: "contain", mixBlendMode: "screen", display: "block", opacity: noteHovered ? 0.35 : 1, transition: "opacity 0.4s ease", pointerEvents: "none", userSelect: "none" }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", overflow: "hidden", pointerEvents: "none", opacity: noteHovered ? 1 : 0, transition: "opacity 0.4s ease" }}>
                  <div style={{ display: "inline-flex", whiteSpace: "nowrap", animation: noteHovered ? "comingsoon-marquee 8s linear infinite" : "none", fontFamily: FONT_FAMILY, fontSize: "140px", fontWeight: 800, color: WHITE, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>
                    <span style={{ paddingRight: "80px" }}>Comingsoon</span><span style={{ paddingRight: "80px" }}>Comingsoon</span><span style={{ paddingRight: "80px" }}>Comingsoon</span><span style={{ paddingRight: "80px" }}>Comingsoon</span>
                  </div>
                </div>
              </div>
            </div>
            <div ref={noteJoinRef} style={{ width: "100%", marginTop: "0px", marginBottom: "60px", paddingLeft: "260px", paddingRight: "360px", fontFamily: FONT_FAMILY, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
                <h3 style={{ fontFamily: FONT_FAMILY, fontSize: "35px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", lineHeight: 1.1, margin: 0 }}>Bergabung bersama kami di fitur Note</h3>
                <button onClick={() => setShowNotesSection(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "10px", fontFamily: FONT_FAMILY, fontSize: "35px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, cursor: "pointer", transition: "background-color 0.25s ease" }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLACK; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLUE; }}><span>Bergabung</span><NorthEastArrow size={32} color={WHITE} /></button>
              </div>
              <div style={{ width: "100%", backgroundColor: BLUE, borderRadius: "24px", padding: "24px 28px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", minHeight: "70px", boxShadow: "0 8px 32px rgba(13,60,252,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  {registeredUsers.length === 0 && <span style={{ fontSize: "35px", fontWeight: 700, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Belum ada yang bergabung</span>}
                  {registeredUsers.map((n) => {
                    const isMe = user && n.userId === user.uid;
                    const hasN = hasSubmittedNote && isMe;
                    const dn = n.isAnonymous ? "Anonim" : n.userName || n.userEmail?.split("@")[0] || "User";
                    return (
                      <div key={n.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {isMe && <><span style={{ fontSize: "35px", fontWeight: 600, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.1 }}>from</span><span style={{ fontSize: "35px", fontWeight: 700, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>{dn}</span></>}
                        <div className="note-user-fp" onClick={() => setActiveNoteUser(activeNoteUser === n.id ? null : n.id)} style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "transform 0.2s ease", border: isMe ? `3px solid ${WHITE}` : "none" }} onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.15)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}>
                          {n.userPhoto && !n.isAnonymous ? <img src={n.userPhoto} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} referrerPolicy="no-referrer" /> : <span style={{ fontSize: "20px", fontWeight: 800, color: BLUE }}>{dn.charAt(0).toUpperCase()}</span>}
                        </div>
                        {isMe && <span style={{ fontSize: "35px", fontWeight: 700, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>{hasN ? "✓ Sudah bergabung" : "Belum bergabung"}</span>}
                        {!isMe && activeNoteUser === n.id && <span className={`note-user-name-${n.id}`} style={{ fontSize: "35px", fontWeight: 700, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>{dn}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {showNotesSection && (
              <div ref={notesSectionRef} id="notes-invite" style={{ width: "100%", marginTop: "60px", marginBottom: "60px", fontFamily: FONT_FAMILY }}>
                <h2 style={{ fontFamily: FONT_FAMILY, fontSize: "150px", fontWeight: 700, color: BLUE, letterSpacing: "-0.04em", lineHeight: 1, margin: 0, marginBottom: "20px", textAlign: "left" }}>Notes</h2>
                <p style={{ fontFamily: FONT_FAMILY, fontSize: "20px", fontWeight: 500, color: BLACK, letterSpacing: "-0.01em", lineHeight: 1.6, margin: 0, marginBottom: "40px", maxWidth: "800px", textAlign: "left" }}>Temukan catatan-catatan menarik dari komunitas Menuru. Semua catatan dikategorikan untuk memudahkan Anda menjelajahi topik yang Anda minati.</p>
                {pendingInvites.length > 0 && <div style={{ marginBottom: "40px", backgroundColor: BLUE, borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "700px" }}><div style={{ fontSize: "20px", fontWeight: 700, color: WHITE, display: "flex", alignItems: "center", gap: "10px" }}><InviteIcon size={24} color={WHITE} />Undangan Masuk ({pendingInvites.length})</div>{pendingInvites.map((inv) => <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: WHITE, padding: "12px 16px", borderRadius: "10px", flexWrap: "wrap", gap: "10px" }}><div style={{ fontFamily: FONT_FAMILY, color: BLUE }}><span style={{ fontWeight: 800 }}>{inv.inviterName}</span> mengundang Anda untuk berkolaborasi di Notes.</div><div style={{ display: "flex", gap: "8px" }}><button onClick={() => handleAccept(inv.id)} style={{ padding: "6px 16px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "12px" }}>ACC</button><button onClick={() => handleDecline(inv.id)} style={{ padding: "6px 16px", backgroundColor: "transparent", color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "12px" }}>Tolak</button></div></div>)}</div>}
                <div style={{ marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <button onClick={() => setShowInvitePanel((p) => !p)} style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 24px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "10px", fontFamily: FONT_FAMILY, fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em", cursor: "pointer", transition: "background-color 0.25s ease" }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLACK; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLUE; }}><InviteIcon size={22} color={WHITE} /><span>{showInvitePanel ? "Tutup Undangan" : "Undang Orang Lain"}</span></button>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: "15px", fontWeight: 500, color: BLUE, letterSpacing: "-0.01em" }}>Pilih user dari Firebase untuk diundang ke Notes Menuru</span>
                </div>
                {showInvitePanel && <div style={{ marginBottom: "40px", backgroundColor: BLUE, borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "700px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}><span style={{ fontFamily: FONT_FAMILY, fontSize: "20px", fontWeight: 700, color: WHITE, letterSpacing: "-0.01em" }}>Daftar User ({filteredInvite.length})</span><input type="text" value={inviteSearch} onChange={(e) => setInviteSearch(e.target.value)} placeholder="Cari user..." style={{ padding: "8px 14px", borderRadius: "8px", border: `1.5px solid ${WHITE}`, backgroundColor: WHITE, color: BLUE, fontFamily: FONT_FAMILY, fontSize: "13px", fontWeight: 600, outline: "none", minWidth: "200px" }} /></div>
                  <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filteredInvite.length === 0 && <div style={{ padding: "20px", textAlign: "center", fontFamily: FONT_FAMILY, fontSize: "14px", color: WHITE, opacity: 0.8 }}>Tidak ada user ditemukan</div>}
                    {filteredInvite.map((iu) => {
                      const isInvited = invitedUsers[iu.uid];
                      const dn = iu.isAnonymous ? "Anonim" : iu.displayName;
                      return (
                        <div key={iu.uid} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", backgroundColor: WHITE, borderRadius: "10px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{iu.photoURL && !iu.isAnonymous ? <img src={iu.photoURL} alt={iu.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" /> : <span style={{ fontSize: "16px", fontWeight: 800, color: WHITE }}>{dn.charAt(0).toUpperCase()}</span>}</div>
                          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 700, color: BLUE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}>{dn}{(iu.email === ADMIN_EMAIL || iu.email === OWNER_EMAIL) && <VerifiedBadgeWhite size={16} />}</div><div style={{ fontFamily: FONT_FAMILY, fontSize: "11px", fontWeight: 500, color: BLUE, opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iu.email}</div></div>
                          <button onClick={() => handleInvite(iu)} style={{ padding: "8px 16px", backgroundColor: isInvited ? BLACK : BLUE, color: WHITE, border: "none", borderRadius: "8px", fontFamily: FONT_FAMILY, fontSize: "12px", fontWeight: 800, letterSpacing: "0.5px", cursor: "pointer", textTransform: "uppercase", flexShrink: 0 }}>{isInvited ? "Invited" : "Invite"}</button>
                        </div>
                      );
                    })}
                  </div>
                </div>}
                {inviteToast && <div style={{ marginBottom: "20px", padding: "12px 20px", backgroundColor: BLUE, color: WHITE, borderRadius: "10px", fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 600, display: "inline-block" }}>{inviteToast}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "50px" }}>
                  {NOTES_CATEGORIES.map((cat) => {
                    const notes = getByCat(cat);
                    return (
                      <div key={cat} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <span style={{ fontFamily: FONT_FAMILY, fontSize: "32px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", lineHeight: 1.2, cursor: "default" }}>{cat}</span>
                        {notes.length > 0 ? <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "20px" }}>
                          {notes.map((note) => {
                            const nu = registeredUsers.find((r) => r.userId === note.userId);
                            const dn = nu?.isAnonymous ? "Anonim" : note.userName || "User";
                            return (
                              <div key={note.id} style={{ backgroundColor: BLUE, borderRadius: "28px", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px", boxShadow: `0 8px 32px ${BLUE}40`, maxWidth: "700px" }}>
                                {note.category && <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "8px", padding: "8px 22px", backgroundColor: WHITE, color: BLUE, borderRadius: "24px 4px 24px 24px", fontFamily: FONT_FAMILY, fontSize: "15px", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", border: `2px solid ${WHITE}`, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{note.category}</div>}
                                <div style={{ padding: "18px 24px", backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: "6px 28px 28px 28px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}><span style={{ fontSize: "34px", fontFamily: FONT_FAMILY, lineHeight: "1.25", color: BLUE, fontWeight: 800, flex: 1, minWidth: 0, wordBreak: "break-word" }}>{note.title}</span></div>
                                {(note.descriptionHtml || note.description) && <div style={{ padding: "20px 24px", backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: "28px 6px 28px 28px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>{note.descriptionHtml ? <div className="note-description-html" dangerouslySetInnerHTML={{ __html: note.descriptionHtml }} style={{ fontSize: "17px", fontFamily: FONT_FAMILY, lineHeight: "1.7", color: BLACK, wordBreak: "break-word" }} /> : <div style={{ fontSize: "17px", fontFamily: FONT_FAMILY, lineHeight: "1.7", color: BLACK, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{note.description}</div>}</div>}
                                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: "20px 4px 20px 20px", fontSize: "14px", color: BLUE, fontWeight: 700, fontFamily: FONT_FAMILY, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{note.updatedAt ? new Date(note.updatedAt.toDate()).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Baru saja"}</div>
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: "4px 20px 20px 20px", fontSize: "14px", color: BLUE, fontWeight: 700, fontFamily: FONT_FAMILY, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>oleh {dn}<VerifiedBadgeBlue size={22} /></div>
                                </div>
                              </div>
                            );
                          })}
                        </div> : <span style={{ fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 500, color: "#999", paddingLeft: "20px", fontStyle: "italic" }}>Belum ada catatan di kategori ini.</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div style={{ position: "relative", zIndex: 1, flex: "1 0 auto", backgroundColor: WHITE }}>
            <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
              <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} onOpenAppealChat={(t: AppealTicket) => { setAdminAppealTicket(t); setShowAdminAppealSection(true); }} onOpenBannedAppealChat={(t: AppealTicket) => { setBannedAppealTicket(t); setShowBannedAppealSection(true); }} />
              {isAdmin && showAdminAppealSection && adminAppealTicket && <div style={{ marginTop: "30px", height: "600px" }}><div style={{ fontSize: "13px", fontWeight: 800, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px" }}>Chat Ajukan Banding</div><AppealChatRoom user={user} isAdmin={true} db={db} appealTicket={adminAppealTicket} onClose={() => { setShowAdminAppealSection(false); setAdminAppealTicket(null); }} /></div>}
              {!isAdmin && showBannedAppealSection && bannedAppealTicket && <div style={{ marginTop: "30px", height: "600px" }}><div style={{ fontSize: "13px", fontWeight: 800, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "12px" }}>Chat Ajukan Banding</div><AppealChatRoom user={user} isAdmin={false} db={db} appealTicket={bannedAppealTicket} onClose={() => { setShowBannedAppealSection(false); setBannedAppealTicket(null); }} /></div>}
            </div>
            <FooterSection />
          </div>
        </div>
      </div>
      <style jsx global>{`
        html { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; height: 100% !important; }
        html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        body { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; margin: 0; padding: 0; background-color: #ffffff !important; min-height: 100% !important; height: auto !important; }
        body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { background-color: transparent; }
        .menuru-char { display: inline-block; will-change: transform, opacity; }
        .split-char-livechat { display: inline-block; will-change: transform, opacity, filter; }
        .hero-menuru-char { display: inline-block; will-change: transform, opacity; color: #0d3cfc !important; transform-origin: 50% 100%; }
        .footer-menuru-char { display: inline-block; will-change: transform, opacity; color: #ffffff !important; transform-origin: 50% 100%; }
        .chat-messages-container::-webkit-scrollbar, .chat-list-container::-webkit-scrollbar, .chat-list-container > div::-webkit-scrollbar, .online-panel-container::-webkit-scrollbar, .online-panel-container > div::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .chat-messages-container, .chat-list-container, .chat-list-container > div, .online-panel-container, .online-panel-container > div { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        @keyframes comingsoon-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes blinking-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.75); } }
        @keyframes verifiedPop { 0% { transform: scale(0.3) rotate(-25deg); opacity: 0; } 20% { transform: scale(1) rotate(0deg); opacity: 1; } 40% { transform: scale(1.12) rotate(0deg); } 60% { transform: scale(1) rotate(0deg); } 80% { transform: scale(1.18) rotate(0deg); } 100% { transform: scale(1) rotate(0deg); } }
        @keyframes drawCheck { 0% { stroke-dashoffset: 100; opacity: 0; } 100% { stroke-dashoffset: 0; opacity: 1; } }
        .note-description-html b, .note-description-html strong { font-weight: 700; }
        .note-description-html i, .note-description-html em { font-style: italic; }
        .note-description-html u { text-decoration: underline; }
        .note-description-html ul { padding-left: 24px; margin: 8px 0; }
        .note-description-html li { margin-bottom: 4px; }
        .footer-gallery-row { gap: 12px !important; }
        .footer-gallery-item img { mix-blend-mode: screen !important; }
        @media (max-width: 1024px) { .footer-gallery-row { gap: 10px !important; } .footer-gallery-item { height: clamp(140px, 24vw, 280px) !important; } }
        @media (max-width: 768px) { .footer-gallery-row { gap: 8px !important; grid-template-columns: repeat(4, 1fr) !important; } .footer-gallery-item { height: clamp(120px, 28vw, 200px) !important; } }
        @media (max-width: 480px) { .footer-gallery-row { gap: 6px !important; grid-template-columns: repeat(3, 1fr) !important; } .footer-gallery-item { height: clamp(100px, 30vw, 160px) !important; } }
      `}</style>
    </>
  );
}
