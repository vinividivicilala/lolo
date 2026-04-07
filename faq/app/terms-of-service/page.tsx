'use client';

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const getMaxScroll = () => {
      return content.scrollWidth - window.innerWidth;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxScroll = getMaxScroll();
      let newScrollLeft = scrollLeft + e.deltaY;
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      gsap.to(container, {
        x: -scrollLeft,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX - (container.getBoundingClientRect().left + scrollLeft);
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.getBoundingClientRect().left;
      const walk = (x - startX) * 1.5;
      let newScrollLeft = scrollLeft - walk;
      const maxScroll = getMaxScroll();
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      gsap.to(container, {
        x: -scrollLeft,
        duration: 0,
        ease: "none",
      });
    };

    const handleMouseUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.style.cursor = "grab";

    return () => {
      window.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const sections = [
    {
      title: "PENDAHULUAN",
      content: "Dengan mengakses dan menggunakan layanan ini, Anda menyetujui untuk terikat dengan Ketentuan Layanan ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, mohon untuk tidak menggunakan layanan kami."
    },
    {
      title: "PENGGUNAAN LAYANAN",
      content: "Anda setuju untuk menggunakan layanan ini hanya untuk tujuan yang sah dan sesuai dengan ketentuan ini. Anda dilarang menyalahgunakan layanan, mencoba mengakses area yang tidak diizinkan, atau mengganggu layanan pihak lain."
    },
    {
      title: "AKUN PENGGUNA",
      content: "Anda bertanggung jawab penuh atas kerahasiaan akun dan kata sandi Anda serta segala aktivitas yang terjadi di dalam akun Anda. Harap segera beri tahu kami jika terjadi akses tidak sah ke akun Anda."
    },
    {
      title: "KONTEN PENGGUNA",
      content: "Anda tetap memiliki hak atas konten yang Anda unggah. Namun, dengan mengunggah konten, Anda memberi kami lisensi untuk menampilkan, mendistribusikan, dan mempromosikan konten tersebut dalam layanan kami."
    },
    {
      title: "HAK KEKAYAAN INTELEKTUAL",
      content: "Seluruh konten, fitur, dan fungsionalitas layanan ini adalah milik kami dan dilindungi oleh hak cipta, merek dagang, dan undang-undang kekayaan intelektual lainnya. Anda tidak diperbolehkan menyalin atau menggunakan ulang tanpa izin."
    },
    {
      title: "BATASAN TANGGUNG JAWAB",
      content: "Kami tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan ini. Layanan disediakan 'sebagaimana adanya' tanpa jaminan apapun."
    },
    {
      title: "PERUBAHAN KETENTUAN",
      content: "Kami berhak untuk mengubah ketentuan ini sewaktu-waktu. Perubahan akan berlaku setelah dipublikasikan di halaman ini. Penggunaan layanan yang berkelanjutan menunjukkan penerimaan Anda terhadap ketentuan yang telah diubah."
    },
    {
      title: "HUKUM YANG BERLAKU",
      content: "Ketentuan ini diatur oleh hukum yang berlaku di wilayah Indonesia. Setiap sengketa yang timbul akan diselesaikan secara musyawarah atau melalui jalur hukum yang berlaku."
    },
    {
      title: "HUBUNGI KAMI",
      content: "Jika Anda memiliki pertanyaan tentang Ketentuan Layanan ini, silakan hubungi melalui email: hello@terms.com"
    }
  ];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#000000",
        fontFamily: "Helvetica, Arial, sans-serif",
        position: "relative",
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          willChange: "transform",
          paddingLeft: "4rem",
        }}
      >
        {/* Main Title */}
        <div
          ref={contentRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6rem",
            paddingRight: "4rem",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              fontSize: "700px",
              lineHeight: "1",
              color: "#ffffff",
              flexShrink: 0,
            }}
          >
            TERMS OF SERVICES
          </div>

          {/* Sections */}
          {sections.map((section, index) => (
            <div
              key={index}
              style={{
                flexShrink: 0,
                width: "500px",
                whiteSpace: "normal",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "700",
                  color: "#ffffff",
                  marginBottom: "24px",
                  borderLeft: "4px solid #ffffff",
                  paddingLeft: "20px",
                }}
              >
                {section.title}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  lineHeight: "1.6",
                  color: "#cccccc",
                  whiteSpace: "normal",
                  paddingLeft: "24px",
                }}
              >
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
