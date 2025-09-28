import { useEffect } from "react";
import gsap from "gsap";

export default function Animations() {
  useEffect(() => {
    console.log("✅ GSAP React jalan di Astro");

    // Animasi judul
    gsap.from(".big-title", {
      opacity: 0,
      y: -100,
      duration: 2,
      ease: "bounce.out",
    });

    // Animasi baris teks
    gsap.from(".text-line", {
      opacity: 0,
      x: -100,
      duration: 1.5,
      delay: 1,
      stagger: 0.3,
    });
  }, []);

  return null; // tidak render HTML, hanya animasi
}
