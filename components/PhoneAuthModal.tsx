'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import toast from 'react-hot-toast';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  phoneNumber: string;
}

// Declare global types to avoid TS errors with window
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

export default function PhoneAuthModal({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber,
}: PhoneAuthModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'VERIFYING'>('IDLE');
  
  // Track initialization to prevent double-firing
  const hasInitedRef = useRef(false);

  // Helper: Format Phone for Firebase (Mongolia default)
  const formattedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+976${phoneNumber.replace(/^0+/, '')}`;

  /* -------------------- 1. Cleanup Recaptcha -------------------- */
  const clearRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Recaptcha clear error', e);
      }
      window.recaptchaVerifier = undefined;
    }
  };

  /* -------------------- 2. Initialize & Send -------------------- */
  const sendVerificationCode = useCallback(async () => {
    if (!phoneNumber || phoneNumber.length < 6) return;
    
    // Prevent double-send if already sending or sent
    if (status === 'SENDING' || status === 'SENT') return;

    setStatus('SENDING');

    try {
      // Step A: Ensure previous instances are gone
      clearRecaptcha();

      // Step B: Wait a tick for the DOM <div id="recaptcha"> to exist
      await new Promise((resolve) => setTimeout(resolve, 100));

      const container = document.getElementById('recaptcha-container');
      if (!container) {
        throw new Error('Recaptcha container not found in DOM');
      }

      // Step C: Initialize Verifier
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // (Firebase handles this automatically usually)
        },
        'expired-callback': () => {
          toast.error('Recaptcha expired. Please try again.');
          setStatus('IDLE');
        },
      });

      window.recaptchaVerifier = verifier;

      // Step D: Send SMS
      // Important: We pass the verifier instance directly
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      
      setConfirmationResult(result);
      setStatus('SENT');
      toast.success('Code sent!');

    } catch (err: any) {
      console.error('SMS Error:', err);
      setStatus('IDLE');
      clearRecaptcha(); // Clean up so they can try again

      if (err.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Try again later.');
      } else if (err.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format.');
      } else if (err.message.includes('reCAPTCHA client element has been removed')) {
        toast.error('Please close and reopen the window.');
      } else {
        toast.error('Failed to send code. Try again.');
      }
    }
  }, [phoneNumber, formattedPhone, status]);

  /* -------------------- 3. Verify Code -------------------- */
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }

    if (!confirmationResult) {
      toast.error('Session expired. Please resend code.');
      return;
    }

    setStatus('VERIFYING');

    try {
      const result = await confirmationResult.confirm(verificationCode);
      toast.success('Verified successfully!');
      onSuccess(result.user);
      handleClose();
    } catch (err: any) {
      console.error('Verify Error:', err);
      setStatus('SENT'); // Go back to 'SENT' state so they can retry typing
      toast.error('Incorrect code. Please check and try again.');
    }
  };

  /* -------------------- 4. Resend -------------------- */
  const handleResend = async () => {
    // Reset state completely to force a fresh recaptcha generation
    setStatus('IDLE');
    setConfirmationResult(null);
    setVerificationCode('');
    hasInitedRef.current = false;
    
    // Trigger send again (via the effect or direct call)
    // We call directly here to bypass the Effect dependency confusion
    setTimeout(() => {
        sendVerificationCode();
    }, 200);
  };

  /* -------------------- 5. Lifecycle -------------------- */
  useEffect(() => {
    // ONLY trigger when isOpen turns true AND we haven't started yet
    if (isOpen && !hasInitedRef.current) {
      hasInitedRef.current = true;
      // Small delay to let the Modal Animation finish rendering the DOM
      const timer = setTimeout(() => {
        sendVerificationCode();
      }, 500); 
      return () => clearTimeout(timer);
    }
    
    // Reset if closed
    if (!isOpen) {
      hasInitedRef.current = false;
      setStatus('IDLE');
      setVerificationCode('');
      setConfirmationResult(null);
      clearRecaptcha();
    }
  }, [isOpen, sendVerificationCode]);

  const handleClose = () => {
    clearRecaptcha();
    onClose();
  };

  /* -------------------- UI -------------------- */
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Verify Your Phone
                </h2>
                <p className="text-gray-500 mt-2 text-sm">
                  {status === 'SENDING'
                    ? 'Preparing secure verification...'
                    : `Enter the code sent to ${formattedPhone}`}
                </p>
              </div>

              {status === 'SENDING' || status === 'IDLE' ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="animate-spin text-green-600" size={48} />
                  <p className="text-sm text-gray-400">Communicating with server...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-500"
                    placeholder="······"
                    autoFocus
                    disabled={status === 'VERIFYING'}
                  />

                  <button
                    onClick={handleVerifyCode}
                    disabled={status === 'VERIFYING' || verificationCode.length < 6}
                    className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px transition-all"
                  >
                    {status === 'VERIFYING' ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Didn't receive code?{' '}
                    <button 
                      onClick={handleResend}
                      className="text-green-600 font-medium hover:underline focus:outline-none"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              )}
              
              {/* Container MUST be present in DOM when sendVerificationCode runs.
                 We keep it hidden but technically "visible" to the DOM (not display:none) 
                 so Recaptcha can attach. 
              */}
              <div id="recaptcha-container" className="invisible w-0 h-0" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}