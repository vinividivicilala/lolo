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
          display: "inline-flex",
          alignItems: "flex-start",
          willChange: "transform",
          padding: "4rem",
          gap: "6rem",
        }}
      >
        {/* Title Section */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              fontSize: "700px",
              lineHeight: "1",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            TERMS OF<br />SERVICES
          </div>
        </div>

        {/* Content Sections */}
        <div
          ref={contentRef}
          style={{
            display: "inline-flex",
            gap: "6rem",
            alignItems: "flex-start",
            paddingTop: "8rem",
          }}
        >
          {/* Section 1 - Introduction */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              01. Introduction
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              Welcome to my notification platform. By accessing or using my services, you agree to be bound by these Terms of Service.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              I provide a platform for sending and receiving notifications, interacting through comments and reactions, and managing digital communication.
            </p>
          </div>

          {/* Section 2 - User Accounts */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              02. User Accounts
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              To access certain features, you may need to register an account. You agree to provide accurate and complete information.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.
            </p>
          </div>

          {/* Section 3 - Service Usage */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              03. Service Usage
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              You agree not to:
            </p>
            <ul style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", paddingLeft: "1.5rem" }}>
              <li>Use the service for illegal purposes</li>
              <li>Send spam or disruptive content</li>
              <li>Spread malware or malicious code</li>
              <li>Violate intellectual property rights</li>
              <li>Attempt to access other users' accounts</li>
            </ul>
          </div>

          {/* Section 4 - User Content */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              04. User Content
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              You retain ownership of the content you post. By posting content, you grant me a non-exclusive, royalty-free license to use and display your content.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              You are solely responsible for the content you post. I reserve the right to remove content that violates these terms.
            </p>
          </div>

          {/* Section 5 - Intellectual Property */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              05. Intellectual Property
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              The service and its original content, features, and functionality are and will remain my exclusive property.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              You may not use my logos, trademarks, or design elements without prior written permission.
            </p>
          </div>

          {/* Section 6 - Limitation of Liability */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              06. Limitation of Liability
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              To the maximum extent permitted by law, I shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              My services are provided "as is" and "as available" without any warranties.
            </p>
          </div>

          {/* Section 7 - Termination */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              07. Termination
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              I may terminate or suspend your access immediately, without notice, for any reason, including if you breach these Terms.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              Upon termination, your right to use the service will immediately cease.
            </p>
          </div>

          {/* Section 8 - Governing Law */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              08. Governing Law
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              These Terms shall be governed by and construed in accordance with the laws of Indonesia.
            </p>
          </div>

          {/* Section 9 - Changes to Terms */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              09. Changes to Terms
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              I reserve the right to modify or replace these Terms at any time.
            </p>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc" }}>
              By continuing to access or use my service after revisions become effective, you agree to be bound by the revised terms.
            </p>
          </div>

          {/* Section 10 - Contact */}
          <div style={{ width: "400px", whiteSpace: "normal" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#ffffff", marginBottom: "1.5rem" }}>
              10. Contact Me
            </h2>
            <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#cccccc", marginBottom: "1rem" }}>
              If you have any questions about these Terms, please contact me:
            </p>
            <div style={{ fontSize: "1rem", lineHeight: "1.8", color: "#ffffff" }}>
              <div>Email: hello@wawa44.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
