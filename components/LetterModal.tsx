'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [direction, setDirection] = useState(0);

  const nextImage = useCallback(() => {
    if (letter?.pictures && letter.pictures.length > 0) {
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % letter.pictures.length);
    }
  }, [letter?.pictures]);

  const prevImage = useCallback(() => {
    if (letter?.pictures && letter.pictures.length > 0) {
      setDirection(-1);
      setCurrentImageIndex((prev) => (prev - 1 + letter.pictures.length) % letter.pictures.length);
    }
  }, [letter?.pictures]);

  const goToImage = useCallback((index: number) => {
    setDirection(index > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(index);
  }, [currentImageIndex]);

  if (!letter) return null;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto max-h-[90vh]">
                <div className="bg-linear-to-r from-red-600 via-green-600 to-red-600 p-8 text-center">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    {letter.title}
                  </h1>
                  <div className="text-6xl">🎄</div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="bg-linear-to-br from-red-50 to-green-50 rounded-2xl p-6 shadow-lg border-2 border-red-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                      {letter.context || "N/A"}
                    </p>
                  </div>

                  {letter.extra_note && (
                    <div className="bg-yellow-50 rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">📝</span>
                        <h3 className="text-xl font-bold text-gray-800">Special Note</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {letter.extra_note}
                      </p>
                    </div>
                  )}

                  {letter.pictures && letter.pictures.length > 0 && (
                    <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📸</span>
                        <h3 className="text-xl font-bold text-gray-800">Special Memories</h3>
                      </div>
                      
                      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                        <AnimatePresence initial={false} custom={direction}>
                          <motion.img
                            key={currentImageIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                              x: { type: 'spring', stiffness: 300, damping: 30 },
                              opacity: { duration: 0.2 },
                            }}
                            src={letter.pictures[currentImageIndex]}
                            alt={`Memory ${currentImageIndex + 1}`}
                            className="absolute inset-0 w-full h-full object-contain"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                              const swipe = offset.x * velocity.x;
                              if (swipe < -10000) {
                                nextImage();
                              } else if (swipe > 10000) {
                                prevImage();
                              }
                            }}
                          />
                        </AnimatePresence>

                        {letter.pictures.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all z-10"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all z-10"
                            >
                              <ChevronRight size={24} />
                            </button>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full">
                              {letter.pictures.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => goToImage(index)}
                                  className={`h-2 rounded-full transition-all ${
                                    index === currentImageIndex
                                      ? 'w-8 bg-white'
                                      : 'w-2 bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-center py-4">
                    <div className="text-5xl mb-2">🎁</div>
                    <p className="text-gray-600 italic">Merry Christmas! 🎄✨</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}