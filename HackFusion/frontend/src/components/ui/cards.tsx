import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  delay?: number;
}

export function GlassCard({ children, className, hover = true, gradient = false, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -5 } : undefined}
      className={cn(
        'glass-card p-6 transition-all duration-300',
        hover && 'hover:shadow-glow cursor-pointer',
        gradient && 'gradient-border',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface HexagonCardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'success' | 'danger';
}

export function HexagonCard({ children, className, size = 'md', color = 'primary' }: HexagonCardProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const colorClasses = {
    primary: 'bg-gradient-primary',
    accent: 'bg-gradient-accent',
    success: 'bg-gradient-success',
    danger: 'bg-gradient-danger',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        'hexagon flex items-center justify-center',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface NeumorphicCardProps {
  children: React.ReactNode;
  className?: string;
  pressed?: boolean;
}

export function NeumorphicCard({ children, className, pressed = false }: NeumorphicCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'neumorphic p-6 transition-all duration-300',
        pressed && 'shadow-inner',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface FloatingActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FloatingActionButton({ children, onClick, className, size = 'md' }: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'fab flex items-center justify-center text-white shadow-glow',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </motion.button>
  );
}

interface GeometricContainerProps {
  children: React.ReactNode;
  shape?: 'diamond' | 'octagon';
  className?: string;
}

export function GeometricContainer({ children, shape = 'octagon', className }: GeometricContainerProps) {
  return (
    <div className={cn(shape, 'bg-card p-8', className)}>
      {children}
    </div>
  );
}

interface LayeredCardProps {
  children: React.ReactNode;
  className?: string;
  layers?: number;
}

export function LayeredCard({ children, className, layers = 3 }: LayeredCardProps) {
  return (
    <div className={cn('relative', className)}>
      {Array.from({ length: layers }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            'absolute inset-0 rounded-2xl bg-primary/10',
            i === 0 && 'translate-x-2 translate-y-2',
            i === 1 && 'translate-x-1 translate-y-1'
          )}
          style={{ zIndex: -i }}
        />
      ))}
      <div className="relative z-10 glass-card p-6">{children}</div>
    </div>
  );
}
