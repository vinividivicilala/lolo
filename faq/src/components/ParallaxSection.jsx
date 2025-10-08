import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <motion.section 
      ref={ref}
      className="parallax-section"
      style={{ opacity }}
    >
      <div className="parallax-linebox">
        <motion.div 
          className="parallax-header"
          style={{ y, scale }}
        >
          <motion.h2 
            className="parallax-title"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Built with 
            <span className="gradient-text"> Astro</span>
          </motion.h2>
          
          <motion.p 
            className="parallax-subtitle"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Modern Web Development dengan Performa Terbaik
          </motion.p>
        </motion.div>

        <div className="parallax-features">
          <FeatureCard 
            number="01"
            title="Zero JavaScript"
            description="Astro menghilangkan JavaScript yang tidak perlu untuk loading ultra cepat"
            scrollProgress={scrollYProgress}
            delay={0.1}
          />
          <FeatureCard 
            number="02" 
            title="Motion Parallax"
            description="Animasi scroll parallax yang smooth dengan Framer Motion"
            scrollProgress={scrollYProgress}
            delay={0.3}
          />
          <FeatureCard 
            number="03"
            title="High Performance" 
            description="Optimized untuk Core Web Vitals dengan score terbaik"
            scrollProgress={scrollYProgress}
            delay={0.5}
          />
        </div>

        <motion.div 
          className="tech-stats"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <StatItem number="100+" label="Lighthouse Score" />
          <StatItem number="0ms" label="JavaScript Bloat" />
          <StatItem number="∞" label="Scalability" />
        </motion.div>
      </div>
    </motion.section>
  );
}

function FeatureCard({ number, title, description, scrollProgress, delay }) {
  const cardRef = useRef(null);
  
  const y = useTransform(scrollProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div 
      ref={cardRef}
      className="feature-card"
      style={{ y, opacity }}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3 }
      }}
    >
      <div className="feature-number">{number}</div>
      <div className="feature-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}

function StatItem({ number, label }) {
  return (
    <motion.div 
      className="stat-item"
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.1 }}
    >
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}
