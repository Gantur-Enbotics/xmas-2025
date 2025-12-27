'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import LetterCard from '@/components/LetterCard';
import PhoneAuthModal from '@/components/PhoneAuthModal';
import LetterModal from '@/components/LetterModal';
import Snowflakes from '@/components/Snowflakes';
import { Toaster } from 'react-hot-toast';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// Memoized Timer Digit component - prevents unnecessary re-renders
const TimerDigit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="timer-digit-box">
        <div className="timer-digit-value">
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="text-yellow-300 w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
      </motion.div>
    </div>
    <p className="text-xs md:text-sm font-semibold text-gray-700 mt-2 uppercase tracking-wider">
      {label}
    </p>
    
    <style jsx>{`
      .timer-digit-box {
        background: linear-gradient(to bottom right, #ef4444, #16a34a);
        border-radius: 1rem;
        padding: 1rem 1.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        min-width: 4.375rem;
      }
      
      @media (min-width: 768px) {
        .timer-digit-box {
          padding: 1.5rem 2rem;
          min-width: 6.25rem;
        }
      }
      
      .timer-digit-value {
        font-size: 1.875rem;
        font-weight: 700;
        color: white;
        text-align: center;
        font-family: 'Courier New', monospace;
      }
      
      @media (min-width: 768px) {
        .timer-digit-value {
          font-size: 3rem;
        }
      }
    `}</style>
  </div>
);

export default function Home() {
  const [letters, setLetters] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  // Check if modal has been shown before
  useEffect(() => {
    const modalShown = localStorage.getItem('newYearModalShown2026');
    if (modalShown === 'true') {
      setHasShownModal(true);
    }
  }, []);

  // Calculate time until New Year's Eve at 10PM in Ulaanbaatar timezone
  const calculateTimeLeft = useCallback((): TimeLeft => {
    const newYearDate = new Date('2025-12-31T21:30:00+08:00');
    const now = new Date();
    const difference = newYearDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }, []);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total === 0 && !showNewYearModal && !hasShownModal) {
        setShowNewYearModal(true);
        setHasShownModal(true);
        localStorage.setItem('newYearModalShown2026', 'true');
      }
    }, 1000);

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [calculateTimeLeft, showNewYearModal, hasShownModal]);

  // Fetch letters on mount
  useEffect(() => {
    const fetchPublicLetters = async () => {
      try {
        const response = await fetch('/api/letters/public');
        const data = await response.json();
        
        if (data.success) {
          setLetters(data.letters);
        } else {
          console.error('Failed to fetch letters');
        }
      } catch (error) {
        console.error('Error fetching letters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicLetters();
  }, []);

  // Optimized handlers - only recreate when dependencies change
  const handleLetterClick = useCallback((letter: any) => {
    setSelectedLetter(letter);
    setIsAuthModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsLetterModalOpen(true);
  }, []);

  const handleAuthModalClose = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLetterModalClose = useCallback(() => {
    setIsLetterModalOpen(false);
  }, []);

  const handleNewYearModalClose = useCallback(() => {
    setShowNewYearModal(false);
  }, []);

  // Memoize empty state
  const hasNoLetters = letters.length === 0;

  return (
    <main className="min-h-screen bg-linear-to-br from-red-100 via-white to-green-100">
      <Toaster position="top-center" />
      
      <Snowflakes count={25} />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative z-10 py-8"
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-6xl mb-4"
            >
              🎄
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-600 to-green-600 mb-4">
              Xmas Letters 2025
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Special messages of love, joy, and holiday cheer ✨
            </p>
          </div>
        </div>
      </motion.header>

      {/* Countdown Timer */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <div className="countdown-container">
            <motion.h2
              className="countdown-title"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉 New Year till 🎉
            </motion.h2>
            
            <div className="flex justify-center items-center gap-3 md:gap-6 flex-wrap">
              <TimerDigit value={timeLeft.days} label="Days" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-3xl md:text-5xl font-bold text-red-500 hidden md:block"
              >
                :
              </motion.div>
              <TimerDigit value={timeLeft.hours} label="Hours" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-3xl md:text-5xl font-bold text-red-500 hidden md:block"
              >
                :
              </motion.div>
              <TimerDigit value={timeLeft.minutes} label="Minutes" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-3xl md:text-5xl font-bold text-red-500 hidden md:block"
              >
                :
              </motion.div>
              <TimerDigit value={timeLeft.seconds} label="Seconds" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-6xl"
            >
              🎁
            </motion.div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {letters.map((letter, index) => (
                <LetterCard
                  key={letter._id}
                  title={letter.title}
                  preview={letter.preview || letter.context}
                  index={index}
                  onClick={() => handleLetterClick(letter)}
                />
              ))}
            </div>

            {hasNoLetters && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center py-20"
              >
                <div className="text-8xl mb-4">🎅</div>
                <p className="text-2xl text-gray-600">
                  No letters available yet. Check back soon!
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 py-8 text-center"
      >
        <p className="text-gray-600">
          Made with ❤️ by Gantur | Happy Holidays! 🎄
        </p>
      </motion.footer>

      {/* New Year Modal */}
      <AnimatePresence>
        {showNewYearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleNewYearModalClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-linear-to-br from-purple-500 via-pink-500 to-yellow-500 p-1 rounded-3xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-3xl p-8 relative overflow-hidden">
                <button
                  onClick={handleNewYearModalClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="absolute top-2 left-2 text-4xl">🎊</div>
                <div className="absolute top-2 right-2 text-4xl">🎉</div>

                <div className="text-center pt-8">
                  <div className="text-8xl mb-6">🎆🥳🍾</div>

                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600 mb-4"
                  >
                    Шинэ жилийн мэнд! 2026! 🎊
                  </motion.h2>

                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-gray-700 mb-6"
                  >
                    Танд боломжууд ба баяр баясгалангаар дүүрэн жил хүсье! ✨
                  </motion.p>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <p className="text-base text-gray-600">🌟 Шинэ адал явдал таныг хүлээж байна</p>
                    <p className="text-base text-gray-600">💫 Том мөрөөдөл зорь, илүү их амжилт</p>
                    <p className="text-base text-gray-600">🎯 Бүх зорилго чинь биелэх болтугай</p>
                    <p className="text-base text-gray-600">❤️ Эрүүл мэнд, аз жаргал, амжилтын төлөө</p>
                  </motion.div>

                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNewYearModalClose}
                    className="mt-8 bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Тэмдэглэцгээе! 🎉
                  </motion.button>
                </div>

                <div className="absolute bottom-2 left-2 text-3xl">🎈</div>
                <div className="absolute bottom-2 right-2 text-3xl">🎈</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        onSuccess={handleAuthSuccess}
        phoneNumber={selectedLetter?.phone || ''}
      />

      <LetterModal
        isOpen={isLetterModalOpen}
        onClose={handleLetterModalClose}
        letter={selectedLetter}
      />

      <style jsx>{`
        .countdown-container {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          padding: 2.5rem;
          border: 4px solid rgb(254 202 202);
        }

        @media (min-width: 768px) {
          .countdown-container {
            padding: 2.5rem;
          }
        }

        .countdown-title {
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1.5rem;
          background: linear-gradient(to right, #16a34a, #dc2626);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (min-width: 768px) {
          .countdown-title {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </main>
  );
}