import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function GSAPDescription() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.section 
      ref={ref}
      className="gsap-description-section"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="gsap-description-linebox">
        <motion.div 
          className="gsap-header"
          variants={itemVariants}
        >
          <h2 className="gsap-main-title">
            🚀 <span className="gradient-highlight">Revolutionary</span> Web Experience
          </h2>
          <p className="gsap-subtitle">
            Dibangun dengan teknologi terdepan untuk performa maksimal
          </p>
        </motion.div>

        <motion.div 
          className="description-content"
          variants={containerVariants}
        >
          <DescriptionParagraph
            icon="⚡"
            text="Website ini menggunakan <highlight>Astro</highlight> yang menghilangkan JavaScript tidak perlu, menghasilkan <highlight>loading time tercepat</highlight> dan <highlight>Core Web Vitals score 100</highlight>"
          />
          
          <DescriptionParagraph
            icon="🎨"
            text="Dilengkapi dengan <highlight>Framer Motion</highlight> untuk animasi smooth, <highlight>scroll-triggered effects</highlight>, dan <highlight>micro-interactions</highlight> yang memukau"
          />
          
          <DescriptionParagraph
            icon="🔧"
            text="Backend powered oleh <highlight>Firebase</highlight> dengan realtime database, authentication, dan <highlight>cloud functions</highlight> yang scalable"
          />
          
          <DescriptionParagraph
            icon="📱"
            text="Desain <highlight>mobile-first responsive</highlight> dengan <highlight>progressive enhancement</highlight> untuk semua device dan jaringan"
          />
          
          <DescriptionParagraph
            icon="🚀"
            text="Optimized untuk <highlight>SEO</highlight>, <highlight>accessibility</highlight>, dan <highlight>user experience</highlight> terbaik dengan modern best practices"
          />
          
          <DescriptionParagraph
            icon="💫"
            text="Mengimplementasikan <highlight>modern CSS</highlight> dengan Grid, Flexbox, Custom Properties, dan <highlight>advanced animations</highlight>"
          />
        </motion.div>

        <motion.div 
          className="tech-highlights"
          variants={itemVariants}
        >
          <div className="highlight-grid">
            <TechHighlight icon="🔥" text="Zero JS by Default" color="orange" />
            <TechHighlight icon="⚡" text="Instant Loading" color="yellow" />
            <TechHighlight icon="🎯" text="Perfect Scores" color="green" />
            <TechHighlight icon="🔒" text="Secure & Safe" color="blue" />
            <TechHighlight icon="📈" text="SEO Optimized" color="purple" />
            <TechHighlight icon="🌟" text="Modern Stack" color="pink" />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

function DescriptionParagraph({ icon, text }) {
  const parts = text.split(/(<highlight>.*?<\/highlight>)/g);
  
  return (
    <motion.div 
      className="description-paragraph"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 80,
        damping: 15
      }}
      whileHover={{ 
        x: 10,
        transition: { duration: 0.3 }
      }}
    >
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
    </motion.div>
  );
}

function TechHighlight({ icon, text, color }) {
  return (
    <motion.div 
      className={`tech-highlight ${color}`}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.4 }
      }}
    >
      <div className="highlight-icon">{icon}</div>
      <div className="highlight-text">{text}</div>
    </motion.div>
  );
}