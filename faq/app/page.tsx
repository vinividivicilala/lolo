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
      try { const enc = encrypted.includes(":") ? encrypted.split(":")[1] : encrypted; return decodeURIComponent(escape(atob(enc))); } catch { return "[Message cannot be decrypted]"; }
    }
    return encrypted;
  }
}

// ===== ANTI-BOT =====
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
    if (botDoc.exists()) { const d = botDoc.data(); return { isBanned: d.isBlocked || false, reason: d.blockedReason || "", message: d.blockedMessage || "", canCreateTicket: d.canCreateTicket !== false, canSendMessage: d.canSendMessage !== false }; }
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) { const u = userDoc.data(); if (u.botBlocked === true) return { isBanned: true, reason: u.botBlockedReason || "Blocked by system", message: u.botBlockedMessage || "", canCreateTicket: u.canCreateTicket !== false, canSendMessage: u.canSendMessage !== false }; }
    return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
  } catch { return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true }; }
}

// ===== TOTP =====
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(bytes: Uint8Array): string {
  let bits = 0, value = 0, output = "";
  for (let i = 0; i < bytes.length; i++) { value = (value << 8) | bytes[i]; bits += 8; while (bits >= 5) { output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}
function base32Decode(input: string): Uint8Array {
  const cleaned = input.replace(/=+$/g, "").toUpperCase();
  const bytes: number[] = [];
  let bits = 0, value = 0;
  for (let i = 0; i < cleaned.length; i++) { const idx = BASE32_ALPHABET.indexOf(cleaned[i]); if (idx === -1) continue; value = (value << 5) | idx; bits += 5; if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 0xff); bits -= 8; } }
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
async function totp(secret: string): Promise<string> { const counter = Math.floor(Math.floor(Date.now() / 1000) / 30); return hotp(secret, counter, 6); }
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

// ===== PASSKEY =====
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
function supportsWebAuthn(): boolean { if (typeof window === "undefined") return false; return !!(window.PublicKeyCredential && navigator.credentials); }
async function platformAuthenticatorAvailable(): Promise<boolean> {
  try { if (!supportsWebAuthn()) return false; const anyCred = window.PublicKeyCredential as any; if (anyCred.isUserVerifyingPlatformAuthenticatorAvailable) return await anyCred.isUserVerifyingPlatformAuthenticatorAvailable(); return true; } catch { return false; }
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
const ChevronLeftIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
const ShieldCheckIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
const InfoIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" /><path d="M12 8V12" stroke={color} strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill={color} /></svg>
);
const SendIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const XCircleIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" /><path d="M8 8L16 16M16 8L8 16" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>
);
const CheckCircleIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" /><path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ArrowRightIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
interface Ticket { id: string; userId: string; userName: string; userEmail: string; userPhoto?: string; agentId?: string; agentName?: string; status: "waiting" | "active" | "resolved" | "closed"; topic: string; createdAt: any; lastMessage?: string; lastMessageTime?: any; lastMessageSender?: string; unreadCount: number; typing: boolean; typingUserId?: string | null; typingUserName?: string | null; isAnnouncement?: boolean; isBroadcast?: boolean; isBanned?: boolean; banReason?: string; banMessage?: string; appealOnly?: boolean; }
interface ChatMessage { id: string; senderId: string; senderName: string; text: string; timestamp: any; read: boolean; isEncrypted?: boolean; isBotDetected?: boolean; deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed"; replyTo?: { messageId: string; senderName: string; text: string } | null; }
interface OnlineUser { uid: string; displayName: string; email: string; photoURL?: string; online: boolean; lastSeen?: any; isAgent?: boolean; isAnonymous?: boolean; }
interface LastMessagePreview { text: string; senderName: string; timestamp: any; isFromAgent: boolean; }
interface TourStep { target: string; title: string; content: string; position?: "top" | "bottom" | "left" | "right"; isLoginStep?: boolean; }
interface AppealMessage { id: string; senderId: string; senderName: string; text: string; timestamp: any; read: boolean; isEncrypted?: boolean; deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed"; replyTo?: { messageId: string; senderName: string; text: string } | null; }
interface AppealTicket { id: string; userId: string; userName: string; userEmail: string; userPhoto?: string; agentId?: string; agentName?: string; status: "waiting" | "active" | "resolved" | "closed"; topic: string; banReason: string; banMessage: string; createdAt: any; lastMessage?: string; lastMessageTime?: any; lastMessageSender?: string; unreadCount: number; typing: boolean; typingUserId?: string | null; typingUserName?: string | null; }
interface PasskeyRecord { id: string; credentialId: string; name: string; createdAt: number; transports?: string[]; }
interface AccountStatusInfo { isBanned: boolean; reason: string; message: string; canCreateTicket: boolean; canSendMessage: boolean; }

// ===== FARID VERIFIED PANEL =====
const FaridVerifiedPanel = ({ open, anchorRect, onClose }: { open: boolean; anchorRect: DOMRect | null; onClose: () => void; }) => {
  const [phase, setPhase] = useState<"loading" | "expand" | "fullpage">("loading");
  const panelRef = useRef<HTMLDivElement>(null);
  const fullPageRef = useRef<HTMLDivElement>(null);
  const closeIconRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => { if (open) { setPhase("loading"); setIsClosing(false); const timer = setTimeout(() => setPhase("expand"), 1800); return () => clearTimeout(timer); } }, [open]);

  useEffect(() => {
    if (phase !== "expand" || !panelRef.current || !fullPageRef.current || !anchorRect) return;
    const panel = panelRef.current, full = fullPageRef.current;
    gsap.set(panel, { position: "fixed", top: anchorRect.top, left: anchorRect.left, width: anchorRect.width, height: anchorRect.height, borderRadius: "6px", opacity: 1, zIndex: 9800 });
    gsap.set(full, { opacity: 0, zIndex: 9799 });
    const tl = gsap.timeline({ onComplete: () => setPhase("fullpage") });
    tl.to(panel, { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: "0px", duration: 0.7, ease: "power4.inOut" }).to(full, { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.35");
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
      {(phase === "loading" || phase === "expand") && <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 9700, background: "rgba(0,0,0,0.25)", pointerEvents: "auto" }} />}
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
              <svg width="18" height="18" viewBox="0 0 40 40"><path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" /><path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "11px", fontWeight: 800, color: WHITE }}>Verified</span>
            </div>
          )}
        </div>
      )}
      {(phase === "expand" || phase === "fullpage") && (
        <div ref={fullPageRef} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: BLUE, zIndex: 9799, display: phase === "fullpage" ? "flex" : "none", flexDirection: "column", fontFamily: FONT_FAMILY, color: WHITE, overflow: "hidden", opacity: 0 }}>
          <div style={{ padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <svg width="32" height="32" viewBox="0 0 40 40"><path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" /><path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
              <span style={{ fontSize: "28px", fontWeight: 800, color: WHITE }}>Verified</span>
            </div>
            <button onClick={handleClose} onMouseEnter={handleIconEnter} onMouseLeave={handleIconLeave} disabled={isClosing} style={{ background: WHITE, border: "none", color: BLUE, borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: isClosing ? "not-allowed" : "pointer" }}>
              <div ref={closeIconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><PlusIcon size={26} color={BLUE} /></div>
            </button>
          </div>
          <div style={{ flex: 1, padding: "20px 40px", display: "flex", flexDirection: "column", overflowY: "auto", gap: "24px" }}>
            <div style={{ backgroundColor: WHITE, borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              <h2 style={{ fontSize: "48px", fontWeight: 800, margin: 0, color: BLUE }}>Farid Ardiansyah</h2>
              <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: BLUE, lineHeight: 1.6, maxWidth: "700px", opacity: 0.9 }}>Website ini dibangun dan dikembangkan oleh Farid Ardiansyah. Verified developer & owner of Menuru.</p>
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
  const handleClickFarid = (e: React.MouseEvent) => { e.preventDefault(); if (showPanel) { setShowPanel(false); return; } if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect()); setShowPanel(true); };
  const handleClose = () => setShowPanel(false);
  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9100, height: "44px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px", fontFamily: FONT_FAMILY }}>
        <span style={{ color: WHITE, fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
          Website this is build the develope{" "}
          <button ref={btnRef} onClick={handleClickFarid} style={{ color: BLUE, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: WHITE, padding: "2px 8px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "14px" }}>
            Farid Ardiansyah<VerifiedBadgeBlue size={16} />
          </button>
        </span>
      </div>
      <FaridVerifiedPanel open={showPanel} anchorRect={anchorRect} onClose={handleClose} />
    </>
  );
};

// ===== FOOTER (singkat) =====
const FooterSection = () => {
  return (
    <div style={{ width: "calc(100% - 40px)", margin: "100px auto 20px auto", backgroundColor: BLUE, borderRadius: "32px", padding: "60px 40px 40px 40px", color: WHITE, fontFamily: FONT_FAMILY }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px" }}>
        {footerLinks.map((s, idx) => (
          <div key={idx} style={{ flex: 1, minWidth: "200px" }}>
            <h3 style={{ fontSize: "28px", fontWeight: 700, color: WHITE, margin: 0, marginBottom: "16px" }}>{s.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {s.links.map((link, i) => (<Link key={i} href="#" style={{ textDecoration: "none" }}><span style={{ color: WHITE, fontSize: "20px", fontWeight: 500 }}>{link}</span></Link>))}
            </div>
          </div>
        ))}
        <a href={STORE_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", padding: "14px 22px", backgroundColor: RED, borderRadius: "12px" }}>
          <WindowsIcon size={24} color={WHITE} />
          <span style={{ color: WHITE, fontSize: "18px", fontWeight: 700 }}>Download for Windows</span>
        </a>
      </div>
      <div style={{ maxWidth: "1400px", margin: "40px auto 0 auto", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        <p style={{ fontSize: "14px", color: WHITE, margin: 0, textAlign: "center", opacity: 0.8 }}>Terms and conditions apply.</p>
      </div>
      <div style={{ marginTop: "40px" }}>
        <span style={{ fontSize: "600px", fontWeight: 400, color: WHITE, letterSpacing: "-0.05em", lineHeight: "0.85", display: "block" }}>Menuru</span>
      </div>
    </div>
  );
};

// ===== NAVBAR (sederhana) =====
const NavbarButton = ({ label, panelTitle, panelDescription, iconType }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", backgroundColor: BLUE, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.18)", cursor: "pointer" }}>
    <span style={{ color: WHITE, fontSize: "13px", fontWeight: 600 }}>{label}</span>
  </div>
);
const LeftNavbar = ({ shifted }: { shifted: boolean }) => (
  <div style={{ position: "fixed", top: "64px", left: shifted ? "340px" : "60px", zIndex: 9000, display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT_FAMILY }}>
    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", marginRight: "16px" }}>
      <img src="/images/gfssa.jpg" alt="Menuru" style={{ height: "60px", mixBlendMode: "multiply" }} />
      <span style={{ color: BLUE, fontSize: "60px", fontWeight: 700, lineHeight: 1 }}>Menuru</span>
    </Link>
    <NavbarButton label="Teams" panelTitle="Trust" panelDescription="" iconType="trust" />
    <NavbarButton label="Individual" panelTitle="Careers" panelDescription="" iconType="career" />
    <NavbarButton label="Resources" panelTitle="Docs & Brand" panelDescription="" iconType="resources" />
  </div>
);

// ===== RIGHT NAVBAR =====
const RightNavbar = ({ user, auth, db, onOpenDashboard }: { user: any; auth: any; db: any; onOpenDashboard: () => void; }) => {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "";
  const userIsAdmin = user?.email === ADMIN_EMAIL;
  const [isAnonymous, setIsAnonymous] = useState(false);
  useEffect(() => { if (!user || !db) return; getDoc(doc(db, "users", user.uid)).then((snap) => { if (snap.exists()) setIsAnonymous(snap.data().isAnonymous === true); }).catch(() => {}); }, [user, db]);
  const displayNameAnon = isAnonymous ? "Anonim" : displayName;
  const handleLogout = async () => { if (!auth) return; try { if (db && user) await updateDoc(doc(db, "users", user.uid), { online: false, lastSeen: serverTimestamp() }); await signOut(auth); } catch (e) { console.error(e); } };
  if (!user) return (<div style={{ position: "fixed", top: "64px", right: "24px", zIndex: 9000 }}><Link href="/signin" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 18px", backgroundColor: BLUE, borderRadius: "10px", color: "#fff", fontFamily: FONT_FAMILY }}><PeopleIcon size={20} color="#fff" /><span style={{ fontSize: "14px", fontWeight: 700 }}>Sign In</span></Link></div>);
  return (
    <div style={{ position: "fixed", top: "64px", right: "24px", zIndex: 9000, fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", backgroundColor: BLUE, borderRadius: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "8px", overflow: "hidden", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {photoURL && !isAnonymous ? <img src={photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "16px", fontWeight: 800, color: BLUE }}>{displayNameAnon.charAt(0).toUpperCase()}</span>}
        </div>
        <span style={{ color: WHITE, fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>{displayNameAnon}{userIsAdmin && <VerifiedBadgeWhite size={18} />}</span>
      </div>
      <button onClick={onOpenDashboard} style={{ padding: "10px 16px", backgroundColor: BLUE, color: WHITE, borderRadius: "10px", border: "none", fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Dashboard</button>
      <button onClick={handleLogout} style={{ padding: "10px 16px", backgroundColor: BLUE, color: WHITE, borderRadius: "10px", border: "none", fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Logout</button>
    </div>
  );
};

// ===== SECURITY CENTER (ringkas, sama seperti sebelumnya) =====
const GoogleAuthenticatorTab = ({ user, db }: { user: any; db: any }) => {
  const [step, setStep] = useState<"loading" | "intro" | "setup" | "verify" | "active" | "disable">("loading");
  const [secret, setSecret] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    (async () => {
      if (!user || !db) { setStep("intro"); return; }
      try { const snap = await getDoc(doc(db, "users", user.uid)); if (snap.exists()) { const d = snap.data(); if (d.twoFactorEnabled && d.totpSecret) { setEnabled(true); setSecret(d.totpSecret); setRecoveryCodes(Array.isArray(d.totpRecoveryCodes) ? d.totpRecoveryCodes : []); setStep("active"); return; } } } catch (e) { console.error(e); }
      setStep("intro");
    })();
  }, [user, db]);
  useEffect(() => { if ((step === "setup" || step === "verify") && !secret) setSecret(generateSecret(20)); }, [step, secret]);
  const handleVerify = async () => {
    if (!user || !db || !secret) return;
    if (!/^\d{6}$/.test(token)) { setError("Kode 6 digit."); return; }
    setBusy(true);
    try { const ok = await verifyTotp(secret, token); if (!ok) { setError("Salah."); setBusy(false); return; } const codes = generateRecoveryCodes(8); await updateDoc(doc(db, "users", user.uid), { twoFactorEnabled: true, totpSecret: secret, totpRecoveryCodes: codes, twoFactorEnabledAt: serverTimestamp() }); setRecoveryCodes(codes); setEnabled(true); setStep("active"); } catch { setError("Gagal."); } finally { setBusy(false); }
  };
  const handleDisable = async () => {
    if (!user || !db || !secret) return;
    if (!/^\d{6}$/.test(token)) { setError("Kode 6 digit."); return; }
    setBusy(true);
    try { const ok = await verifyTotp(secret, token); if (!ok) { setError("Salah."); setBusy(false); return; } await updateDoc(doc(db, "users", user.uid), { twoFactorEnabled: false, totpSecret: "", totpRecoveryCodes: [] }); setEnabled(false); setSecret(""); setRecoveryCodes([]); setToken(""); setStep("intro"); } catch { setError("Gagal."); } finally { setBusy(false); }
  };
  const cardStyle: React.CSSProperties = { backgroundColor: "#F0F4FF", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {step === "loading" && <div style={{ padding: "30px", textAlign: "center", color: BLUE }}>Memuat...</div>}
      {step === "intro" && (<>
        <div style={{ ...cardStyle, background: BLUE }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><ShieldLockIcon size={32} color={WHITE} /><div><div style={{ fontSize: "18px", fontWeight: 800, color: WHITE }}>Google Authenticator</div><div style={{ fontSize: "12px", color: WHITE, opacity: 0.85 }}>Setup sekali, permanen</div></div></div>
          <button onClick={() => setStep("setup")} style={{ padding: "10px 18px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>Setup Sekarang</button>
        </div>
      </>)}
      {step === "setup" && (<>
        <div style={cardStyle}>
          <div style={{ fontSize: "18px", fontWeight: 800, color: BLUE }}>Scan QR Code</div>
          <div style={{ display: "flex", justifyContent: "center" }}>{secret && <img src={qrImageUrl(buildOtpAuthUri(secret, user?.email || "user", SECURITY_ISSUER), 200)} alt="QR" width={200} height={200} />}</div>
          <button onClick={() => setStep("verify")} style={{ padding: "10px 18px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>Lanjut</button>
        </div>
      </>)}
      {step === "verify" && (<>
        <div style={cardStyle}>
          <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${BLUE}40`, fontSize: "20px", textAlign: "center", letterSpacing: "0.15em", outline: "none", color: BLUE, fontWeight: 800 }} />
          {error && <div style={{ color: RED, fontSize: "12px" }}>{error}</div>}
          <button onClick={handleVerify} disabled={busy} style={{ padding: "10px 18px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>{busy ? "..." : "Verifikasi"}</button>
        </div>
      </>)}
      {step === "active" && (<>
        <div style={{ ...cardStyle, background: BLUE }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><TrustIcon size={32} color={WHITE} /><div><div style={{ fontSize: "18px", fontWeight: 800, color: WHITE }}>2FA Aktif</div></div></div>
          <button onClick={() => { setToken(""); setStep("disable"); }} style={{ padding: "10px 18px", backgroundColor: WHITE, color: RED, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>Nonaktifkan</button>
        </div>
        <div style={cardStyle}>
          <span style={{ fontWeight: 800, color: BLUE }}>Recovery Codes ({recoveryCodes.length})</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>{recoveryCodes.map((c, i) => <div key={i} style={{ backgroundColor: WHITE, border: `1.5px solid ${BLUE}`, borderRadius: "8px", padding: "8px 10px", fontSize: "12px", fontWeight: 800, color: BLUE, fontFamily: "monospace" }}>{c}</div>)}</div>
        </div>
      </>)}
      {step === "disable" && (<>
        <div style={cardStyle}>
          <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${BLUE}40`, fontSize: "20px", textAlign: "center", letterSpacing: "0.15em", outline: "none", color: BLUE, fontWeight: 800 }} />
          {error && <div style={{ color: RED, fontSize: "12px" }}>{error}</div>}
          <button onClick={handleDisable} disabled={busy} style={{ padding: "10px 18px", backgroundColor: RED, color: WHITE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>Nonaktifkan</button>
        </div>
      </>)}
    </div>
  );
};

const PasskeyTab = ({ user, db }: { user: any; db: any }) => {
  const [step, setStep] = useState<"loading" | "intro" | "register" | "done">("loading");
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [deviceName, setDeviceName] = useState<string>("My Device");
  useEffect(() => {
    (async () => {
      if (!user || !db) { setStep("intro"); return; }
      try { const snap = await getDoc(doc(db, "users", user.uid)); if (snap.exists() && Array.isArray(snap.data().passkeys)) setPasskeys(snap.data().passkeys); } catch (e) { console.error(e); }
      setStep("intro");
    })();
  }, [user, db]);
  const handleRegister = async () => {
    if (!user || !db) return;
    if (!supportsWebAuthn()) { setError("Browser tidak mendukung WebAuthn."); return; }
    setBusy(true); setError("");
    try {
      const challenge = randomChallenge(32);
      const publicKey: PublicKeyCredentialCreationOptions = { challenge, rp: { name: RP_NAME, id: window.location.hostname }, user: { id: new TextEncoder().encode(user.uid), name: user.email || user.uid, displayName: user.displayName || user.email || "User" }, pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }], timeout: 60000, attestation: "none", authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" } };
      const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
      if (!credential) { setError("Dibatalkan."); setBusy(false); return; }
      const credentialId = bufToB64Url(credential.rawId);
      const newPasskey: PasskeyRecord = { id: `pk_${Date.now()}`, credentialId, name: deviceName || "My Device", createdAt: Date.now() };
      const updatedList = [...passkeys, newPasskey];
      await updateDoc(doc(db, "users", user.uid), { passkeys: updatedList, passkeyRegisteredAt: serverTimestamp() });
      setPasskeys(updatedList); setStep("done");
    } catch (e: any) { setError("Gagal: " + (e?.message || "Unknown")); } finally { setBusy(false); }
  };
  const cardStyle: React.CSSProperties = { backgroundColor: "#F0F4FF", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {step === "loading" && <div style={{ padding: "30px", textAlign: "center", color: BLUE }}>Memuat...</div>}
      {step === "intro" && (<>
        <div style={{ ...cardStyle, background: BLUE }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><KeyIcon size={32} color={WHITE} /><div><div style={{ fontSize: "18px", fontWeight: 800, color: WHITE }}>Passkey</div><div style={{ fontSize: "12px", color: WHITE, opacity: 0.85 }}>Login tanpa password</div></div></div>
          <button onClick={() => setStep("register")} style={{ padding: "10px 18px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>Daftarkan Passkey</button>
        </div>
        <div style={cardStyle}>
          <span style={{ fontWeight: 800, color: BLUE }}>Passkey Terdaftar ({passkeys.length})</span>
          {passkeys.map((pk) => <div key={pk.id} style={{ backgroundColor: WHITE, border: `1.5px solid ${BLUE}30`, borderRadius: "10px", padding: "10px 14px", display: "flex", justifyContent: "space-between" }}><span style={{ color: BLUE, fontWeight: 700 }}>{pk.name}</span><span style={{ color: BLUE, fontSize: "11px", fontFamily: "monospace" }}>{pk.credentialId.slice(0, 12)}...</span></div>)}
        </div>
      </>)}
      {step === "register" && (<>
        <div style={cardStyle}>
          <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="Nama Perangkat" style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: `2px solid ${BLUE}40`, fontSize: "14px", outline: "none", color: BLUE, fontWeight: 600 }} />
          {error && <div style={{ color: RED, fontSize: "12px" }}>{error}</div>}
          <button onClick={handleRegister} disabled={busy} style={{ padding: "10px 18px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>{busy ? "..." : "Daftarkan"}</button>
        </div>
      </>)}
      {step === "done" && (<>
        <div style={{ ...cardStyle, background: BLUE }}>
          <CheckIcon size={36} color={WHITE} />
          <div style={{ fontSize: "18px", fontWeight: 800, color: WHITE }}>Passkey Terdaftar</div>
          <button onClick={() => setStep("intro")} style={{ padding: "10px 18px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>Selesai</button>
        </div>
      </>)}
    </div>
  );
};

const SecurityCenterPanel = ({ user, db, onBack }: { user: any; db: any; onBack: () => void }) => {
  const [tab, setTab] = useState<"totp" | "passkey">("totp");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", padding: 0 }}><ChevronLeftIcon size={24} color={BLUE} /></button>
        <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE }}>Security Center</h2>
      </div>
      <div style={{ display: "flex", gap: "8px", padding: "6px", backgroundColor: "#F0F4FF", borderRadius: "12px" }}>
        <button onClick={() => setTab("totp")} style={{ flex: 1, padding: "10px", backgroundColor: tab === "totp" ? BLUE : "transparent", color: tab === "totp" ? WHITE : BLUE, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Google Auth</button>
        <button onClick={() => setTab("passkey")} style={{ flex: 1, padding: "10px", backgroundColor: tab === "passkey" ? BLUE : "transparent", color: tab === "passkey" ? WHITE : BLUE, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Passkey</button>
      </div>
      {tab === "totp" ? <GoogleAuthenticatorTab user={user} db={db} /> : <PasskeyTab user={user} db={db} />}
    </div>
  );
};

// ===== ACCOUNT STATUS PAGE =====
const AccountStatusPage = ({ user, db, onBack, onOpenAppealChat }: { user: any; db: any; onBack: () => void; onOpenAppealChat: (reason: string, message: string) => void; }) => {
  const [banStatus, setBanStatus] = useState<AccountStatusInfo>({ isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true });
  const [loading, setLoading] = useState(true);
  const [hasAppeal, setHasAppeal] = useState(false);
  const [appealMessage, setAppealMessage] = useState("");
  const [appealBusy, setAppealBusy] = useState(false);
  const [appealError, setAppealError] = useState("");
  const [appealSuccess, setAppealSuccess] = useState(false);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    let active = true;
    const unsubBot = onSnapshot(doc(db, "bot_blocks", user.uid), (snap) => {
      if (!active) return;
      if (snap.exists() && snap.data().isBlocked === true) { const d = snap.data(); setBanStatus({ isBanned: true, reason: d.blockedReason || "Suspicious Activity", message: d.blockedMessage || "", canCreateTicket: d.canCreateTicket !== false, canSendMessage: d.canSendMessage !== false }); setLoading(false); return; }
      setBanStatus({ isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true }); setLoading(false);
    }, () => setLoading(false));
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!active) return;
      if (snap.exists() && snap.data().botBlocked === true) { const u = snap.data(); setBanStatus({ isBanned: true, reason: u.botBlockedReason || "Blocked by system", message: u.botBlockedMessage || "", canCreateTicket: u.canCreateTicket !== false, canSendMessage: u.canSendMessage !== false }); }
    });
    return () => { active = false; unsubBot(); unsubUser(); };
  }, [user, db]);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, "appeal_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(1));
    const unsub = onSnapshot(q, (s: any) => setHasAppeal(!s.empty));
    return () => unsub();
  }, [user, db]);

  // ===== KIRIM BANDING + RIWAYAT OTOMATIS =====
  const handleSendAppeal = async () => {
    if (!user || !db) return;
    // Blokir spasi
    const cleanMessage = appealMessage.replace(/\s/g, "");
    if (!cleanMessage.trim()) { setAppealError("Pesan tidak boleh kosong."); return; }
    setAppealBusy(true); setAppealError(""); setAppealSuccess(false);
    try {
      // Cari ticket existing (appealOnly) atau buat baru
      let ticketRef: any = null;
      const existingQ = query(collection(db, "livechat_tickets"), where("userId", "==", user.uid), where("appealOnly", "==", true), orderBy("createdAt", "desc"), limit(1));
      const existingSnap = await new Promise<any>((resolve) => { const u = onSnapshot(existingQ, (s: any) => { u(); resolve(s); }, () => resolve({ empty: true, docs: [] })); });
      if (existingSnap && !existingSnap.empty) {
        ticketRef = doc(db, "livechat_tickets", existingSnap.docs[0].id);
        await updateDoc(ticketRef, { status: "active", lastMessage: cleanMessage, lastMessageTime: serverTimestamp(), lastMessageSender: user.displayName || user.email || "User", banReason: banStatus.reason, banMessage: banStatus.message });
      } else {
        const newRef = await addDoc(collection(db, "livechat_tickets"), {
          userId: user.uid, userName: user.displayName || user.email || "User", userEmail: user.email || "", userPhoto: user.photoURL || "",
          status: "active", topic: "Account Issues", createdAt: serverTimestamp(), unreadCount: 0, typing: false, typingUserId: null, typingUserName: null, isAnnouncement: false, isBroadcast: false, isBanned: true, banReason: banStatus.reason, banMessage: banStatus.message, appealOnly: true, lastMessage: cleanMessage, lastMessageTime: serverTimestamp(), lastMessageSender: user.displayName || user.email || "User",
        });
        ticketRef = doc(db, "livechat_tickets", newRef.id);
      }
      // Auto-pesan awal (riwayat otomatis) — hanya jika pesan sebelumnya belum ada teks yang sama
      const msgsQ = query(collection(db, "livechat_tickets", ticketRef.id, "messages"), orderBy("timestamp", "desc"), limit(1));
      const lastSnap = await new Promise<any>((resolve) => { const u = onSnapshot(msgsQ, (s: any) => { u(); resolve(s); }, () => resolve({ empty: true })); });
      let shouldSkip = false;
      if (lastSnap && !lastSnap.empty) {
        try { const dec = await decryptMessage(lastSnap.docs[0].data().text || ""); if (dec === cleanMessage) shouldSkip = true; } catch {}
      }
      if (!shouldSkip) {
        await addDoc(collection(db, "livechat_tickets", ticketRef.id, "messages"), {
          senderId: user.uid, senderName: user.displayName || user.email || "User", text: await encryptMessage(cleanMessage),
          timestamp: serverTimestamp(), read: false, isEncrypted: true, isBotDetected: false, deliveryStatus: "sent",
        });
      }
      setAppealSuccess(true); setAppealMessage(""); setHasAppeal(true);
    } catch (e: any) {
      console.error(e);
      setAppealError("Gagal kirim: " + (e?.message || "Unknown"));
    } finally { setAppealBusy(false); }
  };

  const isBanned = banStatus.isBanned;
  const normalFeatures = ["Akses penuh ke Live Chat Agent", "Membuat tiket dukungan baru", "Mengirim & menerima pesan", "Bergabung di komunitas Notes", "Mengelola Passkey & Google Authenticator", "Mengubah pengaturan privasi & anonim"];
  const bannedFeatures = ["Membuat tiket dukungan baru", "Mengirim pesan di Live Chat", "Bergabung di komunitas Notes", "Mengakses fitur interaktif", "Hanya dapat melihat status akun", "Mengirim pesan banding ke admin (tersedia)"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", padding: 0 }}><ChevronLeftIcon size={24} color={BLUE} /></button>
        <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: BLUE }}>Detail Status Akun</h2>
      </div>

      {loading ? (
        <div style={{ padding: "30px", textAlign: "center", color: BLUE, fontWeight: 600 }}>Memeriksa...</div>
      ) : (
        <>
          {/* HERO BANNER */}
          <div style={{ width: "100%", backgroundColor: BLUE, borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "16px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isBanned ? <ShieldBanIcon size={32} color={RED} /> : <ShieldCheckIcon size={32} color={GREEN} />}
                </div>
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: WHITE }}>Status Akun</div>
                  <div style={{ fontSize: "12px", color: WHITE, opacity: 0.85, fontWeight: 600 }}>Menuru Account Status</div>
                </div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 14px", backgroundColor: WHITE, borderRadius: "10px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isBanned ? RED : GREEN, animation: "statusPulse 1.4s ease-in-out infinite" }} />
                <span style={{ fontSize: "11px", fontWeight: 800, color: BLUE, letterSpacing: "0.06em", textTransform: "uppercase" }}>{isBanned ? "BANNED" : "NORMAL"}</span>
              </div>
            </div>
            <p style={{ fontSize: "14px", color: WHITE, opacity: 0.95, lineHeight: 1.6, margin: 0 }}>
              {isBanned ? `Akun Anda dalam status BANNED. Alasan: ${banStatus.reason || "Suspicious Activity"}. Anda tetap dapat mengirim pesan banding ke admin.` : "Akun Anda dalam status aktif dan normal. Semua fitur Menuru tersedia."}
            </p>
            {isBanned && banStatus.message && (
              <div style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: "10px", padding: "12px 14px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: WHITE, opacity: 0.8, textTransform: "uppercase", marginBottom: "4px" }}>Pesan sistem</div>
                <div style={{ fontSize: "13px", color: WHITE, opacity: 0.95, lineHeight: 1.5 }}>{banStatus.message}</div>
              </div>
            )}
          </div>

          {/* FITUR TERSEDIA */}
          <div style={{ width: "100%", backgroundColor: BLUE, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isBanned ? <XCircleIcon size={22} color={RED} /> : <CheckCircleIcon size={22} color={GREEN} />}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: WHITE }}>{isBanned ? "Fitur Tidak Tersedia" : "Fitur Tersedia"}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(isBanned ? bannedFeatures : normalFeatures).map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "10px", padding: "10px 12px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isBanned ? <XCircleIcon size={14} color={RED} /> : <CheckCircleIcon size={14} color={GREEN} />}
                  </div>
                  <span style={{ fontSize: "13px", color: WHITE, lineHeight: 1.5, fontWeight: 600 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KIRIM BANDING */}
          {isBanned && (
            <div style={{ width: "100%", backgroundColor: BLUE, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ReplyIcon size={20} color={BLUE} />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: WHITE }}>Ajukan Banding</div>
                  <div style={{ fontSize: "12px", color: WHITE, opacity: 0.85, fontWeight: 600 }}>Kirim pesan ke admin</div>
                </div>
              </div>
              {hasAppeal ? (
                <div style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: GREEN, animation: "statusPulse 1.4s ease-in-out infinite" }} />
                  <span style={{ fontSize: "13px", color: WHITE, fontWeight: 700 }}>Banding sedang diproses.</span>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: "13px", color: WHITE, opacity: 0.95, margin: 0, lineHeight: 1.6 }}>Jelaskan alasan Anda. Pesan tanpa spasi akan dikirim ke admin.</p>
                  <textarea
                    value={appealMessage}
                    onChange={(e) => setAppealMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === " ") e.preventDefault(); }}
                    placeholder="Alasan banding tanpa spasi..."
                    rows={4}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "none", fontSize: "14px", fontFamily: FONT_FAMILY, outline: "none", color: BLUE, fontWeight: 600, resize: "vertical", boxSizing: "border-box", backgroundColor: WHITE }}
                  />
                  {appealError && <div style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", fontWeight: 700, color: WHITE }}>{appealError}</div>}
                  {appealSuccess && <div style={{ backgroundColor: WHITE, borderRadius: "10px", padding: "10px 12px", fontSize: "12px", fontWeight: 700, color: GREEN, display: "flex", alignItems: "center", gap: "8px" }}><CheckCircleIcon size={16} color={GREEN} />Banding terkirim.</div>}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={handleSendAppeal} disabled={appealBusy || !appealMessage.replace(/\s/g, "").trim()} style={{ padding: "10px 18px", backgroundColor: appealBusy || !appealMessage.replace(/\s/g, "").trim() ? "rgba(255,255,255,0.4)" : WHITE, color: BLUE, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 800, cursor: appealBusy ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      {appealBusy ? "Mengirim..." : "Kirim Banding"}
                      {!appealBusy && <SendIcon size={14} color={BLUE} />}
                    </button>
                    <button onClick={() => onOpenAppealChat(banStatus.reason, banStatus.message)} style={{ padding: "10px 18px", backgroundColor: "transparent", color: WHITE, border: `2px solid ${WHITE}`, borderRadius: "10px", fontSize: "13px", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                      Buka Chat Banding<ArrowRightIcon size={14} color={WHITE} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
      <style jsx>{`@keyframes statusPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(1.35);} }`}</style>
    </div>
  );
};

// ===== DASHBOARD OVERLAY =====
const DashboardOverlay = ({ user, db, onClose, onOpenAppealChat }: { user: any; db: any; onClose: () => void; onOpenAppealChat: (reason: string, message: string) => void; }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeIconRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "security" | "status">("main");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passkeyCount, setPasskeyCount] = useState(0);
  const [quickBanStatus, setQuickBanStatus] = useState<AccountStatusInfo>({ isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true });

  useEffect(() => {
    if (!user || !db) return;
    let active = true;
    const unsubBot = onSnapshot(doc(db, "bot_blocks", user.uid), (snap) => { if (!active) return; if (snap.exists() && snap.data().isBlocked === true) { const d = snap.data(); setQuickBanStatus({ isBanned: true, reason: d.blockedReason || "Suspicious Activity", message: d.blockedMessage || "", canCreateTicket: d.canCreateTicket !== false, canSendMessage: d.canSendMessage !== false }); } else { setQuickBanStatus({ isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true }); } });
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => { if (!active) return; if (snap.exists() && snap.data().botBlocked === true) { const u = snap.data(); setQuickBanStatus({ isBanned: true, reason: u.botBlockedReason || "Blocked by system", message: u.botBlockedMessage || "", canCreateTicket: u.canCreateTicket !== false, canSendMessage: u.canSendMessage !== false }); } });
    return () => { active = false; unsubBot(); unsubUser(); };
  }, [user, db]);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    getDoc(doc(db, "users", user.uid)).then((snap) => { if (snap.exists()) { const d = snap.data(); setIsAnonymous(d.isAnonymous === true); setTwoFactorEnabled(d.twoFactorEnabled === true); setPasskeyCount(Array.isArray(d.passkeys) ? d.passkeys.length : 0); } setLoading(false); }).catch(() => setLoading(false));
  }, [user, db, activeTab]);

  useEffect(() => { if (!overlayRef.current) return; gsap.fromTo(overlayRef.current, { x: "100%" }, { x: "0%", duration: 0.7, ease: "power4.out" }); }, []);

  const handleIconEnter = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 45, scale: 1.2, duration: 0.3, ease: "power2.out" }); };
  const handleIconLeave = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 0, scale: 1, duration: 0.3, ease: "power2.out" }); };
  const handleClose = () => {
    if (isClosing || !overlayRef.current) return;
    setIsClosing(true);
    if (closeIconRef.current) gsap.to(closeIconRef.current, { rotation: 90, scale: 0, duration: 0.4, ease: "back.in(1.7)" });
    gsap.to(overlayRef.current, { x: "100%", duration: 0.5, ease: "power3.in", delay: 0.2, onComplete: () => onClose() });
  };
  const handleToggleAnonymous = async () => { if (!user || !db || saving) return; setSaving(true); const nv = !isAnonymous; try { await updateDoc(doc(db, "users", user.uid), { isAnonymous: nv }); setIsAnonymous(nv); } catch { alert("Gagal menyimpan."); } finally { setSaving(false); } };

  const displayName = isAnonymous ? "Anonim" : user?.displayName || user?.email?.split("@")[0] || "User";
  const gmailEmail = user?.email || "Email tidak tersedia";
  const headerTitle = activeTab === "main" ? "Dashboard" : activeTab === "settings" ? "Pengaturan Privasi" : activeTab === "security" ? "Security Center" : "Detail Status Akun";

  return (
    <div ref={overlayRef} style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "600px", backgroundColor: WHITE, zIndex: 9998, display: "flex", flexDirection: "column", fontFamily: FONT_FAMILY, color: BLUE, boxShadow: "-10px 0 40px rgba(0,0,0,0.2)", overflow: "hidden" }}>
      <div style={{ padding: "20px 20px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {(activeTab === "settings" || activeTab === "security" || activeTab === "status") && (
            <button onClick={() => setActiveTab("main")} style={{ background: "transparent", border: "none", color: BLUE, cursor: "pointer", padding: 0 }}><ChevronLeftIcon size={24} color={BLUE} /></button>
          )}
          <h2 style={{ fontSize: "24px", fontWeight: 800, margin: 0, color: BLUE }}>{headerTitle}</h2>
        </div>
        <button onClick={handleClose} onMouseEnter={handleIconEnter} onMouseLeave={handleIconLeave} disabled={isClosing} style={{ background: BLUE, border: "none", color: WHITE, borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", cursor: isClosing ? "not-allowed" : "pointer" }}>
          <div ref={closeIconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><PlusIcon size={22} color={WHITE} /></div>
        </button>
      </div>

      {/* ===== KONTEN: diberi padding kiri-kanan 20px supaya BG biru tidak mentok ===== */}
      <div style={{ padding: "0 20px 24px 20px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {activeTab === "security" ? (
          <SecurityCenterPanel user={user} db={db} onBack={() => setActiveTab("main")} />
        ) : activeTab === "status" ? (
          <AccountStatusPage user={user} db={db} onBack={() => setActiveTab("main")} onOpenAppealChat={onOpenAppealChat} />
        ) : activeTab === "main" ? (
          <>
            {/* Profil */}
            <div style={{ backgroundColor: BLUE, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "8px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {user?.photoURL && !isAnonymous ? <img src={user.photoURL} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "24px", fontWeight: 800, color: BLUE }}>{displayName.charAt(0).toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}><h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: WHITE }}>{displayName}</h3><p style={{ fontSize: "12px", margin: 0, color: "rgba(255,255,255,0.8)" }}>{gmailEmail}</p></div>
              </div>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.9)", margin: 0 }}>Selamat datang di Dashboard Anda.</p>
            </div>

            {/* KARTU STATUS */}
            <button onClick={() => setActiveTab("status")} style={{ display: "flex", width: "100%", textAlign: "left", backgroundColor: BLUE, borderRadius: "20px", padding: "18px", border: "none", cursor: "pointer", fontFamily: FONT_FAMILY, color: WHITE, flexDirection: "column", gap: "10px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{quickBanStatus.isBanned ? <ShieldBanIcon size={22} color={RED} /> : <ShieldCheckIcon size={22} color={GREEN} />}</div>
                  <div style={{ textAlign: "left" }}><div style={{ fontSize: "14px", fontWeight: 800, color: WHITE }}>Status Akun</div><div style={{ fontSize: "11px", color: WHITE, opacity: 0.85, fontWeight: 600 }}>Lihat detail</div></div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 10px", backgroundColor: WHITE, borderRadius: "8px" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: quickBanStatus.isBanned ? RED : GREEN, animation: "statusPulse 1.4s ease-in-out infinite" }} />
                  <span style={{ fontSize: "10px", fontWeight: 800, color: BLUE }}>{quickBanStatus.isBanned ? "BANNED" : "NORMAL"}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: WHITE, fontSize: "11px", fontWeight: 700, opacity: 0.9 }}><span>Klik untuk detail</span><ArrowRightIcon size={12} color={WHITE} /></div>
            </button>

            {/* Privasi */}
            <div style={{ backgroundColor: BLUE, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><TrustIcon size={20} color={BLUE} /></div><h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: WHITE }}>Pengaturan Privasi</h3></div>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,255,255,0.9)", margin: 0 }}>Atur privasi akun Anda.</p>
              <button onClick={() => setActiveTab("settings")} style={{ alignSelf: "flex-start", padding: "8px 16px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Buka</button>
            </div>

            {/* Security */}
            <div style={{ backgroundColor: BLUE, borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldLockIcon size={20} color={BLUE} /></div><h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: WHITE }}>Menuru Security Center</h3></div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "6px", color: WHITE, fontSize: "11px", fontWeight: 700 }}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: twoFactorEnabled ? GREEN : "#f59e0b" }} />Google Auth: {twoFactorEnabled ? "Aktif" : "Belum"}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "6px", color: WHITE, fontSize: "11px", fontWeight: 700 }}><span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: passkeyCount > 0 ? GREEN : "#f59e0b" }} />Passkey: {passkeyCount}</span>
              </div>
              <button onClick={() => setActiveTab("security")} style={{ alignSelf: "flex-start", padding: "8px 16px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Buka</button>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "24px", textAlign: "center", overflow: "hidden" }}><span style={{ fontFamily: FONT_FAMILY, fontSize: "180px", fontWeight: 400, color: BLUE, letterSpacing: "-0.05em", lineHeight: 0.8, display: "block", userSelect: "none" }}>Menuru</span></div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            <div style={{ backgroundColor: "#F0F4FF", borderRadius: "20px", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "8px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>{user?.photoURL && !isAnonymous ? <img src={user.photoURL} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "24px", fontWeight: 800, color: WHITE }}>{displayName.charAt(0).toUpperCase()}</span>}</div>
              <div style={{ flex: 1, minWidth: 0 }}><h3 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: BLUE }}>{displayName}</h3><p style={{ fontSize: "12px", margin: 0, color: BLUE, opacity: 0.8 }}>{gmailEmail}</p></div>
            </div>
            <div style={{ backgroundColor: "#F0F4FF", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}><TrustIcon size={20} color={WHITE} /></div><h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: BLUE }}>Anonim</h3></div>
              <p style={{ fontSize: "13px", lineHeight: 1.5, color: BLUE, margin: 0 }}>Sembunyikan nama Anda.</p>
              <button onClick={handleToggleAnonymous} disabled={saving || loading} style={{ alignSelf: "flex-start", padding: "10px 18px", backgroundColor: isAnonymous ? BLUE : "transparent", color: isAnonymous ? WHITE : BLUE, border: `2px solid ${BLUE}`, borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "..." : isAnonymous ? "Anonim Aktif" : "Aktifkan Anonim"}</button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`@keyframes statusPulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(1.35);} }`}</style>
    </div>
  );
};

// ===== ONBOARDING TOUR (ringkas) =====
const OnboardingTour = ({ steps, onComplete, isActive, currentStep, setCurrentStep }: any) => {
  if (!isActive) return null;
  const step = steps[currentStep];
  return (
    <>
      <div onClick={onComplete} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9998 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "340px", backgroundColor: BLUE, borderRadius: "14px", padding: "22px", zIndex: 10000 }}>
        <h4 style={{ color: WHITE, margin: 0, marginBottom: "8px" }}>{step?.title}</h4>
        <p style={{ color: WHITE, fontSize: "13px" }}>{step?.content}</p>
        <button onClick={currentStep < steps.length - 1 ? () => setCurrentStep(currentStep + 1) : onComplete} style={{ padding: "8px 16px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>{currentStep < steps.length - 1 ? "Next" : "Finish"}</button>
      </div>
    </>
  );
};

// ===== ROLLING MESSAGE =====
const RollingNewMessage = ({ senderName, message }: { senderName: string; message: string; isFromAgent: boolean }) => (
  <div style={{ fontSize: "13px", color: BLUE, fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "6px" }}>
    <span style={{ fontWeight: 700 }}>{senderName}</span><span style={{ color: "#666" }}>from</span><span style={{ color: BLUE, fontStyle: "italic" }}>{message.length > 60 ? message.substring(0, 60) + "..." : message}</span>
  </div>
);

// ===== CLOSE ROOM BUTTON =====
const CloseRoomButton = ({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) => (
  <button onClick={onConfirm} disabled={disabled} style={{ width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: WHITE, border: `1.5px solid ${WHITE}`, borderRadius: "8px", cursor: disabled ? "not-allowed" : "pointer", padding: 0, opacity: disabled ? 0.4 : 1 }}><CloseIcon size={15} color={BLUE} /></button>
);

// ===== BANNED BANNER =====
const BannedInfoBanner = ({ banReason, banMessage, onAppeal, hasAppeal }: { banReason: string; banMessage: string; onAppeal: () => void; hasAppeal: boolean }) => (
  <div style={{ backgroundColor: BLUE, padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><ShieldBanIcon size={24} color={WHITE} /><span style={{ fontSize: "15px", fontWeight: 800, color: WHITE }}>Account Banned</span></div>
    <div style={{ fontSize: "13px", color: WHITE, opacity: 0.95 }}><strong>Reason:</strong> {banReason || "Suspicious Activity"}</div>
    {banMessage && <div style={{ fontSize: "12px", color: WHITE, opacity: 0.9, padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "8px" }}>{banMessage}</div>}
    {!hasAppeal && <button onClick={onAppeal} style={{ alignSelf: "flex-start", padding: "8px 16px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>Ajukan Banding</button>}
    {hasAppeal && <div style={{ alignSelf: "flex-start", padding: "6px 12px", backgroundColor: WHITE, color: BLUE, borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>Sedang diproses</div>}
  </div>
);

// ===== APPEAL CHAT =====
const AppealChatRoom = ({ user, isAdmin, db, appealTicket, onClose }: any) => {
  const [messages, setMessages] = useState<AppealMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [replyTo, setReplyTo] = useState<AppealMessage | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getCryptoKey().then(() => setEncryptionReady(true)).catch(() => setEncryptionReady(true)); }, []);
  useEffect(() => {
    if (!db || !appealTicket) return;
    const q = query(collection(db, "appeal_tickets", appealTicket.id, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, async (snap: any) => { const list: AppealMessage[] = []; for (const d of snap.docs) { const data = d.data(); let text = data.text || ""; if (data.isEncrypted) { try { text = await decryptMessage(text); } catch { text = "[Encrypted]"; } } list.push({ id: d.id, ...data, text } as AppealMessage); } setMessages(list); requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }); });
    return () => unsub();
  }, [db, appealTicket]);

  const sendMessage = async () => {
    if (!db || !appealTicket || !messageText.trim() || !user || !encryptionReady) return;
    try {
      const ticketRef = doc(db, "appeal_tickets", appealTicket.id);
      const senderName = isAdmin ? AGENT_NAME : user.displayName || user.email || "User";
      const enc = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "appeal_tickets", appealTicket.id, "messages"), { senderId: user.uid, senderName, text: enc, timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: "sent", replyTo: replyTo ? { messageId: replyTo.id, senderName: replyTo.senderName, text: replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + "..." : replyTo.text } : null });
      await updateDoc(ticketRef, { lastMessage: messageText.trim(), lastMessageTime: serverTimestamp(), lastMessageSender: senderName, status: "active" });
      setMessageText(""); setReplyTo(null);
    } catch (e) { console.error(e); }
  };

  const formatTime = (t: any) => { if (!t) return ""; const d = t.toDate ? t.toDate() : new Date(t); return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: WHITE, borderRadius: "12px", overflow: "hidden", border: `2px solid ${BLUE}` }}>
      <div style={{ padding: "14px 18px", backgroundColor: BLUE, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: WHITE }}>{isAdmin ? `Banding: ${appealTicket.userName}` : "Chat Banding"}</div>
        <button onClick={onClose} style={{ background: "transparent", border: `1.5px solid ${WHITE}`, color: WHITE, borderRadius: "8px", padding: "5px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Tutup</button>
      </div>
      <div style={{ padding: "10px 18px", backgroundColor: "rgba(13,60,252,0.08)", fontSize: "11px", color: BLUE, fontWeight: 600 }}><strong>Alasan banned:</strong> {appealTicket.banReason || "Suspicious Activity"}</div>
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}>
        {messages.length === 0 ? <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "30px 0" }}>Belum ada pesan.</div> : messages.map((msg, idx) => {
          const isMine = msg.senderId === user?.uid;
          return (
            <div key={msg.id || idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
              <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: isMine ? BLUE : "#f4f4f5", color: isMine ? WHITE : BLACK, fontSize: "13px", fontFamily: FONT_FAMILY, wordBreak: "break-word" }}>
                {!isMine && <div style={{ fontSize: "11px", fontWeight: 700, color: BLUE, marginBottom: "3px" }}>{msg.senderName}</div>}
                {msg.replyTo && <div style={{ padding: "5px 8px", backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "rgba(13,60,252,0.1)", borderLeft: `3px solid ${isMine ? WHITE : BLUE}`, borderRadius: "4px", marginBottom: "5px", fontSize: "10px", color: isMine ? WHITE : BLUE, fontStyle: "italic" }}><strong>{msg.replyTo.senderName}:</strong> {msg.replyTo.text}</div>}
                <div>{msg.text}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}><span style={{ fontSize: "9px", color: isMine ? WHITE : "#999" }}>{formatTime(msg.timestamp)}</span></div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: "12px 18px", borderTop: `1px solid ${BLUE}20`, display: "flex", gap: "8px", backgroundColor: WHITE }}>
        <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey && messageText.trim()) { e.preventDefault(); sendMessage(); } }} placeholder="Tulis pesan..." style={{ flex: 1, padding: "10px 14px", border: `1px solid ${BLUE}40`, borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: FONT_FAMILY, color: BLUE }} />
        <button onClick={sendMessage} disabled={!messageText.trim()} style={{ padding: "10px 18px", backgroundColor: messageText.trim() ? BLUE : "#ccc", color: WHITE, border: "none", borderRadius: "8px", cursor: messageText.trim() ? "pointer" : "not-allowed", fontSize: "12px", fontWeight: 800 }}>Kirim</button>
      </div>
    </div>
  );
};

// ===== LIVE CHAT AGENT (ringkas) =====
const LiveChatAgent = ({ user, isAdmin, db, auth, onOpenAppealChat, onOpenBannedAppealChat }: any) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banMessage, setBanMessage] = useState<string | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [hasAppeal, setHasAppeal] = useState(false);
  const [appealTickets, setAppealTickets] = useState<AppealTicket[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); getCryptoKey().then(() => setEncryptionReady(true)).catch(() => setEncryptionReady(true)); }, []);

  useEffect(() => {
    if (!user || !isMounted) { setCheckingBan(false); return; }
    (async () => { setCheckingBan(true); try { const s = await checkBanStatus(user.uid); if (s.isBanned) { setIsBanned(true); setBanReason(s.reason); setBanMessage(`BANNED\n\nReason: ${s.reason}`); } else { setIsBanned(false); setBanReason(""); setBanMessage(null); } } catch (e) { console.error(e); } finally { setCheckingBan(false); } })();
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
    if (!db || !user || !isMounted) return;
    const q = isAdmin ? query(collection(db, "livechat_tickets"), orderBy("createdAt", "desc")) : query(collection(db, "livechat_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (s: any) => { const list: Ticket[] = []; s.forEach((d: any) => list.push({ id: d.id, ...d.data() } as Ticket)); setTickets(list); setSelectedTicket((p) => p ? list.find((t) => t.id === p.id) || p : p); });
    return () => unsub();
  }, [db, user, isAdmin, isMounted]);

  useEffect(() => {
    if (!db || !selectedTicket || !isMounted) return;
    const q = query(collection(db, "livechat_tickets", selectedTicket.id, "messages"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, async (s: any) => { const list: ChatMessage[] = []; for (const d of s.docs) { const data = d.data(); let text = data.text || ""; if (data.isEncrypted) { try { text = await decryptMessage(text); } catch { text = "[Encrypted]"; } } list.push({ id: d.id, ...data, text } as ChatMessage); } setMessages(list); requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }); });
    return () => unsub();
  }, [db, selectedTicket, isMounted]);

  const startChat = async () => {
    if (!db || !user || !selectedTopic || !encryptionReady) { setShowStartChat(false); return; }
    try {
      const ref = await addDoc(collection(db, "livechat_tickets"), { userId: user.uid, userName: user.displayName || user.email || "User", userEmail: user.email, userPhoto: user.photoURL || "", status: "waiting", topic: selectedTopic, createdAt: serverTimestamp(), unreadCount: 0, typing: false, typingUserId: null, typingUserName: null, isAnnouncement: false, isBroadcast: false });
      await addDoc(collection(db, "livechat_tickets", ref.id, "messages"), { senderId: user.uid, senderName: user.displayName || user.email || "User", text: await encryptMessage(`Halo, saya ingin bertanya: ${selectedTopic}`), timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: "sent" });
      setSelectedTopic(""); setShowStartChat(false);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async () => {
    if (!db || !selectedTicket || !messageText.trim() || !user || !encryptionReady) return;
    try {
      await addDoc(collection(db, "livechat_tickets", selectedTicket.id, "messages"), { senderId: user.uid, senderName: isAdmin ? AGENT_NAME : user.displayName || user.email || "User", text: await encryptMessage(messageText.trim()), timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: "sent" });
      await updateDoc(doc(db, "livechat_tickets", selectedTicket.id), { lastMessage: messageText.trim(), lastMessageTime: serverTimestamp(), lastMessageSender: user.displayName || user.email || "User", ...(selectedTicket.status === "waiting" && { status: "active" }) });
      setMessageText("");
    } catch (e) { console.error(e); }
  };

  if (checkingBan) return <div style={{ padding: "40px", textAlign: "center", color: BLUE }}>Checking...</div>;
  if (!isMounted) return <div style={{ minHeight: "100px" }} />;

  if (!user) return (<div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 style={{ fontSize: "60px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY }}>Live Chat Agent</h3><p style={{ color: "#666", fontFamily: FONT_FAMILY }}>Please login.</p><Link href="/" style={{ textDecoration: "none" }}><button style={{ padding: "8px 20px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Login</button></Link></div>);

  if (!isAdmin && isBanned) return (<div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 style={{ fontSize: "60px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY }}>Live Chat Agent</h3><BannedInfoBanner banReason={banReason} banMessage={banMessage || ""} onAppeal={() => onOpenBannedAppealChat(null)} hasAppeal={hasAppeal} /></div>);

  const userTickets = tickets.filter((t) => t.userId === user.uid);
  if (!isAdmin && userTickets.length === 0 && !showStartChat) return (<div style={{ marginTop: "80px", paddingTop: "30px" }}><h3 style={{ fontSize: "60px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY }}>Live Chat Agent</h3><p style={{ color: "#666", fontFamily: FONT_FAMILY, marginBottom: "16px" }}>Need help?</p><button onClick={() => setShowStartChat(true)} style={{ padding: "10px 24px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Start Live Chat</button></div>);

  if (!isAdmin && showStartChat) return (<div style={{ marginTop: "80px", paddingTop: "30px", maxWidth: "400px" }}><h3 style={{ fontSize: "60px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: "20px" }}>Live Chat Agent</h3><select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} style={{ width: "100%", padding: "10px", border: `2px solid ${BLUE}`, borderRadius: "8px", marginBottom: "14px", fontFamily: FONT_FAMILY }}><option value="">-- Select topic --</option>{["Product Inquiry", "Technical Support", "Account Issues", "Donation", "Partnership", "Other"].map((t) => <option key={t} value={t}>{t}</option>)}</select><div style={{ display: "flex", gap: "10px" }}><button onClick={startChat} disabled={!selectedTopic} style={{ padding: "8px 20px", backgroundColor: selectedTopic ? BLUE : "#ccc", color: WHITE, border: "none", borderRadius: "8px", cursor: selectedTopic ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY }}>Start Chat</button><button onClick={() => setShowStartChat(false)} style={{ padding: "8px 20px", backgroundColor: "transparent", color: "#666", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Cancel</button></div></div>);

  return (
    <div style={{ marginTop: "80px", paddingTop: "30px" }}>
      <h3 style={{ fontSize: "60px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: "20px" }}>Live Chat Agent</h3>
      <div style={{ display: "flex", gap: "16px", height: "600px" }}>
        <div style={{ width: "320px", backgroundColor: BLUE, borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.15)", fontWeight: 700, fontSize: "14px", color: WHITE }}>Chat History</div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {(isAdmin ? tickets : userTickets).map((t) => <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: WHITE, fontSize: "13px" }}>{t.userName}</div>)}
          </div>
        </div>
        <div style={{ flex: 1, backgroundColor: WHITE, borderRadius: "12px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {selectedTicket ? (<>
            <div style={{ padding: "14px 18px", backgroundColor: BLUE, color: WHITE, fontSize: "15px", fontWeight: 700 }}>{selectedTicket.userName}</div>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {messages.map((m, i) => <div key={i} style={{ alignSelf: m.senderId === user.uid ? "flex-end" : "flex-start", maxWidth: "70%", padding: "10px 14px", borderRadius: "10px", backgroundColor: m.senderId === user.uid ? BLUE : "#f4f4f5", color: m.senderId === user.uid ? WHITE : BLACK, fontSize: "13px" }}>{m.text}</div>)}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "8px" }}>
              <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter" && messageText.trim()) { e.preventDefault(); sendMessage(); } }} placeholder="Ketik pesan..." style={{ flex: 1, padding: "10px 14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px", fontFamily: FONT_FAMILY, fontSize: "13px" }} />
              <button onClick={sendMessage} disabled={!messageText.trim()} style={{ padding: "10px 18px", backgroundColor: messageText.trim() ? BLUE : "#ccc", color: WHITE, border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 800 }}>Send</button>
            </div>
          </>) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "13px" }}>Pilih chat</div>}
        </div>
      </div>
    </div>
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
  const [adminAppealTicket, setAdminAppealTicket] = useState<AppealTicket | null>(null);
  const [showAdminAppealSection, setShowAdminAppealSection] = useState(false);
  const [bannedAppealTicket, setBannedAppealTicket] = useState<AppealTicket | null>(null);
  const [showBannedAppealSection, setShowBannedAppealSection] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);

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
    if (!isMounted || loading) return;
    setShowMain(true);
  }, [isMounted, loading]);

  if (!isMounted || loading) return (<div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}><div style={{ display: "flex", alignItems: "center", gap: "40px" }}><span style={{ fontSize: "100px", color: BLUE, fontFamily: FONT_FAMILY }}>Menuru</span><span style={{ fontSize: "50px", color: BLACK, fontFamily: FONT_FAMILY }}>Shop</span></div></div>);

  return (
    <>
      <Head>
        <title>Menuru Official | Home</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>
      <div style={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: WHITE }}>
        {showDashboard && (
          <DashboardOverlay
            user={user}
            db={db}
            onClose={() => setShowDashboard(false)}
            onOpenAppealChat={async (reason, message) => {
              setShowDashboard(false);
              setTimeout(async () => {
                if (!db || !user) return;
                // Cari ticket appeal existing untuk user
                const existingQ = query(collection(db, "appeal_tickets"), where("userId", "==", user.uid), where("status", "in", ["waiting", "active"]), orderBy("createdAt", "desc"), limit(1));
                const existingSnap = await new Promise<any>((resolve) => { const u = onSnapshot(existingQ, (s: any) => { u(); resolve(s); }, () => resolve({ empty: true, docs: [] })); });
                if (existingSnap && !existingSnap.empty) {
                  setBannedAppealTicket({ id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() });
                  setShowBannedAppealSection(true);
                } else {
                  const ref = await addDoc(collection(db, "appeal_tickets"), { userId: user.uid, userName: user.displayName || user.email || "User", userEmail: user.email, userPhoto: user.photoURL || "", status: "waiting", topic: "Banding Banned", banReason: reason, banMessage: message, createdAt: serverTimestamp(), unreadCount: 0, typing: false, typingUserId: null, typingUserName: null });
                  const init = `Saya mengajukan banding.\n\nAlasan: ${reason}`;
                  await addDoc(collection(db, "appeal_tickets", ref.id, "messages"), { senderId: user.uid, senderName: user.displayName || user.email || "User", text: await encryptMessage(init), timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: "sent" });
                  await updateDoc(ref, { lastMessage: init, lastMessageTime: serverTimestamp(), lastMessageSender: user.displayName || user.email || "User" });
                  setBannedAppealTicket({ id: ref.id, userId: user.uid, userName: user.displayName || user.email || "User", userEmail: user.email, status: "waiting", topic: "Banding Banned", banReason: reason, banMessage: message, createdAt: new Date(), unreadCount: 0, typing: false });
                  setShowBannedAppealSection(true);
                }
              }, 250);
            }}
          />
        )}
        <div ref={mainPageRef} style={{ position: "relative", width: "100%", minHeight: "100vh", backgroundColor: WHITE, fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column" }}>
          <TopBanner />
          <LeftNavbar shifted={navbarShifted} />
          <RightNavbar user={user} auth={auth} db={db} onOpenDashboard={() => setShowDashboard(true)} />
          <div style={{ marginTop: "44px", paddingTop: "120px" }} />
          <div style={{ position: "relative", zIndex: 1, flex: "1 0 auto", backgroundColor: WHITE }}>
            <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
              <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} onOpenAppealChat={(t: AppealTicket) => { setAdminAppealTicket(t); setShowAdminAppealSection(true); }} onOpenBannedAppealChat={(t: AppealTicket | null) => { if (t) { setBannedAppealTicket(t); setShowBannedAppealSection(true); } }} />
              {isAdmin && showAdminAppealSection && adminAppealTicket && <div style={{ marginTop: "30px", height: "500px" }}><div style={{ fontSize: "12px", fontWeight: 800, color: BLUE, marginBottom: "10px", textTransform: "uppercase" }}>Chat Banding</div><AppealChatRoom user={user} isAdmin={true} db={db} appealTicket={adminAppealTicket} onClose={() => { setShowAdminAppealSection(false); setAdminAppealTicket(null); }} /></div>}
              {!isAdmin && showBannedAppealSection && bannedAppealTicket && <div style={{ marginTop: "30px", height: "500px" }}><div style={{ fontSize: "12px", fontWeight: 800, color: BLUE, marginBottom: "10px", textTransform: "uppercase" }}>Chat Banding</div><AppealChatRoom user={user} isAdmin={false} db={db} appealTicket={bannedAppealTicket} onClose={() => { setShowBannedAppealSection(false); setBannedAppealTicket(null); }} /></div>}
            </div>
            <FooterSection />
          </div>
        </div>
      </div>
      <style jsx global>{`
        html { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; }
        html::-webkit-scrollbar { display: none !important; }
        body { overflow: auto !important; margin: 0; padding: 0; background-color: #ffffff !important; }
        body::-webkit-scrollbar { display: none !important; }
        * { background-color: transparent; }
        @keyframes statusPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.35); } }
        @keyframes verifiedPop { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes drawCheck { 0% { stroke-dashoffset: 100; opacity: 0; } 100% { stroke-dashoffset: 0; opacity: 1; } }
        .chat-messages-container::-webkit-scrollbar, .chat-list-container::-webkit-scrollbar { display: none !important; }
        .chat-messages-container, .chat-list-container { scrollbar-width: none !important; }
      `}</style>
    </>
  );
}
