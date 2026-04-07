'use client';

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSections = 6;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const getMaxScroll = () => {
      return container.scrollWidth - window.innerWidth;
    };

    const updateActiveSection = (scrollPos: number) => {
      const sectionWidth = window.innerWidth;
      const newIndex = Math.min(
        Math.floor(scrollPos / sectionWidth),
        totalSections - 1
      );
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxScroll = getMaxScroll();
      let newScrollLeft = scrollLeft + e.deltaY;
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      updateActiveSection(scrollLeft);
      
      gsap.to(container, {
        x: -scrollLeft,
        duration: 0.8,
        ease: "power3.out",
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
      const walk = (x - startX) * 1.2;
      let newScrollLeft = scrollLeft - walk;
      const maxScroll = getMaxScroll();
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      updateActiveSection(scrollLeft);
      
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

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        let newScrollLeft = scrollLeft + window.innerWidth;
        const maxScroll = getMaxScroll();
        if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
        scrollLeft = newScrollLeft;
        updateActiveSection(scrollLeft);
        gsap.to(container, {
          x: -scrollLeft,
          duration: 0.6,
          ease: "power2.out",
        });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        let newScrollLeft = scrollLeft - window.innerWidth;
        if (newScrollLeft < 0) newScrollLeft = 0;
        scrollLeft = newScrollLeft;
        updateActiveSection(scrollLeft);
        gsap.to(container, {
          x: -scrollLeft,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.style.cursor = "grab";

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeIndex]);

  // Parallax effect on scroll
  useEffect(() => {
    const sections = sectionsRef.current.filter(Boolean);
    sections.forEach((section, i) => {
      const ctx = gsap.context(() => {
        gsap.fromTo(section,
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: "left center",
              end: "right center",
              scrub: 1,
            },
          }
        );
      });
      return () => ctx.revert();
    });
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
        fontFamily: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
        position: "relative",
      }}
    >
      {/* Gradient Background */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, #1a1a2e, #0a0a0a)",
          zIndex: 0,
        }}
      />

      {/* Progress Indicator */}
      <div
        style={{
          position: "fixed",
          bottom: 40,
          left: 40,
          zIndex: 100,
          display: "flex",
          gap: 12,
        }}
      >
        {Array.from({ length: totalSections }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === activeIndex ? 48 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === activeIndex ? "#ffffff" : "rgba(255,255,255,0.2)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Navigation Hint */}
      <div
        style={{
          position: "fixed",
          bottom: 40,
          right: 40,
          zIndex: 100,
          color: "rgba(255,255,255,0.4)",
          fontSize: 14,
          fontFamily: "monospace",
          letterSpacing: 1,
        }}
      >
        ← → DRAG / SCROLL
      </div>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "stretch",
          willChange: "transform",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Section 1 - Hero */}
        <div
          ref={(el) => { sectionsRef.current[0] = el; }}
          style={{
            width: "100vw",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10vw",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "clamp(60px, 12vw, 180px)",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: 32,
              }}
            >
              Terms of
              <br />
              <span style={{ color: "#6366f1" }}>Service</span>
            </div>
            <div
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                color: "rgba(255,255,255,0.6)",
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              Last updated: December 2024. Please read these terms carefully before using our platform.
            </div>
          </div>
        </div>

        {/* Section 2 - Acceptance */}
        <div
          ref={(el) => { sectionsRef.current[1] = el; }}
          style={{
            width: "100vw",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10vw",
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 24,
              }}
            >
              01 — Acceptance
            </div>
            <div
              style={{
                fontSize: "clamp(18px, 2.5vw, 24px)",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
                marginBottom: 32,
              }}
            >
              By accessing or using our service, you agree to be bound by these Terms and all applicable laws and regulations.
            </div>
            <div
              style={{
                fontSize: "clamp(14px, 1.8vw, 16px)",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.6,
                borderLeft: "2px solid #6366f1",
                paddingLeft: 20,
              }}
            >
              If you do not agree with any part of these terms, you may not access the service. These terms constitute a legally binding agreement between you and our company.
            </div>
          </div>
        </div>

        {/* Section 3 - User Obligations */}
        <div
          ref={(el) => { sectionsRef.current[2] = el; }}
          style={{
            width: "100vw",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10vw",
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 24,
              }}
            >
              02 — User Obligations
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                "You must be at least 18 years old to use this service",
                "You are responsible for maintaining the security of your account",
                "You agree not to misuse or interfere with the service",
                "You will comply with all applicable laws and regulations",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    fontSize: "clamp(14px, 1.8vw, 18px)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <span style={{ color: "#6366f1", fontSize: 24 }}>✦</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4 - Intellectual Property */}
        <div
          ref={(el) => { sectionsRef.current[3] = el; }}
          style={{
            width: "100vw",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10vw",
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 24,
              }}
            >
              03 — Intellectual Property
            </div>
            <div
              style={{
                fontSize: "clamp(18px, 2.5vw, 24px)",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
                marginBottom: 24,
              }}
            >
              All content, trademarks, and data on this platform are our exclusive property.
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginTop: 32,
              }}
            >
              <div style={{ background: "rgba(99,102,241,0.1)", padding: 20, borderRadius: 12 }}>
                <div style={{ color: "#6366f1", fontSize: 32, marginBottom: 12 }}>©</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>All rights reserved</div>
              </div>
              <div style={{ background: "rgba(99,102,241,0.1)", padding: 20, borderRadius: 12 }}>
                <div style={{ color: "#6366f1", fontSize: 32, marginBottom: 12 }}>™</div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Registered trademarks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 - Limitations */}
        <div
          ref={(el) => { sectionsRef.current[4] = el; }}
          style={{
            width: "100vw",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10vw",
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 24,
              }}
            >
              04 — Limitations
            </div>
            <div
              style={{
                fontSize: "clamp(18px, 2.5vw, 22px)",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
              }}
            >
              To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </div>
            <div
              style={{
                marginTop: 32,
                padding: 24,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
                Disclaimer
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.5 }}>
                The service is provided &quot;as is&quot; without warranties of any kind, either express or implied.
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 - Governing Law */}
        <div
          ref={(el) => { sectionsRef.current[5] = el; }}
          style={{
            width: "100vw",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10vw",
          }}
        >
          <div style={{ maxWidth: 700, textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(32px, 5vw, 64px)",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: 24,
              }}
            >
              05 — Governing Law
            </div>
            <div
              style={{
                fontSize: "clamp(18px, 2.5vw, 22px)",
                color: "rgba(255,255,255,0.8)",
                lineHeight: 1.4,
                marginBottom: 40,
              }}
            >
              These terms shall be governed by and construed in accordance with the laws of Delaware.
            </div>
            <div
              style={{
                fontSize: "clamp(12px, 1.5vw, 14px)",
                color: "rgba(255,255,255,0.4)",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 32,
              }}
            >
              For any questions regarding these Terms, please contact legal@yourcompany.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
