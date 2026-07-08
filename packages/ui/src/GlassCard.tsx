import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        border border-white/10 dark:border-white/5
        bg-white/40 dark:bg-darkbg-card/40
        backdrop-blur-xl
        shadow-glass-light dark:shadow-glass-dark
        transition-colors duration-300
        ${className}
      `}
      {...props}
    >
      {/* Sleek top highlight glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
