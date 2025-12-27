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
  
  const hasInitedRef = useRef(false);
  const isComponentMounted = useRef(true);

  // Format phone for Firebase (Mongolia default: +976)
  const formattedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+976${phoneNumber.replace(/^0+/, '')}`;

  /* -------------------- Cleanup Recaptcha -------------------- */
  const clearRecaptcha = useCallback(() => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Recaptcha clear warning:', e);
      }
      window.recaptchaVerifier = undefined;
    }
  }, []);

  /* -------------------- Send Verification Code -------------------- */
  const sendVerificationCode = useCallback(async () => {
    if (!phoneNumber || phoneNumber.length < 6) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    if (status === 'SENDING' || status === 'SENT') return;

    setStatus('SENDING');

    try {
      // Clear any existing recaptcha
      clearRecaptcha();

      // Wait for DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 150));

      const container = document.getElementById('recaptcha-container');
      if (!container) {
        throw new Error('Recaptcha container not found in DOM');
      }

      // Initialize RecaptchaVerifier with your site key
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('✅ reCAPTCHA has been solved successfully!');
        },
        'expired-callback': () => {
          if (!isComponentMounted.current) return;
          toast.error('Security check expired. Please try again.');
          setStatus('IDLE');
          clearRecaptcha();
        },
        // Your reCAPTCHA Enterprise site key
        'recaptcha-v3-site-key': '6LfAUyosAAAAADdsQaePh6Ej1f85K3fZrmYIwa87',
      });

      window.recaptchaVerifier = verifier;

      // Render the verifier BEFORE using it
      console.log('🔄 Rendering reCAPTCHA...');
      await verifier.render();
      console.log('✅ reCAPTCHA rendered');

      // Send SMS verification code
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      
      if (!isComponentMounted.current) return;

      setConfirmationResult(result);
      setStatus('SENT');
      toast.success('Verification code sent successfully!');
      console.log('✅ SMS sent successfully');

    } catch (err: any) {
      console.error('❌ SMS Error:', err);
      
      if (!isComponentMounted.current) return;

      setStatus('IDLE');
      clearRecaptcha();

      // Handle specific error codes
      if (err.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.');
      } else if (err.code === 'auth/invalid-phone-number') {
        toast.error('Invalid phone number format.');
      } else if (err.code === 'auth/invalid-app-credential') {
        toast.error('reCAPTCHA verification failed. Please refresh and try again.');
      } else if (err.code === 'auth/captcha-check-failed') {
        toast.error('Security check failed. Please try again.');
      } else if (err.message?.includes('reCAPTCHA client element has been removed')) {
        toast.error('Session expired. Please close and reopen.');
      } else {
        toast.error(err.message || 'Failed to send code. Please try again.');
      }
    }
  }, [phoneNumber, formattedPhone, status, clearRecaptcha]);

  /* -------------------- Verify Code -------------------- */
  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    if (!confirmationResult) {
      toast.error('Session expired. Please resend the code.');
      setStatus('IDLE');
      return;
    }

    setStatus('VERIFYING');

    try {
      const result = await confirmationResult.confirm(verificationCode);
      
      if (!isComponentMounted.current) return;

      toast.success('Phone verified successfully!');
      console.log('✅ Verification successful:', result.user.uid);
      
      onSuccess(result.user);
      handleClose();
      
    } catch (err: any) {
      console.error('❌ Verification Error:', err);
      
      if (!isComponentMounted.current) return;

      setStatus('SENT');
      
      if (err.code === 'auth/invalid-verification-code') {
        toast.error('Invalid code. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        toast.error('Code expired. Please request a new one.');
        setStatus('IDLE');
        setConfirmationResult(null);
      } else {
        toast.error('Verification failed. Please try again.');
      }
    }
  };

  /* -------------------- Resend Code -------------------- */
  const handleResend = async () => {
    setStatus('IDLE');
    setConfirmationResult(null);
    setVerificationCode('');
    clearRecaptcha();
    
    // Wait a moment before resending
    await new Promise(resolve => setTimeout(resolve, 300));
    sendVerificationCode();
  };

  /* -------------------- Handle Close -------------------- */
  const handleClose = () => {
    clearRecaptcha();
    setVerificationCode('');
    setStatus('IDLE');
    setConfirmationResult(null);
    hasInitedRef.current = false;
    onClose();
  };

  /* -------------------- Lifecycle Effects -------------------- */
  useEffect(() => {
    isComponentMounted.current = true;

    if (isOpen && !hasInitedRef.current && phoneNumber) {
      hasInitedRef.current = true;
      
      // Delay to ensure modal animation completes and DOM is ready
      const timer = setTimeout(() => {
        if (isComponentMounted.current) {
          sendVerificationCode();
        }
      }, 600);
      
      return () => clearTimeout(timer);
    }
    
    if (!isOpen) {
      hasInitedRef.current = false;
      setStatus('IDLE');
      setVerificationCode('');
      setConfirmationResult(null);
      clearRecaptcha();
    }
  }, [isOpen, phoneNumber, sendVerificationCode, clearRecaptcha]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
      clearRecaptcha();
    };
  }, [clearRecaptcha]);

  // Handle Enter key for verification
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6 && status === 'SENT') {
      handleVerifyCode();
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              {/* Header */}
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
                    : status === 'IDLE'
                    ? 'Setting up verification...'
                    : `Code sent to ${formattedPhone}`}
                </p>
              </div>

              {/* Content */}
              {status === 'SENDING' || status === 'IDLE' ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="animate-spin text-green-600" size={48} />
                  <p className="text-sm text-gray-400">
                    {status === 'SENDING' ? 'Sending verification code...' : 'Initializing...'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Verification Code Input */}
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                      }}
                      onKeyPress={handleKeyPress}
                      className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-gray-700"
                      placeholder="••••••"
                      autoFocus
                      disabled={status === 'VERIFYING'}
                      maxLength={6}
                    />
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={handleVerifyCode}
                    disabled={status === 'VERIFYING' || verificationCode.length < 6}
                    className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
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

                  {/* Resend Link */}
                  <p className="text-center text-sm text-gray-500">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleResend}
                      disabled={status === 'VERIFYING'}
                      className="text-green-600 font-medium hover:underline focus:outline-none disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              )}

              {/* Hidden reCAPTCHA Container */}
              <div 
                id="recaptcha-container" 
                style={{ 
                  position: 'absolute', 
                  top: '-9999px',
                  left: '-9999px',
                  visibility: 'hidden'
                }} 
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}