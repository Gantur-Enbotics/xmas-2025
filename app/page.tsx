'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import LetterCard from '@/components/LetterCard';
import PhoneAuthModal from '@/components/PhoneAuthModal';
import LetterModal from '@/components/LetterModal';
import Snowflakes from '@/components/Snowflakes';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';

export default function Home() {
  const [letters, setLetters] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoize the fetch function to prevent recreation on every render
  const fetchPublicLetters = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPublicLetters();
  }, [fetchPublicLetters]);

  // Memoize click handler to prevent recreation
  const handleLetterClick = useCallback((letter: any) => {
    setSelectedLetter(letter);
    setIsAuthModalOpen(true);
  }, []);

  // Memoize auth success handler
  const handleAuthSuccess = useCallback((userData: any) => {
    setIsLetterModalOpen(true);
  }, []);

  // Memoize close handlers
  const handleAuthModalClose = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLetterModalClose = useCallback(() => {
    setIsLetterModalOpen(false);
  }, []);

  // Memoize empty state check
  const hasNoLetters = useMemo(() => letters.length === 0, [letters.length]);

  return (
    <main className="min-h-screen bg-linear-to-br from-red-100 via-white to-green-100">
      <Toaster position="top-center" />
      
      {/* Falling Snowflakes - balanced count */}
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
            {/* Animated tree emoji */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-6xl mb-4"
            >
              🎄
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-linear-to-r from-red-600 to-green-600 mb-4">
              Christmas Letters 2025
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Special messages of love, joy, and holiday cheer ✨
            </p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            {/* Spinning gift */}
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
    </main>
  );
}