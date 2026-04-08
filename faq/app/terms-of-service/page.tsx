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
          willChange: "transform",
        }}
      >
        <div
          ref={contentRef}
          style={{
            display: "flex",
            gap: "100px",
            alignItems: "center",
            padding: "0 100px",
          }}
        >
          {/* Teks TERMS OF SERVICES yang besar */}
          <div
            style={{
              fontWeight: "700",
              fontSize: "700px",
              lineHeight: "1",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            TERMS OF SERVICES
          </div>

          {/* Section 1 - Introduction */}
          <div
            style={{
              width: "600px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              1. Introduction, Acceptance and General Conditions
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.8)",
              margin: 0,
            }}>
              By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
              If you do not agree with any part of these terms, you may not use our services. These terms constitute a legally binding 
              agreement between you and the company.
            </p>
          </div>

          {/* Section 2 - Use of Services */}
          <div
            style={{
              width: "600px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              2. Use of Services
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.8)",
              margin: 0,
            }}>
              You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for 
              maintaining the confidentiality of your account and for all activities that occur under your account. You must not use 
              our services for any illegal or unauthorized purpose.
            </p>
          </div>

          {/* Section 3 - Intellectual Property */}
          <div
            style={{
              width: "600px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              3. Intellectual Property
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.8)",
              margin: 0,
            }}>
              All content, features, and functionality of our services are owned by the company and are protected by international 
              copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, 
              modify, or create derivative works of any content without our express written permission.
            </p>
          </div>

          {/* Section 4 - Limitation of Liability */}
          <div
            style={{
              width: "600px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              4. Limitation of Liability
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.8)",
              margin: 0,
            }}>
              To the fullest extent permitted by law, the company shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages arising out of or relating to your use of our services. Our total liability 
              shall not exceed the amount you paid us, if any, for using our services.
            </p>
          </div>

          {/* Section 5 - Changes to Terms */}
          <div
            style={{
              width: "600px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              5. Changes to Terms
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.8)",
              margin: 0,
            }}>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms 
              on this page. Your continued use of the services after such modifications constitutes your acceptance of the new Terms.
            </p>
          </div>

          {/* Section 6 - Contact Information */}
          <div
            style={{
              width: "600px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              6. Contact Information
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "20px",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.8)",
              margin: 0,
            }}>
              If you have any questions about these Terms, please contact us at legal@company.com. We will respond to your inquiry 
              as soon as possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
