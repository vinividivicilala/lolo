'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // GSAP Animation for menu button
  useEffect(() => {
    if (menuButtonRef.current && !showLoading) {
      const menuText = menuButtonRef.current;
      
      // Initial animation when component mounts
      gsap.fromTo(menuText,
        {
          opacity: 0,
          y: -20,
          rotation: -10
        },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: 1,
          delay: 1.2,
          ease: "elastic.out(1, 0.5)"
        }
      );
    }
  }, [showLoading]);

  const openMenu = () => {
    setShowMenu(true);
    
    if (menuOverlayRef.current && menuRef.current && closeButtonRef.current) {
      // Reset styles before animation
      gsap.set(menuOverlayRef.current, { 
        scaleY: 0, 
        transformOrigin: "top",
        display: "flex" 
      });
      
      gsap.set(menuRef.current, { 
        x: -100, 
        opacity: 0 
      });
      
      gsap.set(closeButtonRef.current, { 
        opacity: 0, 
        rotation: -180 
      });

      // Create timeline for menu opening
      const tl = gsap.timeline();
      
      // Animate menu overlay
      tl.to(menuOverlayRef.current, {
        scaleY: 1,
        duration: 0.8,
        ease: "power3.inOut"
      })
      // Animate menu items
      .to(".menu-item", {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      }, "-=0.4")
      // Animate website name
      .to(".website-name", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.6")
      // Animate close button
      .to(closeButtonRef.current, {
        opacity: 1,
        rotation: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");
    }
  };

  const closeMenu = () => {
    if (menuOverlayRef.current && menuRef.current && closeButtonRef.current) {
      // Create timeline for menu closing
      const tl = gsap.timeline();
      
      // Animate close button
      tl.to(closeButtonRef.current, {
        opacity: 0,
        rotation: 180,
        duration: 0.4,
        ease: "power2.out"
      })
      // Animate website name
      .to(".website-name", {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.3")
      // Animate menu items
      .to(".menu-item", {
        x: -100,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.in"
      }, "-=0.3")
      // Animate menu overlay
      .to(menuOverlayRef.current, {
        scaleY: 0,
        duration: 0.7,
        ease: "power3.inOut",
        onComplete: () => {
          setShowMenu(false);
        }
      });
    } else {
      setShowMenu(false);
    }
  };

  const toggleMenu = () => {
    if (showMenu) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const navigateToNotes = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/notes');
    }, 1000);
  };

  const handleMenuHover = () => {
    if (!menuButtonRef.current) return;
    
    setIsMenuHovered(true);
    
    // Hover animation
    gsap.to(menuButtonRef.current, {
      scale: 1.1,
      color: "#CCFF00",
      duration: 0.3,
      ease: "power2.out"
    });
    
    // Add floating animation
    gsap.to(menuButtonRef.current, {
      y: -5,
      duration: 0.6,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });
    
    // Add glow effect
    gsap.to(menuButtonRef.current, {
      textShadow: "0 0 10px #CCFF00, 0 0 20px #CCFF00",
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMenuLeave = () => {
    if (!menuButtonRef.current) return;
    
    setIsMenuHovered(false);
    
    // Reset hover animation
    gsap.to(menuButtonRef.current, {
      scale: 1,
      color: "white",
      duration: 0.3,
      ease: "power2.out"
    });
    
    // Stop floating animation
    gsap.killTweensOf(menuButtonRef.current);
    gsap.to(menuButtonRef.current, {
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
    
    // Remove glow effect
    gsap.to(menuButtonRef.current, {
      textShadow: "0 0 0px rgba(255,255,255,0)",
      duration: 0.4,
      ease: "power2.out"
    });
  };

  const handleMenuClick = () => {
    if (!menuButtonRef.current) return;
    
    // Click animation
    gsap.to(menuButtonRef.current, {
      scale: 0.9,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(menuButtonRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "elastic.out(1, 0.5)"
        });
      }
    });
    
    // Ripple effect
    gsap.to(menuButtonRef.current, {
      rotation: 360,
      duration: 0.6,
      ease: "power2.out"
    });
    
    // Color flash
    gsap.to(menuButtonRef.current, {
      color: "#FF00FF",
      duration: 0.1,
      onComplete: () => {
        gsap.to(menuButtonRef.current, {
          color: isMenuHovered ? "#CCFF00" : "white",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });
    
    toggleMenu();
  };

  const handleMenuItemHover = (itemName: string) => {
    setHoveredItem(itemName);
    
    // GSAP hover animation for menu item
    const currentItem = document.querySelector(`[data-item="${itemName}"]`);
    const arrow = document.querySelector(`[data-arrow="${itemName}"]`);
    
    if (currentItem && arrow) {
      gsap.to(currentItem, {
        x: 20,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(arrow, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMenuItemLeave = (itemName: string) => {
    setHoveredItem(null);
    
    // GSAP leave animation for menu item
    const currentItem = document.querySelector(`[data-item="${itemName}"]`);
    const arrow = document.querySelector(`[data-arrow="${itemName}"]`);
    
    if (currentItem && arrow) {
      gsap.to(currentItem, {
        x: 0,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(arrow, {
        opacity: 0,
        x: -10,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const menuItems = [
    { name: "HOME", delay: 0.3 },
    { name: "WORK", delay: 0.4 },
    { name: "ABOUT", delay: 0.5 },
    { name: "CONTACT", delay: 0.6 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Saans Trial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Menu Button with GSAP Animations */}
      <div
        ref={menuButtonRef}
        onClick={handleMenuClick}
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          fontSize: '1.2rem',
          fontWeight: '500',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'Saans Trial, sans-serif',
          letterSpacing: '2px',
          zIndex: 20,
          padding: '0.5rem 1rem',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          borderRadius: '25px',
          border: '2px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {/* Animated dots */}
        <div className="menu-dots" style={{
          display: 'flex',
          gap: '2px'
        }}>
          <div style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'currentColor'
          }}></div>
          <div style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'currentColor'
          }}></div>
          <div style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'currentColor'
          }}></div>
        </div>
        メニュー
      </div>

      {/* Menu Overlay with GSAP Animations */}
      {showMenu && (
        <>
          {/* Background Overlay */}
          <div
            ref={menuOverlayRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#CCFF00',
              zIndex: 25,
              display: 'none',
              flexDirection: 'column',
              padding: '2rem'
            }}
          >
            {/* Website Name - Top Left */}
            <div
              className="website-name"
              style={{
                position: 'absolute',
                left: '2rem',
                top: '2rem',
                fontSize: '1.8rem',
                fontWeight: '400',
                color: 'black',
                fontFamily: 'Saans Trial, sans-serif',
                lineHeight: 1,
                letterSpacing: '1px',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                opacity: 0,
                y: -20
              }}
            >
              sorusuru
            </div>

            {/* Main Content - Navigation Menu */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingLeft: '2rem'
            }}>
              {/* Menu Items - Very tight spacing */}
              <div ref={menuRef} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0rem'
              }}>
                {menuItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="menu-item"
                    data-item={item.name}
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      x: -100,
                      opacity: 0
                    }}
                    onMouseEnter={() => handleMenuItemHover(item.name)}
                    onMouseLeave={() => handleMenuItemLeave(item.name)}
                  >
                    {/* Menu Text */}
                    <div style={{
                      fontSize: '3.5rem',
                      fontWeight: '400',
                      color: 'black',
                      fontFamily: 'Saans Trial, sans-serif',
                      lineHeight: 0.8,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      padding: '0rem 0',
                      margin: '0rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      {item.name}
                      
                      {/* Arrow SVG - Animated with GSAP */}
                      <div
                        data-arrow={item.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0,
                          x: -10
                        }}
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Close Button with GSAP Animation */}
          <button
            ref={closeButtonRef}
            onClick={closeMenu}
            style={{
              position: 'fixed',
              top: '1.5rem',
              right: '1.5rem',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'black',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 30,
              opacity: 0
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.1,
                backgroundColor: '#333',
                duration: 0.3
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                backgroundColor: 'black',
                duration: 0.3
              });
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              stroke="#CCFF00"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="12" x2="28" y2="28" />
              <line x1="28" y1="12" x2="12" y2="28" />
            </svg>
          </button>
        </>
      )}

      {/* Loading and Main Content */}
      {showLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
            zIndex: 10
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              fontWeight: '900',
              color: 'white',
              fontFamily: 'Saans Trial, sans-serif',
              textAlign: 'center',
              letterSpacing: '8px',
              position: 'relative'
            }}
          >
            ノートとは何ですか
          </div>
        </div>
      )}

      {/* Main Content After Loading */}
      {!showLoading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem'
          }}
        >
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: '900',
              color: 'white',
              fontFamily: 'Saans Trial, sans-serif',
              textAlign: 'center',
              marginBottom: '1rem'
            }}
          >
            ようこそ
          </h1>
          
          <p
            style={{
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Saans Trial, sans-serif',
              textAlign: 'center',
              maxWidth: '500px',
              lineHeight: '1.6'
            }}
          >
            あなたの思考を記録する場所へ
          </p>

          <button
            onClick={navigateToNotes}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              color: 'black',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Saans Trial, sans-serif',
              letterSpacing: '2px'
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                backgroundColor: '#f0f0f0',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)',
                duration: 0.3
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                backgroundColor: 'white',
                boxShadow: 'none',
                duration: 0.3
              });
            }}
          >
            ノートを見る
          </button>
        </div>
      )}

      {/* Font import */}
      <style jsx>{`
        @import url('https://fonts.cdnfonts.com/css/saans-trial');
      `}</style>
    </div>
  );
}
