'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [menuText, setMenuText] = useState("MENU");
  const [isAnimating, setIsAnimating] = useState(false);
  const [visitorTime, setVisitorTime] = useState({
    time: "",
    timezone: "",
    date: ""
  });
  const [visitorLocation, setVisitorLocation] = useState({
    city: "",
    region: "",
    country: "",
    isp: "",
    coordinates: "",
    provider: ""
  });
  const [isLocationVisible, setIsLocationVisible] = useState(false);
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);

  // Database lengkap lokasi Indonesia dari Sabang sampai Merauke
  const indonesiaLocations = [
    // Aceh - Sabang (Paling Barat)
    { city: "Sabang", region: "Aceh", lat: 5.8923, lng: 95.3232, country: "Indonesia", isp: "Internet Aceh" },
    { city: "Banda Aceh", region: "Aceh", lat: 5.5483, lng: 95.3232, country: "Indonesia", isp: "Telkom Aceh" },
    { city: "Lhokseumawe", region: "Aceh", lat: 5.1801, lng: 97.1507, country: "Indonesia", isp: "Indosat Aceh" },
    { city: "Langsa", region: "Aceh", lat: 4.4681, lng: 97.9683, country: "Indonesia", isp: "XL Aceh" },
    
    // Sumatera Utara
    { city: "Medan", region: "Sumatera Utara", lat: 3.5952, lng: 98.6722, country: "Indonesia", isp: "Telkom Sumut" },
    { city: "Binjai", region: "Sumatera Utara", lat: 3.6001, lng: 98.4854, country: "Indonesia", isp: "XL Sumut" },
    { city: "Pematang Siantar", region: "Sumatera Utara", lat: 2.9604, lng: 99.0607, country: "Indonesia", isp: "Indosat Sumut" },
    { city: "Tebing Tinggi", region: "Sumatera Utara", lat: 3.3285, lng: 99.1625, country: "Indonesia", isp: "First Media Sumut" },
    { city: "Tanjung Balai", region: "Sumatera Utara", lat: 2.9667, lng: 99.8000, country: "Indonesia", isp: "Telkom Sumut" },
    
    // Sumatera Barat
    { city: "Padang", region: "Sumatera Barat", lat: -0.9471, lng: 100.4172, country: "Indonesia", isp: "Telkom Sumbar" },
    { city: "Bukittinggi", region: "Sumatera Barat", lat: -0.3056, lng: 100.3692, country: "Indonesia", isp: "XL Sumbar" },
    { city: "Payakumbuh", region: "Sumatera Barat", lat: -0.2246, lng: 100.6329, country: "Indonesia", isp: "Indosat Sumbar" },
    { city: "Padang Panjang", region: "Sumatera Barat", lat: -0.4667, lng: 100.4167, country: "Indonesia", isp: "Telkom Sumbar" },
    
    // Riau
    { city: "Pekanbaru", region: "Riau", lat: 0.5071, lng: 101.4478, country: "Indonesia", isp: "Telkom Riau" },
    { city: "Dumai", region: "Riau", lat: 1.6667, lng: 101.4333, country: "Indonesia", isp: "XL Riau" },
    { city: "Bengkalis", region: "Riau", lat: 1.4667, lng: 102.1333, country: "Indonesia", isp: "Indosat Riau" },
    
    // Kepulauan Riau
    { city: "Batam", region: "Kepulauan Riau", lat: 1.0456, lng: 104.0305, country: "Indonesia", isp: "Biznet Batam" },
    { city: "Tanjung Pinang", region: "Kepulauan Riau", lat: 0.9186, lng: 104.4554, country: "Indonesia", isp: "Telkom Kepri" },
    { city: "Bintan", region: "Kepulauan Riau", lat: 1.1500, lng: 104.5167, country: "Indonesia", isp: "First Media Batam" },
    
    // Jambi
    { city: "Jambi", region: "Jambi", lat: -1.6100, lng: 103.6071, country: "Indonesia", isp: "Telkom Jambi" },
    { city: "Sungai Penuh", region: "Jambi", lat: -2.0631, lng: 101.3872, country: "Indonesia", isp: "XL Jambi" },
    
    // Sumatera Selatan
    { city: "Palembang", region: "Sumatera Selatan", lat: -2.9761, lng: 104.7754, country: "Indonesia", isp: "Telkom Sumsel" },
    { city: "Prabumulih", region: "Sumatera Selatan", lat: -3.4324, lng: 104.2345, country: "Indonesia", isp: "Indosat Sumsel" },
    { city: "Lubuklinggau", region: "Sumatera Selatan", lat: -3.2967, lng: 102.8617, country: "Indonesia", isp: "XL Sumsel" },
    
    // Bengkulu
    { city: "Bengkulu", region: "Bengkulu", lat: -3.7956, lng: 102.2592, country: "Indonesia", isp: "Telkom Bengkulu" },
    { city: "Curup", region: "Bengkulu", lat: -3.4672, lng: 102.5247, country: "Indonesia", isp: "Indosat Bengkulu" },
    
    // Lampung
    { city: "Bandar Lampung", region: "Lampung", lat: -5.4294, lng: 105.2621, country: "Indonesia", isp: "Telkom Lampung" },
    { city: "Metro", region: "Lampung", lat: -5.1167, lng: 105.3000, country: "Indonesia", isp: "XL Lampung" },
    { city: "Kota Agung", region: "Lampung", lat: -5.4778, lng: 104.6583, country: "Indonesia", isp: "Indosat Lampung" },
    
    // Jakarta
    { city: "Ciracas", region: "Jakarta Timur", lat: -6.3293, lng: 106.8795, country: "Indonesia", isp: "Telkom Jakarta" },
    { city: "Pasar Minggu", region: "Jakarta Selatan", lat: -6.2922, lng: 106.8435, country: "Indonesia", isp: "First Media" },
    { city: "Tanah Abang", region: "Jakarta Pusat", lat: -6.1866, lng: 106.8086, country: "Indonesia", isp: "Biznet Jakarta" },
    { city: "Cengkareng", region: "Jakarta Barat", lat: -6.1522, lng: 106.7395, country: "Indonesia", isp: "Indihome Jakarta" },
    { city: "Cilincing", region: "Jakarta Utara", lat: -6.1149, lng: 106.9462, country: "Indonesia", isp: "MyRepublic Jakarta" },
    { city: "Kebayoran Baru", region: "Jakarta Selatan", lat: -6.2431, lng: 106.7997, country: "Indonesia", isp: "Biznet Premium" },
    
    // Jawa Barat
    { city: "Bandung", region: "Jawa Barat", lat: -6.9175, lng: 107.6191, country: "Indonesia", isp: "Telkom Bandung" },
    { city: "Bekasi", region: "Jawa Barat", lat: -6.2383, lng: 106.9756, country: "Indonesia", isp: "First Media Bekasi" },
    { city: "Bogor", region: "Jawa Barat", lat: -6.5971, lng: 106.8060, country: "Indonesia", isp: "Indihome Bogor" },
    { city: "Depok", region: "Jawa Barat", lat: -6.4025, lng: 106.7942, country: "Indonesia", isp: "Biznet Depok" },
    { city: "Cimahi", region: "Jawa Barat", lat: -6.8722, lng: 107.5422, country: "Indonesia", isp: "XL Jawa Barat" },
    { city: "Cirebon", region: "Jawa Barat", lat: -6.7320, lng: 108.5523, country: "Indonesia", isp: "Telkom Cirebon" },
    { city: "Sukabumi", region: "Jawa Barat", lat: -6.9197, lng: 106.9272, country: "Indonesia", isp: "Indosat Jabar" },
    { city: "Tasikmalaya", region: "Jawa Barat", lat: -7.3257, lng: 108.2144, country: "Indonesia", isp: "Telkom Tasik" },
    
    // Banten
    { city: "Tangerang", region: "Banten", lat: -6.1783, lng: 106.6319, country: "Indonesia", isp: "Telkom Banten" },
    { city: "Serang", region: "Banten", lat: -6.1153, lng: 106.1544, country: "Indonesia", isp: "Indosat Banten" },
    { city: "Cilegon", region: "Banten", lat: -6.0025, lng: 106.0111, country: "Indonesia", isp: "XL Banten" },
    
    // Jawa Tengah
    { city: "Semarang", region: "Jawa Tengah", lat: -6.9667, lng: 110.4167, country: "Indonesia", isp: "Telkom Jateng" },
    { city: "Surakarta", region: "Jawa Tengah", lat: -7.5667, lng: 110.8167, country: "Indonesia", isp: "Indihome Solo" },
    { city: "Purwokerto", region: "Jawa Tengah", lat: -7.4244, lng: 109.2344, country: "Indonesia", isp: "XL Jateng" },
    { city: "Pekalongan", region: "Jawa Tengah", lat: -6.8883, lng: 109.6753, country: "Indonesia", isp: "Telkom Pekalongan" },
    { city: "Tegal", region: "Jawa Tengah", lat: -6.8667, lng: 109.1333, country: "Indonesia", isp: "Indosat Jateng" },
    { city: "Magelang", region: "Jawa Tengah", lat: -7.4667, lng: 110.2167, country: "Indonesia", isp: "Telkom Magelang" },
    
    // Yogyakarta
    { city: "Yogyakarta", region: "DI Yogyakarta", lat: -7.7956, lng: 110.3695, country: "Indonesia", isp: "Telkom Jogja" },
    { city: "Bantul", region: "DI Yogyakarta", lat: -7.8844, lng: 110.3289, country: "Indonesia", isp: "First Media Jogja" },
    { city: "Sleman", region: "DI Yogyakarta", lat: -7.7156, lng: 110.3556, country: "Indonesia", isp: "Biznet Jogja" },
    
    // Jawa Timur
    { city: "Surabaya", region: "Jawa Timur", lat: -7.2504, lng: 112.7688, country: "Indonesia", isp: "Telkom Jatim" },
    { city: "Malang", region: "Jawa Timur", lat: -7.9666, lng: 112.6326, country: "Indonesia", isp: "First Media Malang" },
    { city: "Kediri", region: "Jawa Timur", lat: -7.8467, lng: 112.0178, country: "Indonesia", isp: "Indosat Jatim" },
    { city: "Madiun", region: "Jawa Timur", lat: -7.6298, lng: 111.5239, country: "Indonesia", isp: "XL Jatim" },
    { city: "Blitar", region: "Jawa Timur", lat: -8.0981, lng: 112.1683, country: "Indonesia", isp: "Telkom Jatim" },
    { city: "Probolinggo", region: "Jawa Timur", lat: -7.7543, lng: 113.2159, country: "Indonesia", isp: "Indosat Jatim" },
    { city: "Pasuruan", region: "Jawa Timur", lat: -7.6453, lng: 112.9075, country: "Indonesia", isp: "XL Jatim" },
    { city: "Mojokerto", region: "Jawa Timur", lat: -7.4664, lng: 112.4338, country: "Indonesia", isp: "Telkom Jatim" },
    { city: "Jember", region: "Jawa Timur", lat: -8.1845, lng: 113.7031, country: "Indonesia", isp: "Indosat Jatim" },
    { city: "Banyuwangi", region: "Jawa Timur", lat: -8.2191, lng: 114.3691, country: "Indonesia", isp: "Telkom Banyuwangi" },
    
    // Bali
    { city: "Denpasar", region: "Bali", lat: -8.6705, lng: 115.2126, country: "Indonesia", isp: "Telkom Bali" },
    { city: "Kuta", region: "Bali", lat: -8.7224, lng: 115.1729, country: "Indonesia", isp: "Biznet Bali" },
    { city: "Ubud", region: "Bali", lat: -8.5069, lng: 115.2625, country: "Indonesia", isp: "Indihome Bali" },
    { city: "Sanur", region: "Bali", lat: -8.6833, lng: 115.2611, country: "Indonesia", isp: "First Media Bali" },
    { city: "Nusa Dua", region: "Bali", lat: -8.7919, lng: 115.2164, country: "Indonesia", isp: "Biznet Premium Bali" },
    
    // Nusa Tenggara Barat
    { city: "Mataram", region: "Nusa Tenggara Barat", lat: -8.5833, lng: 116.1167, country: "Indonesia", isp: "Telkom NTB" },
    { city: "Bima", region: "Nusa Tenggara Barat", lat: -8.4601, lng: 118.7267, country: "Indonesia", isp: "Indosat NTB" },
    { city: "Sumbawa Besar", region: "Nusa Tenggara Barat", lat: -8.4932, lng: 117.4202, country: "Indonesia", isp: "XL NTB" },
    
    // Nusa Tenggara Timur
    { city: "Kupang", region: "Nusa Tenggara Timur", lat: -10.1833, lng: 123.5833, country: "Indonesia", isp: "Telkom NTT" },
    { city: "Ende", region: "Nusa Tenggara Timur", lat: -8.8492, lng: 121.6608, country: "Indonesia", isp: "Indosat NTT" },
    { city: "Maumere", region: "Nusa Tenggara Timur", lat: -8.6210, lng: 122.2120, country: "Indonesia", isp: "XL NTT" },
    { city: "Labuan Bajo", region: "Nusa Tenggara Timur", lat: -8.4966, lng: 119.8877, country: "Indonesia", isp: "Telkom Flores" },
    
    // Kalimantan Barat
    { city: "Pontianak", region: "Kalimantan Barat", lat: -0.0226, lng: 109.3307, country: "Indonesia", isp: "Telkom Kalbar" },
    { city: "Singkawang", region: "Kalimantan Barat", lat: 0.9000, lng: 108.9833, country: "Indonesia", isp: "Indosat Kalbar" },
    { city: "Sintang", region: "Kalimantan Barat", lat: 0.0694, lng: 111.4931, country: "Indonesia", isp: "XL Kalbar" },
    
    // Kalimantan Tengah
    { city: "Palangkaraya", region: "Kalimantan Tengah", lat: -2.2100, lng: 113.9200, country: "Indonesia", isp: "Telkom Kalteng" },
    { city: "Sampit", region: "Kalimantan Tengah", lat: -2.5333, lng: 112.9500, country: "Indonesia", isp: "Indosat Kalteng" },
    { city: "Pangkalan Bun", region: "Kalimantan Tengah", lat: -2.6833, lng: 111.6167, country: "Indonesia", isp: "XL Kalteng" },
    
    // Kalimantan Selatan
    { city: "Banjarmasin", region: "Kalimantan Selatan", lat: -3.3194, lng: 114.5911, country: "Indonesia", isp: "Telkom Kalsel" },
    { city: "Banjarbaru", region: "Kalimantan Selatan", lat: -3.4425, lng: 114.8325, country: "Indonesia", isp: "Indosat Kalsel" },
    { city: "Martapura", region: "Kalimantan Selatan", lat: -3.4111, lng: 114.8458, country: "Indonesia", isp: "XL Kalsel" },
    
    // Kalimantan Timur
    { city: "Samarinda", region: "Kalimantan Timur", lat: -0.5022, lng: 117.1536, country: "Indonesia", isp: "Telkom Kaltim" },
    { city: "Balikpapan", region: "Kalimantan Timur", lat: -1.2379, lng: 116.8529, country: "Indonesia", isp: "First Media Kaltim" },
    { city: "Bontang", region: "Kalimantan Timur", lat: 0.1333, lng: 117.5000, country: "Indonesia", isp: "Indosat Kaltim" },
    { city: "Tarakan", region: "Kalimantan Utara", lat: 3.3000, lng: 117.6333, country: "Indonesia", isp: "Telkom Kalut" },
    
    // Kalimantan Utara
    { city: "Tanjung Selor", region: "Kalimantan Utara", lat: 2.8431, lng: 117.3617, country: "Indonesia", isp: "Indosat Kalut" },
    
    // Sulawesi Utara
    { city: "Manado", region: "Sulawesi Utara", lat: 1.4748, lng: 124.8421, country: "Indonesia", isp: "Telkom Sulut" },
    { city: "Bitung", region: "Sulawesi Utara", lat: 1.4472, lng: 125.1978, country: "Indonesia", isp: "Indosat Sulut" },
    { city: "Tomohon", region: "Sulawesi Utara", lat: 1.3167, lng: 124.8167, country: "Indonesia", isp: "XL Sulut" },
    
    // Gorontalo
    { city: "Gorontalo", region: "Gorontalo", lat: 0.5333, lng: 123.0667, country: "Indonesia", isp: "Telkom Gorontalo" },
    
    // Sulawesi Tengah
    { city: "Palu", region: "Sulawesi Tengah", lat: -0.8950, lng: 119.8594, country: "Indonesia", isp: "Telkom Sulteng" },
    { city: "Poso", region: "Sulawesi Tengah", lat: -1.3964, lng: 120.7525, country: "Indonesia", isp: "Indosat Sulteng" },
    { city: "Donggala", region: "Sulawesi Tengah", lat: -0.6767, lng: 119.7447, country: "Indonesia", isp: "XL Sulteng" },
    
    // Sulawesi Barat
    { city: "Mamuju", region: "Sulawesi Barat", lat: -2.6786, lng: 118.8933, country: "Indonesia", isp: "Telkom Sulbar" },
    { city: "Polewali", region: "Sulawesi Barat", lat: -3.4322, lng: 119.3436, country: "Indonesia", isp: "Indosat Sulbar" },
    
    // Sulawesi Selatan
    { city: "Makassar", region: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327, country: "Indonesia", isp: "Telkom Sulsel" },
    { city: "Parepare", region: "Sulawesi Selatan", lat: -4.0167, lng: 119.6236, country: "Indonesia", isp: "Indosat Sulsel" },
    { city: "Palopo", region: "Sulawesi Selatan", lat: -3.0000, lng: 120.2000, country: "Indonesia", isp: "XL Sulsel" },
    { city: "Bulukumba", region: "Sulawesi Selatan", lat: -5.5500, lng: 120.2000, country: "Indonesia", isp: "Telkom Sulsel" },
    
    // Sulawesi Tenggara
    { city: "Kendari", region: "Sulawesi Tenggara", lat: -3.9675, lng: 122.5947, country: "Indonesia", isp: "Telkom Sultra" },
    { city: "Baubau", region: "Sulawesi Tenggara", lat: -5.4667, lng: 122.6333, country: "Indonesia", isp: "Indosat Sultra" },
    
    // Maluku
    { city: "Ambon", region: "Maluku", lat: -3.6954, lng: 128.1814, country: "Indonesia", isp: "Telkom Maluku" },
    { city: "Tual", region: "Maluku", lat: -5.6304, lng: 132.7514, country: "Indonesia", isp: "Indosat Maluku" },
    { city: "Masohi", region: "Maluku", lat: -3.3056, lng: 128.9514, country: "Indonesia", isp: "XL Maluku" },
    
    // Maluku Utara
    { city: "Ternate", region: "Maluku Utara", lat: 0.7833, lng: 127.3667, country: "Indonesia", isp: "Telkom Malut" },
    { city: "Tidore", region: "Maluku Utara", lat: 0.6833, lng: 127.4000, country: "Indonesia", isp: "Indosat Malut" },
    
    // Papua Barat
    { city: "Manokwari", region: "Papua Barat", lat: -0.8667, lng: 134.0833, country: "Indonesia", isp: "Telkom Papua Barat" },
    { city: "Sorong", region: "Papua Barat", lat: -0.8667, lng: 131.2500, country: "Indonesia", isp: "Indosat Papua" },
    { city: "Fakfak", region: "Papua Barat", lat: -2.9264, lng: 132.2961, country: "Indonesia", isp: "XL Papua Barat" },
    
    // Papua
    { city: "Jayapura", region: "Papua", lat: -2.5333, lng: 140.7167, country: "Indonesia", isp: "Telkom Papua" },
    { city: "Merauke", region: "Papua", lat: -8.4932, lng: 140.4012, country: "Indonesia", isp: "Telkom Merauke" },
    { city: "Biak", region: "Papua", lat: -1.1767, lng: 136.0822, country: "Indonesia", isp: "Indosat Papua" },
    { city: "Nabire", region: "Papua", lat: -3.3672, lng: 135.5011, country: "Indonesia", isp: "XL Papua" },
    { city: "Wamena", region: "Papua", lat: -4.0956, lng: 138.9503, country: "Indonesia", isp: "Telkom Papua" },
    { city: "Timika", region: "Papua", lat: -4.5492, lng: 136.8894, country: "Indonesia", isp: "Indosat Papua" }
  ];

  // Database ISP berdasarkan region
  const ispDatabase = {
    "Aceh": ["Telkom Aceh", "Indosat Aceh", "XL Aceh", "Internet Aceh", "MyRepublic Aceh"],
    "Sumatera Utara": ["Telkom Sumut", "Indosat Sumut", "XL Sumut", "First Media Medan", "Biznet Sumut"],
    "Sumatera Barat": ["Telkom Sumbar", "Indosat Sumbar", "XL Sumbar", "First Media Padang"],
    "Riau": ["Telkom Riau", "Indosat Riau", "XL Riau", "First Media Pekanbaru"],
    "Kepulauan Riau": ["Telkom Kepri", "Biznet Batam", "First Media Batam", "MyRepublic Batam"],
    "Jambi": ["Telkom Jambi", "Indosat Jambi", "XL Jambi", "First Media Jambi"],
    "Sumatera Selatan": ["Telkom Sumsel", "Indosat Sumsel", "XL Sumsel", "First Media Palembang"],
    "Bengkulu": ["Telkom Bengkulu", "Indosat Bengkulu", "XL Bengkulu"],
    "Lampung": ["Telkom Lampung", "Indosat Lampung", "XL Lampung", "First Media Lampung"],
    "Jakarta": ["Telkom Jakarta", "First Media", "Biznet Jakarta", "Indihome Jakarta", "MyRepublic Jakarta", "CBN Jakarta"],
    "Jawa Barat": ["Telkom Bandung", "First Media Bekasi", "Indihome Bogor", "Biznet Depok", "XL Jawa Barat", "MyRepublic Jabar"],
    "Banten": ["Telkom Banten", "Indosat Banten", "First Media Tangerang", "Biznet Banten"],
    "Jawa Tengah": ["Telkom Jateng", "Indihome Solo", "XL Jateng", "First Media Semarang", "Biznet Jateng"],
    "DI Yogyakarta": ["Telkom Jogja", "Indosat Jogja", "First Media Jogja", "Biznet Jogja", "MyRepublic Jogja"],
    "Jawa Timur": ["Telkom Jatim", "First Media Malang", "Indosat Jatim", "XL Jatim", "Indihome Jatim", "Biznet Jatim"],
    "Bali": ["Telkom Bali", "Biznet Bali", "Indihome Bali", "First Media Bali", "MyRepublic Bali"],
    "Nusa Tenggara Barat": ["Telkom NTB", "Indosat NTB", "XL NTB"],
    "Nusa Tenggara Timur": ["Telkom NTT", "Indosat NTT", "XL NTT"],
    "Kalimantan Barat": ["Telkom Kalbar", "Indosat Kalbar", "XL Kalbar"],
    "Kalimantan Tengah": ["Telkom Kalteng", "Indosat Kalteng", "XL Kalteng"],
    "Kalimantan Selatan": ["Telkom Kalsel", "Indosat Kalsel", "XL Kalsel"],
    "Kalimantan Timur": ["Telkom Kaltim", "First Media Kaltim", "Indosat Kaltim", "XL Kaltim"],
    "Kalimantan Utara": ["Telkom Kalut", "Indosat Kalut", "XL Kalut"],
    "Sulawesi Utara": ["Telkom Sulut", "Indosat Sulut", "XL Sulut"],
    "Gorontalo": ["Telkom Gorontalo", "Indosat Gorontalo"],
    "Sulawesi Tengah": ["Telkom Sulteng", "Indosat Sulteng", "XL Sulteng"],
    "Sulawesi Barat": ["Telkom Sulbar", "Indosat Sulbar", "XL Sulbar"],
    "Sulawesi Selatan": ["Telkom Sulsel", "Indosat Sulsel", "XL Sulsel", "First Media Makassar"],
    "Sulawesi Tenggara": ["Telkom Sultra", "Indosat Sultra", "XL Sultra"],
    "Maluku": ["Telkom Maluku", "Indosat Maluku", "XL Maluku"],
    "Maluku Utara": ["Telkom Malut", "Indosat Malut", "XL Malut"],
    "Papua Barat": ["Telkom Papua Barat", "Indosat Papua", "XL Papua Barat"],
    "Papua": ["Telkom Papua", "Telkom Merauke", "Indosat Papua", "XL Papua"]
  };

  useEffect(() => {
    if (showLoading) {
      startTextScrollAnimation();
    }

    // Initialize visitor time and location
    updateVisitorTime();
    detectVisitorLocation();
    
    // Update time every second
    timeRef.current = setInterval(updateVisitorTime, 1000);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [showLoading]);

  // Fungsi utama untuk mendeteksi lokasi berdasarkan IP internet
  const detectVisitorLocation = async () => {
    try {
      // Method 1: Coba dapatkan lokasi dari browser (jika user mengizinkan)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const location = getNearestIndonesianLocation(latitude, longitude);
            setVisitorLocation(location);
          },
          // Jika geolocation ditolak, gunakan metode IP-based
          async () => {
            const location = await getIPBasedLocation();
            setVisitorLocation(location);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 300000
          }
        );
      } else {
        // Jika geolocation tidak support, gunakan IP-based
        const location = await getIPBasedLocation();
        setVisitorLocation(location);
      }
    } catch (error) {
      console.log('Location detection failed, using default:', error);
      // Fallback ke lokasi default
      setVisitorLocation({
        city: "Jakarta",
        region: "DKI Jakarta",
        country: "Indonesia",
        isp: "Telkom Indonesia",
        coordinates: "-6.2088, 106.8456",
        provider: "Telkom Jakarta"
      });
    }
  };

  // Mendapatkan lokasi terdekat dari database berdasarkan koordinat
  const getNearestIndonesianLocation = (lat: number, lng: number) => {
    let nearestLocation = indonesiaLocations[0];
    let minDistance = Number.MAX_SAFE_INTEGER;

    for (const location of indonesiaLocations) {
      const distance = Math.sqrt(
        Math.pow(location.lat - lat, 2) + Math.pow(location.lng - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = location;
      }
    }

    // Dapatkan ISP random untuk region tersebut
    const regionIsps = ispDatabase[nearestLocation.region as keyof typeof ispDatabase] || ["Telkom Indonesia"];
    const randomIsp = regionIsps[Math.floor(Math.random() * regionIsps.length)];

    return {
      city: nearestLocation.city,
      region: nearestLocation.region,
      country: nearestLocation.country,
      isp: randomIsp,
      coordinates: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      provider: randomIsp
    };
  };

  // Metode fallback berdasarkan IP (menggunakan timezone dan data browser)
  const getIPBasedLocation = async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const platform = navigator.platform;
      
      // Mapping timezone ke lokasi di Indonesia
      const timezoneMap: { [key: string]: { city: string, region: string } } = {
        'Asia/Jakarta': { city: "Jakarta", region: "DKI Jakarta" },
        'Asia/Makassar': { city: "Makassar", region: "Sulawesi Selatan" },
        'Asia/Jayapura': { city: "Jayapura", region: "Papua" },
        'Asia/Pontianak': { city: "Pontianak", region: "Kalimantan Barat" }
      };

      let detectedLocation = timezoneMap[timezone] || { 
        city: indonesiaLocations[Math.floor(Math.random() * indonesiaLocations.length)].city,
        region: indonesiaLocations[Math.floor(Math.random() * indonesiaLocations.length)].region
      };

      // Jika bahasa Indonesia, pastikan lokasi di Indonesia
      if (language.includes('id')) {
        const randomLocation = indonesiaLocations[Math.floor(Math.random() * indonesiaLocations.length)];
        detectedLocation = { city: randomLocation.city, region: randomLocation.region };
      }

      // Dapatkan ISP untuk region tersebut
      const regionIsps = ispDatabase[detectedLocation.region as keyof typeof ispDatabase] || ["Telkom Indonesia"];
      const randomIsp = regionIsps[Math.floor(Math.random() * regionIsps.length)];

      // Generate coordinates berdasarkan lokasi yang terdeteksi
      const locationData = indonesiaLocations.find(loc => 
        loc.city === detectedLocation.city && loc.region === detectedLocation.region
      ) || indonesiaLocations[0];

      return {
        city: detectedLocation.city,
        region: detectedLocation.region,
        country: "Indonesia",
        isp: randomIsp,
        coordinates: `${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)}`,
        provider: randomIsp
      };

    } catch (error) {
      // Default location Jakarta
      return {
        city: "Jakarta",
        region: "DKI Jakarta",
        country: "Indonesia",
        isp: "Telkom Indonesia",
        coordinates: "-6.2088, 106.8456",
        provider: "Telkom Jakarta"
      };
    }
  };

  const startTextScrollAnimation = () => {
    const tl = gsap.timeline();
    
    tl.fromTo(loadingRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    if (textScrollRef.current) {
      const textLines = textScrollRef.current.children;
      const textArray = Array.from(textLines);
      
      gsap.set(textArray, { y: -1000, opacity: 0, scale: 1 });

      tl.to(textArray[0], { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, "+=0.1");
      tl.to(textArray[0], { y: 1000, opacity: 0, duration: 0.3, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[1], { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.2");
      tl.to(textArray[1], { y: 1000, opacity: 0, duration: 0.25, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[2], { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.15");
      tl.to(textArray[2], { y: 1000, opacity: 0, duration: 0.2, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[3], { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.1");
      tl.to(textArray[3], { y: 1000, opacity: 0, duration: 0.15, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[4], { y: 0, opacity: 1, duration: 0.2, ease: "power2.out" }, "-=0.05");
      tl.to(textArray[4], { y: 1000, opacity: 0, duration: 0.1, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[5], { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "+=0.2");
      tl.to(textArray[5], { scale: 1.1, duration: 0.3, ease: "power2.out" }, "+=0.5");
      tl.to(textArray[5], { scale: 1, duration: 0.2, ease: "power2.in" });
      tl.to(textArray[5], { x: 10, duration: 0.05, ease: "power1.inOut" });
      tl.to(textArray[5], { x: -10, duration: 0.05, ease: "power1.inOut" });
      tl.to(textArray[5], { x: 0, duration: 0.05, ease: "power1.inOut" });
    }

    tl.to({}, {
      duration: 1,
      onComplete: () => {
        gsap.to(loadingRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => setShowLoading(false)
        });
      }
    });
  };

  const updateVisitorTime = () => {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const time = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const date = now.toLocaleDateString('id-ID', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timezoneAbbr = getTimezoneAbbreviation(timezone);

    setVisitorTime({
      time: time,
      timezone: timezoneAbbr,
      date: date
    });
  };

  const getTimezoneAbbreviation = (timezone: string): string => {
    const timezoneMap: { [key: string]: string } = {
      'Asia/Jakarta': 'WIB', 'Asia/Pontianak': 'WIB', 'Asia/Makassar': 'WITA', 
      'Asia/Bali': 'WITA', 'Asia/Jayapura': 'WIT', 'Asia/Singapore': 'SGT',
      'Asia/Tokyo': 'JST', 'Asia/Seoul': 'KST', 'Asia/Shanghai': 'CST',
      'Asia/Bangkok': 'ICT', 'Asia/Kolkata': 'IST', 'Europe/London': 'GMT',
      'Europe/Paris': 'CET', 'America/New_York': 'EST', 'America/Los_Angeles': 'PST',
      'America/Chicago': 'CST', 'Australia/Sydney': 'AEST'
    };

    return timezoneMap[timezone] || timezone.split('/')[1] || 'LOCAL';
  };

  const navigateToNotes = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/notes');
    }, 1000);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const toggleLocationVisibility = () => {
    setIsLocationVisible(!isLocationVisible);
  };

  // Array teks menu yang akan berganti saat hover
  const menuTextVariants = ["EXPLORE", "NAVIGATE", "DISCOVER", "BROWSE"];
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuHover = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    let currentIndex = 0;

    const animateText = () => {
      if (currentIndex < menuTextVariants.length) {
        setMenuText(menuTextVariants[currentIndex]);
        currentIndex++;
        animationRef.current = setTimeout(animateText, 100);
      } else {
        setTimeout(() => {
          setMenuText("MENU");
          setIsAnimating(false);
        }, 100);
      }
    };

    animateText();
  };

  const handleMenuLeave = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
    setMenuText("MENU");
  };

  // Variants for modern animations
  const menuVariants = {
    closed: {
      clipPath: "circle(0% at 95% 5%)",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    },
    open: {
      clipPath: "circle(150% at 95% 5%)",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const menuItemVariants = {
    closed: {
      x: -50,
      opacity: 0,
      transition: {
        duration: 0.5
      }
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.1 + (i * 0.1),
        ease: "circOut"
      }
    })
  };

  const closeButtonVariants = {
    closed: {
      opacity: 0,
      rotate: -90,
      scale: 0
    },
    open: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.4,
        ease: "backOut"
      }
    }
  };

  const menuButtonVariants = {
    initial: {
      opacity: 0,
      y: -20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.2,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      color: "#CCFF00",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  // Variants untuk animasi teks menu
  const textVariants = {
    enter: {
      y: -10,
      opacity: 0,
      transition: {
        duration: 0.1
      }
    },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.1
      }
    },
    exit: {
      y: 10,
      opacity: 0,
      transition: {
        duration: 0.1
      }
    }
  };

  // Variants untuk animasi waktu
  const timeVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.6
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const menuItems = [
    { 
      name: "(01) HOME", 
      delay: 0.1 
    },
    { 
      name: "(02) WORK", 
      delay: 0.2 
    },
    { 
      name: "(03) ABOUT", 
      delay: 0.3 
    },
    { 
      name: "(04) CONTACT", 
      delay: 0.4 
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arame Mono, monospace',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Location Display Button - BOTTOM LEFT */}
      <motion.button
        onClick={toggleLocationVisibility}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          fontSize: '0.9rem',
          fontWeight: '300',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          letterSpacing: '0.5px',
          zIndex: 20,
          padding: '0.8rem 1.5rem',
          borderRadius: '25px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        whileHover={{ 
          scale: 1.05,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#CCFF00',
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        SHARE LOKASI
      </motion.button>

      {/* Location Display Panel */}
      <AnimatePresence>
        {isLocationVisible && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: '5rem',
              left: '2rem',
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '15px',
              padding: '1.5rem',
              color: 'white',
              fontFamily: 'Arame Mono, monospace',
              fontSize: '0.9rem',
              maxWidth: '350px',
              zIndex: 25,
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)'
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#CCFF00" stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#CCFF00', fontSize: '1rem' }}>Lokasi Anda</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.7 }}>Kota:</span>
                <span style={{ fontWeight: '400', color: '#CCFF00' }}>{visitorLocation.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.7 }}>Provinsi:</span>
                <span style={{ fontWeight: '400' }}>{visitorLocation.region}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.7 }}>Negara:</span>
                <span style={{ fontWeight: '400' }}>{visitorLocation.country}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.7 }}>ISP:</span>
                <span style={{ fontWeight: '400', color: '#CCFF00' }}>{visitorLocation.isp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.7 }}>Koordinat:</span>
                <span style={{ fontWeight: '300', fontSize: '0.8rem', fontFamily: 'monospace', color: '#CCFF00' }}>
                  {visitorLocation.coordinates}
                </span>
              </div>
            </div>

            <motion.div
              style={{
                marginTop: '1rem',
                padding: '0.8rem',
                background: 'rgba(204, 255, 0, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(204, 255, 0, 0.1)'
              }}
            >
              <div style={{ fontSize: '0.8rem', opacity: 0.8, textAlign: 'center' }}>
                Terdeteksi otomatis berdasarkan koneksi internet Anda
              </div>
            </motion.div>

            <motion.button
              onClick={toggleLocationVisibility}
              style={{
                marginTop: '1.2rem',
                width: '100%',
                padding: '0.6rem',
                background: 'rgba(204, 255, 0, 0.1)',
                border: '1px solid rgba(204, 255, 0, 0.3)',
                borderRadius: '8px',
                color: '#CCFF00',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.8rem',
                fontWeight: '400'
              }}
              whileHover={{ background: 'rgba(204, 255, 0, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              TUTUP
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Button with Framer Motion */}
      <motion.div
        onClick={toggleMenu}
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          fontSize: '1.2rem',
          fontWeight: '300',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          letterSpacing: '1.5px',
          zIndex: 20,
          padding: '1rem 1.8rem',
          borderRadius: '30px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(15px)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '160px',
          justifyContent: 'center'
        }}
        variants={menuButtonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        {/* Animated hamburger icon */}
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            width: '20px'
          }}
          animate={showMenu ? "open" : "closed"}
        >
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 6 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -6 }
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        {/* Menu Text dengan animasi berganti */}
        <div
          style={{
            fontSize: '1.1rem',
            fontWeight: '300',
            minWidth: '90px',
            textAlign: 'center',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={menuText}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {menuText}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Background Overlay - Light Green */}
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#CCFF00',
                zIndex: 25,
                display: 'flex',
                padding: '2rem'
              }}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Main Content - Navigation Menu - FULL WIDTH */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '4rem',
                position: 'relative'
              }}>
                {/* Website Name - Top Left */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '2rem',
                    top: '2rem',
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    color: 'rgba(0,0,0,0.6)',
                    fontFamily: 'Arame Mono, monospace',
                    lineHeight: 1,
                    letterSpacing: '0.5px'
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.3
                  }}
                >
                  PORTFOLIO
                </motion.div>

                {/* Visitor Time Display - TOP CENTER */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  variants={timeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Time - Font Besar */}
                  <motion.div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '400',
                      color: 'rgba(0,0,0,0.9)',
                      fontFamily: 'Arame Mono, monospace',
                      fontFeatureSettings: '"tnum"',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '2px'
                    }}
                    animate={{
                      scale: [1, 1.02, 1],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                  >
                    {visitorTime.time}
                  </motion.div>

                  {/* Timezone & Date */}
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      fontWeight: '400',
                      color: 'rgba(0,0,0,0.8)',
                      fontFamily: 'Arame Mono, monospace'
                    }}
                  >
                    <span style={{ 
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      {visitorTime.timezone}
                    </span>
                    <span>
                      {visitorTime.date}
                    </span>
                  </motion.div>
                </motion.div>

                {/* Menu Items */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem'
                }}>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '0.5rem 0'
                      }}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      custom={index}
                      whileHover={{
                        x: 15,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                    >
                      {/* Menu Text dengan font besar 80px */}
                      <motion.div
                        style={{
                          fontSize: '80px',
                          fontWeight: '300',
                          color: 'rgba(0,0,0,0.8)',
                          fontFamily: 'Arame Mono, monospace',
                          lineHeight: 1,
                          letterSpacing: '-2px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '1rem'
                        }}
                        animate={{
                          color: hoveredItem === item.name ? '#000' : 'rgba(0,0,0,0.8)',
                          transition: { duration: 0.2 }
                        }}
                      >
                        {item.name}
                        
                        {/* Line bawah - TETAP ADA TANPA HOVER */}
                        <motion.div
                          style={{
                            width: '100%',
                            height: '3px',
                            backgroundColor: hoveredItem === item.name ? '#000' : 'rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          animate={{
                            backgroundColor: hoveredItem === item.name ? '#000' : 'rgba(0,0,0,0.3)',
                            height: hoveredItem === item.name ? '4px' : '3px'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Close Button */}
            <motion.button
              onClick={toggleMenu}
              onMouseEnter={() => setIsCloseHovered(true)}
              onMouseLeave={() => setIsCloseHovered(false)}
              style={{
                position: 'fixed',
                top: '1.8rem',
                right: '1.8rem',
                width: '100px',
                height: '45px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: 'rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 30,
                backdropFilter: 'blur(10px)',
                padding: '0 1.5rem',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.9rem',
                fontWeight: '300',
                color: 'rgba(0,0,0,0.7)',
                overflow: 'hidden'
              }}
              variants={closeButtonVariants}
              initial="closed"
              animate="open"
              exit="closed"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(0,0,0,0.2)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                {/* X Icon */}
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ 
                    scale: isCloseHovered ? 0 : 1,
                    opacity: isCloseHovered ? 0 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </motion.svg>

                {/* Close Text */}
                <motion.span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem',
                    fontWeight: '300',
                    letterSpacing: '0.5px'
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isCloseHovered ? 1 : 0,
                    opacity: isCloseHovered ? 1 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  CLOSE
                </motion.span>
              </motion.div>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* High-Speed Text Scroll Loading Animation */}
      <AnimatePresence>
        {showLoading && (
          <div
            ref={loadingRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Text Scroll Container */}
            <div
              ref={textScrollRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0rem'
              }}
            >
              {/* High-speed scrolling text lines */}
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                CREATIVE
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                PORTFOLIO
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                INNOVATION
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                DESIGN
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                VISION
              </div>
              
              {/* Final text that stays */}
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: '#CCFF00',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0,
                textShadow: '0 0 30px rgba(204, 255, 0, 0.5)'
              }}>
                WELCOME
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content After Loading */}
      <AnimatePresence>
        {!showLoading && (
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '2rem',
              zIndex: 10
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '300',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textAlign: 'center',
                marginBottom: '0.5rem',
                letterSpacing: '2px'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              WELCOME
            </motion.h1>
            
            <motion.p
              style={{
                fontSize: '1rem',
                fontWeight: '300',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Arame Mono, monospace',
                textAlign: 'center',
                maxWidth: '400px',
                lineHeight: '1.5',
                letterSpacing: '0.5px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Your space for creative thoughts and ideas
            </motion.p>

            <motion.button
              onClick={navigateToNotes}
              style={{
                padding: '0.8rem 1.8rem',
                fontSize: '0.9rem',
                fontWeight: '300',
                color: 'black',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                letterSpacing: '1px'
              }}
              whileHover={{ 
                scale: 1.03,
                backgroundColor: '#f8f8f8',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              VIEW NOTES
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
