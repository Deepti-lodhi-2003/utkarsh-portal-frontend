import React, { useState } from 'react';
import { TriangleAlert, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Footer from '../component/Footer';
import { authAPI } from '../services/api';
import useOtpVerification from '../hooks/useOtpVerification';

const ForgotPassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // OTP Hook
    const otpHook = useOtpVerification('forgot_password');

    const [mobile, setMobile] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP & Password
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!mobile || mobile.length !== 10) {
            toast.error(t('pages.auth.mobile_invalid'));
            return;
        }

        const success = await otpHook.sendOtp(mobile);
        if (success) {
            setStep(2);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otpHook.otp || otpHook.otp.length !== 6) {
            toast.error(t('pages.auth.otp_invalid'));
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            toast.error(t('pages.auth.password_min'));
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error(t('pages.auth.password_mismatch'));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                mobile,
                otp: otpHook.otp,
                newPassword,
                confirmPassword
            };

            const response = await authAPI.resetPassword(payload);

            if (response.data.success) {
                toast.success(t('pages.auth.reset_success'));
                setTimeout(() => {
                    navigate('/login/candidate');
                }, 1500);
            }
        } catch (error) {
            const message = error.response?.data?.message || t('pages.auth.reset_failed');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Hero Banner Section */}
            <div className="relative w-full h-40 md:h-48 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-widest text-center px-4 uppercase">
                    {t('pages.auth.forgot_password_title')}
                </h1>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center p-4 -mt-10 relative z-20 mb-20">
                <div className="w-full max-w-lg bg-white shadow-2xl overflow-hidden border-b-4 border-[#233480] rounded-sm p-6 md:p-10">

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="text-center">
                                <p className="text-gray-600 text-sm mb-6">
                                    {t('pages.auth.enter_mobile_otp')}
                                </p>
                            </div>

                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">
                                    {t('pages.register.mobile_label')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t('pages.register.mobile_placeholder')}
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#233480] text-sm transition-all"
                                        disabled={otpHook.isSending}
                                    />
                                    {otpHook.isSending && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 size={16} className="animate-spin text-[#233480]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={otpHook.isSending || mobile.length !== 10}
                                className={`w-full py-3.5 font-bold rounded-sm transition-all duration-300 text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${mobile.length === 10
                                    ? 'bg-[#233480] text-white hover:bg-[#1a2660]'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {otpHook.isSending ? t('pages.auth.sending_otp') : t('pages.auth.send_otp')}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="bg-blue-50 p-4 rounded-sm border border-blue-100 flex items-center gap-3 mb-6">
                                <TriangleAlert size={18} className="text-[#233480] shrink-0" />
                                <p className="text-[#233480] text-xs leading-relaxed">
                                    {t('pages.auth.otp_sent_to')} <span className="font-bold">+91 {mobile}</span>. {t('pages.auth.enter_otp')}.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-[10px] uppercase font-bold text-[#233480] hover:underline shrink-0"
                                >
                                    {t('pages.auth.edit')}
                                </button>
                            </div>

                            {/* OTP Input */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase">
                                    {t('pages.auth.enter_otp')}
                                </label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otpHook.otp}
                                    onChange={(e) => otpHook.setOtp(e.target.value)}
                                    placeholder="_ _ _ _ _ _"
                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#233480] text-center text-lg tracking-[1em] font-bold"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase">
                                    {t('pages.auth.new_password')}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={t('pages.auth.min_chars')}
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#233480] text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2 uppercase">
                                    {t('pages.auth.confirm_password')}
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('pages.auth.re_enter_password')}
                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#233480] text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || otpHook.otp.length !== 6}
                                className={`w-full py-4 font-bold rounded-sm transition-all duration-300 text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-4 ${otpHook.otp.length === 6 && !isSubmitting
                                    ? 'bg-[#233480] text-white hover:bg-[#1a2660]'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {t('pages.auth.resetting')}
                                    </>
                                ) : t('pages.auth.reset_password')}
                            </button>

                            <div className="text-center pt-2">
                                <p className="text-xs text-gray-500">
                                    {t('pages.auth.didnt_receive_otp')}{' '}
                                    {otpHook.timer > 0 ? (
                                        <span className="font-bold">{t('pages.auth.resend_in')} {otpHook.timer}s</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => otpHook.resendOtp(mobile)}
                                            className="text-[#233480] font-bold hover:underline"
                                            disabled={otpHook.isResending}
                                        >
                                            {otpHook.isResending ? t('pages.auth.resending') : t('pages.auth.resend_now')}
                                        </button>
                                    )}
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ForgotPassword;
