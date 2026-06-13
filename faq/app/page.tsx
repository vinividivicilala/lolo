'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import Image from "next/image";
import Lenis from "@studio-freight/lenis";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

export default function HomePage(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const textRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // State untuk Hover Panel
  const [hoveredNav, setHoveredNav] = useState<string>("Note");
  const [showPanel, setShowPanel] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);
  const panelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // State untuk scroll navbar
  const [isScrolled, setIsScrolled] = useState(false);
  
  // State untuk filter foto
  const [activeFilter, setActiveFilter] = useState<string>("View All");
  
  // State untuk rolling image pada Creative Studio
  const [currentCreativeImageIndex, setCurrentCreativeImageIndex] = useState(0);
  const rollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const creativeImageRef = useRef<HTMLDivElement>(null);

  // Refs
  const headerTextRef = useRef<HTMLDivElement>(null);
  const headerSectionRef = useRef<HTMLDivElement>(null);
  const scrollDownRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const menuruTopTextRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const yearTextRef = useRef<HTMLDivElement>(null);
  const studioTextRef = useRef<HTMLDivElement>(null);
  const studioContainerRef = useRef<HTMLDivElement>(null);
  const bottomLeftTextRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<any>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const startPlanRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  
  const [headerScrollProgress, setHeaderScrollProgress] = useState(0);
  
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const marqueeContentRef = useRef<HTMLDivElement>(null);

  // Data untuk foto portrait dengan kategori
  const portraitImages = [
    { id: 1, src: "/images/11.jpg", alt: "Portrait 1", name: "Creative Studio", category: "Note", rollingImages: ["/images/12.jpg", "/images/13.jpg", "/images/14.jpg", "/images/15.jpg", "/images/16.jpg"] },
    { id: 2, src: "/images/12.jpg", alt: "Portrait 2", name: "Digital Art", category: "Community", rollingImages: [] },
    { id: 3, src: "/images/13.jpg", alt: "Portrait 3", name: "Brand Design", category: "Blog", rollingImages: [] },
    { id: 4, src: "/images/14.jpg", alt: "Portrait 4", name: "UX Research", category: "Note", rollingImages: [] },
    { id: 5, src: "/images/15.jpg", alt: "Portrait 5", name: "UI Design", category: "Community", rollingImages: [] },
    { id: 6, src: "/images/16.jpg", alt: "Portrait 6", name: "Motion Graphics", category: "Blog", rollingImages: [] },
  ];

  // State untuk src foto yang sedang ditampilkan (untuk efek rolling)
  const [imageSrcs, setImageSrcs] = useState(portraitImages.map(img => img.src));

  // Fungsi untuk memulai rolling gambar pada Creative Studio
  const startRollingImages = (index: number) => {
    if (rollingIntervalRef.current) {
      clearInterval(rollingIntervalRef.current);
    }
    
    const creativeImage = portraitImages[index];
    if (!creativeImage.rollingImages || creativeImage.rollingImages.length === 0) return;
    
    let rollIndex = 0;
    
    const imgElement = document.getElementById(`portrait-img-${creativeImage.id}`);
    if (imgElement) {
      gsap.to(imgElement, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          rollingIntervalRef.current = setInterval(() => {
            rollIndex = (rollIndex + 1) % creativeImage.rollingImages.length;
            const newSrc = creativeImage.rollingImages[rollIndex];
            
            setImageSrcs(prev => {
              const newSrcs = [...prev];
              newSrcs[index] = newSrc;
              return newSrcs;
            });
            
            if (imgElement) {
              gsap.to(imgElement, {
                opacity: 1,
                duration: 0.3,
              });
            }
          }, 800);
        }
      });
    }
  };

  // Fungsi untuk menghentikan rolling gambar
  const stopRollingImages = (index: number) => {
    if (rollingIntervalRef.current) {
      clearInterval(rollingIntervalRef.current);
      rollingIntervalRef.current = null;
    }
    
    const originalSrc = portraitImages[index].src;
    const imgElement = document.getElementById(`portrait-img-${portraitImages[index].id}`);
    
    if (imgElement && imageSrcs[index] !== originalSrc) {
      gsap.to(imgElement, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setImageSrcs(prev => {
            const newSrcs = [...prev];
            newSrcs[index] = originalSrc;
            return newSrcs;
          });
          gsap.to(imgElement, {
            opacity: 1,
            duration: 0.3,
          });
        }
      });
    }
  };

  // Filtered images based on active filter
  const getFilteredImages = () => {
    if (activeFilter === "View All") {
      return portraitImages.map((img, idx) => ({ ...img, currentSrc: imageSrcs[idx] }));
    }
    return portraitImages
      .filter(img => img.category === activeFilter)
      .map((img, idx) => {
        const originalIndex = portraitImages.findIndex(p => p.id === img.id);
        return { ...img, currentSrc: imageSrcs[originalIndex] };
      });
  };

  const filteredImages = getFilteredImages();

  // Data untuk Preview Card
  const previewData = {
    Note: {
      title: "Note Features",
      description: "Capture all your daily activities with ease",
      image: "/images/ai.jpg",
      items: [
        { name: "Daily Notes", desc: "Record your daily activities in detail" },
        { name: "Food Log", desc: "Track your food intake and nutrition" },
        { name: "Water Tracker", desc: "Monitor your daily water consumption" },
        { name: "Exercise Log", desc: "Track your workouts and physical activities" },
        { name: "Sleep Tracker", desc: "Monitor your sleep patterns and quality" }
      ]
    },
    Community: {
      title: "Community Features",
      description: "Connect and grow with your community",
      image: "/images/lkhh.jpg",
      items: [
        { name: "General Discussion", desc: "Communicate with fellow members" },
        { name: "Study Groups", desc: "Learn together in groups" },
        { name: "Collaboration", desc: "Work together on projects and ideas" },
        { name: "Events & Meetups", desc: "Event information and gatherings" },
        { name: "Feedback & Suggestions", desc: "Criticism and suggestions for progress" }
      ]
    },
    Donation: {
      title: "Donation Features",
      description: "Donate to help others in need",
      image: "/images/5.jpg",
      items: [
        { name: "Monetary Donation", desc: "Financial donation for those in need" },
        { name: "Food Donation", desc: "Share meals with others" },
        { name: "Book Donation", desc: "Donate books for education" },
        { name: "Clothing Donation", desc: "Donate wearable clothes" },
        { name: "Health Donation", desc: "Donation for health services" }
      ]
    },
    Blog: {
      title: "Blog Features",
      description: "Latest articles and tutorials every day",
      image: "/images/ai.jpg",
      items: [
        { name: "Latest Articles", desc: "Read the latest articles daily" },
        { name: "Tutorials", desc: "Complete and easy-to-follow guides" },
        { name: "Tips & Tricks", desc: "Useful tips for daily life" },
        { name: "News", desc: "Latest news updates" },
        { name: "Video Content", desc: "Interesting video content" }
      ]
    }
  };

  // Notifikasi count
  const notificationCounts = {
    Note: "5",
    Community: "8",
    Donation: "3",
    Blog: "12"
  };

  const rotatingTexts = [
    "Open this",
    "Hey there",
    "Welcome back",
    "Good to see you",
    "Explore now",
    "Join the journey",
    "Stay inspired",
    "Click to begin"
  ];

  // Scroll gallery function
  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryScrollRef.current) {
      const scrollAmount = 324;
      galleryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (rollingIntervalRef.current) {
        clearInterval(rollingIntervalRef.current);
      }
    };
  }, []);

  // Efek untuk scroll down mengikuti cursor
  useEffect(() => {
    if (isLoading || !showScrollDown) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let rafId: number | null = null;
    
    const updatePosition = () => {
      if (scrollDownRef.current) {
        scrollDownRef.current.style.transform = `translate(${mouseX + 20}px, ${mouseY + 20}px)`;
      }
      rafId = requestAnimationFrame(updatePosition);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    document.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(updatePosition);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isLoading, showScrollDown]);

  // Efek untuk animasi marquee
  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      const container = marqueeContainerRef.current;
      const content = marqueeContentRef.current;
      
      if (!container || !content) return;
      
      content.innerHTML = '';
      
      for (let i = 0; i < 10; i++) {
        const marqueeItem = document.createElement('div');
        marqueeItem.style.display = 'inline-flex';
        marqueeItem.style.alignItems = 'center';
        marqueeItem.style.gap = '60px';
        marqueeItem.style.marginRight = '80px';
        marqueeItem.style.flexShrink = '0';
        
        const leftText = document.createElement('span');
        leftText.style.fontFamily = "'Inter', 'Helvetica Neue', sans-serif";
        leftText.style.fontWeight = '700';
        leftText.style.fontSize = '140px';
        leftText.style.color = '#000000';
        leftText.style.letterSpacing = '-0.03em';
        leftText.style.textTransform = 'uppercase';
        leftText.style.lineHeight = '1';
        leftText.style.whiteSpace = 'nowrap';
        leftText.textContent = 'SUBSCRIBE';
        
        const imageContainer = document.createElement('div');
        imageContainer.style.width = '280px';
        imageContainer.style.height = '160px';
        imageContainer.style.backgroundColor = '#e0e0e0';
        imageContainer.style.borderRadius = '16px';
        imageContainer.style.overflow = 'hidden';
        imageContainer.style.position = 'relative';
        imageContainer.style.flexShrink = '0';
        imageContainer.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        
        const img = document.createElement('img');
        img.src = '/images/ai.jpg';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        imageContainer.appendChild(img);
        
        marqueeItem.appendChild(leftText);
        marqueeItem.appendChild(imageContainer);
        
        content.appendChild(marqueeItem);
      }
      
      const cloneContent = content.cloneNode(true);
      content.appendChild(cloneContent);
      
      const contentWidth = content.scrollWidth / 2;
      
      gsap.set(content, { x: 0 });
      
      const animation = gsap.to(content, {
        x: -contentWidth,
        duration: 45,
        ease: "none",
        repeat: -1
      });
      
      const handleMouseEnter = () => animation.pause();
      const handleMouseLeave = () => animation.resume();
      
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        animation.kill();
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Efek untuk animasi scroll header MENURU
  useEffect(() => {
    if (isLoading) return;
    
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: headerSectionRef.current,
        start: "top top",
        end: "+=500",
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          setHeaderScrollProgress(progress);
          
          if (headerTextRef.current) {
            const fontSize = 300 - (progress * 240);
            const newFontSize = Math.max(60, fontSize);
            headerTextRef.current.style.fontSize = `${newFontSize}px`;
          }
          
          if (navbarRef.current && startPlanRef.current) {
            const translateX = -progress * 300;
            navbarRef.current.style.transform = `translateX(${translateX}px)`;
            startPlanRef.current.style.transform = `translateX(${translateX}px)`;
          }
        }
      });
    });
    
    return () => ctx.revert();
  }, [isLoading]);

  // Scroll handler
  useEffect(() => {
    if (isLoading) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      if (scrollY > 50 && showScrollDown) {
        setShowScrollDown(false);
      } else if (scrollY <= 10 && !showScrollDown) {
        setShowScrollDown(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, showScrollDown]);

  // Loading animation
  useEffect(() => {
    if (!isLoading || !loadingOverlayRef.current) return;

    const splitMenuruLoading = new SplitText(menuruTopTextRef.current, {
      type: "chars, words",
      charsClass: "split-char-loading"
    });

    const splitBrand = new SplitText(brandTextRef.current, {
      type: "chars, words",
      charsClass: "split-char-loading"
    });

    const splitYear = new SplitText(yearTextRef.current, {
      type: "chars",
      charsClass: "split-char-loading"
    });

    if (splitMenuruLoading.chars) {
      gsap.set(splitMenuruLoading.chars, {
        opacity: 0,
        y: 120,
        rotationX: -120,
        rotationY: 45,
        transformPerspective: 1200,
        filter: 'blur(25px)',
        transformOrigin: '50% 50% -80px'
      });
    }

    if (splitBrand.chars) {
      gsap.set(splitBrand.chars, {
        opacity: 0,
        x: 100,
        rotationY: 90,
        transformPerspective: 1200,
        filter: 'blur(20px)',
        transformOrigin: '50% 50% -50px'
      });
    }

    if (splitYear.chars) {
      gsap.set(splitYear.chars, {
        opacity: 0,
        y: 80,
        rotationX: -60,
        transformPerspective: 1000,
        filter: 'blur(15px)',
        transformOrigin: '50% 50% -30px'
      });
    }

    const loadingTimeline = gsap.timeline({
      onComplete: () => {
        gsap.to(loadingOverlayRef.current, {
          x: '-100%',
          duration: 1,
          ease: "power3.inOut",
          onComplete: () => {
            setIsLoading(false);
            gsap.fromTo(mainContentRef.current,
              { x: '100%', opacity: 0.5 },
              { x: '0%', opacity: 1, duration: 1, ease: "power3.inOut" }
            );
            animateStudioText();
          }
        });
      }
    });

    if (splitMenuruLoading.chars) {
      loadingTimeline.to(splitMenuruLoading.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: { each: 0.05, from: "start", ease: "back.out(1.2)" },
        ease: "back.out(0.8)"
      }, 0);
    }

    if (splitBrand.chars) {
      loadingTimeline.to(splitBrand.chars, {
        opacity: 1,
        x: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1,
        stagger: { each: 0.04, from: "end", ease: "power2.out" },
        ease: "back.out(1)"
      }, 0.2);
    }

    if (splitYear.chars) {
      loadingTimeline.to(splitYear.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: { each: 0.08, from: "start", ease: "bounce.out" },
        ease: "back.out(1.1)"
      }, 0.4);
    }

    return () => {
      loadingTimeline.kill();
    };
  }, [isLoading]);

  const animateStudioText = () => {
    if (studioTextRef.current) {
      gsap.set(studioTextRef.current, { opacity: 0, y: 50 });
      gsap.to(studioTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3
      });
    }

    if (bottomLeftTextRef.current) {
      gsap.set(bottomLeftTextRef.current, { opacity: 0, y: 50 });
      gsap.to(bottomLeftTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.45
      });
    }
  };

  // ScrollSmoother init
  useEffect(() => {
    const initSmoother = () => {
      if (typeof window !== 'undefined' && !smootherRef.current) {
        smootherRef.current = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          effects: true,
          smoothTouch: 0.5,
          normalizeScroll: true,
          ignoreMobileResize: true,
        });
      }
    };

    const timer = setTimeout(() => {
      initSmoother();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Lenis init
  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isLoading]);

  // Efek GSAP untuk pergantian teks floating button
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const changeText = () => {
      if (!textRef.current) return;
      
      gsap.to(textRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
          gsap.fromTo(textRef.current, 
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        }
      });
    };
    
    if (!isHovering) {
      intervalId = setInterval(changeText, 8000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovering, rotatingTexts.length]);

  const handleTextHover = () => {
    setIsHovering(true);
    if (!textRef.current) return;
    
    gsap.to(textRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        const randomIndex = Math.floor(Math.random() * rotatingTexts.length);
        setCurrentTextIndex(randomIndex);
        gsap.fromTo(textRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }
    });
    
    setTimeout(() => {
      setIsHovering(false);
    }, 3000);
  };

  // Handler untuk hover panel
  const handleNavHover = (navName: string) => {
    if (panelTimeoutRef.current) {
      clearTimeout(panelTimeoutRef.current);
    }
    setHoveredNav(navName);
    setShowPanel(true);
  };

  const handleNavLeave = () => {
    panelTimeoutRef.current = setTimeout(() => {
      setShowPanel(false);
    }, 100);
  };

  const handlePanelLeave = () => {
    setShowPanel(false);
  };

  const getPanelPosition = () => {
    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.bottom + 15,
      };
    }
    return { left: 0, top: 0 };
  };

  const panelPosition = getPanelPosition();

  const navNames = ["Note", "Community", "Donation", "Blog"];

  // Filter options untuk gallery
  const filterOptions = [
    { label: "View All", color: "black" },
    { label: "Note", color: "green" },
    { label: "Community", color: "blue" },
    { label: "Blog", color: "red" }
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @font-face {
          font-family: 'Aeonik-Regular';
          src: url('/fonts/Aeonik-Regular.woff2') format('woff2'),
               url('/fonts/Aeonik-Regular.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        *::-webkit-scrollbar {
          display: none;
        }

        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: white;
        }

        #smooth-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        #smooth-content {
          min-height: 100vh;
          width: 100%;
          will-change: transform;
        }

        .split-char-loading {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .studio-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 80px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .bottom-left-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 40px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        .preview-card {
          position: fixed;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 0.2s ease;
          width: 650px;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
          z-index: 100000;
        }
        
        .preview-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 40px 80px -12px rgba(0, 0, 0, 0.35);
        }
        
        .preview-card-inner {
          display: flex;
          padding: 32px;
          gap: 32px;
        }
        
        .preview-left {
          flex: 1.5;
        }
        
        .preview-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .preview-item:last-child {
          border-bottom: none;
        }
        
        .preview-item:hover {
          transform: translateX(8px);
        }
        
        .preview-item-name {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: #000000;
        }
        
        .preview-item-desc {
          font-family: 'Questrial', sans-serif;
          font-size: 13px;
          color: #666666;
          margin-top: 4px;
        }
        
        .preview-item-arrow {
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #000000;
        }
        
        .preview-item:hover .preview-item-arrow {
          opacity: 1;
        }
        
        .preview-right {
          width: 240px;
          flex-shrink: 0;
          background: #fafafa;
          border-radius: 20px;
          padding: 20px;
        }
        
        .preview-title {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 40px;
          font-weight: 700;
          color: #000000;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        
        .preview-description {
          font-family: 'Questrial', sans-serif;
          font-size: 15px;
          color: #333333;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        
        .preview-image {
          width: 100%;
          height: 160px;
          background-color: #e0e0e0;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
        }
        
        .preview-view-all {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 18px;
          background-color: #000000;
          border-radius: 60px;
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }
        
        .preview-view-all:hover {
          background-color: #333333;
          transform: scale(1.02);
        }

        /* Meet the team button */
        .meet-team-btn {
          display: inline-flex;
          align-items: center;
          background-color: #c5e800;
          border-radius: 60px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-left: 20px;
        }
        
        .meet-team-btn:hover {
          transform: translateX(4px);
          opacity: 0.9;
        }
        
        .meet-team-text {
          padding: 12px 20px 12px 24px;
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: #000000;
          letter-spacing: -0.01em;
        }
        
        .meet-team-icon {
          width: 48px;
          height: 48px;
          background-color: #000000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
          transition: all 0.3s ease;
        }
        
        .meet-team-icon svg {
          stroke: #c5e800;
          width: 22px;
          height: 22px;
        }
        
        .meet-team-btn:hover .meet-team-icon {
          transform: rotate(45deg);
        }

        /* Start a Plan button */
        .start-plan-btn {
          display: inline-flex;
          align-items: center;
          background-color: #000000;
          border-radius: 60px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.15);
          white-space: nowrap;
        }
        
        .start-plan-btn:hover {
          transform: translateX(4px) !important;
          opacity: 0.9;
        }
        
        .start-plan-text {
          padding: 12px 20px 12px 24px;
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        
        .start-plan-icon {
          width: 48px;
          height: 48px;
          background-color: #c5e800;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
          transition: all 0.3s ease;
        }
        
        .start-plan-icon svg {
          stroke: #000000;
          width: 22px;
          height: 22px;
        }
        
        .start-plan-btn:hover .start-plan-icon {
          transform: rotate(45deg);
        }

        /* Left text styles */
        .left-headline {
          font-family: 'Inter', 'Helvetica Neue', sans-serif;
          font-weight: 400;
          font-size: 120px;
          color: #000000;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 40px;
          white-space: nowrap;
        }
        
        .left-subheadline {
          font-family: 'Questrial', sans-serif;
          font-weight: 400;
          font-size: 40px;
          color: #000000;
          letter-spacing: -0.02em;
          line-height: 1.3;
          max-width: 1000px;
          margin-bottom: 40px;
        }

        /* Bottom row container */
        .bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
          margin-bottom: 40px;
        }

        /* Color dots with labels */
        .dots-container {
          display: flex;
          align-items: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .dot-item {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .dot-item:hover {
          transform: translateX(4px);
        }

        .dot-item.active .dot-label {
          font-weight: 600;
        }

        .dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          transition: transform 0.2s ease;
        }

        .dot:hover {
          transform: scale(1.2);
        }

        .dot-black {
          background-color: #000000;
        }

        .dot-green {
          background-color: #c5e800;
        }

        .dot-blue {
          background-color: #3b82f6;
        }

        .dot-red {
          background-color: #ef4444;
        }

        .dot-label {
          font-family: 'Questrial', sans-serif;
          font-size: 18px;
          font-weight: 400;
          color: #000000;
          letter-spacing: -0.01em;
          transition: font-weight 0.2s ease;
        }

        /* Navigation arrows */
        .nav-arrows {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .arrow-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #c5e800;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .arrow-btn:hover {
          transform: scale(1.1);
          background-color: #a8c400;
        }

        .arrow-btn svg {
          stroke: #000000;
          width: 32px;
          height: 32px;
        }

        .arrow-left svg {
          transform: rotate(180deg);
        }

        /* Gallery Section */
        .gallery-section {
          margin-top: 20px;
          width: 100%;
        }

        .gallery-scroll {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .gallery-scroll::-webkit-scrollbar {
          display: none;
        }

        .portrait-card {
          flex-shrink: 0;
          width: 300px;
        }

        .portrait-image {
          width: 100%;
          height: 450px;
          background-color: #e0e0e0;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          margin-bottom: 16px;
          cursor: pointer;
        }

        .portrait-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .portrait-name {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 18px;
          font-weight: 500;
          color: #000000;
        }

        .portrait-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .portrait-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .portrait-dot:hover {
          transform: scale(1.3);
        }

        .portrait-dot-black {
          background-color: #000000;
        }

        .portrait-dot-green {
          background-color: #c5e800;
        }

        .portrait-dot-blue {
          background-color: #3b82f6;
        }

        .portrait-dot-red {
          background-color: #ef4444;
        }

        /* Our plan text */
        .our-plan-text {
          font-family: 'Inter', 'Helvetica Neue', sans-serif;
          font-weight: 400;
          font-size: 200px;
          color: #000000;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-top: 80px;
          margin-bottom: 60px;
          white-space: nowrap;
        }

        /* View plan button - sisi kiri */
        .view-plan-button {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: opacity 0.2s ease;
          text-decoration: none;
        }

        .view-plan-button:hover {
          opacity: 0.7;
        }

        .view-plan-text {
          font-family: 'Questrial', sans-serif;
          font-size: 40px;
          font-weight: 500;
          color: #000000;
          letter-spacing: -0.02em;
        }

        .view-plan-icon svg {
          stroke: #000000;
          width: 48px;
          height: 48px;
        }

        /* Projects description - sisi kanan, 2 baris, font 20px */
        .projects-description {
          font-family: 'Questrial', sans-serif;
          font-weight: 400;
          font-size: 20px;
          color: #000000;
          letter-spacing: -0.01em;
          line-height: 1.4;
          text-align: right;
          max-width: 500px;
        }
      `}</style>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div
          ref={loadingOverlayRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '40px',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            <span ref={menuruTopTextRef}>MENURU</span>
          </div>

          <div style={{
            position: 'absolute',
            top: '50%',
            right: '60px',
            transform: 'translateY(-50%)',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            textAlign: 'right',
          }}>
            <span ref={brandTextRef}>BRAND</span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            <span ref={yearTextRef}>2026</span>
          </div>
        </div>
      )}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div
            ref={mainContentRef}
            style={{
              minHeight: '100vh',
              backgroundColor: 'white',
              margin: 0,
              padding: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Questrial, sans-serif',
              position: 'relative',
              opacity: isLoading ? 0 : 1,
              transform: isLoading ? 'translateX(100%)' : 'translateX(0)',
              transition: 'all 0.01s ease'
            }}
          >
            {/* HEADER SECTION */}
            <div
              ref={headerSectionRef}
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '100vh',
                backgroundColor: 'transparent',
                zIndex: 10,
                paddingBottom: '150px'
              }}
            >
              <div
                ref={headerContainerRef}
                style={{
                  position: 'relative',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: '40px 40px 0 40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '40px'
                }}
              >
                {/* Teks MENURU besar - Sisi Kiri */}
                <div
                  ref={headerTextRef}
                  style={{
                    fontFamily: 'Inter, "Helvetica Neue", sans-serif',
                    fontWeight: '400',
                    fontSize: '300px',
                    lineHeight: '1',
                    color: '#000000',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    transition: 'font-size 0.1s linear'
                  }}
                >
                  MENURU
                </div>

                {/* Container untuk Navbar dan Start a Plan */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                  {/* NAVBAR */}
                  <div
                    ref={navbarRef}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '48px',
                      transition: 'transform 0.1s linear'
                    }}
                  >
                    {navNames.map((item) => (
                      <div
                        key={item}
                        ref={item === "Note" ? noteRef : null}
                        style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onMouseEnter={() => handleNavHover(item)}
                        onMouseLeave={handleNavLeave}
                      >
                        <span
                          style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '32px',
                            fontWeight: '400',
                            color: '#000000',
                            letterSpacing: '-0.01em',
                            transition: 'opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          {item}
                        </span>
                        <sup
                          style={{
                            fontFamily: "'Aeonik-Regular', Helvetica, Arial, sans-serif",
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#ED1B3C',
                            marginLeft: '2px'
                          }}
                        >
                          {notificationCounts[item as keyof typeof notificationCounts]}
                        </sup>
                      </div>
                    ))}
                  </div>

                  {/* START A PLAN */}
                  <Link href="/start-plan" className="start-plan-btn" ref={startPlanRef} style={{ transition: 'transform 0.1s linear' }}>
                    <span className="start-plan-text">Start a Plan</span>
                    <div className="start-plan-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                </div>
              </div>

              {/* MARQUEE SECTION */}
              <div
                ref={marqueeContainerRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  marginTop: '100px',
                  marginBottom: '80px',
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                  marginLeft: '-40px',
                  width: 'calc(100% + 80px)'
                }}
              >
                <div
                  ref={marqueeContentRef}
                  style={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    willChange: 'transform',
                    width: 'fit-content'
                  }}
                />
              </div>

              {/* LEFT TEXT SECTION */}
              <div
                style={{
                  position: 'relative',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  marginTop: '0px',
                }}
              >
                <div className="left-headline">
                  Easy to "get" and hard to forget.
                </div>
                <div className="left-subheadline">
                  Our work taps into cultural moments to create brands <br />that resonate in noisy spaces.
                </div>
                
                {/* BOTTOM ROW - Dots dan Arrows */}
                <div className="bottom-row">
                  <div className="dots-container">
                    {filterOptions.map((option) => (
                      <div 
                        key={option.label}
                        className={`dot-item ${activeFilter === option.label ? 'active' : ''}`}
                        onClick={() => setActiveFilter(option.label)}
                      >
                        <div className={`dot dot-${option.color === 'black' ? 'black' : option.color === 'green' ? 'green' : option.color === 'blue' ? 'blue' : 'red'}`}></div>
                        <span className="dot-label">{option.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="nav-arrows">
                    <div className="arrow-btn arrow-left" onClick={() => scrollGallery('left')}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="arrow-btn arrow-right" onClick={() => scrollGallery('right')}>
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* GALLERY SECTION */}
                <div className="gallery-section">
                  <div className="gallery-scroll" ref={galleryScrollRef}>
                    {filteredImages.map((portrait, idx) => {
                      const originalIndex = portraitImages.findIndex(p => p.id === portrait.id);
                      const currentImageSrc = imageSrcs[originalIndex];
                      const isCreativeStudio = portrait.name === "Creative Studio";
                      
                      return (
                        <div key={portrait.id} className="portrait-card">
                          <div 
                            className="portrait-image"
                            onMouseEnter={() => isCreativeStudio && startRollingImages(originalIndex)}
                            onMouseLeave={() => isCreativeStudio && stopRollingImages(originalIndex)}
                          >
                            <Image
                              id={`portrait-img-${portrait.id}`}
                              src={currentImageSrc}
                              alt={portrait.alt}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className="portrait-info">
                            <span className="portrait-name">{portrait.name}</span>
                            <div className="portrait-dots">
                              <div className="portrait-dot portrait-dot-black" title="View All"></div>
                              <div className="portrait-dot portrait-dot-green" title="Note"></div>
                              <div className="portrait-dot portrait-dot-blue" title="Community"></div>
                              <div className="portrait-dot portrait-dot-red" title="Blog"></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OUR PLAN TEXT */}
                <div className="our-plan-text">
                  Our plan
                </div>

                {/* SECTION: View plan di kiri, Explore some di kanan, sejajar */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '40px',
                  marginTop: '0px',
                  marginBottom: '80px'
                }}>
                  {/* KIRI: View plan button */}
                  <Link href="/plan" className="view-plan-button">
                    <span className="view-plan-text">View plan</span>
                    <div className="view-plan-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>

                  {/* KANAN: Explore some text - 2 BARIS, font 20px, rata kanan */}
                  <div className="projects-description">
                    Explore some of our recent projects,<br />
                    showcasing work across diverse sectors and product ranges.
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1 - MENURU.STUDIO */}
            <div
              ref={studioContainerRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: '100vh',
                paddingRight: '80px',
                paddingBottom: '120px',
                position: 'relative',
              }}
            >
              <div
                ref={studioTextRef}
                className="studio-text"
                style={{
                  textAlign: 'right',
                  opacity: 0
                }}
              >
                <div>MENURU.STUDIO – Jakarta UX/UI Design</div>
                <div>Personal for Note, Donation & Calendar</div>
              </div>

              <div
                ref={bottomLeftTextRef}
                className="bottom-left-text"
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  left: '80px',
                  textAlign: 'left',
                  opacity: 0,
                }}
              >
                IDN
                <br />
                MN'RU© - 26'
              </div>

              {/* ABOUT SECTION */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  right: '80px',
                  textAlign: 'left',
                  maxWidth: '900px',
                  marginBottom: '60px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#000000',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'Questrial, sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ABOUT
                  </div>

                  <div
                    style={{
                      fontSize: '20px',
                      lineHeight: '1.4',
                      fontWeight: 400,
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      fontFamily: 'Questrial, sans-serif',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <span>
                      I am a developer based in Jakarta focused on creating
                      interactive digital experiences on the web, working with brands
                      and industry leaders such personal others to achieve this.
                    </span>
                    
                    {/* TOMBOL PROFILE */}
                    <Link href="/profile">
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <span
                          style={{
                            fontSize: '50px',
                            fontWeight: 500,
                            color: '#000000',
                            fontFamily: 'Questrial, sans-serif',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Profile
                        </span>
                        <svg
                          width="50"
                          height="50"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ stroke: '#000000', strokeWidth: '1.5' }}
                        >
                          <path
                            d="M7 17L17 7M17 7H7M17 7V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </Link>

                    {/* MEET THE TEAM BUTTON */}
                    <div className="meet-team-btn">
                      <span className="meet-team-text">Meet the team</span>
                      <div className="meet-team-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#c5e800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SCROLL DOWN */}
            {showScrollDown && !isLoading && (
              <div
                ref={scrollDownRef}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: 'Questrial, sans-serif',
                  userSelect: 'none',
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  padding: '10px 20px',
                  borderRadius: '60px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', color: '#ffffff' }}>
                  SCROLL DOWN
                </span>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ animation: 'bounce 1.2s ease infinite' }}
                >
                  <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}

            {/* FLOATING BUTTON */}
            <div
              style={{
                position: 'fixed',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 99999,
              }}
            >
              <div
                style={{
                  background: '#050505',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: isMenuOpen ? '28px' : '999px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                  width: '1000px',
                  maxWidth: '92vw',
                  transition: 'all .7s cubic-bezier(.16,1,.3,1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    maxHeight: isMenuOpen ? '800px' : '0',
                    opacity: isMenuOpen ? 1 : 0,
                    visibility: isMenuOpen ? 'visible' : 'hidden',
                    transition: 'max-height .7s cubic-bezier(.16,1,.3,1), opacity .45s ease .15s, visibility .45s ease .15s',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '30px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <img src="/images/lkhh.jpg" alt="Menuru Brand" style={{ width: '60px', height: '60px', borderRadius: '16px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ color: '#fff', fontSize: '48px', lineHeight: '1', fontWeight: 600, fontFamily: 'Questrial, sans-serif', letterSpacing: '-0.02em' }}>MENURU</div>
                        <div style={{ color: '#8a8a8a', marginTop: '8px', fontSize: '14px', fontFamily: 'Questrial, sans-serif' }}>Creative Digital Studio</div>
                      </div>
                    </div>
                    <div style={{ background: '#fff', color: '#000', padding: '10px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Let's Talk</div>
                  </div>
                  {[
                    { name: 'Homepage', link: '/' },
                    { name: 'Studios', link: '/studios' },
                    { name: 'Recognition', link: '/recognition' },
                    { name: 'Work', link: '/work' },
                    { name: 'Blog', link: '/blog' },
                    { name: 'Contact', link: '/contact' },
                  ].map((item, index) => (
                    <Link href={item.link} key={index} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 30px', borderBottom: index !== 5 ? '1px solid rgba(255,255,255,0.06)' : 'none', cursor: 'pointer', transition: 'all .3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <span style={{ color: '#fff', fontSize: '28px', fontWeight: 400, fontFamily: 'Questrial, sans-serif' }}>{item.name}</span>
                        <span style={{ color: '#777', fontSize: '14px', fontFamily: 'Questrial, sans-serif' }}>View</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '68px', cursor: 'pointer', borderTop: isMenuOpen ? '1px solid rgba(255,255,255,0.08)' : 'none', background: '#050505' }}>
                  <div ref={textRef} onMouseEnter={handleTextHover} style={{ color: '#fff', fontSize: '18px', fontFamily: 'Questrial, sans-serif', cursor: 'pointer', display: 'inline-block', whiteSpace: 'nowrap' }}>{rotatingTexts[currentTextIndex]}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}><div style={{ background: '#fff', color: '#000', borderRadius: '999px', padding: '8px 24px', fontSize: '16px', fontWeight: 500, fontFamily: 'Questrial, sans-serif' }}>Homepage</div></Link>
                    <span style={{ color: '#fff', fontSize: '28px', fontWeight: 300, cursor: 'pointer' }}>{isMenuOpen ? '−' : '+'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW CARD */}
      {showPanel && (
        <div
          className="preview-card"
          onMouseEnter={() => {
            if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
          }}
          onMouseLeave={handlePanelLeave}
          style={{
            left: panelPosition.left,
            top: panelPosition.top,
          }}
        >
          <div className="preview-card-inner">
            <div className="preview-left">
              <div className="preview-items">
                {previewData[hoveredNav as keyof typeof previewData].items.map((item, idx) => (
                  <div key={idx} className="preview-item">
                    <div>
                      <div className="preview-item-name">{item.name}</div>
                      <div className="preview-item-desc">{item.desc}</div>
                    </div>
                    <div className="preview-item-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="preview-right">
              <div className="preview-title">
                {previewData[hoveredNav as keyof typeof previewData].title}
              </div>
              <div className="preview-description">
                {previewData[hoveredNav as keyof typeof previewData].description}
              </div>
              <div className="preview-image">
                <Image
                  src={previewData[hoveredNav as keyof typeof previewData].image}
                  alt={hoveredNav}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="preview-view-all">
                <span>Explore Now</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
