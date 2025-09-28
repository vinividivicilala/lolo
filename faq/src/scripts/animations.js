import gsap from "gsap";

if (typeof window !== "undefined") {
  // Cek GSAP jalan
  console.log("✅ GSAP berhasil dijalankan!");

  // Animasi teks judul
  gsap.from(".big-title", {
    opacity: 0,
    y: -100,
    duration: 2,
    ease: "bounce.out"
  });

  // Animasi teks paragraf
  gsap.from(".text-line", {
    opacity: 0,
    x: -100,
    duration: 1.5,
    delay: 1, // jalan setelah judul selesai
    stagger: 0.3
  });
}
