'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  getDocs,
  where,
  getDoc,
  limit,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: 'AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ',
  authDomain: 'wawa44-58d1e.firebaseapp.com',
  databaseURL:
    'https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'wawa44-58d1e',
  storageBucket: 'wawa44-58d1e.firebasestorage.app',
  messagingSenderId: '836899520599',
  appId: '1:836899520599:web:b346e4370ecfa9bb89e312',
  measurementId: 'G-8LMP7F4BE9',
};

// ===== CONSTANTS =====
const FONT_FAMILY = "'Plus Jakarta Sans'";
const BLUE = '#0D3CFC';
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const LIME = '#E3FB96';
const MINT = '#00E3AA';
const RED = '#DC2626';
const GREEN = '#4ADE80';
const STORE_LINK =
  'https://apps.microsoft.com/detail/9nv1fg4b6xvn?hl=id-ID&gl=ID';
const OWNER_EMAIL = 'faridardiansyah061@gmail.com';
const OWNER_NAME = 'Farid Ardiansyah';
const ADMIN_EMAIL = 'faridardiansyah061@gmail.com';

// ===== STABILO COLORS =====
const STABILO_COLORS = [
  { name: 'Kuning', value: '#FFF59D' },
  { name: 'Kuning Cerah', value: '#FFFF00' },
  { name: 'Hijau', value: '#A5D6A7' },
  { name: 'Hijau Stabilo', value: '#39FF14' },
  { name: 'Biru', value: '#90CAF9' },
  { name: 'Biru Muda', value: '#00E5FF' },
  { name: 'Pink', value: '#F48FB1' },
  { name: 'Pink Stabilo', value: '#FF69B4' },
  { name: 'Oranye', value: '#FFCC80' },
  { name: 'Oranye Stabilo', value: '#FF9800' },
  { name: 'Ungu', value: '#CE93D8' },
  { name: 'Ungu Stabilo', value: '#E040FB' },
  { name: 'Merah', value: '#EF9A9A' },
  { name: 'Merah Stabilo', value: '#FF1744' },
  { name: 'Abu', value: '#CFD8DC' },
  { name: 'Putih', value: '#FFFFFF' },
];

const FONT_SIZES = [
  12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120, 144,
  160, 200, 240, 280, 320, 360, 400, 450, 500,
];

// ===== SVG ICONS =====
const NorthEastArrow = ({ size = 20, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7M17 7H8M17 7V16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoutIcon = ({ size = 20, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12H9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PeopleIcon = ({ size = 20, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StriperIcon = ({ size = 22, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 6H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M3 12H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M3 18H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const TrustIcon = ({ size = 24, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CareerIcon = ({ size = 24, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 13H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ResourcesIcon = ({ size = 24, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 4H10C11.1046 4 12 4.89543 12 6V20C12 18.8954 11.1046 18 10 18H4V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 4H14C12.8954 4 12 4.89543 12 6V20C12 18.8954 12.8954 18 14 18H20V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DocsIcon = ({ size = 20, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 17H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandIcon = ({ size = 20, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20.59 13.41L11 3.83C10.6 3.43 10.06 3.2 9.5 3.2H4C2.9 3.2 2 4.1 2 5.2V10.7C2 11.26 2.22 11.8 2.63 12.2L12.21 21.79C13 22.57 14.27 22.57 15.06 21.79L20.59 16.26C21.37 15.47 21.37 14.2 20.59 13.41Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7" cy="7" r="1.5" fill={color} />
  </svg>
);

const SayHeyIcon = ({ size = 22, color = '#000000' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.8452 20 9.74371 19.7964 8.73507 19.4276L4 21L5.45177 16.7441C4.53668 15.3762 4 13.7581 4 12C4 7.30558 8.02944 3.5 12 3.5C16.9706 3.5 21 7.30558 21 11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="11.5" r="1" fill={color} />
    <circle cx="12" cy="11.5" r="1" fill={color} />
    <circle cx="15" cy="11.5" r="1" fill={color} />
  </svg>
);

const CollabIcon = ({ size = 16, color = '#0D3CFC' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 8v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M23 11h-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PlusIcon = ({ size = 18, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const BoldIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ItalicIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="19" y1="4" x2="10" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="14" y1="20" x2="5" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="15" y1="4" x2="9" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const UnderlineIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3v7a6 6 0 0 0 12 0V3" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="4" y1="21" x2="20" y2="21" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const AlignLeftIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="3" y1="12" x2="15" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="3" y1="18" x2="18" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const AlignCenterIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="4" y1="18" x2="20" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const AlignRightIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="9" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="6" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const ListIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="9" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="9" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="9" y1="18" x2="21" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="4" cy="6" r="1.5" fill={color} />
    <circle cx="4" cy="12" r="1.5" fill={color} />
    <circle cx="4" cy="18" r="1.5" fill={color} />
  </svg>
);

const HighlightIcon = ({ size = 16, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 11l-4 4v4h4l4-4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11l7-7 4 4-7 7-4-4z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MicrosoftStoreIcon = ({ size = 32 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
    <path d="M9 3.5C9 2.67157 9.67157 2 10.5 2H13.5C14.3284 2 15 2.67157 15 3.5V5H9V3.5Z" fill="#0078D4" />
    <path d="M4 5H20C20.5523 5 21 5.44772 21 6V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V6C3 5.44772 3.44772 5 4 5Z" fill="#0078D4" />
    <rect x="6" y="8" width="5" height="5" fill="#F25022" />
    <rect x="13" y="8" width="5" height="5" fill="#7FBA00" />
    <rect x="6" y="14" width="5" height="5" fill="#00A4EF" />
    <rect x="13" y="14" width="5" height="5" fill="#FFB900" />
  </svg>
);

const WindowsIcon = ({ size = 20, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="9" height="9" fill={color} />
    <rect x="13" y="2" width="9" height="9" fill={color} />
    <rect x="2" y="13" width="9" height="9" fill={color} />
    <rect x="13" y="13" width="9" height="9" fill={color} />
  </svg>
);

const MicIcon = ({ size = 20, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2" width="6" height="12" rx="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="22" x2="16" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const StopIcon = ({ size = 20, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="6" y="6" width="12" height="12" rx="2" fill={color} />
  </svg>
);

const SendIcon = ({ size = 20, color = '#ffffff' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = ({ size = 12, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoubleCheckIcon = ({ size = 12, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 12L7 17L18 6" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 12L16 17L22 11" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = ({ size = 12, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" />
    <path d="M12 6V12L16 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HistoryIcon = ({ size = 20, color = 'currentColor' }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.48995 21 7.21647 19.9724 5.5717 18.328" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8V12H7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7V12L15 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== VERIFIED BADGE (INSTAGRAM REAL, BESAR) =====
const InstagramVerifiedReal = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    <path
      fill="#0095F6"
      d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
    />
  </svg>
);

const BlinkingDot = ({ size = 10, color = BLUE }: any) => (
  <span
    style={{
      display: 'inline-block',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: color,
      flexShrink: 0,
      animation: 'blinking-dot 1s ease-in-out infinite',
    }}
  />
);

const COMMANDS = {
  simpan: ['simpan', 'simpan catatan', 'submit', 'kirim', 'save', 'simpan note'],
  batal: ['batal', 'batalkan', 'batal catatan', 'cancel'],
  hapus: ['hapus semua', 'clear', 'hapus isi', 'kosongkan'],
  judul: ['judul', 'title', 'judul catatan'],
};

// ===== ENCRYPTION =====
const ENCRYPTION_KEY_BASE64 = 'bWVudXJ1LXNlY3JldC1rZXktMjAyNi0zMmJ5dGVzISEh';
const IV_LENGTH = 12;
let cryptoKeyCache: CryptoKey | null = null;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
  return btoa(binary);
}

async function getCryptoKey(): Promise<CryptoKey> {
  if (cryptoKeyCache) return cryptoKeyCache;
  const keyData = base64ToUint8Array(ENCRYPTION_KEY_BASE64);
  const keyBytes = keyData.slice(0, 32);
  cryptoKeyCache = await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  return cryptoKeyCache;
}

async function encryptMessage(text: string): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto) return `encrypted:${btoa(unescape(encodeURIComponent(text)))}`;
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, data);
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);
    return `encrypted:${uint8ArrayToBase64(combined)}`;
  } catch {
    return `plain:${btoa(unescape(encodeURIComponent(text)))}`;
  }
}

async function decryptMessage(encrypted: string): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto) {
      if (encrypted.startsWith('encrypted:')) return decodeURIComponent(escape(atob(encrypted.substring('encrypted:'.length))));
      return encrypted;
    }
    if (encrypted.startsWith('plain:')) return decodeURIComponent(escape(atob(encrypted.substring('plain:'.length))));
    if (!encrypted.startsWith('encrypted:')) return encrypted;
    const combined = base64ToUint8Array(encrypted.substring('encrypted:'.length));
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);
    const key = await getCryptoKey();
    const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, encryptedData);
    return new TextDecoder().decode(decrypted);
  } catch {
    return '[Message cannot be decrypted]';
  }
}

// ===== NAVBAR BUTTON =====
const NavbarButton = ({
  label, panelTitle, panelDescription, panelImage, panelRightTitle, panelRightDescription,
  iconType, bigPanelWidth = 850, bigPanelHeight = 260,
  buttonColor = '#0D3CFC', buttonHoverColor = '#000000', panelColor = '#0D3CFC',
  iconButtonColor = '#000000', iconButtonHoverColor = '#0D3CFC',
  panelBoxColor = 'rgba(255,255,255,0.12)', panelBoxBorder = 'rgba(255,255,255,0.25)',
  labelTextColor = '#ffffff', labelTextHoverColor = '#ffffff', titleTextColor = '#ffffff',
  descriptionTextColor = 'rgba(255,255,255,0.9)', iconComponent = null, isResources = false,
}: any) => {
  const [open, setOpen] = useState(false);
  const linesTopRef = useRef<SVGLineElement>(null);
  const linesBottomRef = useRef<SVGLineElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
    setOpen(true);
  };
  const handleLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 250);
  };

  useEffect(() => () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }, []);

  useEffect(() => {
    if (!linesTopRef.current || !linesBottomRef.current) return;
    if (open) {
      gsap.to(linesTopRef.current, { y: 2, duration: 0.35, ease: 'power2.out' });
      gsap.to(linesBottomRef.current, { y: -2, duration: 0.35, ease: 'power2.out' });
    } else {
      gsap.to(linesTopRef.current, { y: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(linesBottomRef.current, { y: 0, duration: 0.35, ease: 'power2.out' });
    }
  }, [open]);

  useEffect(() => {
    if (!panelRef.current) return;
    if (open) gsap.fromTo(panelRef.current, { opacity: 0, y: -20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' });
    else gsap.to(panelRef.current, { opacity: 0, y: -20, scale: 0.96, duration: 0.25, ease: 'power2.in' });
  }, [open]);

  const strokeColor = open ? labelTextHoverColor : labelTextColor;

  return (
    <div style={{ position: 'relative' }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
        backgroundColor: open ? buttonHoverColor : buttonColor, backdropFilter: 'blur(20px)',
        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: open ? '0 8px 24px rgba(0,0,0,0.35)' : `0 8px 24px ${buttonColor}55`,
        transition: 'background-color 0.25s ease', cursor: 'pointer', position: 'relative', zIndex: 2,
      }}>
        <span style={{ color: open ? labelTextHoverColor : labelTextColor, fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em', fontFamily: FONT_FAMILY, whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', backgroundColor: open ? iconButtonHoverColor : iconButtonColor, borderRadius: '6px' }}>
          {iconComponent ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StriperIcon size={13} color={strokeColor} /></div>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
              <line ref={linesTopRef} x1="4" y1="7" x2="20" y2="7" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
              <line ref={linesBottomRef} x1="4" y1="17" x2="20" y2="17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>
      {open && (
        <div ref={panelRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: '0px',
          width: `${bigPanelWidth}px`, minHeight: `${bigPanelHeight}px`,
          backgroundColor: panelColor, backdropFilter: 'blur(24px)', borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.2)', boxShadow: `0 8px 32px ${panelColor}55`,
          zIndex: 1, fontFamily: FONT_FAMILY, color: titleTextColor, padding: '22px 26px',
          display: 'flex', gap: '20px', alignItems: 'flex-start',
        }}>
          <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isResources ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DocsIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Docs</span>
                  </div>
                  <p style={{ fontSize: '12px', lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: '340px' }}>Complete documentation of product guides, API, and Menuru tutorials.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BrandIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand</span>
                  </div>
                  <p style={{ fontSize: '12px', lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: '340px' }}>Visual assets, logos, and Menuru brand identity guidelines.</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {iconComponent ? iconComponent : iconType === 'trust' ? <TrustIcon size={26} color={titleTextColor} /> : iconType === 'career' ? <CareerIcon size={26} color={titleTextColor} /> : <ResourcesIcon size={26} color={titleTextColor} />}
                  <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelTitle}</span>
                </div>
                <p style={{ fontSize: '13px', lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: '340px' }}>{panelDescription}</p>
              </>
            )}
          </div>
          <div style={{ flex: '0 0 380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <img src={panelImage} alt={panelTitle} style={{ width: '100%', height: '170px', objectFit: 'contain', display: 'block', borderRadius: '10px' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelRightTitle}</span>
              <p style={{ fontSize: '12px', lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>{panelRightDescription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== FIXED NAVBAR =====
const FixedNavbar = ({ user, auth, db, userDisplayName, router, onSayHeyToggle, sayHeyOpen }: any) => {
  const displayName = userDisplayName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const photoURL = user?.photoURL || '';
  const userIsAdmin = user?.email === ADMIN_EMAIL;

  const handleLogout = async () => {
    if (!auth) return;
    try {
      if (db && user) await updateDoc(doc(db, 'users', user.uid), { online: false, lastSeen: serverTimestamp() });
      await signOut(auth);
      router.push('/notes');
    } catch (error) { console.error('Logout error:', error); }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000, height: '80px',
      backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(13, 60, 252, 0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', fontFamily: FONT_FAMILY,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginRight: '14px' }}>
          <img src="/images/nop.jpg" alt="Menuru" style={{ height: '44px', width: 'auto', maxWidth: 'none', objectFit: 'contain', display: 'block', flexShrink: 0, mixBlendMode: 'multiply' }} />
          <span style={{ color: BLUE, fontSize: '38px', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: FONT_FAMILY, lineHeight: 1, whiteSpace: 'nowrap' }}>Menuru</span>
        </Link>
        <NavbarButton label="Teams" panelTitle="Trust" panelDescription="Your security and privacy are our top priorities with end-to-end encryption." panelImage="/images/p0l.jpg" panelRightTitle="Why Trust Us" panelRightDescription="Our systems are monitored 24/7 to protect your data." iconType="trust" bigPanelWidth={850} bigPanelHeight={260} />
        <NavbarButton label="Individual" panelTitle="Careers" panelDescription="Join our team and build a meaningful career in a supportive environment." panelImage="/images/xxz.jpg" panelRightTitle="Life at Menuru" panelRightDescription="A collaborative, flexible work culture with plenty of opportunities to grow together." iconType="career" bigPanelWidth={850} bigPanelHeight={260} />
        <NavbarButton label="Resources" panelTitle="Docs & Brand" panelDescription="Access complete documentation and Menuru brand assets in one place." panelImage="/images/p0l.jpg" panelRightTitle="Docs & Brand" panelRightDescription="Guides, visual assets, and official Menuru brand references." iconType="resources" iconComponent={<StriperIcon size={22} color="#ffffff" />} bigPanelWidth={850} bigPanelHeight={340} buttonColor="#0D3CFC" buttonHoverColor="#0D3CFC" panelColor="#000000" iconButtonColor="#000000" iconButtonHoverColor="#000000" panelBoxColor="rgba(255,255,255,0.12)" panelBoxBorder="rgba(255,255,255,0.25)" labelTextColor="#ffffff" labelTextHoverColor="#ffffff" titleTextColor="#ffffff" descriptionTextColor="rgba(255,255,255,0.92)" isResources={true} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onSayHeyToggle} style={{
          position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 14px', backgroundColor: sayHeyOpen ? BLACK : LIME, borderRadius: '8px',
          border: `1px solid ${sayHeyOpen ? BLACK : LIME}`,
          boxShadow: sayHeyOpen ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(227,251,150,0.35)',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}>
          <SayHeyIcon size={16} color={sayHeyOpen ? WHITE : BLACK} />
          <span style={{ color: sayHeyOpen ? WHITE : BLACK, fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', fontFamily: FONT_FAMILY, whiteSpace: 'nowrap' }}>Say Hey</span>
        </button>
        {!user ? (
          <Link href="/signin" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: BLUE, borderRadius: '8px', border: `1px solid ${BLUE}`, boxShadow: '0 4px 12px rgba(13,60,252,0.25)', cursor: 'pointer' }}>
            <PeopleIcon size={18} color="#ffffff" />
            <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 700, letterSpacing: '0.02em', fontFamily: FONT_FAMILY, whiteSpace: 'nowrap' }}>Sign In</span>
          </Link>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: BLUE, borderRadius: '8px', border: `1px solid ${BLUE}`, boxShadow: '0 4px 12px rgba(13,60,252,0.25)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {photoURL ? (<img src={photoURL} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} referrerPolicy="no-referrer" />) : (<span style={{ fontSize: '13px', fontWeight: 800, color: BLUE }}>{displayName.charAt(0).toUpperCase()}</span>)}
              </div>
              <span style={{ color: WHITE, fontSize: '12px', fontWeight: 700, letterSpacing: '0.02em', fontFamily: FONT_FAMILY, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {displayName}
                {userIsAdmin && <InstagramVerifiedReal size={24} />}
              </span>
            </div>
            <button onClick={handleLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: BLUE, color: WHITE, borderRadius: '8px', border: `1px solid ${BLUE}`, boxShadow: '0 4px 12px rgba(13,60,252,0.25)', fontFamily: FONT_FAMILY, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Logout
              <LogoutIcon size={14} color={WHITE} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ===== FOOTER SECTION =====
const FooterSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!titleRef.current || !containerRef.current) return;
    const title = titleRef.current;
    let split: any = null;
    let ctx: any = null;
    const setup = () => {
      split = new SplitText(title, { type: 'chars', charsClass: 'footer-menuru-char' });
      ctx = gsap.context(() => {
        gsap.set(split.chars, { yPercent: 120, opacity: 0, rotationX: -90, transformOrigin: '50% 100%', force3D: true });
        gsap.to(split.chars, {
          yPercent: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.08, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: containerRef.current, start: 'top 90%', end: 'top 40%', scrub: 1, toggleActions: 'play none none reverse', invalidateOnRefresh: true },
        });
      }, containerRef);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(setup, 50));
    else setTimeout(setup, 200);
    return () => { if (ctx) ctx.revert(); if (split && split.revert) split.revert(); };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 600);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1500);
    return () => { window.removeEventListener('load', onLoad); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div ref={containerRef} style={{ width: 'calc(100% - 40px)', margin: '100px auto 20px auto', backgroundColor: MINT, borderRadius: '32px', padding: '60px 40px 40px 40px', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: '1400px', margin: '0 auto', gap: '40px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
        {footerLinks.map((section, idx) => (
          <div key={idx} style={{ flex: '1', minWidth: '200px' }}>
            <h3 style={{ fontFamily: FONT_FAMILY, fontSize: '28px', fontWeight: 700, color: BLUE, margin: 0, marginBottom: '16px', letterSpacing: '-0.01em' }}>{section.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.links.map((link, linkIdx) => {
                let linkHref = '#';
                let isAttention = false;
                let isStories = false;
                if (link === 'Contact Us') linkHref = '/contact';
                else if (link === 'Live Chat') linkHref = '/live-chat';
                else if (link === 'Live Chat Agent') linkHref = '/live-chat-agent';
                else if (link === 'Help Center') linkHref = '/pusat-bantuan';
                else if (link === 'About Us') { linkHref = '/profile'; isAttention = true; }
                else if (link === 'Privacy Policy') { linkHref = '/privacy-policy'; isAttention = true; }
                else if (link === 'Terms & Conditions') { linkHref = '/terms-of-services'; isAttention = true; }
                else if (link === 'Terms of Use') { linkHref = '/notfounds'; isAttention = true; }
                else if (link === 'Cookies Policy') { linkHref = '/notfounds'; isAttention = true; }
                else if (link === 'Stories') { linkHref = '/notfounds'; isStories = true; }
                else if (link === 'Shop') linkHref = '/notfounds';
                else if (link === 'Note') linkHref = '/notes';
                else if (link === 'Calendar') linkHref = '/notfounds';
                else if (link === 'Blog') linkHref = '/notfounds';
                else if (link === 'Donation') linkHref = '/notfounds';
                else if (link === 'Community') linkHref = '/notfounds';
                else if (link === 'Instagram') linkHref = 'https://instagram.com/menuru';
                return (
                  <div key={linkIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Link href={linkHref} style={{ textDecoration: 'none' }}>
                      <span style={{ fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 500, color: BLUE, letterSpacing: '-0.01em', cursor: 'pointer' }}>{link}</span>
                    </Link>
                    {isAttention && (<span style={{ backgroundColor: WHITE, border: `1.5px solid ${BLUE}`, color: BLUE, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, fontFamily: FONT_FAMILY, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'inline-block' }}>Updated</span>)}
                    {isStories && (<span style={{ backgroundColor: WHITE, border: `1.5px solid ${BLUE}`, color: BLUE, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, fontFamily: FONT_FAMILY, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'inline-block' }}>New</span>)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ flex: '0 0 auto', minWidth: '200px' }}>
          <a href={STORE_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', cursor: 'pointer', padding: '14px 22px', backgroundColor: RED, borderRadius: '12px', boxShadow: '0 6px 24px rgba(220,38,38,0.35)', transition: 'transform 0.2s ease, boxShadow 0.2s ease', pointerEvents: 'auto' }}>
            <WindowsIcon size={24} color={WHITE} />
            <span style={{ fontFamily: FONT_FAMILY, fontSize: '18px', fontWeight: 700, color: WHITE, letterSpacing: '-0.01em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Download for Windows</span>
          </a>
        </div>
      </div>
      <div style={{ maxWidth: '1400px', margin: '40px auto 0 auto', paddingTop: '20px', borderTop: `1px solid ${BLUE}20`, position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 400, color: BLUE, margin: 0, textAlign: 'center', letterSpacing: '0.01em', opacity: 0.8 }}>Terms and conditions apply. By using this website, you agree to our Terms of Use and Privacy Policy.</p>
      </div>
      <div style={{ marginTop: '40px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
        <a href={STORE_LINK} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none', cursor: 'pointer', padding: '14px 22px', backgroundColor: WHITE, borderRadius: '14px', boxShadow: '0 6px 24px rgba(0,0,0,0.12)', transition: 'transform 0.2s ease, boxShadow 0.2s ease', pointerEvents: 'auto' }}>
          <MicrosoftStoreIcon size={36} />
          <span style={{ fontFamily: FONT_FAMILY, fontSize: '24px', fontWeight: 700, color: BLUE, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Unduh Menuru</span>
        </a>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span ref={titleRef} style={{ fontFamily: FONT_FAMILY, fontSize: '600px', fontWeight: 400, color: BLUE, letterSpacing: '-0.05em', lineHeight: '0.85', display: 'block', textAlign: 'left', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', willChange: 'transform, opacity', whiteSpace: 'nowrap', margin: 0, padding: 0, overflow: 'visible', position: 'relative', pointerEvents: 'none' }}>Menuru</span>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 400, color: BLUE, letterSpacing: '0.01em', opacity: 0.85 }}>2024 - 2026 Menuru. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

const footerLinks = [
  { title: 'Get in Touch', links: ['Contact Us', 'Instagram', 'Live Chat'] },
  { title: 'Product', links: ['Shop', 'Note', 'Calendar', 'Blog', 'Donation', 'Community', 'Live Chat Agent', 'Stories'] },
  { title: 'Attention', links: ['Privacy Policy', 'Terms & Conditions', 'About Us', 'Terms of Use', 'Cookies Policy', 'Help Center'] },
];

// ===== TOPIC DROPDOWN =====
const TopicDropdown = ({ categories, notesByCategory, selectedTopic, onSelectTopic }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const getNoteCount = (category: string) => notesByCategory[category]?.length || 0;
  const activeCategories = categories.filter((cat: string) => getNoteCount(cat) > 0);
  if (activeCategories.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', padding: '14px 18px', backgroundColor: BLUE, border: `1px solid ${BLUE}`, borderRadius: '8px', color: 'white', fontSize: '16px', fontFamily: FONT_FAMILY, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', outline: 'none' }}>
        <span>{selectedTopic || 'Pilih Topik Catatan'}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: BLUE, border: `1px solid ${BLUE}`, borderRadius: '8px', overflow: 'hidden', zIndex: 1000 }}>
          <button onClick={() => { onSelectTopic(''); setIsOpen(false); }} style={{ width: '100%', padding: '14px 18px', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid rgba(255,255,255,0.1)`, color: !selectedTopic ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontFamily: FONT_FAMILY, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Semua Topik</span>
            <span style={{ backgroundColor: WHITE, padding: '3px 8px', borderRadius: '20px', fontSize: '12px', color: BLUE, fontWeight: 700 }}>{Object.keys(notesByCategory).reduce((acc, cat) => acc + notesByCategory[cat].length, 0)}</span>
          </button>
          {activeCategories.map((category: string) => (
            <button key={category} onClick={() => { onSelectTopic(category); setIsOpen(false); }} style={{ width: '100%', padding: '14px 18px', backgroundColor: 'transparent', border: 'none', borderBottom: `1px solid rgba(255,255,255,0.1)`, color: selectedTopic === category ? 'white' : 'rgba(255,255,255,0.6)', fontSize: '14px', fontFamily: FONT_FAMILY, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{category}</span>
              <span style={{ backgroundColor: WHITE, padding: '3px 8px', borderRadius: '20px', fontSize: '12px', color: BLUE, fontWeight: 700 }}>{getNoteCount(category)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== NOTE EDITOR TOOLBAR =====
const NoteEditorToolbar = ({ onFormat, activeFormats, stabiloColor, setStabiloColor, showStabiloPicker, setShowStabiloPicker, fontSize, setFontSize }: any) => {
  const toolbarBtnStyle = (active: boolean) => ({
    width: '32px', height: '32px', backgroundColor: active ? BLUE : 'transparent',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '10px 14px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: `1.5px solid ${BLUE}30`, marginBottom: '14px', alignItems: 'center' }}>
      <button type="button" onClick={() => onFormat('bold')} style={toolbarBtnStyle(activeFormats.bold)}><BoldIcon size={14} color={activeFormats.bold ? WHITE : BLUE} /></button>
      <button type="button" onClick={() => onFormat('italic')} style={toolbarBtnStyle(activeFormats.italic)}><ItalicIcon size={14} color={activeFormats.italic ? WHITE : BLUE} /></button>
      <button type="button" onClick={() => onFormat('underline')} style={toolbarBtnStyle(activeFormats.underline)}><UnderlineIcon size={14} color={activeFormats.underline ? WHITE : BLUE} /></button>
      <div style={{ width: '1px', height: '22px', backgroundColor: `${BLUE}30`, margin: '0 3px' }} />
      <select value={fontSize} onChange={(e) => { setFontSize(Number(e.target.value)); onFormat('fontSize', e.target.value); }} style={{ padding: '5px 8px', backgroundColor: WHITE, border: `1.5px solid ${BLUE}`, borderRadius: '6px', color: BLUE, fontSize: '12px', fontFamily: FONT_FAMILY, fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
        {FONT_SIZES.map((size) => (<option key={size} value={size}>{size}px</option>))}
      </select>
      <div style={{ width: '1px', height: '22px', backgroundColor: `${BLUE}30`, margin: '0 3px' }} />
      <button type="button" onClick={() => onFormat('justifyLeft')} style={toolbarBtnStyle(activeFormats.justifyLeft)}><AlignLeftIcon size={14} color={activeFormats.justifyLeft ? WHITE : BLUE} /></button>
      <button type="button" onClick={() => onFormat('justifyCenter')} style={toolbarBtnStyle(activeFormats.justifyCenter)}><AlignCenterIcon size={14} color={activeFormats.justifyCenter ? WHITE : BLUE} /></button>
      <button type="button" onClick={() => onFormat('justifyRight')} style={toolbarBtnStyle(activeFormats.justifyRight)}><AlignRightIcon size={14} color={activeFormats.justifyRight ? WHITE : BLUE} /></button>
      <div style={{ width: '1px', height: '22px', backgroundColor: `${BLUE}30`, margin: '0 3px' }} />
      <button type="button" onClick={() => onFormat('insertUnorderedList')} style={toolbarBtnStyle(activeFormats.insertUnorderedList)}><ListIcon size={14} color={activeFormats.insertUnorderedList ? WHITE : BLUE} /></button>
      <div style={{ position: 'relative' }}>
        <button type="button" onClick={() => setShowStabiloPicker(!showStabiloPicker)} style={toolbarBtnStyle(showStabiloPicker)}><HighlightIcon size={14} color={showStabiloPicker ? WHITE : BLUE} /></button>
        {showStabiloPicker && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: WHITE, border: `2px solid ${BLUE}`, borderRadius: '10px', padding: '8px', zIndex: 100, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', boxShadow: '0 8px 24px rgba(13,60,252,0.25)', minWidth: '200px' }}>
            {STABILO_COLORS.map((color) => (
              <button key={color.value} type="button" onClick={() => { setStabiloColor(color.value); onFormat('hiliteColor', color.value); setShowStabiloPicker(false); }} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: color.value, border: stabiloColor === color.value ? `3px solid ${BLUE}` : '2px solid rgba(0,0,0,0.15)', cursor: 'pointer', padding: 0 }} title={color.name} />
            ))}
            <button type="button" onClick={() => { setStabiloColor('transparent'); onFormat('hiliteColor', 'transparent'); setShowStabiloPicker(false); }} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: WHITE, border: `2px solid ${BLUE}`, cursor: 'pointer', padding: 0, gridColumn: 'span 4', fontFamily: FONT_FAMILY, fontSize: '10px', fontWeight: 700, color: BLUE }}>Hapus Label</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== INTERFACES =====
interface Note {
  id?: string;
  title: string;
  category: string;
  link: string;
  description: string;
  descriptionHtml?: string;
  labelColor?: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: any;
  updatedAt: any;
  savedBy?: string[];
  thumbnail?: string;
  collaborators?: string[];
  collaboratorNames?: { [key: string]: string };
  collaboratorEmails?: { [key: string]: string };
  isCollaborative?: boolean;
}

interface Group {
  id?: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  members: string[];
  memberNames?: { [key: string]: string };
  memberEmails?: { [key: string]: string };
  createdAt: any;
}

interface GroupMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  text: string;
  timestamp: any;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read';
  readBy?: string[];
  replyTo?: { messageId: string; senderName: string; text: string } | null;
}

export default function NotesPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInlineNoteEditor, setShowInlineNoteEditor] = useState(false);
  const [showInlineEditNoteEditor, setShowInlineEditNoteEditor] = useState(false);
  const [showInlineGroupEditor, setShowInlineGroupEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingNoteInline, setEditingNoteInline] = useState<Note | null>(null);
  const [showSayHey, setShowSayHey] = useState(false);
  const [sayHeyUnreadCount, setSayHeyUnreadCount] = useState(0);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<{ [gid: string]: GroupMessage[] }>({});
  const [groupMessageText, setGroupMessageText] = useState('');
  const [groupReplyTo, setGroupReplyTo] = useState<any>(null);
  const [groupTyping, setGroupTyping] = useState<{ [gid: string]: any[] }>({});
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [newNote, setNewNote] = useState({ title: '', category: '', link: '' });
  const [editNote, setEditNote] = useState({ title: '', category: '', link: '', description: '' });
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<{ uid: string; name: string; email: string }[]>([]);
  const [memberSearchEmail, setMemberSearchEmail] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const groupChatContainerRef = useRef<HTMLDivElement>(null);
  const groupTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const groupInputRef = useRef<HTMLInputElement>(null);
  const editNoteEditorRef = useRef<HTMLDivElement>(null);
  const noteEditorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<any>({ bold: false, italic: false, underline: false, justifyLeft: true, justifyCenter: false, justifyRight: false, insertUnorderedList: false });
  const [stabiloColor, setStabiloColor] = useState<string>('transparent');
  const [showStabiloPicker, setShowStabiloPicker] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [noteLabelColor, setNoteLabelColor] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [voiceTarget, setVoiceTarget] = useState<'title' | 'body'>('title');
  const recognitionRef = useRef<any>(null);
  const voiceBaseHtmlRef = useRef<string>('');
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);

  const categories = ['Makanan', 'Minuman', 'Fotografi', 'Coding', 'Desain', 'Musik', 'Film', 'Buku', 'Olahraga', 'Travel', 'Pendidikan', 'Bisnis', 'Kesehatan', 'Teknologi', 'Hobi'];

  useEffect(() => { setIsMounted(true); }, []);

  // ===== VOICE INPUT SETUP =====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setVoiceSupported(true);
      const rec = new SR();
      rec.lang = 'id-ID';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalText += transcript + ' ';
          else interimText += transcript;
        }
        if (finalText.trim()) {
          const lowerFinal = finalText.toLowerCase().trim();
          if (COMMANDS.simpan.some(cmd => lowerFinal.includes(cmd))) {
            setVoiceStatus('Menyimpan catatan...');
            try { rec.stop(); } catch (e) {}
            setIsListening(false);
            setTimeout(() => handleCreateNote(), 300);
            return;
          }
          if (COMMANDS.batal.some(cmd => lowerFinal.includes(cmd))) {
            setVoiceStatus('Membatalkan...');
            try { rec.stop(); } catch (e) {}
            setIsListening(false);
            setTimeout(() => {
              setShowInlineNoteEditor(false);
              setNewNote({ title: '', category: '', link: '' });
              setNoteLabelColor('');
              if (noteEditorRef.current) noteEditorRef.current.innerHTML = '';
            }, 300);
            return;
          }
          if (COMMANDS.hapus.some(cmd => lowerFinal.includes(cmd))) {
            if (noteEditorRef.current) noteEditorRef.current.innerHTML = '';
            voiceBaseHtmlRef.current = '';
            setVoiceStatus('Isi catatan dihapus');
            return;
          }
          if (COMMANDS.judul.some(cmd => lowerFinal.includes(cmd))) {
            setVoiceTarget('title');
            setVoiceStatus('Mode judul aktif - ucapkan judul catatan');
            return;
          }
          if (lowerFinal.includes('isi') || lowerFinal.includes('tulis') || lowerFinal.includes('body')) {
            setVoiceTarget('body');
            setVoiceStatus('Mode isi aktif - ucapkan isi catatan');
            return;
          }
          if (voiceTarget === 'title') {
            setNewNote(prev => ({ ...prev, title: (prev.title + ' ' + finalText).trim() }));
          } else {
            if (noteEditorRef.current) {
              noteEditorRef.current.innerHTML = voiceBaseHtmlRef.current + finalText + interimText;
              voiceBaseHtmlRef.current = voiceBaseHtmlRef.current + finalText;
            }
          }
        } else if (interimText) {
          if (voiceTarget === 'body' && noteEditorRef.current) noteEditorRef.current.innerHTML = voiceBaseHtmlRef.current + interimText;
        }
      };
      rec.onerror = (event: any) => {
        console.error('Voice error:', event.error);
        setVoiceStatus(event.error === 'no-speech' || event.error === 'aborted' ? 'Tidak ada suara terdeteksi' : `Error: ${event.error}`);
        setIsListening(false);
      };
      rec.onend = () => { setIsListening(false); };
      recognitionRef.current = rec;
    }
  }, [voiceTarget]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      let app;
      if (getApps().length === 0) app = initializeApp(firebaseConfig);
      else app = getApps()[0];
      setAuth(getAuth(app));
      setDb(getFirestore(app));
    } catch (error) { console.error('Firebase init error:', error); }
  }, []);

  useEffect(() => {
    if (!db || !isMounted || !user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribes: (() => void)[] = [];
    try {
      const ownNotesQ = query(collection(db, 'userNotes'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));
      const unsub1 = onSnapshot(ownNotesQ, (snap: any) => {
        const ownNotes: Note[] = [];
        snap.forEach((docSnap: any) => { ownNotes.push({ id: docSnap.id, ...docSnap.data() }); });
        const collabNotesQ = query(collection(db, 'userNotes'), where('collaborators', 'array-contains', user.uid));
        getDocs(collabNotesQ).then((collabSnap) => {
          const collabNotes: Note[] = [];
          collabSnap.forEach((docSnap: any) => {
            if (!ownNotes.some(n => n.id === docSnap.id)) collabNotes.push({ id: docSnap.id, ...docSnap.data(), isCollaborative: true });
          });
          setNotes([...ownNotes, ...collabNotes]);
          setIsLoading(false);
        }).catch((err) => {
          console.error('Error loading collab notes:', err);
          setNotes(ownNotes);
          setIsLoading(false);
        });
      });
      unsubscribes.push(unsub1);
    } catch (error) {
      console.error('Error loading notes:', error);
      setIsLoading(false);
    }
    return () => { unsubscribes.forEach((unsub) => unsub()); };
  }, [db, isMounted, user]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        const email = currentUser.email || '';
        setUserDisplayName(name);
        setUserEmail(email);
        await saveUserToFirestore(currentUser.uid, name, email);
        loadUserGroups(currentUser.uid);
      } else {
        setUser(null);
        setUserDisplayName('');
        setUserEmail('');
        setNotes([]);
      }
      setAuthReady(true);
      setLoading(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [auth]);

  useEffect(() => {
    if (!isMounted || loading) return;
    let killed = false;
    const preloaderEl = preloaderRef.current;
    const textEl = textRef.current;
    const counterEl = counterRef.current;
    const mainEl = mainPageRef.current;
    if (!preloaderEl || !textEl || !counterEl || !mainEl) return;
    gsap.set(textEl, { y: 100, opacity: 0 });
    gsap.set(counterEl, { opacity: 1, scale: 1, y: 0, xPercent: 0 });
    gsap.set(preloaderEl, { opacity: 1, scale: 1, xPercent: 0, display: 'block' });
    gsap.set(mainEl, { xPercent: 100, opacity: 1, display: 'flex' });
    const counterObj = { value: 1 };
    counterEl.textContent = '01';
    const tl = gsap.timeline();
    tl.to(textEl, { y: 0, opacity: 1, duration: 1.0, ease: 'back.out(1.7)' })
      .to(textEl, { duration: 0.8 })
      .to(textEl, { opacity: 0, y: -20, scale: 0.9, duration: 0.5, ease: 'power2.out', onComplete: () => { if (textEl) textEl.textContent = 'Note'; } })
      .to(textEl, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' })
      .to(textEl, { duration: 1.2 });
    tl.to(counterObj, { value: 100, duration: 6.5, ease: 'power2.inOut', onUpdate: () => { if (counterEl) { const val = Math.round(counterObj.value); counterEl.textContent = String(val).padStart(2, '0'); } } }, 0);
    tl.to(textEl, { scale: 0.3, opacity: 0, duration: 0.8, ease: 'power2.in' })
      .to(counterEl, { scale: 0.6, opacity: 0, duration: 0.8, ease: 'power2.in' }, '-=0.8')
      .to(preloaderEl, { xPercent: -100, duration: 1.2, ease: 'power3.inOut', onComplete: () => { if (preloaderEl) preloaderEl.style.display = 'none'; } }, '-=0.2')
      .to(mainEl, { xPercent: 0, duration: 1.2, ease: 'power3.inOut', onComplete: () => { if (killed) return; gsap.set(mainEl, { clearProps: 'transform,willChange' }); setTimeout(() => ScrollTrigger.refresh(), 300); } }, '<');
    return () => { killed = true; tl.kill(); };
  }, [isMounted, loading]);

  const saveUserToFirestore = async (userId: string, name: string, email: string) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = { id: userId, name, displayName: name, email: email.toLowerCase(), online: true, lastSeen: serverTimestamp(), updatedAt: serverTimestamp() };
      if (!userSnap.exists()) await setDoc(userRef, { ...userData, createdAt: serverTimestamp() });
      else await updateDoc(userRef, userData);
    } catch (error) { console.error('Error saving user:', error); }
  };

  const loadUserGroups = async (userId: string) => {
    if (!db) return;
    try {
      const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot: any) => {
        const groupsData: Group[] = [];
        querySnapshot.forEach((docSnap: any) => { groupsData.push({ id: docSnap.id, ...docSnap.data() }); });
        setGroups(groupsData);
      });
      return unsubscribe;
    } catch (error) { console.error('Error loading groups:', error); }
  };

  const requireLogin = (action: string) => {
    if (!user) {
      if (confirm(`Anda perlu login untuk ${action}. Login sekarang?`)) router.push('/signin');
      return false;
    }
    return true;
  };

  const handleFormat = (command: string, value?: string) => {
    if (!noteEditorRef.current) return;
    noteEditorRef.current.focus();
    document.execCommand(command, false, value);
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
    });
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) { alert('Browser Anda tidak mendukung fitur mikrofon. Gunakan Chrome/Edge terbaru.'); return; }
    if (isListening) {
      try { recognitionRef.current.stop(); } catch (e) { console.error(e); }
      setIsListening(false);
      setVoiceStatus('Mikrofon dimatikan');
      setTimeout(() => setVoiceStatus(''), 1500);
      return;
    }
    voiceBaseHtmlRef.current = noteEditorRef.current?.innerHTML || '';
    setVoiceTarget('title');
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceStatus("Mendengarkan... Ucapkan 'judul' atau 'isi' untuk ganti target, 'simpan' untuk submit");
    } catch (error) {
      console.error('Start voice error:', error);
      setVoiceStatus('Gagal memulai mikrofon');
      setIsListening(false);
    }
  };

  const handleSearchMember = async (email: string) => {
    if (!email.trim() || !db) { setMemberSearchResults([]); return; }
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase().trim()));
      const snap = await getDocs(q);
      const results: any[] = [];
      snap.forEach((docSnap) => { results.push({ uid: docSnap.id, ...docSnap.data() }); });
      setMemberSearchResults(results);
    } catch (err) { console.error('Search error:', err); }
  };

  const addMemberToNewGroup = (member: any) => {
    if (newGroupMembers.some(m => m.uid === member.uid)) { alert('User sudah ditambahkan'); return; }
    setNewGroupMembers([
      ...newGroupMembers,
      {
        uid: member.uid,
        name: member.displayName || member.name || member.email?.split('@')[0] || 'User',
        email: member.email || '',
      },
    ]);
    setMemberSearchEmail('');
    setMemberSearchResults([]);
  };

  const removeMemberFromNewGroup = (uid: string) => { setNewGroupMembers(newGroupMembers.filter(m => m.uid !== uid)); };

  const handleCreateNote = async () => {
    if (!user) { alert('Silakan login terlebih dahulu'); return; }
    if (!db || !newNote.title.trim()) { alert('Judul catatan harus diisi'); return; }
    const descriptionHtml = noteEditorRef.current?.innerHTML || '';
    const descriptionText = noteEditorRef.current?.innerText || '';
    if (!descriptionText.trim() && !newNote.title.trim()) { alert('Isi catatan tidak boleh kosong'); return; }
    try {
      const collaboratorNames: { [key: string]: string } = {};
      const collaboratorEmails: { [key: string]: string } = {};
      newGroupMembers.forEach(m => { collaboratorNames[m.uid] = m.name; collaboratorEmails[m.uid] = m.email; });
      await addDoc(collection(db, 'userNotes'), {
        title: newNote.title.trim(),
        category: newNote.category.trim(),
        link: newNote.link.trim(),
        description: descriptionText,
        descriptionHtml,
        labelColor: noteLabelColor,
        userId: user.uid,
        userName: userDisplayName,
        userEmail,
        thumbnail: generateThumbnail(newNote.link.trim()),
        savedBy: [],
        collaborators: newGroupMembers.map(m => m.uid),
        collaboratorNames,
        collaboratorEmails,
        isCollaborative: newGroupMembers.length > 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewNote({ title: '', category: '', link: '' });
      setNoteLabelColor('');
      setNewGroupMembers([]);
      if (noteEditorRef.current) noteEditorRef.current.innerHTML = '';
      setShowInlineNoteEditor(false);
      setVoiceStatus('Catatan berhasil disimpan!');
      setTimeout(() => setVoiceStatus(''), 2000);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Gagal membuat catatan.');
    }
  };

  const handleCreateGroup = async () => {
    if (!requireLogin('membuat grup')) return;
    if (!db || !newGroupName.trim()) { alert('Nama grup harus diisi'); return; }
    try {
      const memberIds = [user.uid, ...newGroupMembers.map(m => m.uid)];
      const memberNames: { [key: string]: string } = { [user.uid]: userDisplayName };
      const memberEmails: { [key: string]: string } = { [user.uid]: userEmail };
      newGroupMembers.forEach(m => { memberNames[m.uid] = m.name; memberEmails[m.uid] = m.email; });
      await addDoc(collection(db, 'groups'), {
        name: newGroupName.trim(),
        ownerId: user.uid,
        ownerName: userDisplayName,
        ownerEmail: userEmail,
        members: memberIds,
        memberNames,
        memberEmails,
        createdAt: serverTimestamp(),
      });
      setNewGroupName('');
      setNewGroupMembers([]);
      setShowInlineGroupEditor(false);
      alert('Grup berhasil dibuat!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Gagal membuat grup.');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user || !db) return;
    if (!confirm('Apakah Anda yakin ingin menghapus grup ini?')) return;
    try {
      const msgsQ = query(collection(db, 'groups', groupId, 'messages'));
      const msgsSnap = await getDocs(msgsQ);
      for (const msgDoc of msgsSnap.docs) await deleteDoc(doc(db, 'groups', groupId, 'messages', msgDoc.id));
      await deleteDoc(doc(db, 'groups', groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Gagal menghapus grup.');
    }
  };

  const handleEditNote = async () => {
    if (!user || !db || !editingNoteInline) return;
    try {
      const editHtml = editNoteEditorRef.current?.innerHTML || '';
      const editText = editNoteEditorRef.current?.innerText || '';
      await updateDoc(doc(db, 'userNotes', editingNoteInline.id!), {
        title: editNote.title.trim() || editingNoteInline.title,
        category: editNote.category.trim() || editingNoteInline.category,
        link: editNote.link.trim() || editingNoteInline.link,
        description: editText || editNote.description,
        descriptionHtml: editHtml || editingNoteInline.descriptionHtml,
        updatedAt: serverTimestamp(),
      });
      setShowInlineEditNoteEditor(false);
      setEditingNoteInline(null);
      setEditNote({ title: '', category: '', link: '', description: '' });
    } catch (error) {
      console.error(error);
      alert('Gagal mengedit catatan.');
    }
  };

  const generateThumbnail = (link: string): string => {
    if (!link) return '';
    try {
      const url = new URL(link);
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
      }
      return '';
    } catch { return ''; }
  };

  const handleSaveNote = async (noteId: string) => {
    if (!requireLogin('menyimpan catatan')) return;
    try {
      const noteRef = doc(db, 'userNotes', noteId);
      await updateDoc(noteRef, { savedBy: arrayUnion(user.uid) });
      const noteSnap = await getDoc(noteRef);
      const noteData = noteSnap.data();
      await addDoc(collection(db, 'userSavedNotes'), {
        noteId,
        userId: user.uid,
        userName: userDisplayName,
        userEmail,
        noteTitle: noteData?.title || '',
        noteCategory: noteData?.category || '',
        noteDescription: noteData?.description || '',
        noteDescriptionHtml: noteData?.descriptionHtml || '',
        noteUserName: noteData?.userName || '',
        noteUpdatedAt: noteData?.updatedAt || null,
        savedAt: serverTimestamp(),
      });
      alert('Catatan berhasil disimpan ke riwayat!');
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan catatan.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user || !db) return;
    if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      try { await deleteDoc(doc(db, 'userNotes', noteId)); }
      catch (error) { console.error(error); alert('Gagal menghapus catatan.'); }
    }
  };

  const handleUnsaveNote = async (noteId: string) => {
    if (!user || !db) return;
    try {
      const noteRef = doc(db, 'userNotes', noteId);
      const noteSnap = await getDoc(noteRef);
      if (noteSnap.exists()) {
        const savedBy = noteSnap.data().savedBy || [];
        await updateDoc(noteRef, { savedBy: savedBy.filter((id: string) => id !== user.uid) });
      }
      alert('Catatan dihapus dari riwayat.');
    } catch (error) {
      console.error(error);
      alert('Gagal menghapus dari riwayat.');
    }
  };

  const getVideoEmbedUrl = (link: string) => {
    if (!link) return null;
    try {
      const url = new URL(link);
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
      }
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
      }
      if (link.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) return link;
      return null;
    } catch { return null; }
  };

  const togglePlayPause = (noteId: string) => {
    const video = videoRefs.current[noteId];
    if (video) { video.paused ? video.play() : video.pause(); }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Baru saja';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hari ini';
    else if (diffDays === 1) return 'Kemarin';
    else if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const canEditNote = (note: Note) => {
    if (!user) return false;
    return note.userId === user?.uid || (note.collaborators && note.collaborators.includes(user?.uid));
  };

  // ===== GROUP CHAT =====
  const openGroupChat = async (group: Group) => {
    setSelectedGroup(group);
    setGroupReplyTo(null);
    if (!db) return;
    try {
      const messagesQ = query(collection(db, 'groups', group.id!, 'messages'), orderBy('timestamp', 'asc'));
      onSnapshot(messagesQ, async (snap) => {
        const list: GroupMessage[] = [];
        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          let text = data.text || '';
          if (data.isEncrypted) {
            try { text = await decryptMessage(text); } catch { text = '[Encrypted]'; }
          }
          list.push({ id: docSnap.id, ...data, text });
        }
        setGroupMessages(prev => ({ ...prev, [group.id!]: list }));
        requestAnimationFrame(() => {
          if (groupChatContainerRef.current) groupChatContainerRef.current.scrollTop = groupChatContainerRef.current.scrollHeight;
        });
      });
      const typingQ = query(collection(db, 'groups', group.id!, 'typing'));
      onSnapshot(typingQ, (snap) => {
        const typers: any[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.uid !== user?.uid) typers.push({ uid: docSnap.id, ...data });
        });
        setGroupTyping(prev => ({ ...prev, [group.id!]: typers }));
      });
    } catch (error) { console.error('openGroupChat error:', error); }
  };

  const handleGroupTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGroupMessageText(value);
    if (!db || !selectedGroup || !user) return;
    const typingRef = doc(db, 'groups', selectedGroup.id!, 'typing', user.uid);
    if (value.length > 0) {
      await setDoc(typingRef, { uid: user.uid, name: userDisplayName, email: userEmail, at: serverTimestamp() }, { merge: true }).catch(() => {});
    } else {
      await deleteDoc(typingRef).catch(() => {});
    }
    if (groupTypingTimeoutRef.current) clearTimeout(groupTypingTimeoutRef.current);
    groupTypingTimeoutRef.current = setTimeout(async () => {
      await deleteDoc(typingRef).catch(() => {});
    }, 2500);
  };

  const sendGroupMessage = async () => {
    if (!db || !selectedGroup || !groupMessageText.trim() || !user) return;
    const txt = groupMessageText.trim();
    setGroupMessageText('');
    const typingRef = doc(db, 'groups', selectedGroup.id!, 'typing', user.uid);
    deleteDoc(typingRef).catch(() => {});
    try {
      const encrypted = await encryptMessage(txt);
      await addDoc(collection(db, 'groups', selectedGroup.id!, 'messages'), {
        senderId: user.uid,
        senderName: userDisplayName,
        senderEmail: userEmail,
        text: encrypted,
        isEncrypted: true,
        timestamp: serverTimestamp(),
        deliveryStatus: 'sent',
        readBy: [user.uid],
        replyTo: groupReplyTo ? { messageId: groupReplyTo.id, senderName: groupReplyTo.senderName, text: groupReplyTo.text } : null,
      });
      setGroupReplyTo(null);
      if (groupTypingTimeoutRef.current) clearTimeout(groupTypingTimeoutRef.current);
    } catch (error) { console.error('sendGroupMessage error:', error); }
  };

  useEffect(() => {
    if (!db || !selectedGroup || !user) return;
    const msgs = groupMessages[selectedGroup.id!] || [];
    msgs.forEach(async (m) => {
      if (m.senderId === user.uid) return;
      const readBy = m.readBy || [];
      if (!readBy.includes(user.uid)) {
        const msgRef = doc(db, 'groups', selectedGroup.id!, 'messages', m.id!);
        await updateDoc(msgRef, { readBy: arrayUnion(user.uid), deliveryStatus: 'read' }).catch(() => {});
      }
    });
  }, [groupMessages, selectedGroup, db, user]);

  const getGroupMessageStatus = (msg: GroupMessage) => {
    if (msg.senderId !== user?.uid) return null;
    const readers = (msg.readBy || []).filter(id => id !== user?.uid);
    if (readers.length > 0) return 'read';
    if (msg.deliveryStatus === 'delivered') return 'delivered';
    if (msg.deliveryStatus === 'sent') return 'sent';
    if (msg.deliveryStatus === 'sending') return 'sending';
    return 'sent';
  };

  const renderGroupMessageStatusIcon = (status: string | null) => {
    if (!status) return null;
    if (status === 'sending') return <ClockIcon size={14} color="#999" />;
    if (status === 'sent') return <CheckIcon size={14} color="#999" />;
    if (status === 'delivered') return <DoubleCheckIcon size={14} color="#999" />;
    if (status === 'read') return <DoubleCheckIcon size={14} color="#0095F6" />;
    return null;
  };

  const notesByCategory = notes.reduce((acc, note) => {
    const category = note.category || 'Lainnya';
    if (!acc[category]) acc[category] = [];
    acc[category].push(note);
    return acc;
  }, {} as { [key: string]: Note[] });

  const filteredNotes = selectedTopic ? notesByCategory[selectedTopic] || [] : notes;

  if (!auth || !db || !isMounted || !authReady) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BLUE, fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 700 }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Menuru Notes</title>
        <meta name="description" content="Notes for the next era of technology system" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content={BLUE} />
      </Head>

      <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', backgroundColor: WHITE }}>
        <div ref={preloaderRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: WHITE, zIndex: 9999, fontFamily: FONT_FAMILY, overflow: 'hidden', willChange: 'transform' }}>
          <span ref={counterRef} style={{ position: 'absolute', top: '10px', right: '40px', fontSize: '400px', fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: '-0.04em', lineHeight: 0.9, display: 'inline-block', willChange: 'transform, opacity', userSelect: 'none', pointerEvents: 'none' }}>01</span>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', overflow: 'hidden' }}>
              <span style={{ fontSize: '100px', fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: '-0.03em' }}>Menuru</span>
              <span ref={textRef} style={{ fontSize: '50px', fontWeight: 600, color: BLACK, fontFamily: FONT_FAMILY, letterSpacing: '-0.02em', display: 'inline-block', willChange: 'transform, opacity' }}>Note</span>
            </div>
          </div>
        </div>

        <div ref={mainPageRef} style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: WHITE, margin: 0, padding: 0, fontFamily: FONT_FAMILY, overflow: 'visible', display: 'flex', flexDirection: 'column', willChange: 'transform' }}>
          <FixedNavbar user={user} auth={auth} db={db} userDisplayName={userDisplayName} router={router} onSayHeyToggle={() => setShowSayHey((prev) => !prev)} sayHeyOpen={showSayHey} />

          <div style={{ width: '100%', padding: '0 40px', maxWidth: '1600px', margin: '0 auto', marginTop: '140px', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontFamily: FONT_FAMILY, fontSize: '450px', fontWeight: 400, color: BLUE, letterSpacing: '-0.04em', lineHeight: 1, margin: 0, marginBottom: '20px', textAlign: 'left' }}>Notes</h2>
            <p style={{ fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 500, color: BLACK, letterSpacing: '-0.01em', lineHeight: 1.6, margin: 0, marginBottom: '40px', maxWidth: '800px', textAlign: 'left' }}>Temukan catatan-catatan menarik dari komunitas Menuru. Semua catatan dikategorikan untuk memudahkan Anda menjelajahi topik yang Anda minati.</p>

            {showSayHey && (
              <div id="sayhey-section" style={{ marginBottom: '60px' }}>
                <SayHeySectionSimple user={user} db={db} isAdmin={user?.email === ADMIN_EMAIL} onUnreadCountChange={setSayHeyUnreadCount} />
              </div>
            )}

            {!user ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', marginTop: '40px', gap: '30px', textAlign: 'center' }}>
                <div style={{ fontFamily: FONT_FAMILY, fontSize: '40px', fontWeight: 700, color: BLUE, letterSpacing: '-0.02em', lineHeight: 1.2, maxWidth: '800px' }}>Silakan login terlebih dahulu untuk melihat catatan Anda</div>
                <p style={{ fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 500, color: BLACK, letterSpacing: '-0.01em', lineHeight: 1.6, maxWidth: '700px', margin: 0 }}>Catatan bersifat pribadi</p>
                <Link href="/signin" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '18px 36px', backgroundColor: BLUE, color: WHITE, borderRadius: '12px', fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em', boxShadow: '0 12px 32px rgba(13,60,252,0.35)', marginTop: '20px' }}>
                  Sign In untuk Melanjutkan
                  <NorthEastArrow size={24} color={WHITE} />
                </Link>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <TopicDropdown categories={categories} notesByCategory={notesByCategory} selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <button onClick={() => { if (requireLogin('membuat grup')) { setShowInlineGroupEditor(!showInlineGroupEditor); setShowInlineNoteEditor(false); setShowHistory(false); setShowInlineEditNoteEditor(false); } }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: showInlineGroupEditor ? BLACK : BLUE, color: WHITE, border: 'none', borderRadius: '10px', fontFamily: FONT_FAMILY, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                      {showInlineGroupEditor ? 'Tutup Form Grup' : 'Buat Grup'}
                    </button>
                    <button onClick={() => { if (requireLogin('membuat catatan')) { setShowInlineNoteEditor(!showInlineNoteEditor); setShowInlineGroupEditor(false); setShowHistory(false); setShowInlineEditNoteEditor(false); } }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: showInlineNoteEditor ? BLACK : BLUE, color: WHITE, border: 'none', borderRadius: '10px', fontFamily: FONT_FAMILY, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                      {showInlineNoteEditor ? 'Tutup Form Catatan' : 'Buat Catatan'}
                    </button>
                    <button onClick={() => { setShowHistory(!showHistory); setShowInlineNoteEditor(false); setShowInlineGroupEditor(false); setShowInlineEditNoteEditor(false); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: showHistory ? BLACK : BLUE, color: WHITE, border: 'none', borderRadius: '10px', fontFamily: FONT_FAMILY, fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
                      <HistoryIcon size={18} color={WHITE} />
                      {showHistory ? 'Tutup Riwayat' : 'Riwayat Note'}
                    </button>
                  </div>
                </div>

                {showHistory && (
                  <div style={{ backgroundColor: WHITE, border: `2px solid ${BLUE}`, borderRadius: '16px', padding: '30px', marginBottom: '40px', boxShadow: '0 8px 32px rgba(13,60,252,0.15)' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: '20px' }}>Riwayat Note Tersimpan</div>
                    {notes.filter(n => (n.savedBy || []).includes(user.uid)).length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontFamily: FONT_FAMILY }}>Belum ada catatan yang disimpan.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {notes.filter(n => (n.savedBy || []).includes(user.uid)).map((n) => (
                          <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '14px 18px', backgroundColor: '#f8f9ff', borderRadius: '12px', border: `1.5px solid ${BLUE}20`, flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: BLUE, fontFamily: FONT_FAMILY, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {n.title}
                                <InstagramVerifiedReal size={24} />
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', fontFamily: FONT_FAMILY }}>{n.category || 'Tanpa kategori'} · oleh {n.userName}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button onClick={() => handleUnsaveNote(n.id!)} style={{ padding: '8px 14px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '8px', color: BLUE, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT_FAMILY }}>Hapus</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showInlineGroupEditor && (
                  <div style={{ backgroundColor: WHITE, border: `2px solid ${BLUE}`, borderRadius: '16px', padding: '30px', marginBottom: '40px', boxShadow: '0 8px 32px rgba(13,60,252,0.15)' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: '20px' }}>Buat Grup Baru</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Nama Grup" style={{ width: '100%', padding: '14px 18px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '16px', outline: 'none', fontFamily: FONT_FAMILY, fontWeight: 600 }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: '10px' }}>Pilih User dari Firebase:</div>
                        <input type="email" value={memberSearchEmail} onChange={(e) => { setMemberSearchEmail(e.target.value); handleSearchMember(e.target.value); }} placeholder="Cari email user..." style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '14px', outline: 'none', fontFamily: FONT_FAMILY, fontWeight: 500 }} />
                        {memberSearchResults.length > 0 && (
                          <div style={{ backgroundColor: '#f8f9fa', border: `1px solid ${BLUE}30`, borderRadius: '8px', marginTop: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                            {memberSearchResults.map((m) => (
                              <div key={m.uid} onClick={() => addMemberToNewGroup(m)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${BLUE}15`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: '14px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {m.displayName || m.name || m.email?.split('@')[0]}
                                    <InstagramVerifiedReal size={20} />
                                  </div>
                                  <div style={{ fontSize: '12px', color: BLUE, opacity: 0.7, fontFamily: FONT_FAMILY }}>{m.email}</div>
                                </div>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: BLUE }}>+</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {newGroupMembers.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {newGroupMembers.map((m) => (
                              <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: BLUE, color: WHITE, borderRadius: '20px', fontSize: '13px', fontFamily: FONT_FAMILY, fontWeight: 600 }}>
                                <span>{m.name}</span>
                                <span style={{ fontSize: '11px', opacity: 0.8 }}>({m.email})</span>
                                <button onClick={() => removeMemberFromNewGroup(m.uid)} style={{ background: 'transparent', border: 'none', color: WHITE, cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1 }}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
                        <button onClick={() => { setShowInlineGroupEditor(false); setNewGroupName(''); setNewGroupMembers([]); setMemberSearchEmail(''); setMemberSearchResults([]); }} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '14px', cursor: 'pointer', fontFamily: FONT_FAMILY, fontWeight: 700 }}>Batal</button>
                        <button onClick={handleCreateGroup} style={{ padding: '12px 24px', backgroundColor: BLUE, border: 'none', borderRadius: '10px', color: WHITE, fontSize: '14px', cursor: 'pointer', fontFamily: FONT_FAMILY, fontWeight: 700 }}>Buat Grup</button>
                      </div>
                    </div>
                  </div>
                )}

                {showInlineNoteEditor && (
                  <div style={{ backgroundColor: WHITE, border: `2px solid ${BLUE}`, borderRadius: '16px', padding: '30px', marginBottom: '40px', boxShadow: '0 8px 32px rgba(13,60,252,0.15)' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      Buat Catatan Baru
                      {noteLabelColor && (<span style={{ padding: '4px 12px', backgroundColor: noteLabelColor, color: BLACK, borderRadius: '4px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: FONT_FAMILY }}>Label Aktif</span>)}
                      {voiceSupported && (<button type="button" onClick={toggleVoiceInput} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: isListening ? '#EF4444' : BLUE, color: WHITE, border: 'none', borderRadius: '10px', fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>{isListening ? <StopIcon size={18} color={WHITE} /> : <MicIcon size={18} color={WHITE} />}{isListening ? 'Stop Rekam' : 'Rekam Suara'}</button>)}
                    </div>

                    {/* ===== CATATAN MIC ===== */}
                    <div style={{ padding: '12px 18px', backgroundColor: '#E0E7FF', border: `1.5px solid ${BLUE}`, borderRadius: '10px', marginBottom: '20px', fontSize: '13px', lineHeight: 1.6, color: BLUE, fontFamily: FONT_FAMILY }}>
                      <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}><MicIcon size={16} color={BLUE} />Catatan Mic (Rekam Suara)</div>
                      <div>Ucapkan <strong>judul</strong> untuk mode judul, <strong>isi</strong> untuk mode isi catatan, <strong>simpan</strong> untuk submit, <strong>batal</strong> untuk membatalkan, dan <strong>hapus semua</strong> untuk mengosongkan isi. Mic hanya tersedia di Chrome/Edge terbaru dan memerlukan izin mikrofon.</div>
                    </div>

                    {voiceStatus && (<div style={{ padding: '12px 18px', backgroundColor: isListening ? '#FEE2E2' : '#E0E7FF', border: `1.5px solid ${isListening ? '#EF4444' : BLUE}`, borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 600, color: isListening ? '#991B1B' : BLUE, fontFamily: FONT_FAMILY }}>{voiceStatus}{isListening && <span style={{ marginLeft: '10px', fontSize: '12px', opacity: 0.8 }}>(Target: {voiceTarget === 'title' ? 'Judul' : 'Isi Catatan'})</span>}</div>)}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <input type="text" value={newNote.title} onChange={(e) => setNewNote({ ...newNote, title: e.target.value })} placeholder="Judul Catatan" style={{ width: '100%', padding: '18px 20px', backgroundColor: 'transparent', border: 'none', borderBottom: `2px solid ${BLUE}`, color: BLUE, fontSize: '26px', outline: 'none', fontFamily: FONT_FAMILY, fontWeight: 700 }} />
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <select value={newNote.category} onChange={(e) => setNewNote({ ...newNote, category: e.target.value })} style={{ flex: 1, minWidth: '200px', padding: '14px 18px', backgroundColor: BLUE, border: 'none', color: WHITE, fontSize: '16px', outline: 'none', fontFamily: FONT_FAMILY, cursor: 'pointer', borderRadius: '10px', fontWeight: 600 }}>
                          <option value="">Pilih Kategori</option>
                          {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY }}>Label:</span>
                          {STABILO_COLORS.map((color) => (<button key={color.value} type="button" onClick={() => setNoteLabelColor(noteLabelColor === color.value ? '' : color.value)} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: color.value, border: noteLabelColor === color.value ? `3px solid ${BLUE}` : `2px solid ${BLUE}30`, cursor: 'pointer', padding: 0 }} title={color.name} />))}
                          {noteLabelColor && (<button type="button" onClick={() => setNoteLabelColor('')} style={{ padding: '4px 10px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '6px', color: BLUE, fontSize: '11px', fontWeight: 700, fontFamily: FONT_FAMILY, cursor: 'pointer' }}>Hapus</button>)}
                        </div>
                      </div>
                      <input type="text" value={newNote.link} onChange={(e) => setNewNote({ ...newNote, link: e.target.value })} placeholder="Link Video/Gambar (YouTube, Vimeo, dll.)" style={{ width: '100%', padding: '14px 18px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '15px', outline: 'none', fontFamily: FONT_FAMILY, fontWeight: 600 }} />
                      <NoteEditorToolbar onFormat={handleFormat} activeFormats={activeFormats} stabiloColor={stabiloColor} setStabiloColor={setStabiloColor} showStabiloPicker={showStabiloPicker} setShowStabiloPicker={setShowStabiloPicker} fontSize={fontSize} setFontSize={setFontSize} />
                      <div ref={noteEditorRef} contentEditable suppressContentEditableWarning onInput={updateActiveFormats} onKeyUp={updateActiveFormats} onMouseUp={updateActiveFormats} data-placeholder="Tulis isi catatan di sini... atau gunakan mikrofon untuk berbicara." style={{ width: '100%', minHeight: '250px', padding: '18px 20px', backgroundColor: '#fafbff', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLACK, fontSize: '16px', outline: 'none', fontFamily: FONT_FAMILY, lineHeight: 1.6, overflowY: 'auto' }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><CollabIcon size={16} color={BLUE} />Tambah Kolaborator (Opsional, dari Firebase):</div>
                        <input type="email" value={memberSearchEmail} onChange={(e) => { setMemberSearchEmail(e.target.value); handleSearchMember(e.target.value); }} placeholder="Cari email kolaborator..." style={{ width: '100%', padding: '12px 16px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '14px', outline: 'none', fontFamily: FONT_FAMILY, fontWeight: 500 }} />
                        {memberSearchResults.length > 0 && (
                          <div style={{ backgroundColor: '#f8f9fa', border: `1px solid ${BLUE}30`, borderRadius: '8px', marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                            {memberSearchResults.map((m) => (
                              <div key={m.uid} onClick={() => addMemberToNewGroup(m)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${BLUE}15`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, display: 'flex', alignItems: 'center', gap: '6px' }}>{m.displayName || m.name || m.email?.split('@')[0]}<InstagramVerifiedReal size={20} /></div>
                                  <div style={{ fontSize: '12px', color: BLUE, opacity: 0.7, fontFamily: FONT_FAMILY }}>{m.email}</div>
                                </div>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: BLUE }}>+</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {newGroupMembers.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                            {newGroupMembers.map((m) => (
                              <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: BLUE, color: WHITE, borderRadius: '20px', fontSize: '13px', fontFamily: FONT_FAMILY, fontWeight: 600 }}>
                                <span>{m.name}</span>
                                <span style={{ fontSize: '11px', opacity: 0.8 }}>({m.email})</span>
                                <button onClick={() => removeMemberFromNewGroup(m.uid)} style={{ background: 'transparent', border: 'none', color: WHITE, cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1 }}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
                        <button onClick={() => { setShowInlineNoteEditor(false); setNewNote({ title: '', category: '', link: '' }); setNoteLabelColor(''); setNewGroupMembers([]); setMemberSearchEmail(''); setMemberSearchResults([]); if (noteEditorRef.current) noteEditorRef.current.innerHTML = ''; setVoiceStatus(''); if (isListening) { try { recognitionRef.current?.stop(); } catch (e) {} setIsListening(false); } }} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '14px', cursor: 'pointer', fontFamily: FONT_FAMILY, fontWeight: 700 }}>Batal</button>
                        <button onClick={handleCreateNote} style={{ padding: '12px 24px', backgroundColor: BLUE, border: 'none', borderRadius: '10px', color: WHITE, fontSize: '14px', cursor: 'pointer', fontFamily: FONT_FAMILY, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>Simpan Catatan<NorthEastArrow size={16} color={WHITE} /></button>
                      </div>
                    </div>
                  </div>
                )}

                {showInlineEditNoteEditor && editingNoteInline && (
                  <div style={{ backgroundColor: WHITE, border: `2px solid ${BLUE}`, borderRadius: '16px', padding: '30px', marginBottom: '40px', boxShadow: '0 8px 32px rgba(13,60,252,0.15)' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: '20px' }}>Edit Catatan</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <input type="text" value={editNote.title} onChange={(e) => setEditNote({ ...editNote, title: e.target.value })} placeholder="Judul Catatan" style={{ width: '100%', padding: '18px 20px', backgroundColor: 'transparent', border: 'none', borderBottom: `2px solid ${BLUE}`, color: BLUE, fontSize: '26px', outline: 'none', fontFamily: FONT_FAMILY, fontWeight: 700 }} />
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <select value={editNote.category} onChange={(e) => setEditNote({ ...editNote, category: e.target.value })} style={{ flex: 1, minWidth: '200px', padding: '14px 18px', backgroundColor: BLUE, border: 'none', color: WHITE, fontSize: '16px', outline: 'none', fontFamily: FONT_FAMILY, cursor: 'pointer', borderRadius: '10px', fontWeight: 600 }}>
                          <option value="">Pilih Kategori</option>
                          {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
                        </select>
                      </div>
                      <input type="text" value={editNote.link} onChange={(e) => setEditNote({ ...editNote, link: e.target.value })} placeholder="Link Video/Gambar" style={{ width: '100%', padding: '14px 18px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '15px', outline: 'none', fontFamily: FONT_FAMILY, fontWeight: 600 }} />
                      <div ref={editNoteEditorRef} contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: editingNoteInline.descriptionHtml || '' }} style={{ width: '100%', minHeight: '220px', padding: '18px 20px', backgroundColor: '#fafbff', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLACK, fontSize: '16px', outline: 'none', fontFamily: FONT_FAMILY, lineHeight: 1.6, overflowY: 'auto' }} />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
                        <button onClick={() => { setShowInlineEditNoteEditor(false); setEditingNoteInline(null); setEditNote({ title: '', category: '', link: '', description: '' }); }} style={{ padding: '12px 24px', backgroundColor: 'transparent', border: `1.5px solid ${BLUE}`, borderRadius: '10px', color: BLUE, fontSize: '14px', cursor: 'pointer', fontFamily: FONT_FAMILY, fontWeight: 700 }}>Batal</button>
                        <button onClick={handleEditNote} style={{ padding: '12px 24px', backgroundColor: BLUE, border: 'none', borderRadius: '10px', color: WHITE, fontSize: '14px', cursor: 'pointer', fontFamily: FONT_FAMILY, fontWeight: 700 }}>Update Catatan</button>
                      </div>
                    </div>
                  </div>
                )}

                {groups.length > 0 && (
                  <div style={{ marginBottom: '60px' }}>
                    <h3 style={{ fontSize: '32px', fontWeight: 800, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: '20px', letterSpacing: '-0.02em' }}>Grup Anda ({groups.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {groups.map((group) => (
                        <div key={group.id} style={{ backgroundColor: BLUE, borderRadius: '28px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: `0 8px 32px ${BLUE}40` }}>
                          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '10px', padding: '8px 22px', backgroundColor: WHITE, color: BLUE, borderRadius: '24px 4px 24px 24px', fontFamily: FONT_FAMILY, fontSize: '15px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: `2px solid ${WHITE}`, boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>Grup</div>
                          <div style={{ padding: '18px 24px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '6px 28px 28px 28px', boxShadow: `0 6px 20px rgba(0,0,0,0.12)`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <span style={{ fontSize: '30px', fontFamily: FONT_FAMILY, lineHeight: '1.25', color: BLUE, fontWeight: 800, flex: 1, minWidth: 0, wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '10px' }}>{group.name}<InstagramVerifiedReal size={28} /></span>
                            <span style={{ padding: '4px 12px', backgroundColor: BLUE, color: WHITE, borderRadius: '20px', fontSize: '12px', fontWeight: 800, fontFamily: FONT_FAMILY }}>{group.members?.length || 0} members</span>
                          </div>
                          <div style={{ padding: '20px 24px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '28px 6px 28px 28px', boxShadow: `0 6px 20px rgba(0,0,0,0.12)`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: BLUE, fontFamily: FONT_FAMILY, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Anggota Grup</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              {(group.members || []).map((memberId) => {
                                const memberName = group.memberNames?.[memberId] || 'User';
                                const memberEmail = group.memberEmails?.[memberId] || '';
                                return (
                                  <div key={memberId} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '8px 16px', backgroundColor: '#F0F4FF', border: `1.5px solid ${BLUE}30`, borderRadius: '20px 4px 20px 20px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: BLUE, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, fontFamily: FONT_FAMILY }}>{memberName.charAt(0).toUpperCase()}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '13px', fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, display: 'flex', alignItems: 'center', gap: '6px' }}>{memberName}<InstagramVerifiedReal size={20} /></span>
                                      {memberEmail && (<span style={{ fontSize: '11px', color: BLUE, opacity: 0.7, fontFamily: FONT_FAMILY }}>{memberEmail}</span>)}
                                    </div>
                                    {memberId === group.ownerId && (<span style={{ fontSize: '9px', fontWeight: 800, color: WHITE, backgroundColor: BLUE, padding: '2px 8px', borderRadius: '10px', fontFamily: FONT_FAMILY }}>OWNER</span>)}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '20px 4px 20px 20px', fontSize: '14px', color: BLUE, fontWeight: 700, fontFamily: FONT_FAMILY, boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>{formatDate(group.createdAt)}</div>
                            <button onClick={() => openGroupChat(group)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '20px', fontSize: '14px', color: BLUE, fontWeight: 700, fontFamily: FONT_FAMILY, cursor: 'pointer', boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>Buka Chat</button>
                            {group.ownerId === user?.uid && (<button onClick={() => handleDeleteGroup(group.id!)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '4px 20px 20px 20px', fontSize: '14px', color: RED, fontWeight: 700, fontFamily: FONT_FAMILY, cursor: 'pointer', boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>Hapus Grup</button>)}
                          </div>
                          {selectedGroup?.id === group.id && (
                            <div style={{ padding: '18px 20px', backgroundColor: WHITE, borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ fontSize: '16px', fontWeight: 800, color: BLUE, fontFamily: FONT_FAMILY }}>Chat Grup</div>
                              <div ref={groupChatContainerRef} style={{ maxHeight: '420px', overflowY: 'auto', padding: '8px 0' }}>
                                {(groupMessages[group.id!] || []).length === 0 ? (
                                  <div style={{ textAlign: 'center', color: '#999', fontSize: '13px', padding: '20px 0', fontFamily: FONT_FAMILY }}>Belum ada pesan. Mulai kirim pesan!</div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {(groupMessages[group.id!] || []).map((msg, idx, arr) => {
                                      const isMine = msg.senderId === user?.uid;
                                      const status = getGroupMessageStatus(msg);
                                      const isLast = idx === arr.length - 1;
                                      return (
                                        <div key={msg.id || idx} style={{ display: 'flex', alignItems: 'stretch', gap: '12px', flexDirection: isMine ? 'row-reverse' : 'row', marginBottom: isLast ? 0 : '0' }}>
                                          {/* KOLOM TITIK BULAT + GARIS PATAH-PATAH (NYAMBUNG) */}
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
                                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: BLUE, marginTop: '8px', flexShrink: 0 }} />
                                            {!isLast && (
                                              <div style={{ width: '3px', flex: 1, minHeight: '40px', marginTop: '4px', backgroundImage: `repeating-linear-gradient(to bottom, ${BLUE} 0px, ${BLUE} 10px, transparent 10px, transparent 20px)` }} />
                                            )}
                                          </div>
                                          <div style={{ flex: 1, minWidth: 0, maxWidth: '78%', paddingBottom: isLast ? 0 : '12px' }}>
                                            <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: isMine ? BLUE : '#F1F5FF', color: isMine ? WHITE : BLACK, fontFamily: FONT_FAMILY, fontSize: '13px', wordBreak: 'break-word', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                              {!isMine && (<div style={{ fontSize: '11px', fontWeight: 800, color: BLUE, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>{msg.senderName}<InstagramVerifiedReal size={18} /></div>)}
                                              {msg.replyTo && (<div style={{ padding: '4px 8px', marginBottom: '4px', backgroundColor: isMine ? 'rgba(255,255,255,0.18)' : 'rgba(13,60,252,0.08)', borderLeft: `2px solid ${isMine ? WHITE : BLUE}`, borderRadius: '4px', fontSize: '10px', fontStyle: 'italic' }}><strong>{msg.replyTo.senderName}:</strong> {msg.replyTo.text}</div>)}
                                              <div>{msg.text}</div>
                                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '9px', color: isMine ? 'rgba(255,255,255,0.8)' : '#888' }}>
                                                <button onClick={() => { setGroupReplyTo({ id: msg.id, senderName: msg.senderName, text: msg.text }); groupInputRef.current?.focus(); }} style={{ background: 'transparent', border: 'none', color: isMine ? 'rgba(255,255,255,0.8)' : '#666', cursor: 'pointer', fontSize: '9px', padding: 0, fontFamily: FONT_FAMILY }}>reply</button>
                                                <span>{formatTime(msg.timestamp)}</span>
                                                {isMine && <span style={{ display: 'inline-flex' }}>{renderGroupMessageStatusIcon(status)}</span>}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                {(groupTyping[group.id!] || []).length > 0 && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: BLUE, fontFamily: FONT_FAMILY, paddingLeft: '36px', marginTop: '8px' }}>
                                    <BlinkingDot size={6} color={BLUE} />
                                    {(groupTyping[group.id!] || []).map(t => t.name).join(', ')} sedang mengetik...
                                  </div>
                                )}
                              </div>
                              {groupReplyTo && (<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#F0F4FF', borderRadius: '8px' }}><div style={{ flex: 1, fontSize: '11px', color: BLUE, fontFamily: FONT_FAMILY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>{groupReplyTo.senderName}:</strong> {groupReplyTo.text}</div><button onClick={() => setGroupReplyTo(null)} style={{ background: 'transparent', border: 'none', color: BLUE, cursor: 'pointer', fontSize: '16px' }}>×</button></div>)}
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input ref={groupInputRef} type="text" value={groupMessageText} onChange={handleGroupTyping} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendGroupMessage(); } }} placeholder="Ketik pesan grup..." style={{ flex: 1, padding: '12px 16px', border: `1.5px solid ${BLUE}`, borderRadius: '10px', fontSize: '13px', outline: 'none', fontFamily: FONT_FAMILY, backgroundColor: WHITE, color: BLACK }} />
                                <button onClick={sendGroupMessage} disabled={!groupMessageText.trim()} style={{ padding: '12px 20px', backgroundColor: groupMessageText.trim() ? BLUE : '#ccc', color: WHITE, border: 'none', borderRadius: '10px', cursor: groupMessageText.trim() ? 'pointer' : 'not-allowed', fontFamily: FONT_FAMILY, fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SendIcon size={14} color={WHITE} /> Kirim</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', fontSize: '26px', fontFamily: FONT_FAMILY, color: BLUE, fontWeight: 700 }}>Memuat catatan...</div>
                ) : filteredNotes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '120px 20px', fontFamily: FONT_FAMILY }}>
                    <div style={{ fontSize: '32px', color: BLUE, marginBottom: '20px', fontWeight: 700 }}>{selectedTopic ? `Belum ada catatan di topik ${selectedTopic}` : 'Belum ada catatan'}</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0', fontFamily: FONT_FAMILY, position: 'relative' }}>
                    {filteredNotes.map((note, noteIndex) => {
                      const videoEmbedUrl = getVideoEmbedUrl(note.link);
                      const isSaved = note.savedBy && user && note.savedBy.includes(user.uid);
                      const userCanEdit = canEditNote(note);
                      const resultNumber = String(noteIndex + 1).padStart(2, '0');
                      const isLast = noteIndex === filteredNotes.length - 1;
                      return (
                        <div key={note.id} style={{ display: 'flex', gap: '0', alignItems: 'stretch', fontFamily: FONT_FAMILY, position: 'relative' }}>
                          <div style={{ width: '320px', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', paddingRight: '40px' }}>
                            <div style={{ fontSize: '200px', fontWeight: 400, fontFamily: FONT_FAMILY, color: BLUE, lineHeight: 0.85, letterSpacing: '-0.05em', paddingTop: '10px', zIndex: 2, position: 'relative', flexShrink: 0 }}>{resultNumber}</div>
                            <div style={{ position: 'absolute', top: 0, right: '20px', bottom: 0, width: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: BLUE, flexShrink: 0, zIndex: 3, marginTop: '40px' }} />
                              <div style={{ flex: 1, width: '3px', backgroundImage: `repeating-linear-gradient(to bottom, ${BLUE} 0px, ${BLUE} 12px, transparent 12px, transparent 24px)` }} />
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? '0' : '40px' }}>
                            <div style={{ backgroundColor: BLUE, borderRadius: '28px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: `0 8px 32px ${BLUE}40` }}>
                              {note.category && (<div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '8px', padding: '8px 22px', backgroundColor: WHITE, color: BLUE, borderRadius: '24px 4px 24px 24px', fontFamily: FONT_FAMILY, fontSize: '15px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: `2px solid ${WHITE}`, boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>{note.category}</div>)}
                              <div style={{ padding: '18px 24px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '6px 28px 28px 28px', boxShadow: `0 6px 20px rgba(0,0,0,0.12)`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <span style={{ fontSize: '34px', fontFamily: FONT_FAMILY, lineHeight: '1.25', color: BLUE, fontWeight: 800, flex: 1, minWidth: 0, wordBreak: 'break-word' }}>{note.title}</span>
                                {note.collaborators && note.collaborators.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                                    {note.collaborators.map((cid) => {
                                      const cname = note.collaboratorNames?.[cid] || 'User';
                                      return (
                                        <span key={cid} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: BLUE, color: WHITE, borderRadius: '12px', fontSize: '11px', fontWeight: 700, fontFamily: FONT_FAMILY }}>
                                          Kolaborator: {cname}
                                          <InstagramVerifiedReal size={16} />
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              {(note.descriptionHtml || note.description) && (
                                <div style={{ padding: '20px 24px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '28px 6px 28px 28px', boxShadow: `0 6px 20px rgba(0,0,0,0.12)` }}>
                                  {note.descriptionHtml ? (<div className="note-description-html" dangerouslySetInnerHTML={{ __html: note.descriptionHtml }} style={{ fontSize: '17px', fontFamily: FONT_FAMILY, lineHeight: '1.7', color: BLACK, wordBreak: 'break-word' }} />) : (<div style={{ fontSize: '17px', fontFamily: FONT_FAMILY, lineHeight: '1.7', color: BLACK, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{note.description}</div>)}
                                </div>
                              )}
                              {videoEmbedUrl && (
                                <div style={{ margin: '4px 0', position: 'relative' }}>
                                  {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (<div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', backgroundColor: '#000', borderRadius: '20px' }}><iframe src={videoEmbedUrl} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen /></div>) : (<div style={{ position: 'relative', backgroundColor: '#000', borderRadius: '20px', overflow: 'hidden' }}><video ref={(el) => { if (note.id) videoRefs.current[note.id] = el; }} src={videoEmbedUrl} style={{ width: '100%', maxWidth: '600px', height: 'auto', aspectRatio: '16/9', backgroundColor: '#000', cursor: 'pointer' }} onClick={() => togglePlayPause(note.id!)} controls /></div>)}
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '20px 4px 20px 20px', fontSize: '14px', color: BLUE, fontWeight: 700, fontFamily: FONT_FAMILY, boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>{formatDate(note.updatedAt)}</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: WHITE, border: `2px solid ${WHITE}`, borderRadius: '4px 20px 20px 20px', fontSize: '14px', color: BLUE, fontWeight: 700, fontFamily: FONT_FAMILY, boxShadow: `0 4px 12px rgba(0,0,0,0.1)` }}>oleh {note.userName}<InstagramVerifiedReal size={22} /></div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', paddingTop: '4px' }}>
                                <button onClick={() => handleSaveNote(note.id!)} style={{ backgroundColor: 'transparent', border: 'none', color: WHITE, fontSize: '22px', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSaved ? 0.5 : 1 }}><svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? WHITE : 'none'} stroke={WHITE} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg></button>
                                {userCanEdit && (<button onClick={() => { setEditingNoteInline(note); setEditNote({ title: note.title, category: note.category, link: note.link || '', description: note.description || '' }); setShowInlineEditNoteEditor(true); setShowInlineNoteEditor(false); setShowInlineGroupEditor(false); setShowHistory(false); }} style={{ backgroundColor: 'transparent', border: 'none', color: WHITE, fontSize: '22px', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg></button>)}
                                {note.userId === user?.uid && (<button onClick={() => handleDeleteNote(note.id!)} style={{ backgroundColor: 'transparent', border: 'none', color: WHITE, fontSize: '32px', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>×</button>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          <FooterSection />
        </div>
      </div>

      <style jsx global>{`
        html { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; height: 100% !important; }
        html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        body { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; margin: 0; padding: 0; background-color: #ffffff !important; min-height: 100% !important; height: auto !important; }
        body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { background-color: transparent; }
        .footer-menuru-char { display: inline-block; will-change: transform, opacity; color: #0d3cfc !important; transform-origin: 50% 100%; }
        .note-description-html b, .note-description-html strong { font-weight: 700; }
        .note-description-html i, .note-description-html em { font-style: italic; }
        .note-description-html u { text-decoration: underline; }
        .note-description-html ul { padding-left: 24px; margin: 8px 0; }
        .note-description-html li { margin-bottom: 4px; }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #999; pointer-events: none; font-style: italic; }
        @keyframes blinking-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.75); } }
      `}</style>
    </>
  );
}

// ===== SAY HEY SECTION (disimpan ringkas) =====
function SayHeySectionSimple({ user, db, isAdmin, onUnreadCountChange }: any) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOwner = isAdmin;

  useEffect(() => { getCryptoKey().then(() => setEncryptionReady(true)).catch(() => setEncryptionReady(true)); }, []);

  useEffect(() => {
    if (!db || !user) return;
    let q;
    if (isOwner) q = query(collection(db, 'users'), where('online', '==', true));
    else q = query(collection(db, 'users'), where('online', '==', true), where('email', '==', OWNER_EMAIL));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const list: any[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (isOwner) { if (docSnap.id === user.uid) return; if (data.email === ADMIN_EMAIL) return; }
        list.push({ uid: docSnap.id, displayName: data.displayName || data.name || data.email || 'User', email: data.email || '', photoURL: data.photoURL || '', online: data.online || false });
      });
      setContacts(list);
    });
    return () => unsub();
  }, [db, user, isOwner]);

  useEffect(() => {
    if (!db || !ticket) return;
    const q = query(collection(db, 'sayhey_tickets', ticket.id, 'messages'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, async (snapshot: any) => {
      const list: any[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let text = data.text || '';
        if (data.isEncrypted) { try { text = await decryptMessage(text); } catch { text = '[Encrypted]'; } }
        list.push({ id: docSnap.id, ...data, text });
      }
      setMessages(list);
      requestAnimationFrame(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; });
    });
    return () => unsub();
  }, [db, ticket]);

  const openChatWith = async (contact: any) => {
    if (!db || !user) return;
    setSelectedContact(contact);
    try {
      const existingQ = isOwner
        ? query(collection(db, 'sayhey_tickets'), where('userId', '==', contact.uid), where('ownerId', '==', user.uid))
        : query(collection(db, 'sayhey_tickets'), where('userId', '==', user.uid), where('ownerId', '==', contact.uid));
      const existingSnap = await new Promise<any>((resolve) => {
        const unsub = onSnapshot(existingQ, (snap: any) => { unsub(); resolve(snap); });
      });
      if (!existingSnap.empty) { const docSnap = existingSnap.docs[0]; setTicket({ id: docSnap.id, ...docSnap.data() }); return; }
      const ticketRef = await addDoc(collection(db, 'sayhey_tickets'), {
        userId: isOwner ? contact.uid : user.uid,
        userName: isOwner ? contact.displayName : user.displayName,
        userEmail: isOwner ? contact.email : user.email,
        userPhoto: isOwner ? contact.photoURL : user.photoURL,
        ownerId: isOwner ? user.uid : contact.uid,
        ownerName: isOwner ? user.displayName : contact.displayName,
        ownerEmail: isOwner ? user.email : contact.email,
        ownerPhoto: isOwner ? user.photoURL : contact.photoURL,
        status: 'active', createdAt: serverTimestamp(), lastMessage: '', lastMessageTime: serverTimestamp(), lastMessageSender: '',
        typing: false, typingUserId: null, typingUserName: null, userUnreadCount: 0, ownerUnreadCount: 0,
      });
      const initialMessage = `Hey!`;
      const encryptedMessage = await encryptMessage(initialMessage);
      await addDoc(collection(db, 'sayhey_tickets', ticketRef.id, 'messages'), { senderId: user.uid, senderName: user.displayName || user.email || 'User', text: encryptedMessage, timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: 'sent' });
      await updateDoc(ticketRef, { lastMessage: initialMessage, lastMessageTime: serverTimestamp(), lastMessageSender: user.displayName || user.email || 'User' });
      const newTicketSnap = await getDoc(ticketRef);
      setTicket({ id: newTicketSnap.id, ...newTicketSnap.data() });
    } catch (error) { console.error(error); }
  };

  const sendMessage = async () => {
    if (!db || !ticket || !messageText.trim() || !user || !encryptionReady) return;
    try {
      const ticketRef = doc(db, 'sayhey_tickets', ticket.id);
      const senderName = isAdmin ? `${OWNER_NAME} (Admin)` : user.displayName || user.email || 'User';
      const encryptedMessage = await encryptMessage(messageText.trim());
      await addDoc(collection(db, 'sayhey_tickets', ticket.id, 'messages'), {
        senderId: user.uid, senderName, text: encryptedMessage, timestamp: serverTimestamp(), read: false, isEncrypted: true, deliveryStatus: 'sent', isAdmin,
        replyTo: replyTo ? { messageId: replyTo.id, senderName: replyTo.senderName, text: replyTo.text } : null,
      });
      const updatePayload: any = { lastMessage: messageText.trim(), lastMessageTime: serverTimestamp(), lastMessageSender: senderName };
      if (isOwner) updatePayload.userUnreadCount = (ticket.userUnreadCount || 0) + 1;
      else updatePayload.ownerUnreadCount = (ticket.ownerUnreadCount || 0) + 1;
      await updateDoc(ticketRef, updatePayload);
      setMessageText('');
      setReplyTo(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) { console.error(error); }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div style={{ width: '100%', backgroundColor: BLUE, borderRadius: '20px', padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', fontFamily: FONT_FAMILY, color: WHITE, marginBottom: '40px', minHeight: '300px' }}>
        <SayHeyIcon size={64} color={WHITE} />
        <h3 style={{ fontSize: '48px', fontWeight: 700, color: WHITE, margin: 0, letterSpacing: '-0.02em', textAlign: 'center', fontFamily: FONT_FAMILY }}>Say Hey</h3>
        <p style={{ fontSize: '18px', fontWeight: 500, color: WHITE, margin: 0, textAlign: 'center', maxWidth: '600px', lineHeight: 1.5, opacity: 0.95, fontFamily: FONT_FAMILY }}>Please sign in to your account to start a real-time conversation.</p>
        <Link href="/signin" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', backgroundColor: WHITE, color: BLUE, borderRadius: '12px', fontSize: '16px', fontWeight: 800, fontFamily: FONT_FAMILY, letterSpacing: '0.02em', marginTop: '10px' }}>Sign In to Continue<NorthEastArrow size={20} color={BLUE} /></Link>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', backgroundColor: BLUE, borderRadius: '20px', padding: '20px', fontFamily: FONT_FAMILY, color: WHITE, marginBottom: '40px', minHeight: '600px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <SayHeyIcon size={32} color={WHITE} />
          <h3 style={{ fontSize: '32px', fontWeight: 700, color: WHITE, margin: 0, letterSpacing: '-0.02em', fontFamily: FONT_FAMILY }}>Say Hey</h3>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', minHeight: '700px', flexWrap: 'wrap' }}>
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: WHITE, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          <div style={{ padding: '10px 12px', backgroundColor: BLUE, color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: WHITE, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: FONT_FAMILY }}>Kontak</span>
            <span style={{ fontSize: '10px', color: BLUE, padding: '2px 7px', borderRadius: '8px', backgroundColor: WHITE, fontWeight: 800 }}>{contacts.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: WHITE, padding: '8px 10px' }}>
            {contacts.length === 0 ? (<div style={{ padding: '14px', textAlign: 'center', fontSize: '11px', color: BLUE, fontFamily: FONT_FAMILY, opacity: 0.7 }}>{isOwner ? 'No users online.' : 'Owner is currently offline.'}</div>) : contacts.map((c) => (
              <div key={c.uid} onClick={() => openChatWith(c)} style={{ padding: '8px 6px', borderBottom: `1px solid rgba(0,0,0,0.05)`, display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: selectedContact?.uid === c.uid ? 'rgba(13,60,252,0.08)' : 'transparent', borderRadius: '6px', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', backgroundColor: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.photoURL ? (<img src={c.photoURL} alt={c.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (<span style={{ fontSize: '14px', fontWeight: 800, color: WHITE }}>{c.displayName.charAt(0).toUpperCase()}</span>)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: BLUE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONT_FAMILY }}>{c.displayName}</span>
                    {(c.email === ADMIN_EMAIL || c.email === OWNER_EMAIL) && (<InstagramVerifiedReal size={18} />)}
                  </div>
                  <div style={{ fontSize: '10px', color: BLUE, fontFamily: FONT_FAMILY, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, opacity: 0.85 }}>
                    <BlinkingDot size={6} color={BLUE} />
                    {c.online ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: WHITE, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '700px', color: BLACK, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          {!ticket || !selectedContact ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#999', fontSize: '14px', fontFamily: FONT_FAMILY, padding: '20px', textAlign: 'center' }}>
              <SayHeyIcon size={40} color="#ccc" />
              <span>{isOwner ? 'Pilih user online untuk mulai chat' : 'Pilih owner untuk mulai chat'}</span>
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', backgroundColor: BLUE, color: WHITE, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', backgroundColor: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selectedContact.photoURL ? (<img src={selectedContact.photoURL} alt={selectedContact.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (<span style={{ fontSize: '14px', fontWeight: 800, color: BLUE }}>{(selectedContact.displayName || 'U').charAt(0).toUpperCase()}</span>)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: WHITE, fontFamily: FONT_FAMILY, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedContact.displayName}
                  {(selectedContact.email === ADMIN_EMAIL || selectedContact.email === OWNER_EMAIL) && (<InstagramVerifiedReal size={20} />)}
                </div>
              </div>
              <div ref={chatContainerRef} className="chat-messages-container" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, backgroundColor: WHITE }}>
                {messages.length === 0 ? (<div style={{ textAlign: 'center', color: '#999', fontSize: '13px', padding: '30px 0', fontFamily: FONT_FAMILY }}>No messages yet. Say hey!</div>) : messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.uid;
                  const msgIsAdmin = msg.isAdmin || msg.senderName?.includes('(Admin)');
                  return (
                    <div key={msg.id || idx} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: msgIsAdmin ? '#FEF3C7' : (isMine ? BLUE : '#ffffff'), color: msgIsAdmin ? BLACK : (isMine ? WHITE : BLACK), fontSize: '13px', fontFamily: FONT_FAMILY, wordBreak: 'break-word', border: msgIsAdmin ? `1.5px solid #F59E0B` : (isMine ? 'none' : '1px solid rgba(0,0,0,0.06)') }}>
                        {!isMine && (<div style={{ fontSize: '11px', fontWeight: 700, color: msgIsAdmin ? '#92400E' : BLUE, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>{msg.senderName}{msgIsAdmin && <InstagramVerifiedReal size={18} />}</div>)}
                        <div>{msg.text}</div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                          <button onClick={() => setReplyTo(msg)} style={{ background: 'transparent', border: 'none', color: isMine ? 'rgba(255,255,255,0.7)' : '#666', cursor: 'pointer', fontSize: '9px', fontFamily: FONT_FAMILY, padding: 0, fontWeight: 600 }}>reply</button>
                          <span style={{ fontSize: '9px', color: msgIsAdmin ? '#92400E' : (isMine ? 'rgba(255,255,255,0.85)' : '#999') }}>{formatTime(msg.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '8px', backgroundColor: WHITE, flexShrink: 0 }}>
                <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) { e.preventDefault(); sendMessage(); } }} placeholder="Type your message..." style={{ flex: 1, padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: FONT_FAMILY, backgroundColor: WHITE, color: BLACK }} />
                <button onClick={sendMessage} disabled={!messageText.trim()} style={{ padding: '10px 20px', backgroundColor: messageText.trim() ? BLUE : '#ccc', color: WHITE, border: 'none', borderRadius: '8px', cursor: messageText.trim() ? 'pointer' : 'not-allowed', fontFamily: FONT_FAMILY, fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
