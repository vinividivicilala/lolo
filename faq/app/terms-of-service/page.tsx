'use client';

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function TermsOfServicePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const text = textRef.current;

    if (!container || !text) return;

    // Get the width of the text
    const textWidth = text.scrollWidth;

    // Set the scroll trigger for horizontal scrolling
    ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: () => `+=${textWidth - window.innerWidth}`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      horizontal: true,
      onUpdate: (self) => {
        gsap.to(container, {
          x: -(textWidth - window.innerWidth) * self.progress,
          duration: 0,
          ease: "none",
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#ffffff",
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
            fontSize: "700px",
            lineHeight: "1",
            padding: "0 2rem",
          }}
        >
          TERMS OF SERVICES
        </div>
      </div>
    </div>
  );
}
