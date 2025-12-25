'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2, ImageOff } from 'lucide-react';

interface IPicture {
  type: 'url' | 'uploaded';
  data: string;
  filename?: string;
}

const MediaDisplay = ({
  src,
  direction,
  dragHandlers
}: {
  src: string;
  direction: number;
  dragHandlers: any;
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  if (!src || typeof src !== 'string') return null;

  const isVideo = 
    /\.(mp4|webm|ogg)$/i.test(src) || 
    src.startsWith('data:video');

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -1000 : 1000, opacity: 0 }),
  };

  return (
    <motion.div
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      custom={direction}
      transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
      className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900"
      {...dragHandlers}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center justify-center text-white/50 gap-2">
          <ImageOff size={48} />
          <p className="text-sm">Image unavailable</p>
        </div>
      )}

      {isVideo ? (
        <video
          src={src}
          className={`w-full h-full object-contain z-10 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      ) : (
        <img
          src={src}
          alt="Memory"
          className={`w-full h-full object-contain z-10 pointer-events-none select-none ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </motion.div>
  );
};

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: {
    title: string;
    context: string;
    extra_note: string;
    pictures: IPicture[];
  } | null;
}

// Helper to extract image source from IPicture or legacy string
const getImageSrc = (picture: IPicture | string): string => {
  if (typeof picture === 'string') return picture;
  return picture?.data || '';
};

export default function LetterModal({ isOpen, onClose, letter }: LetterModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setDirection(0);
    }
  }, [isOpen, letter]);

  const safePictures = letter?.pictures || [];

  const nextImage = useCallback(() => {
    if (safePictures.length > 0) {
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % safePictures.length);
    }
  }, [safePictures.length]);

  const prevImage = useCallback(() => {
    if (safePictures.length > 0) {
      setDirection(-1);
      setCurrentImageIndex((prev) => (prev - 1 + safePictures.length) % safePictures.length);
    }
  }, [safePictures.length]);

  const goToImage = useCallback((index: number) => {
    setDirection(index > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(index);
  }, [currentImageIndex]);

  const dragHandlers = {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 1,
    onDragEnd: (_e: any, { offset, velocity }: any) => {
      const swipe = offset.x * velocity.x;
      if (swipe < -10000) nextImage();
      else if (swipe > 10000) prevImage();
    }
  };

  if (!letter) return null;

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

                  {safePictures.length > 0 && (
                    <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📸</span>
                        <h3 className="text-xl font-bold text-gray-800">Special Memories</h3>
                      </div>
                      
                      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                        <AnimatePresence initial={false} custom={direction} mode='popLayout'>
                          <MediaDisplay 
                             key={currentImageIndex}
                             src={getImageSrc(safePictures[currentImageIndex])}
                             direction={direction}
                             dragHandlers={dragHandlers}
                          />
                        </AnimatePresence>

                        {safePictures.length > 1 && (
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

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-2 rounded-full z-10">
                              {safePictures.map((_, index) => (
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