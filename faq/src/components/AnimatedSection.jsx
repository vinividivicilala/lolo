import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function AnimatedSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section 
      ref={ref}
      className="framer-motion-section"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="framer-motion-linebox">
        <motion.div 
          className="monogram-container"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div 
            className="monogram"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <span className="animated-text">A</span>
          </motion.div>
          <div className="monogram-text">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Built with <span className="animated-text">Astro</span> & Motion
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Website ini dibangun menggunakan Astro dengan performa tinggi dan animasi smooth menggunakan Framer Motion
            </motion.p>
          </div>
        </motion.div>
        
        <motion.div 
          className="motion-features"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <FeatureCard 
            icon="⚡" 
            title="Zero JavaScript" 
            description="Astro menghilangkan JavaScript yang tidak perlu untuk loading yang lebih cepat"
            delay={0.9}
          />
          <FeatureCard 
            icon="🎨" 
            title="Motion Design" 
            description="Animasi Framer Motion yang smooth dan responsif"
            delay={1.0}
          />
          <FeatureCard 
            icon="🚀" 
            title="High Performance" 
            description="Optimized untuk Core Web Vitals dan pengalaman pengguna terbaik"
            delay={1.1}
          />
        </motion.div>
        
        <motion.div 
          className="tech-stack"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <TechBadges />
        </motion.div>
      </div>
    </motion.section>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div 
      ref={ref}
      className="motion-feature"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      <motion.div 
        className="feature-icon"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.6 }}
      >
        {icon}
      </motion.div>
      <div className="feature-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}

function TechBadges() {
  const badges = [
    { name: "Astro.build", class: "astro" },
    { name: "Framer Motion", class: "motion" },
    { name: "Firebase", class: "firebase" },
    { name: "Mobile First", class: "responsive" }
  ];

  return (
    <div className="tech-badges">
      {badges.map((badge, index) => (
        <motion.span
          key={badge.name}
          className={`tech-badge ${badge.class}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 1.4 + (index * 0.1),
            duration: 0.4,
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ 
            scale: 1.1,
            y: -2,
            transition: { duration: 0.2 }
          }}
        >
          {badge.name}
        </motion.span>
      ))}
    </div>
  );
}