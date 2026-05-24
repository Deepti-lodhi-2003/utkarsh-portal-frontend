// src/component/OtpVerification.jsx
import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2, Edit3, RefreshCw, ShieldCheck } from 'lucide-react';

const OtpVerification = ({
    mobile,
    otpState,
    onSendOtp,
    onVerifyOtp,
    onResendOtp,
    onOtpChange,
    onEditMobile,
    disabled = false,
}) => {
    const { t } = useTranslation();
    const inputRefs = useRef([]);
    const {
        isSending,
        isVerifying,
        isResending,
        otpSent,
        otpVerified,
        otp,
        timer,
        error,
    } = otpState;

    // Auto focus first input when OTP sent
    useEffect(() => {
        if (otpSent && !otpVerified && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [otpSent, otpVerified]);

    // Handle individual OTP digit input
    const handleDigitChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const otpArray = otp.split('');
        while (otpArray.length < 6) otpArray.push('');
        otpArray[index] = value;
        const newOtp = otpArray.join('').slice(0, 6);
        onOtpChange(newOtp);

        // Auto focus next input
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        onOtpChange(pastedData);

        // Focus appropriate input
        const focusIndex = Math.min(pastedData.length, 5);
        if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
        }
    };

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ── Already Verified State ──
    if (otpVerified) {
        return (
            <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                    <CheckCircle size={14} />
                    Mobile Verified 
                </span>
                <button
                    type="button"
                    onClick={onEditMobile}
                    className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    disabled={disabled}
                >
                    <Edit3 size={12} /> Change
                </button>
            </div>
        );
    }

    // ── Send OTP Button (before OTP sent) ──
    if (!otpSent) {
        return (
            <button
                type="button"
                onClick={() => onSendOtp(mobile)}
                disabled={isSending || !mobile || mobile.length !== 10 || disabled}
                className="mt-1 px-4 py-2 bg-[#233480] text-white text-xs font-bold rounded-sm hover:bg-[#1a2660] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isSending ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        Sending OTP...
                    </>
                ) : (
                    <>
                        <ShieldCheck size={14} />
                        Verify Mobile
                    </>
                )}
            </button>
        );
    }

    // ── OTP Input Section (after OTP sent, before verified) ──
    return (
        <div className="mt-3 space-y-3">
            {/* OTP Info */}
            <div className="flex items-center gap-2">
                <p className="text-xs text-gray-600">
                    OTP sent to <span className="font-bold text-gray-800">+91 {mobile}</span>
                </p>
                <button
                    type="button"
                    onClick={onEditMobile}
                    className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                    <Edit3 size={10} /> Edit
                </button>
            </div>

            {/* 6 Digit OTP Boxes */}
            <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[index] || ''}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={`w-10 h-10 text-center text-lg font-bold border-2 rounded-md focus:outline-none focus:border-[#233480] transition-all ${
                            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                        }`}
                        disabled={isVerifying}
                    />
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-[11px] font-medium">⊗ {error}</p>
            )}

            {/* Verify + Resend Buttons */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onVerifyOtp(mobile, otp)}
                    disabled={isVerifying || otp.length !== 6}
                    className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-sm hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isVerifying ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={14} />
                            Verify OTP
                        </>
                    )}
                </button>

                {timer > 0 ? (
                    <span className="text-xs text-gray-500">
                        Resend in <span className="font-bold text-[#233480]">{formatTimer(timer)}</span>
                    </span>
                ) : (
                    <button
                        type="button"
                        onClick={() => onResendOtp(mobile)}
                        disabled={isResending}
                        className="text-xs text-[#233480] hover:text-[#1a2660] font-semibold underline flex items-center gap-1 disabled:opacity-50"
                    >
                        {isResending ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <RefreshCw size={12} />
                        )}
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
};

export default OtpVerification;