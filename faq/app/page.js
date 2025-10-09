'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

export default function MaintenancePage() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    // GSAP Animations
    const tl = gsap.timeline();

    if (textRef.current && imageRef.current && progressRef.current) {
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      )
      .fromTo(
        imageRef.current,
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo(
        progressRef.current,
        { width: '0%' },
        { width: '85%', duration: 2, ease: 'power2.inOut' },
        '-=1'
      );
    }

    // Floating animation untuk elemen tertentu
    gsap.to('.floating-element', {
      y: -10,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden" ref={containerRef}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      {/* Main Content */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Text Content */}
            <motion.div
              ref={textRef}
              className="text-center lg:text-left space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              {/* Maintenance Badge */}
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-gray-900 border border-gray-700 mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-yellow-400 text-sm font-medium font-poppins">
                  UNDER MAINTENANCE
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span className="text-white font-poppins block">
                  We'll Be Back
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 font-poppins block mt-2">
                  Soon
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                className="text-xl text-gray-300 leading-relaxed font-inter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Our website is currently undergoing scheduled maintenance. 
                We're working hard to improve your experience and will be back 
                shortly with exciting new features.
              </motion.p>

              {/* Progress Section */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                <div className="flex justify-between text-sm font-inter">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-blue-400 font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    ref={progressRef}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 2, delay: 1.5, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>

              {/* Estimated Time */}
              <motion.div
                className="flex items-center justify-center lg:justify-start space-x-4 text-gray-400 font-inter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Estimated time: 2-3 hours</span>
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                className="pt-6 border-t border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.7 }}
              >
                <p className="text-gray-400 font-inter mb-4">
                  For urgent inquiries, please contact us:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg floating-element font-poppins">
                    support@example.com
                  </button>
                  <button className="px-6 py-3 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-poppins">
                    +1 (555) 123-4567
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Image Section */}
            <motion.div
              ref={imageRef}
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl floating-element">
                <motion.img
                  src="/images/5.jpg"
                  alt="Maintenance in Progress"
                  className="w-full h-auto object-cover"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-80"></div>
                
                {/* Animated Elements on Image */}
                <div className="absolute top-6 right-6">
                  <motion.div
                    className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Floating Elements Around Image */}
              <motion.div
                className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500 rounded-full opacity-30 blur-xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500 rounded-full opacity-30 blur-xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom Decorative Element */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-gray-500 text-sm font-inter mb-2">
            Thank you for your patience
          </div>
          <div className="w-8 h-12 border-2 border-gray-600 rounded-full flex justify-center mx-auto">
            <motion.div
              className="w-1 h-3 bg-gray-500 rounded-full mt-2"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
