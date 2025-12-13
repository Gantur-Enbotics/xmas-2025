'use client';

import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

interface LetterCardProps {
  title: string;
  preview: string;
  index: number;
  onClick: () => void;
}

const LetterCard = memo(function LetterCard({ title, preview, index, onClick }: LetterCardProps) {
  const [rotation, setRotation] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRotation(-2 + Math.random() * 4);
    setMounted(true);
  }, []);

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
      className="cursor-pointer perspective-1000"
      style={{
        rotate: mounted ? rotation : 0,
      }}
      onClick={onClick}
    >
      <div className="relative">
        {/* Envelope */}
        <div 
          className="relative bg-amber-50 rounded-md overflow-hidden"
          style={{
            boxShadow: `
              0 20px 40px -20px rgba(0, 0, 0, 0.25),
              0 10px 20px -10px rgba(0, 0, 0, 0.15),
              inset 0 0 0 1px rgba(139, 92, 46, 0.1)
            `,
            background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
          }}
        >
          {/* Aged Paper Texture */}
          <div 
            className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3' numOctaves='5' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
            }}
          />

          {/* Red Envelope Flap */}
          <div className="relative">
            <svg 
              className="w-full h-auto" 
              viewBox="0 0 400 140" 
              style={{ display: 'block' }}
            >
              {/* Main flap */}
              <path 
                d="M 0,0 L 200,100 L 400,0 L 400,140 L 0,140 Z" 
                fill="url(#flap-gradient)"
                stroke="none"
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

            {/* Christmas Wax Seal */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                {/* Wax seal */}
                <div 
                  className="w-14 h-14 rounded-full relative"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #ef4444, #991b1b)',
                    boxShadow: `
                      0 4px 8px rgba(0, 0, 0, 0.3),
                      inset 0 2px 4px rgba(255, 255, 255, 0.3),
                      inset 0 -2px 4px rgba(0, 0, 0, 0.3)
                    `,
                  }}
                >
                  {/* Seal impression */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="text-2xl opacity-60"
                      style={{
                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))',
                        textShadow: '0 -1px 0 rgba(255,255,255,0.3)',
                      }}
                    >
                      🎄
                    </div>
                  </div>
                </div>
                {/* Wax drips */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  <div className="w-2 h-3 bg-red-800 rounded-b-full opacity-40" />
                  <div className="w-1.5 h-2 bg-red-800 rounded-b-full opacity-30" />
                </div>
              </motion.div>
            </div>

            {/* Vintage Stamp */}
            <div className="absolute top-2 right-3 transform rotate-12">
              <div 
                className="bg-white p-1 shadow-md"
                style={{
                  borderRadius: '2px',
                  border: '2px solid #dc2626',
                  borderStyle: 'dashed',
                }}
              >
                <div className="w-14 h-14 flex flex-col items-center justify-center text-red-600 text-xs font-serif bg-linear-to-br from-red-50 to-green-50">
                  <div className="text-2xl mb-1">🎅</div>
                  <div className="font-bold">XMAS</div>
                  <div className="text-[8px]">2025</div>
                </div>
              </div>
            </div>

            {/* Postmark */}
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
            {/* To: Section (handwritten style) */}
            <div className="space-y-2">
              <div className="text-xs text-gray-500 font-serif italic">To:</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h3 
                    className="text-xl font-bold text-gray-800 mb-1"
                    style={{ 
                      fontFamily: "'Brush Script MT', cursive, serif",
                      letterSpacing: '0.5px',
                    }}
                  >
                    {title}
                  </h3>
                  {/* Underline */}
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-linear-to-r from-red-600 to-green-600 text-white text-sm font-serif rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                Open Letter
              </motion.button>
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

        {/* Realistic Shadow */}
        <div 
          className="absolute -bottom-2 left-4 right-4 h-4 bg-black/20 blur-xl rounded-full"
        />
      </div>
    </motion.div>
  );
});

export default LetterCard;