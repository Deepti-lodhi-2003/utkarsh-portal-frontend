
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

const InstitutionSettings = () => {
    const { t } = useTranslation();
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [errors, setErrors] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [apiError, setApiError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        if (value.trim()) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowSuccessAlert(false);
        setShowErrorAlert(false);

        let newErrors = { current: '', new: '', confirm: '' };
        let hasError = false;

        if (!passwords.current.trim()) {
            newErrors.current = t('pages.institution_settings.errors.current_required');
            hasError = true;
        }

        if (!passwords.new.trim()) {
            newErrors.new = t('pages.institution_settings.errors.new_required');
            hasError = true;
        } else if (passwords.new.length < 5) {
            newErrors.new = t('pages.institution_settings.errors.min_length');
            hasError = true;
        }

        if (!passwords.confirm.trim()) {
            newErrors.confirm = t('pages.institution_settings.errors.confirm_required');
            hasError = true;
        } else if (passwords.confirm.length < 5) {
            newErrors.confirm = t('pages.institution_settings.errors.min_length');
            hasError = true;
        } else if (passwords.new !== passwords.confirm) {
            newErrors.confirm = t('pages.institution_settings.errors.mismatch');
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        // ── API Call ──
        setIsUpdating(true);
        try {
            await authAPI.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
                confirmPassword: passwords.confirm
            });

            setShowSuccessAlert(true);
            setPasswords({ current: '', new: '', confirm: '' });
            setErrors({ current: '', new: '', confirm: '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Change password error:', err);
            const message = err.response?.data?.message || t('pages.institution_settings.errors.change_failed');

            // Map server error to field
            if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('current')) {
                setErrors(prev => ({ ...prev, current: t('pages.institution_settings.errors.incorrect_current') }));
            } else {
                setApiError(message);
                setShowErrorAlert(true);
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-2">
            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-[14px]">
                        <Check size={16} className="text-[#155724] stroke-[3px]" />
                        {t('pages.institution_settings.update_success')}
                    </div>
                    <button onClick={() => setShowSuccessAlert(false)} className="text-[#155724] hover:opacity-70 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* API Error Alert */}
            {showErrorAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-md">
                    <div className="flex items-center gap-2 text-[14px]">
                        <AlertCircle size={16} className="text-[#721c24] stroke-[3px]" />
                        {apiError}
                    </div>
                    <button onClick={() => setShowErrorAlert(false)} className="text-[#721c24] hover:opacity-70">
                        <X size={14} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h3 className="text-[#1e2a5a] text-lg font-semibold mb-6">{t('pages.institution_settings.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <div className="space-y-2">
                            <input type="password" name="current" placeholder={t('pages.institution_settings.placeholders.current')} value={passwords.current} onChange={handleInputChange}
                                className={`w-full px-4 py-3 bg-white border ${errors.current ? 'border-red-300' : 'border-gray-200'} rounded text-gray-700 text-sm focus:outline-none focus:border-[#233480] transition-colors`} />
                            {errors.current && (
                                <p className="text-[#721c24] text-[12px] flex items-center gap-1 mt-1 font-medium">
                                    <AlertCircle size={14} className="inline" /> {errors.current}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <input type="password" name="new" placeholder={t('pages.institution_settings.placeholders.new')} value={passwords.new} onChange={handleInputChange}
                                className={`w-full px-4 py-3 bg-white border ${errors.new ? 'border-red-300' : 'border-gray-200'} rounded text-gray-700 text-sm focus:outline-none focus:border-[#233480] transition-colors`} />
                            {errors.new && (
                                <p className="text-[#721c24] text-[12px] flex items-center gap-1 mt-1 font-medium">
                                    <AlertCircle size={14} className="inline" /> {errors.new}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <input type="password" name="confirm" placeholder={t('pages.institution_settings.placeholders.confirm')} value={passwords.confirm} onChange={handleInputChange}
                                className={`w-full px-4 py-3 bg-white border ${errors.confirm ? 'border-red-300' : 'border-gray-200'} rounded text-gray-700 text-sm focus:outline-none focus:border-[#233480] transition-colors`} />
                            {errors.confirm && (
                                <p className="text-[#721c24] text-[12px] flex items-center gap-1 mt-1 font-medium">
                                    <AlertCircle size={14} className="inline" /> {errors.confirm}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button type="submit" disabled={isUpdating}
                        className={`w-full md:w-auto px-16 md:px-12 py-3 bg-[#233480] text-white font-bold rounded hover:bg-[#1a2660] transition-all text-sm shadow-md uppercase tracking-wide ${isUpdating ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                        {isUpdating ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin" /> {t('pages.institution_settings.actions.updating')}
                            </span>
                        ) : t('pages.institution_settings.actions.change_password')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InstitutionSettings;