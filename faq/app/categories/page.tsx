// app/categories/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const categories = [
  { id: 1, name: 'Pendidikan', slug: 'pendidikan' },
  { id: 2, name: 'Kesehatan', slug: 'kesehatan' },
  { id: 3, name: 'Bencana Alam', slug: 'bencana-alam' },
  { id: 4, name: 'Sosial Kemanusiaan', slug: 'sosial-kemanusiaan' },
  { id: 5, name: 'Lingkungan Hidup', slug: 'lingkungan-hidup' },
  { id: 6, name: 'Infrastruktur', slug: 'infrastruktur' },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCategoryClick = (slug: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const container = document.querySelector('.categories-container');
    if (container) {
      container.classList.add('page-transition-out');
      setTimeout(() => {
        router.push(`/categories/${slug}`);
      }, 300);
    } else {
      router.push(`/categories/${slug}`);
    }
  };

  // Maksimal 4 baris ke bawah (4 kategori pertama)
  const displayedCategories = categories.slice(0, 4);

  return (
    <div style={styles.wrapper}>
      <div className="categories-container" style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Kategori</h1>
        </div>

        <div style={styles.content}>
          <div style={styles.categoriesList}>
            {displayedCategories.map((category) => (
              <div
                key={category.id}
                style={styles.categoryItem}
                onClick={() => handleCategoryClick(category.slug)}
              >
                <span style={styles.categoryName}>{category.name}</span>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={styles.arrowIcon}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Hubot+Sans:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Hubot Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        @keyframes slideOutLeft {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .page-transition-out {
          animation: slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .categories-container {
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    position: 'relative',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 'env(safe-area-inset-top)',
    marginBottom: '32px',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    backgroundColor: '#000000',
    zIndex: 10,
    paddingBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  categoriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    width: '100%',
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  categoryName: {
    fontSize: '17px',
    fontWeight: '400',
    color: '#ffffff',
    flex: 1,
  },
  arrowIcon: {
    color: '#8e8e93',
    flexShrink: 0,
  },
};
