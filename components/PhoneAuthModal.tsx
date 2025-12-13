'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import toast from 'react-hot-toast';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
  phoneNumber: string;
}

export default function PhoneAuthModal({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber,
}: PhoneAuthModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const initializedRef = useRef(false);

  /* -------------------- Helpers -------------------- */

  const formattedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+${phoneNumber}`;

  const clearRecaptcha = () => {
    const verifier = (window as any).recaptchaVerifier;
    if (verifier) {
      try {
        verifier.clear();
      } catch {}
      (window as any).recaptchaVerifier = null;
    }
  };

  const setupRecaptcha = () => {
    clearRecaptcha();
    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      { size: 'invisible' }
    );
  };

  /* -------------------- Send SMS -------------------- */

  const sendVerificationCode = useCallback(async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Invalid phone number');
      return;
    }

    setSendingCode(true);

    try {
      // 1️⃣ Check cooldown FIRST (backend)
      const check = await fetch('/api/auth/can-send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const checkData = await check.json();

      if (!check.ok) {
        toast.error(checkData.error);
        return;
      }

      if (!checkData.canResend) {
        toast.error('You can request a new code after 2 days.');
        return;
      }

      // 2️⃣ Setup reCAPTCHA
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;

      // 3️⃣ Send SMS via Firebase
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResult(result);
      initializedRef.current = true;
      toast.success('Verification code sent!');
    } catch (err: any) {
      console.error('Send SMS error:', err);
      toast.error(err.message || 'Failed to send code');
      clearRecaptcha();
    } finally {
      setSendingCode(false);
    }
  }, [phoneNumber, formattedPhone]);

  /* -------------------- Verify Code -------------------- */

  const handleVerifyCode = useCallback(async () => {
    if (verificationCode.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }

    if (!confirmationResult) {
      toast.error('Request a verification code first');
      return;
    }

    setVerifying(true);

    try {
      // 1️⃣ Firebase verification
      await confirmationResult.confirm(verificationCode);

      // 2️⃣ Mark verified in DB (update loggedAt)
      const res = await fetch('/api/auth/mark-verified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Verification failed');
        return;
      }

      toast.success('Authentication successful!');
      onSuccess(data.user);
      handleClose();
    } catch (err: any) {
      console.error('Verify error:', err);
      toast.error('Invalid or expired code');
    } finally {
      setVerifying(false);
    }
  }, [verificationCode, confirmationResult, formattedPhone, onSuccess]);

  /* -------------------- Resend -------------------- */

  const handleResend = async () => {
    setVerificationCode('');
    setConfirmationResult(null);
    initializedRef.current = false;
    clearRecaptcha();
    await sendVerificationCode();
  };

  /* -------------------- Lifecycle -------------------- */

  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      sendVerificationCode();
    }
  }, [isOpen, sendVerificationCode]);

  const handleClose = () => {
    setVerificationCode('');
    setConfirmationResult(null);
    initializedRef.current = false;
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
              className="bg-linear-to-br from-red-50 to-green-50 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-linear-to-br from-red-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Verify Your Phone
                </h2>
                <p className="text-gray-600 mt-2">
                  {sendingCode
                    ? 'Sending verification code...'
                    : `Enter the code sent to ${phoneNumber}`}
                </p>
              </div>

              {sendingCode ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-red-500" size={40} />
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ''))
                    }
                    maxLength={6}
                    placeholder="123456"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest"
                  />

                  <button
                    onClick={handleVerifyCode}
                    disabled={verifying}
                    className="w-full bg-linear-to-r from-red-500 to-green-500 text-white py-3 rounded-lg font-semibold"
                  >
                    {verifying ? (
                      <Loader2 className="animate-spin mx-auto" size={20} />
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <button
                    onClick={handleResend}
                    disabled={sendingCode || verifying}
                    className="w-full text-gray-600 py-2 text-sm"
                  >
                    Didn’t receive code? Resend
                  </button>
                </div>
              )}

              <div id="recaptcha-container" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
