'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface LetterCardProps {
  title: string;
  preview: string;
  index: number;
  onClick: () => void;
}

const LetterCard = memo(function LetterCard({ title, preview, index, onClick }: LetterCardProps) {
  // Calculate rotation once and memoize it - no state needed!
  const rotation = useMemo(() => -2 + Math.random() * 4, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ 
        scale: 1.03, 
        rotate: 0,
        y: -15,
        transition: { duration: 0.3 }
      }}
      className="cursor-pointer"
      style={{
        rotate: rotation,
        willChange: 'transform', // Optimize for animations
      }}
      onClick={onClick}
    >
      <div className="relative">
        {/* Envelope - Optimized shadows using CSS variables */}
        <div 
          className="relative bg-linear-to-br from-amber-100 to-amber-200 rounded-md overflow-hidden letter-card-shadow"
        >
          {/* Simplified texture overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-noise" />

          {/* Red Envelope Flap - Optimized SVG */}
          <div className="relative">
            <svg 
              className="w-full h-auto block" 
              viewBox="0 0 400 140"
              preserveAspectRatio="none"
            >
              {/* Main flap */}
              <path 
                d="M 0,0 L 200,100 L 400,0 L 400,140 L 0,140 Z" 
                fill="url(#flap-gradient)"
              />
              {/* Left fold shadow */}
              <path 
                d="M 0,0 L 200,100 L 0,140 Z" 
                fill="rgba(0,0,0,0.08)"
              />
              {/* Right fold shadow */}
              <path 
                d="M 400,0 L 200,100 L 400,140 Z" 
                fill="rgba(255,255,255,0.1)"
              />
              
              <defs>
                <linearGradient id="flap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="50%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>

            {/* Christmas Wax Seal - Simplified */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
              <div className="wax-seal">
                <div className="wax-seal-inner">
                  <div className="text-2xl opacity-60">
                    🎄
                  </div>
                </div>
                {/* Wax drips */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  <div className="w-2 h-3 bg-red-900/40 rounded-b-full" />
                  <div className="w-1.5 h-2 bg-red-900/30 rounded-b-full" />
                </div>
              </div>
            </div>

            {/* Vintage Stamp - Simplified */}
            <div className="absolute top-2 right-3 transform rotate-12">
              <div className="stamp-border">
                <div className="w-14 h-14 flex flex-col items-center justify-center text-red-600 text-xs font-serif bg-linear-to-br from-red-50 to-green-50">
                  <div className="text-2xl mb-1">🎅</div>
                  <div className="font-bold">XMAS</div>
                  <div className="text-[8px]">2025</div>
                </div>
              </div>
            </div>

            {/* Postmark - Optimized */}
            <div className="absolute top-3 left-4">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle 
                  cx="25" 
                  cy="25" 
                  r="22" 
                  fill="none" 
                  stroke="rgba(0,0,0,0.2)" 
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <text 
                  x="25" 
                  y="22" 
                  textAnchor="middle" 
                  fontSize="9" 
                  fill="rgba(0,0,0,0.4)"
                  fontFamily="serif"
                  fontWeight="bold"
                >
                  NORTH
                </text>
                <text 
                  x="25" 
                  y="32" 
                  textAnchor="middle" 
                  fontSize="9" 
                  fill="rgba(0,0,0,0.4)"
                  fontFamily="serif"
                  fontWeight="bold"
                >
                  POLE
                </text>
              </svg>
            </div>
          </div>

          {/* Letter Content Area */}
          <div className="p-6 pt-10 space-y-4">
            {/* To: Section */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500 font-serif italic">To:</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="letter-title">
                    {title}
                  </h3>
                  <div className="h-px w-full bg-linear-to-r from-red-300 via-red-200 to-transparent" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-amber-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock size={12} />
                <span className="font-serif">Private & Sealed</span>
              </div>

              {/* Open Button */}
              <button
                className="open-letter-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                Open Letter
              </button>
            </div>

            {/* Decorative holly */}
            <div className="flex justify-center opacity-30">
              <span className="text-2xl">🎄</span>
            </div>
          </div>

          {/* Corner Wear Effect */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-amber-100 opacity-50 rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-amber-100 opacity-40 rounded-tr-full" />
        </div>

        {/* Shadow - Simplified */}
        <div className="absolute -bottom-2 left-4 right-4 h-4 bg-black/20 blur-xl rounded-full" />
      </div>

      <style jsx>{`
        .letter-card-shadow {
          box-shadow: 
            0 20px 40px -20px rgba(0, 0, 0, 0.25),
            0 10px 20px -10px rgba(0, 0, 0, 0.15),
            inset 0 0 0 1px rgba(139, 92, 46, 0.1);
        }

        .bg-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }

        .wax-seal {
          position: relative;
          transition: transform 0.2s ease;
        }

        .wax-seal:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .wax-seal-inner {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ef4444, #991b1b);
          box-shadow: 
            0 4px 8px rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stamp-border {
          background: white;
          padding: 0.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 2px;
          border: 2px dashed #dc2626;
        }

        .letter-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
          font-family: 'Brush Script MT', cursive, serif;
          letter-spacing: 0.5px;
        }

        .open-letter-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(to right, #dc2626, #16a34a);
          color: white;
          font-size: 0.875rem;
          font-family: serif;
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          will-change: transform;
        }

        .open-letter-btn:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }

        .open-letter-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.title === nextProps.title &&
    prevProps.preview === nextProps.preview &&
    prevProps.index === nextProps.index
  );
});

export default LetterCard;