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
      number: "01",
      title: "Introduction",
      content: "Welcome to my notification platform. By accessing or using my services, you agree to be bound by these Terms of Service. I provide a platform for sending and receiving notifications, interacting through comments and reactions, and managing digital communication."
    },
    {
      number: "02",
      title: "User Accounts",
      content: "To access certain features, you may need to register an account. You agree to provide accurate and complete information. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account."
    },
    {
      number: "03",
      title: "Service Usage",
      content: "You agree not to use the service for illegal purposes, send spam or disruptive content, spread malware or malicious code, violate intellectual property rights, attempt to access other users' accounts, or use the service in any way that may damage or burden my infrastructure."
    },
    {
      number: "04",
      title: "User Content",
      content: "You retain ownership of the content you post on my service. By posting content, you grant me a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content in connection with providing the service. You are solely responsible for the content you post."
    },
    {
      number: "05",
      title: "Intellectual Property",
      content: "The service and its original content, features, and functionality are and will remain my exclusive property. The service is protected by copyright, trademark, and other laws. You may not use my logos, trademarks, or design elements without prior written permission."
    },
    {
      number: "06",
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by applicable law, I shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses. My services are provided 'as is' and 'as available' without any warranties."
    },
    {
      number: "07",
      title: "Termination",
      content: "I may terminate or suspend your access to my service immediately, without notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the service will immediately cease."
    },
    {
      number: "08",
      title: "Governing Law",
      content: "These Terms shall be governed by and construed in accordance with the laws of Indonesia, without regard to its conflict of law provisions."
    },
    {
      number: "09",
      title: "Changes to Terms",
      content: "I reserve the right to modify or replace these Terms at any time. If a revision is material, I will provide at least 30 days' notice before new terms take effect. By continuing to access or use my service after revisions become effective, you agree to be bound by the revised terms."
    },
    {
      number: "10",
      title: "Contact Me",
      content: "If you have any questions about these Terms of Service, please contact me at: hello@wawa44.com"
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
          display: "inline-flex",
          alignItems: "center",
          willChange: "transform",
          padding: "4rem",
          gap: "6rem",
        }}
      >
        {/* Title Section - Big 700px */}
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
            alignItems: "center",
          }}
        >
          {sections.map((section) => (
            <div
              key={section.number}
              style={{
                width: "500px",
                whiteSpace: "normal",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "1rem",
                  color: "#888888",
                  marginBottom: "1rem",
                  letterSpacing: "2px",
                }}
              >
                {section.number}
              </div>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: "700",
                  color: "#ffffff",
                  marginBottom: "2rem",
                  lineHeight: "1.2",
                }}
              >
                {section.title}
              </div>
              <div
                style={{
                  fontSize: "1.1rem",
                  lineHeight: "1.6",
                  color: "#cccccc",
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
