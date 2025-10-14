'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // GSAP Animation for menu toggle
  useEffect(() => {
    if (menuContainerRef.current) {
      if (showMenu) {
        // Open menu animation
        const tl = gsap.timeline();
        
        // Animate menu background
        tl.to(menuContainerRef.current, {
          scaleY: 1,
          duration: 0.8,
          ease: "power3.inOut",
          transformOrigin: "top"
        })
        // Animate menu items with staggered effect
        .fromTo(".menu-item", 
          { 
            x: -100, 
            opacity: 0,
            rotation: -5
          },
          { 
            x: 0, 
            opacity: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.7)"
          },
          "-=0.3"
        )
        // Animate arrows
        .fromTo(".menu-arrow", 
          { 
            scale: 0, 
            rotation: -90 
          },
          { 
            scale: 1, 
            rotation: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1.7)"
          },
          "-=0.2"
        );

      } else {
        // Close menu animation
        const tl = gsap.timeline();
        
        // Animate menu items out
        tl.to(".menu-item", {
          x: -100,
          opacity: 0,
          rotation: -5,
          duration: 0.4,
          stagger: 0.05,
          ease: "power3.in"
        })
        // Animate menu background
        .to(menuContainerRef.current, {
          scaleY: 0,
          duration: 0.6,
          ease: "power3.inOut",
          transformOrigin: "top"
        }, "-=0.2");
      }
    }
  }, [showMenu]);

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

  const navigateToNotes = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/notes');
    }, 1000);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
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

  const handleMenuItemClick = (itemName: string) => {
    // GSAP animation for menu item click
    const clickedItem = document.querySelector(`[data-item="${itemName}"]`);
    
    if (clickedItem) {
      // Create ripple effect
      gsap.to(clickedItem, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(clickedItem, {
            scale: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.5)"
          });
        }
      });

      // Color flash effect
      gsap.to(clickedItem, {
        color: "#FF00FF",
        duration: 0.1,
        onComplete: () => {
          gsap.to(clickedItem, {
            color: "black",
            duration: 0.3,
            ease: "power2.out"
          });
        }
      });

      // Animate arrow
      const arrow = clickedItem.querySelector('.menu-arrow');
      if (arrow) {
        gsap.to(arrow, {
          x: 20,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(arrow, {
              x: 0,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
      }
    }

    // Close menu after animation
    setTimeout(() => {
      toggleMenu();
      
      // Navigate based on menu item
      switch(itemName) {
        case "HOME":
          // Already on home, just close menu
          break;
        case "WORK":
          // Add your navigation logic here
          console.log("Navigate to Work");
          break;
        case "ABOUT":
          // Add your navigation logic here
          console.log("Navigate to About");
          break;
        case "CONTACT":
          // Add your navigation logic here
          console.log("Navigate to Contact");
          break;
      }
    }, 400);
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
      {/* Modern Menu Button */}
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
          padding: '0.8rem 1.5rem',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          borderRadius: '50px',
          border: '2px solid rgba(255,255,255,0.3)',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(15px)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        {/* Animated hamburger icon */}
        <div className="menu-icon" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          width: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '18px',
            height: '2px',
            backgroundColor: 'currentColor',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></div>
          <div style={{
            width: '14px',
            height: '2px',
            backgroundColor: 'currentColor',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></div>
          <div style={{
            width: '18px',
            height: '2px',
            backgroundColor: 'currentColor',
            borderRadius: '2px',
            transition: 'all 0.3s ease'
          }}></div>
        </div>
        メニュー
      </div>

      {/* Modern GSAP Menu Overlay */}
      <div
        ref={menuContainerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#CCFF00',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem',
          scaleY: 0,
          transformOrigin: 'top'
        }}
      >
        {/* Website Name - Top Left */}
        <div
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
            opacity: showMenu ? 1 : 0
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
          {/* Menu Items */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0rem'
          }}>
            {menuItems.map((item, index) => (
              <div
                key={item.name}
                data-item={item.name}
                className="menu-item"
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0 // Will be animated by GSAP
                }}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleMenuItemClick(item.name)}
              >
                {/* Menu Text */}
                <div style={{
                  fontSize: '4rem',
                  fontWeight: '700',
                  color: 'black',
                  fontFamily: 'Saans Trial, sans-serif',
                  lineHeight: 0.8,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '0.5rem 0',
                  margin: '0rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  transition: 'all 0.3s ease'
                }}>
                  {item.name}
                  
                  {/* Arrow SVG */}
                  <div className="menu-arrow"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      opacity: hoveredItem === item.name ? 1 : 0.7,
                      transform: hoveredItem === item.name ? 'translateX(10px)' : 'translateX(0)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
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

        {/* Close Button with GSAP Animation */}
        <button
          onClick={toggleMenu}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'black',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 30,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1.1,
              backgroundColor: '#333',
              duration: 0.3,
              ease: "power2.out"
            });
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1,
              backgroundColor: 'black',
              duration: 0.3,
              ease: "power2.out"
            });
          }}
        >
          <svg
            width="35"
            height="35"
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
      </div>

      {/* Loading and Main Content */}
      <AnimatePresence>
        {showLoading && (
          <motion.div
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
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
          >
            <motion.div
              style={{
                fontSize: '4rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Saans Trial, sans-serif',
                textAlign: 'center',
                letterSpacing: '8px',
                position: 'relative'
              }}
              initial={{ 
                scale: 0.5, 
                opacity: 0, 
                rotateY: 180,
                filter: 'blur(20px)'
              }}
              animate={{ 
                scale: [0.8, 1.1, 1],
                opacity: [0, 1, 1],
                rotateY: [180, 0, 0],
                filter: ['blur(20px)', 'blur(5px)', 'blur(0px)'],
                textShadow: [
                  '0 0 0px rgba(255,255,255,0)',
                  '0 0 30px rgba(255,255,255,0.8)',
                  '0 0 20px rgba(255,255,255,0.4)'
                ]
              }}
              transition={{ 
                duration: 2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              ノートとは何ですか
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content After Loading */}
      <AnimatePresence>
        {!showLoading && (
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
              padding: '2rem'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Saans Trial, sans-serif',
                textAlign: 'center',
                marginBottom: '1rem'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              ようこそ
            </motion.h1>
            
            <motion.p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'Saans Trial, sans-serif',
                textAlign: 'center',
                maxWidth: '500px',
                lineHeight: '1.6'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              あなたの思考を記録する場所へ
            </motion.p>

            <motion.button
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
              whileHover={{ 
                scale: 1.05,
                backgroundColor: '#f0f0f0',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              ノートを見る
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font import */}
      <style jsx>{`
        @import url('https://fonts.cdnfonts.com/css/saans-trial');
      `}</style>
    </div>
  );
}
