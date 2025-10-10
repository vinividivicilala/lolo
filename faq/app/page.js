'use client';

import React from "react";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

// ✅ IMPORT LANGSUNG DARI RADIX UI
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

// ✅ IMPORT LANGSUNG DARI LUCIDE REACT (icons)
import { Mail, Phone, Clock, Settings, Wrench, Hammer, Cog, Sparkles } from 'lucide-react';

// ✅ IMPORT SHADCN UTILITIES LANGSUNG
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export default function DevelopmentPage() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [animatedText, setAnimatedText] = useState("");

  const fullText = "🚧 Website Masih Dalam Pengembangan! 💻";

  useEffect(() => {
    // GSAP Animations untuk container
    const tl = gsap.timeline();

    if (textRef.current && imageRef.current) {
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
      );
    }

    // Animasi teks dengan emoticon
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setAnimatedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(textInterval);
      }
    }, 100);

    // Simulate progress animation
    const progressTimer = setTimeout(() => {
      setProgress(65);
    }, 1000);

    // Floating animation untuk elemen tertentu
    gsap.to('.floating-element', {
      y: -15,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Animasi rotasi untuk icon tools
    gsap.to('.rotating-icon', {
      rotation: 360,
      duration: 3,
      repeat: -1,
      ease: "none"
    });

    return () => {
      clearInterval(textInterval);
      clearTimeout(progressTimer);
    };
  }, []);

  const handleEmailClick = () => {
    navigator.clipboard.writeText('developer@example.com');
  };

  const handlePhoneClick = () => {
    navigator.clipboard.writeText('+62 812-3456-7890');
  };

  // ✅ SHADCN BUTTON COMPONENT LANGSUNG
  const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
    {
      variants: {
        variant: {
          default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300",
          destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
          outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
          secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
          ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
          link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
        },
        size: {
          default: "h-10 px-4 py-2",
          sm: "h-9 rounded-md px-3",
          lg: "h-11 rounded-md px-8",
          icon: "h-10 w-10",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  );

  const Button = ({ className, variant, size, ...props }) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  };

  // ✅ SHADCN BADGE COMPONENT LANGSUNG
  const badgeVariants = cva(
    "inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-800 dark:focus:ring-slate-300",
    {
      variants: {
        variant: {
          default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
          secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
          destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
          outline: "text-slate-950 dark:text-slate-50",
          warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
          development: "border-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600",
        },
      },
      defaultVariants: {
        variant: "default",
      },
    }
  );

  const Badge = ({ className, variant, ...props }) => {
    return (
      <div className={cn(badgeVariants({ variant, className }))} {...props} />
    );
  };

  // ✅ RADIX UI PROGRESS COMPONENT
  const Progress = ({ value, className }) => (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );

  // ✅ RADIX UI TOOLTIP COMPONENTS
  const TooltipProvider = TooltipPrimitive.Provider;
  const Tooltip = TooltipPrimitive.Root;
  const TooltipTrigger = TooltipPrimitive.Trigger;
  const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-950 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
        className
      )}
      {...props}
    />
  ));
  TooltipContent.displayName = TooltipPrimitive.Content.displayName;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black overflow-hidden" ref={containerRef}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-20"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl opacity-10" />
        </div>

        {/* Main Content */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col items-center justify-center text-center space-y-12">
              
              {/* Animated Title dengan Emoticon */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                {/* Development Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Badge variant="development" className="mb-6 py-3 px-6 text-base font-bold">
                    <Sparkles className="w-4 h-4 mr-2 rotating-icon" />
                    DALAM PENGEMBANGAN
                    <Sparkles className="w-4 h-4 ml-2 rotating-icon" />
                  </Badge>
                </motion.div>

                {/* Main Heading dengan animasi ketikan */}
                <motion.div
                  ref={textRef}
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight font-poppins">
                    <span className="text-white block">
                      {animatedText}
                      <span className="inline-block w-2 h-12 bg-yellow-400 ml-1 animate-pulse"></span>
                    </span>
                  </h1>
                  
                  <motion.p
                    className="text-2xl text-gray-300 leading-relaxed font-inter max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                  >
                    Kami sedang bekerja keras untuk memberikan pengalaman terbaik! 
                    ⚡ Stay tuned for amazing updates! 🚀
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Image Section di Tengah */}
              <motion.div
                ref={imageRef}
                className="relative w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl floating-element border-4 border-yellow-400">
                  <motion.img
                    src="/images/5.jpg"
                    alt="Development in Progress"
                    className="w-full h-auto object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 opacity-80" />
                  
                  {/* Animated Development Icons */}
                  <div className="absolute top-6 left-6">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg rotating-icon"
                          whileHover={{ scale: 1.2 }}
                        >
                          <Wrench className="w-6 h-6 text-white" />
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">Development Tools</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="absolute top-6 right-6">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg rotating-icon"
                          whileHover={{ scale: 1.2 }}
                        >
                          <Hammer className="w-6 h-6 text-white" />
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">Building in Progress</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer shadow-lg rotating-icon"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Cog className="w-8 h-8 text-black" />
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">Development in Progress</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500 rounded-full opacity-40 blur-xl"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -right-4 w-28 h-28 bg-purple-500 rounded-full opacity-40 blur-xl"
                  animate={{
                    scale: [1.3, 1, 1.3],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>

              {/* Progress dan Info Section */}
              <motion.div
                className="w-full max-w-2xl space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                {/* Progress Section */}
                <motion.div
                  className="space-y-4 bg-gray-900/50 rounded-2xl p-6 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                >
                  <div className="flex justify-between text-lg font-inter font-semibold">
                    <span className="text-gray-300">Progress Development</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-blue-400 font-bold cursor-help">{progress}%</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">Estimated completion in 2-3 weeks</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Progress value={progress} className="h-4" />
                </motion.div>

                {/* Estimated Time */}
                <motion.div
                  className="flex items-center justify-center space-x-6 text-gray-300 font-inter text-lg font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                >
                  <div className="flex items-center space-x-3 bg-gray-900/50 rounded-xl px-6 py-3">
                    <Clock className="w-6 h-6 text-yellow-400 rotating-icon" />
                    <span>Estimasi: 2-3 Minggu Lagi</span>
                  </div>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                  className="pt-6 border-t border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 2.1 }}
                >
                  <p className="text-gray-400 font-inter mb-6 text-lg">
                    Butuh informasi lebih lanjut? Hubungi developer:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          size="lg"
                          className="floating-element font-poppins text-base font-semibold"
                          onClick={handleEmailClick}
                        >
                          <Mail className="w-5 h-5 mr-3" />
                          developer@example.com
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">Klik untuk copy email developer</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="font-poppins text-base font-semibold"
                          onClick={handlePhoneClick}
                        >
                          <Phone className="w-5 h-5 mr-3" />
                          +62 812-3456-7890
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">WhatsApp Developer</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-gray-500 text-lg font-inter mb-3 font-medium">
              ⏳ Terima kasih atas kesabaran Anda! 🙏
            </div>
            <div className="w-10 h-16 border-2 border-gray-600 rounded-full flex justify-center mx-auto">
              <motion.div
                className="w-2 h-4 bg-yellow-400 rounded-full mt-3"
                animate={{ y: [0, 24, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>
      </div>
    </TooltipProvider>
  );
}
