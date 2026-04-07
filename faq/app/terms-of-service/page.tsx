'use client';

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const getMaxScroll = () => {
      return text.scrollWidth - window.innerWidth;
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
        }}
      >
        <div
          ref={textRef}
          style={{
            fontWeight: "700",
            fontSize: "120px",
            lineHeight: "1.2",
            padding: "0 2rem",
            color: "#ffffff",
            whiteSpace: "normal",
            maxWidth: "90vw",
            display: "inline-block",
          }}
        >
          <div style={{ marginBottom: "2rem", fontSize: "200px" }}>TERMS OF SERVICE</div>
          
          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>1. Acceptance of Terms</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            By accessing and using this service, you accept and agree to be bound by the terms and provisions of this agreement.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>2. Description of Service</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            We provide users with access to a rich collection of resources, including various tools, and interactive features through our network.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>3. User Conduct</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            You understand that all information, data, text, software, music, sound, photographs, graphics, video, messages, or other materials are the sole responsibility of the person from which such content originated.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>4. Privacy Policy</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>5. Intellectual Property</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            The service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>6. Termination</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>7. Limitation of Liability</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            In no event shall we be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>8. Governing Law</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>9. Changes to Terms</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "2rem", lineHeight: "1.4" }}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
          </div>

          <div style={{ fontSize: "24px", marginBottom: "1rem" }}>
            <strong>10. Contact Information</strong>
          </div>
          <div style={{ fontSize: "18px", marginBottom: "4rem", lineHeight: "1.4" }}>
            If you have any questions about these Terms, please contact us at legal@example.com.
          </div>

          <div style={{ fontSize: "14px", color: "#666", marginBottom: "2rem" }}>
            Last updated: January 2024
          </div>
        </div>
      </div>
    </div>
  );
}
