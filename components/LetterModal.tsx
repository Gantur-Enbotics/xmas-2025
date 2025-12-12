'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: {
    title: string;
    context: string;
    extra_note: string;
    pictures: string[];
  } | null;
}

export default function LetterModal({ isOpen, onClose, letter }: LetterModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!letter) return null;

  const nextImage = () => {
    if (letter.pictures.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % letter.pictures.length);
    }
  };

  const prevImage = () => {
    if (letter.pictures.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + letter.pictures.length) % letter.pictures.length);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Snowflakes */}
          <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 0 }}
                animate={{
                  y: window.innerHeight + 20,
                  opacity: [0, 1, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'linear',
                }}
                className="absolute text-white text-xl"
              >
                ❄
              </motion.div>
            ))}
          </div>

          {/* Letter Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={24} />
              </button>

              {/* Content Container */}
              <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
                {/* Header with decorations */}
                <div className="bg-linear-to-r from-red-600 via-green-600 to-red-600 p-8 text-center relative overflow-hidden">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-4 left-4 text-yellow-300 text-4xl"
                  >
                    ⭐
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-4 right-4 text-yellow-300 text-4xl"
                  >
                    ⭐
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="inline-block"
                  >
                    <Sparkles className="text-yellow-300 mb-2 mx-auto" size={40} />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg"
                  >
                    {letter.title}
                  </motion.h1>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-6xl mb-2"
                  >
                    🎄
                  </motion.div>
                </div>

                {/* Main Content */}
                <div className="p-8 space-y-6">
                  {/* Letter Content */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-linear-to-br from-red-50 to-green-50 rounded-2xl p-6 shadow-lg border-2 border-red-200"
                  >
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                        {letter.context}
                      </p>
                    </div>
                  </motion.div>

                  {/* Extra Note */}
                  {letter.extra_note && (
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-yellow-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">📝</span>
                        <h3 className="text-xl font-bold text-gray-800">Special Note</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {letter.extra_note}
                      </p>
                    </motion.div>
                  )}

                  {/* Picture Gallery */}
                  {letter.pictures && letter.pictures.length > 0 && (
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📸</span>
                        <h3 className="text-xl font-bold text-gray-800">Special Memories</h3>
                      </div>
                      
                      <div className="relative">
                        <div className="aspect-video bg-white rounded-xl overflow-hidden shadow-lg">
                          <motion.img
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                            src={letter.pictures[currentImageIndex]}
                            alt={`Memory ${currentImageIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {letter.pictures.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                            >
                              <ChevronRight size={24} />
                            </button>

                            <div className="flex justify-center gap-2 mt-4">
                              {letter.pictures.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`h-2 rounded-full transition-all ${
                                    index === currentImageIndex
                                      ? 'w-8 bg-purple-600'
                                      : 'w-2 bg-purple-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Footer Decoration */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center py-4"
                  >
                    <div className="text-5xl mb-2">🎁</div>
                    <p className="text-gray-600 italic">Merry Christmas! 🎄✨</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}