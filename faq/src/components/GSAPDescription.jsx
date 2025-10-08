import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GSAPDescription() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const paragraphsRef = useRef([]);
  const highlightsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation - GSAP style
      gsap.fromTo(headingRef.current, 
        {
          y: 100,
          opacity: 0,
          scale: 0.8
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Paragraphs stagger animation - Classic GSAP
      gsap.fromTo(paragraphsRef.current,
        {
          x: -100,
          opacity: 0,
          rotationY: 90
        },
        {
          x: 0,
          opacity: 1,
          rotationY: 0,
          duration: 1,
          stagger: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: paragraphsRef.current[0],
            start: "top 70%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Highlights grid animation
      gsap.fromTo(highlightsRef.current,
        {
          y: 50,
          opacity: 0,
          scale: 0
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: highlightsRef.current[0],
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Hover effects dengan GSAP
      paragraphsRef.current.forEach((paragraph, index) => {
        paragraph.addEventListener('mouseenter', () => {
          gsap.to(paragraph, {
            scale: 1.05,
            y: -10,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true
          });

          // Highlight words animation
          const highlights = paragraph.querySelectorAll('.highlight-word');
          gsap.to(highlights, {
            scale: 1.2,
            duration: 0.2,
            stagger: 0.05,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
          });
        });

        paragraph.addEventListener('mouseleave', () => {
          gsap.to(paragraph, {
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: "elastic.out(1, 0.8)"
          });
        });
      });

      // Continuous background animation
      gsap.to(sectionRef.current, {
        backgroundPosition: "200% 200%",
        duration: 20,
        ease: "none",
        repeat: -1
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
        <div ref={headingRef} className="gsap-header">
          <h2 className="gsap-main-title">
            🚀 <span className="gradient-highlight">Revolutionary</span> Web Experience
          </h2>
          <p className="gsap-subtitle">
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
