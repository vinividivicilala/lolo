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
            fontWeight: "400",
            fontSize: "20px",
            lineHeight: "1.6",
            padding: "0 2rem",
            color: "#ffffff",
            whiteSpace: "normal",
            display: "inline-block",
            width: "800px",
            maxWidth: "80vw",
          }}
        >
          <h1 style={{ fontWeight: "700", fontSize: "700px", margin: "0 0 100px 0", lineHeight: "1" }}>
            TERMS OF SERVICES
          </h1>
          
          <h2 style={{ fontWeight: "600", fontSize: "32px", margin: "60px 0 20px 0" }}>
            1. Introduction, Acceptance and General Conditions
          </h2>
          <p style={{ marginBottom: "30px" }}>
            By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
            If you do not agree with any part of these terms, you may not use our services. These terms constitute a legally binding 
            agreement between you and the company.
          </p>

          <h2 style={{ fontWeight: "600", fontSize: "32px", margin: "60px 0 20px 0" }}>
            2. Use of Services
          </h2>
          <p style={{ marginBottom: "30px" }}>
            You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for 
            maintaining the confidentiality of your account and for all activities that occur under your account.
          </p>

          <h2 style={{ fontWeight: "600", fontSize: "32px", margin: "60px 0 20px 0" }}>
            3. Intellectual Property
          </h2>
          <p style={{ marginBottom: "30px" }}>
            All content, features, and functionality of our services are owned by the company and are protected by international 
            copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2 style={{ fontWeight: "600", fontSize: "32px", margin: "60px 0 20px 0" }}>
            4. Limitation of Liability
          </h2>
          <p style={{ marginBottom: "30px" }}>
            To the fullest extent permitted by law, the company shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages arising out of or relating to your use of our services.
          </p>

          <h2 style={{ fontWeight: "600", fontSize: "32px", margin: "60px 0 20px 0" }}>
            5. Changes to Terms
          </h2>
          <p style={{ marginBottom: "30px" }}>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms 
            on this page. Your continued use of the services after such modifications constitutes your acceptance of the new Terms.
          </p>

          <h2 style={{ fontWeight: "600", fontSize: "32px", margin: "60px 0 20px 0" }}>
            6. Contact Information
          </h2>
          <p style={{ marginBottom: "100px" }}>
            If you have any questions about these Terms, please contact us at legal@company.com.
          </p>
        </div>
      </div>
    </div>
  );
}
