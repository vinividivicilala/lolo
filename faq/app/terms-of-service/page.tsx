'use client';

import { useRef, useEffect } from "react";
import gsap from "gsap";

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scrollContent = scrollRef.current;

    if (!container || !scrollContent) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const getMaxScroll = () => {
      return scrollContent.scrollWidth - window.innerWidth;
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
      description: "Welcome to my platform. By accessing or using my services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the services.",
      details: "These Terms apply to all visitors, users, and others who access or use the Service."
    },
    {
      number: "02",
      title: "User Accounts",
      description: "When you create an account with me, you must provide accurate, complete, and current information. You are solely responsible for safeguarding the password and for any activities under your account.",
      details: "You agree to notify me immediately of any breach of security or unauthorized use of your account."
    },
    {
      number: "03",
      title: "Intellectual Property",
      description: "The Service and its original content, features, and functionality are and will remain my exclusive property. The Service is protected by copyright, trademark, and other laws.",
      details: "My trademarks and trade dress may not be used in connection with any product or service without prior written consent."
    },
    {
      number: "04",
      title: "User Content",
      description: "You retain any and all of your rights to any content you submit, post or display on or through the Service. You are responsible for protecting those rights.",
      details: "By posting content, you grant me a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content."
    },
    {
      number: "05",
      title: "Prohibited Uses",
      description: "You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service.",
      details: "Prohibited activities include: violating laws, infringing intellectual property, distributing malware, harassing others, or interfering with security features."
    },
    {
      number: "06",
      title: "Termination",
      description: "I may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.",
      details: "Upon termination, your right to use the Service will immediately cease. Provisions that by their nature should survive termination shall survive."
    },
    {
      number: "07",
      title: "Limitation of Liability",
      description: "In no event shall I be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, or goodwill.",
      details: "My liability is limited to the fullest extent permitted by applicable law. The Service is provided 'AS IS' without warranties of any kind."
    },
    {
      number: "08",
      title: "Changes to Terms",
      description: "I reserve the right to modify or replace these Terms at any time. If a revision is material, I will provide at least 30 days' notice prior to any new terms taking effect.",
      details: "By continuing to access or use my Service after those revisions become effective, you agree to be bound by the revised terms."
    },
    {
      number: "09",
      title: "Governing Law",
      description: "These Terms shall be governed and construed in accordance with applicable laws, without regard to its conflict of law provisions.",
      details: "Any disputes arising under these Terms shall be resolved exclusively through binding arbitration or in competent courts."
    },
    {
      number: "10",
      title: "Contact",
      description: "If you have any questions about these Terms, please contact me. I will respond to your inquiries as quickly as possible.",
      details: "Email: hello@terms.io | Response time: within 3 business days."
    }
  ];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#0a0a0a",
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
          paddingLeft: "5rem",
          cursor: "grab",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "8rem",
            paddingRight: "5rem",
          }}
        >
          {/* Main Title */}
          <div
            style={{
              flexShrink: 0,
              width: "600px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: "120px",
                fontWeight: "700",
                color: "#ffffff",
                lineHeight: "1",
                marginBottom: "2rem",
                letterSpacing: "-0.02em",
              }}
            >
              TERMS OF<br />SERVICES
            </div>
            <div
              style={{
                fontSize: "20px",
                color: "#888888",
                lineHeight: "1.5",
                borderLeft: "2px solid #333333",
                paddingLeft: "1.5rem",
              }}
            >
              Last updated: April 7, 2026
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div
              key={section.number}
              style={{
                flexShrink: 0,
                width: "480px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "400",
                  color: "#666666",
                  letterSpacing: "0.1em",
                  marginBottom: "1rem",
                }}
              >
                {section.number}
              </div>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "600",
                  color: "#ffffff",
                  marginBottom: "1.5rem",
                  lineHeight: "1.2",
                  letterSpacing: "-0.01em",
                }}
              >
                {section.title}
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#cccccc",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                }}
              >
                {section.description}
              </div>
              <div
                style={{
                  fontSize: "15px",
                  color: "#666666",
                  lineHeight: "1.5",
                  borderTop: "1px solid #222222",
                  paddingTop: "1rem",
                }}
              >
                {section.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
