import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GSAPDescription() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const paragraphsRef = useRef([]);
  const highlightsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const masterTL = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          markers: false,
        }
      });

      // 1. HEADING ANIMATION - Smooth GSAP Style
      masterTL.fromTo(headingRef.current, 
        {
          y: 100,
          opacity: 0,
          scale: 0.6,
          rotationX: 90
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          ease: "power4.out",
          transformOrigin: "center bottom"
        }
      );

      // 2. SUBTITLE ANIMATION - Typing-like Smooth Transition
      masterTL.fromTo(subtitleRef.current,
        {
          opacity: 0,
          x: -80
        },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out"
        },
        "-=0.6"
      );

      // 3. PARAGRAPHS STAGGER - Smoother GSAP Stagger with Adjusted Delay
      masterTL.fromTo(paragraphsRef.current,
        {
          x: -150,
          opacity: 0,
          scale: 0.7,
          rotationY: 35
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 1.3,
          stagger: {
            each: 0.4,
            from: "start",
            ease: "power3.out"
          },
          ease: "back.out(2)"
        },
        "-=0.4"
      );

      // 4. HIGHLIGHTS GRID - Bounce In with Delayed Stagger
      masterTL.fromTo(highlightsRef.current,
        {
          y: 120,
          opacity: 0,
          scale: 0.1
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.0,
          stagger: {
            each: 0.1,
            grid: "auto",
            from: "center"
          },
          ease: "bounce.out"
        },
        "-=0.7"
      );

      // SCROLL TRIGGERS untuk setiap paragraph dengan lebih halus
      paragraphsRef.current.forEach((paragraph, index) => {
        gsap.fromTo(paragraph,
          {
            opacity: 0.2,
            scale: 0.95
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: paragraph,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // Hover Effects with GSAP Physics - Added Z rotation for smoother hover
      paragraphsRef.current.forEach((paragraph) => {
        paragraph.addEventListener('mouseenter', () => {
          gsap.to(paragraph, {
            scale: 1.1,
            y: -20,
            rotationZ: 5,
            duration: 0.5,
            ease: "power3.out",
            overwrite: true
          });

          const highlights = paragraph.querySelectorAll('.highlight-word');
          gsap.to(highlights, {
            scale: 1.4,
            y: -8,
            duration: 0.3,
            stagger: 0.06,
            ease: "power2.inOut",
            yoyo: true,
            repeat: 1
          });
        });

        paragraph.addEventListener('mouseleave', () => {
          gsap.to(paragraph, {
            scale: 1,
            y: 0,
            rotationZ: 0,
            duration: 0.7,
            ease: "elastic.out(1.2, 0.8)"
          });
        });
      });

      // Continuous Background Animation with smooth transition
      gsap.to(sectionRef.current, {
        backgroundPosition: "200% 200%",
        duration: 30,
        ease: "none",
        repeat: -1,
        yoyo: true
      });

      // TEXT GRADIENT ANIMATION with smoother transition
      gsap.to(".gradient-highlight", {
        backgroundPosition: "200% 200%",
        duration: 4,
        ease: "none",
        repeat: -1,
        yoyo: true
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const addToParagraphsRef = (el) => {
    if (el && !paragraphsRef.current.includes(el)) {
      paragraphsRef.current.push(el);
    }
  };

  const addToHighlightsRef = (el) => {
    if (el && !highlightsRef.current.includes(el)) {
      highlightsRef.current.push(el);
    }
  };

  return (
    <section ref={sectionRef} className="gsap-description-section">
      <div className="gsap-description-linebox">
        <div className="gsap-header">
          <h2 ref={headingRef} className="gsap-main-title">
            🚀 <span className="gradient-highlight">Revolutionary</span> Web Experience
          </h2>
          <p ref={subtitleRef} className="gsap-subtitle">
            Dibangun dengan teknologi terdepan untuk performa maksimal
          </p>
        </div>

        <div className="description-content">
          <DescriptionParagraph
            ref={addToParagraphsRef}
            icon="⚡"
            text="Website ini menggunakan <highlight>Astro</highlight> yang menghilangkan JavaScript tidak perlu, menghasilkan <highlight>loading time tercepat</highlight> dan <highlight>Core Web Vitals score 100</highlight>"
          />
          
          <DescriptionParagraph
            ref={addToParagraphsRef}
            icon="🎨"
            text="Dilengkapi dengan <highlight>Framer Motion</highlight> untuk animasi smooth, <highlight>scroll-triggered effects</highlight>, dan <highlight>micro-interactions</highlight> yang memukau"
          />
          
          <DescriptionParagraph
            ref={addToParagraphsRef}
            icon="🔧"
            text="Backend powered oleh <highlight>Firebase</highlight> dengan realtime database, authentication, dan <highlight>cloud functions</highlight> yang scalable"
          />
          
          <DescriptionParagraph
            ref={addToParagraphsRef}
            icon="📱"
            text="Desain <highlight>mobile-first responsive</highlight> dengan <highlight>progressive enhancement</highlight> untuk semua device dan jaringan"
          />
          
          <DescriptionParagraph
            ref={addToParagraphsRef}
            icon="🚀"
            text="Optimized untuk <highlight>SEO</highlight>, <highlight>accessibility</highlight>, dan <highlight>user experience</highlight> terbaik dengan modern best practices"
          />
          
          <DescriptionParagraph
            ref={addToParagraphsRef}
            icon="💫"
            text="Mengimplementasikan <highlight>modern CSS</highlight> dengan Grid, Flexbox, Custom Properties, dan <highlight>advanced animations</highlight>"
          />
        </div>

        <div className="tech-highlights">
          <div className="highlight-grid">
            <TechHighlight ref={addToHighlightsRef} icon="🔥" text="Zero JS by Default" color="orange" />
            <TechHighlight ref={addToHighlightsRef} icon="⚡" text="Instant Loading" color="yellow" />
            <TechHighlight ref={addToHighlightsRef} icon="🎯" text="Perfect Scores" color="green" />
            <TechHighlight ref={addToHighlightsRef} icon="🔒" text="Secure & Safe" color="blue" />
            <TechHighlight ref={addToHighlightsRef} icon="📈" text="SEO Optimized" color="purple" />
            <TechHighlight ref={addToHighlightsRef} icon="🌟" text="Modern Stack" color="pink" />
          </div>
        </div>
      </div>
    </section>
  );
}

const DescriptionParagraph = React.forwardRef(({ icon, text }, ref) => {
  const parts = text.split(/(<highlight>.*?<\/highlight>)/g);
  
  return (
    <div ref={ref} className="description-paragraph">
      <span className="paragraph-icon">{icon}</span>
      <p className="paragraph-text">
        {parts.map((part, index) => {
          if (part.startsWith('<highlight>') && part.endsWith('</highlight>')) {
            const highlightText = part.replace(/<\/?highlight>/g, '');
            return (
              <span key={index} className="highlight-word">
                {highlightText}
              </span>
            );
          }
          return part;
        })}
      </p>
    </div>
  );
});

const TechHighlight = React.forwardRef(({ icon, text, color }, ref) => {
  return (
    <div ref={ref} className={`tech-highlight ${color}`}>
      <div className="highlight-icon">{icon}</div>
      <div className="highlight-text">{text}</div>
    </div>
  );
});
