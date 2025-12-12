'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchPublicLetters();
  }, []);

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

  const handleLetterClick = (letter: any) => {
    setSelectedLetter(letter);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setIsLetterModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-100 via-white to-green-100">
      <Toaster position="top-center" />
      
      {/* Floating Snowflakes */}
      <Snowflakes count={15} />

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
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600 mb-4">
              Christmas Letters 2025
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Special messages of love, joy, and holiday cheer ✨
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/admin"
                className="inline-block bg-gradient-to-r from-red-600 to-green-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Admin Dashboard
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <Sparkles className="inline-block text-yellow-500 mb-4" size={40} />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Available Letters
              </h2>
              <p className="text-gray-600">
                Click on any letter to unlock your special Christmas message
              </p>
            </motion.div>

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

            {letters.length === 0 && (
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
          Made with ❤️ for Christmas 2025 | Happy Holidays! 🎄
        </p>
      </motion.footer>

      {/* Modals */}
      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <LetterModal
        isOpen={isLetterModalOpen}
        onClose={() => setIsLetterModalOpen(false)}
        letter={selectedLetter}
      />
    </main>
  );
}