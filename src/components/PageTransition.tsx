import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.997 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.997 }}
      transition={{ 
        duration: 0.28, 
        ease: [0.25, 1, 0.5, 1] 
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
