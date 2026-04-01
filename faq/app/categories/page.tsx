// app/categories/[slug]/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const handleBack = () => {
    const element = document.querySelector('.container');
    if (element) {
      element.classList.add('page-transition-out');
      setTimeout(() => {
        router.back();
      }, 300);
    } else {
      router.back();
    }
  };

  return (
    <div style={styles.wrapper}>
      <div className="container" style={styles.container}>
        <div style={styles.header}>
          <button onClick={handleBack} style={styles.backButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5" />
              <path d="M12 19L5 12L12 5" />
            </svg>
          </button>
          <h1 style={styles.title}>{params.slug.charAt(0).toUpperCase() + params.slug.slice(1)}</h1>
          <div style={styles.placeholder} />
        </div>

        <div style={styles.content}>
          <p style={styles.description}>Halaman donasi untuk kategori {params.slug}</p>
        </div>
      </div>

      <style jsx global>{`
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
          animation: slideOutLeft 0.3s ease-out forwards;
        }
        
        .page-transition-in {
          animation: slideInRight 0.3s ease-out forwards;
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
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'env(safe-area-inset-top)',
    marginBottom: '24px',
    flexShrink: 0,
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#007aff',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  placeholder: {
    width: '40px',
  },
  content: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: '16px',
    color: '#8e8e93',
    textAlign: 'center',
  },
};
