import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-dark flex flex-col items-center justify-center z-[100] backdrop-blur-sm">
      <div className="relative w-48 h-48">
        {/* Bat */}
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-5 bg-amber-600 rounded-md shadow-lg"
          style={{ transform: 'rotate(-15deg)' }}
        />

        {/* Ball */}
        <motion.div
          className="absolute w-6 h-6 bg-white rounded-full shadow-md"
          style={{ left: 'calc(50% - 12px)', bottom: 45 }}
          animate={{
            y: [0, -80, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>
      <p className="text-white mt-8 font-semibold text-lg tracking-wider animate-pulse">
        Loading the field...
      </p>
    </div>
  );
};
