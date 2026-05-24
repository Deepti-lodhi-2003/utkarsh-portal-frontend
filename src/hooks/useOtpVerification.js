// src/hooks/useOtpVerification.js
import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useOtpVerification = (purpose = 'registration') => {
    const [otpState, setOtpState] = useState({
        isSending: false,
        isVerifying: false,
        isResending: false,
        otpSent: false,
        otpVerified: false,
        otp: '',
        timer: 0,
        error: '',
    });

    // Countdown timer
    useEffect(() => {
        let interval;
        if (otpState.timer > 0) {
            interval = setInterval(() => {
                setOtpState(prev => ({ ...prev, timer: prev.timer - 1 }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpState.timer]);

    // Send OTP
    const sendOtp = useCallback(async (mobile) => {
        if (!mobile || mobile.length !== 10) {
            setOtpState(prev => ({ ...prev, error: 'Please enter valid 10 digit mobile number' }));
            return false;
        }

        setOtpState(prev => ({ ...prev, isSending: true, error: '' }));

        try {
            const response = await authAPI.sendOtp({ mobile, purpose });

            if (response.data.success) {
                const expiresIn = response.data.data?.expiresIn || 600;
                setOtpState(prev => ({
                    ...prev,
                    isSending: false,
                    otpSent: true,
                    timer: 60, // 60 seconds resend timer
                    error: '',
                }));
                toast.success('OTP sent successfully! Check your mobile.');
                return true;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP';
            setOtpState(prev => ({
                ...prev,
                isSending: false,
                error: message,
            }));
            toast.error(message);
            return false;
        }
    }, [purpose]);

    // Verify OTP
    const verifyOtp = useCallback(async (mobile, otp) => {
        if (!otp || otp.length !== 6) {
            setOtpState(prev => ({ ...prev, error: 'Please enter valid 6 digit OTP' }));
            return false;
        }

        setOtpState(prev => ({ ...prev, isVerifying: true, error: '' }));

        try {
            const response = await authAPI.verifyOtp({ mobile, otp, purpose });

            if (response.data.success && response.data.data?.verified) {
                setOtpState(prev => ({
                    ...prev,
                    isVerifying: false,
                    otpVerified: true,
                    error: '',
                }));
                toast.success('Mobile number verified successfully! ');
                return true;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
            setOtpState(prev => ({
                ...prev,
                isVerifying: false,
                error: message,
            }));
            toast.error(message);
            return false;
        }
    }, [purpose]);

    // Resend OTP
    const resendOtp = useCallback(async (mobile) => {
        if (otpState.timer > 0) return false;

        setOtpState(prev => ({ ...prev, isResending: true, error: '' }));

        try {
            const response = await authAPI.resendOtp({ mobile, purpose });

            if (response.data.success) {
                setOtpState(prev => ({
                    ...prev,
                    isResending: false,
                    timer: 60,
                    otp: '',
                    error: '',
                }));
                toast.success('OTP resent successfully!');
                return true;
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to resend OTP';
            setOtpState(prev => ({
                ...prev,
                isResending: false,
                error: message,
            }));
            toast.error(message);
            return false;
        }
    }, [purpose, otpState.timer]);

    // Set OTP value
    const setOtp = useCallback((value) => {
        // Only allow digits, max 6
        const cleanValue = value.replace(/\D/g, '').slice(0, 6);
        setOtpState(prev => ({ ...prev, otp: cleanValue, error: '' }));
    }, []);

    // Reset everything
    const resetOtp = useCallback(() => {
        setOtpState({
            isSending: false,
            isVerifying: false,
            isResending: false,
            otpSent: false,
            otpVerified: false,
            otp: '',
            timer: 0,
            error: '',
        });
    }, []);

    // Edit mobile (go back to mobile input)
    const editMobile = useCallback(() => {
        setOtpState(prev => ({
            ...prev,
            otpSent: false,
            otpVerified: false,
            otp: '',
            timer: 0,
            error: '',
        }));
    }, []);

    return {
        ...otpState,
        sendOtp,
        verifyOtp,
        resendOtp,
        setOtp,
        resetOtp,
        editMobile,
    };
};

export default useOtpVerification;