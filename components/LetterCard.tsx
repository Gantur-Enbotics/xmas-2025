'use client';

import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';

interface LetterCardProps {
  title: string;
  preview: string;
  index: number;
  onClick: () => void;
}

export default function LetterCard({ title, preview, index, onClick }: LetterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: Math.random() > 0.5 ? 2 : -2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-red-200 hover:border-green-300 transition-all">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-red-500 to-green-500 p-4 relative overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-4 -right-4 text-white/20 text-8xl"
          >
            ❄
          </motion.div>
          
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white rounded-full p-3 shadow-lg"
            >
              <Mail className="text-red-500" size={24} />
            </motion.div>
            <h3 className="text-xl font-bold text-white truncate flex-1">{title}</h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <p className="text-gray-600 line-clamp-3 mb-4">{preview}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock size={16} />
              <span>Protected</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-gradient-to-r from-red-500 to-green-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Open Letter
            </motion.button>
          </div>
        </div>

        {/* Decorative Corner */}
        <div className="absolute bottom-0 right-0 text-6xl opacity-10">🎄</div>
      </div>
    </motion.div>
  );
}