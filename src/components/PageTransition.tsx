import { motion } from 'framer-motion';
import { type ReactNode, useRef } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const isFirstMount = useRef(true);

  // Eliminate LCP/FCP delay on initial page load (Lighthouse 100 Performance)
  const initial = isFirstMount.current 
    ? { opacity: 1, y: 0 } 
    : { opacity: 0.88, y: 6 };

  if (isFirstMount.current) {
    isFirstMount.current = false;
  }

  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0.88, y: -6 }}
      transition={{ 
        duration: 0.22, 
        ease: 'easeOut' 
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
