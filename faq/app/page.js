'use client';

import React from "react";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

// ✅ IMPORT LANGSUNG DARI RADIX UI
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

// ✅ IMPORT LANGSUNG DARI LUCIDE REACT (icons)
import { Mail, Phone, Clock, Settings } from 'lucide-react';

// ✅ IMPORT SHADCN UTILITIES LANGSUNG
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // GSAP Animations
    const tl = gsap.timeline();

    if (textRef.current) {
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      );
    }

    // Simulate progress animation
    const progressTimer = setTimeout(() => {
      setProgress(85);
    }, 1000);

    // Floating animation
    gsap.to('.floating-element', {
      y: -10,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    return () => {
      clearTimeout(progressTimer);
    };
  }, []);

  const handleEmailClick = () => {
    navigator.clipboard.writeText('support@example.com');
  };

  const handlePhoneClick = () => {
    navigator.clipboard.writeText('+1 (555) 123-4567');
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
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
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
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-center">
              
              {/* Text Content */}
              <motion.div
                ref={textRef}
                className="text-center space-y-8 w-full max-w-2xl"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
              >
                {/* Maintenance Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Badge variant="warning" className="mb-6 py-2 px-4 text-sm font-poppins">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    UNDER MAINTENANCE
                  </Badge>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight font-poppins">
                    <span className="text-white block">We&apos;ll Be Back</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 block mt-2">
                      Soon
                    </span>
                  </h1>
                </motion.div>

                {/* Description */}
                <motion.p
                  className="text-xl text-gray-300 leading-relaxed font-inter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  Our website is currently undergoing scheduled maintenance. 
                  We&apos;re working hard to improve your experience and will be back 
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-blue-400 font-medium cursor-help">{progress}%</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">Estimated completion in 2-3 hours</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Progress value={progress} />
                </motion.div>

                {/* Estimated Time */}
                <motion.div
                  className="flex items-center justify-center space-x-4 text-gray-400 font-inter text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.4 }}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
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
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="default" 
                          size="lg"
                          className="floating-element font-poppins"
                          onClick={handleEmailClick}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          support@example.com
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">Click to copy email address</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="font-poppins"
                          onClick={handlePhoneClick}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          +1 (555) 123-4567
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-inter">24/7 Support Hotline</p>
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
    </TooltipProvider>
  );
}
