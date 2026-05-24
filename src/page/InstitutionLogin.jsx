import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Info, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../dashboard/context/AuthContext';

const InstitutionLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const showLogoutAlert = searchParams.get('logout') === 'success';
    
    const { login, user, loading: authLoading } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    // ────────────────────────────────────────────────
    //  Redirect if already logged in
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (!authLoading && user && user.role === 'institution') {
            navigate('/institution/dashboard');
        }
    }, [user, authLoading, navigate]);

    const closeAlert = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('logout');
        setSearchParams(newParams);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ username: '', password: '' });

        let newErrors = { username: '', password: '' };
        let hasError = false;

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[0-9]{10}$/;

        if (!formData.username.trim()) {
            newErrors.username = t('pages.errors.username_required');
            hasError = true;
        } else if (!emailRegex.test(formData.username) && !mobileRegex.test(formData.username)) {
            newErrors.username = t('pages.errors.username_invalid');
            hasError = true;
        }

        if (!formData.password) {
            newErrors.password = t('pages.errors.password_required');
            hasError = true;
        } else if (formData.password.length < 6) {
            newErrors.password = t('pages.errors.password_length');
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        // ────────────────────────────────────────────────
        //  API Login Call
        // ────────────────────────────────────────────────
        setLoading(true);
        
        // Use mobile (username can be email or mobile)
        const mobile = mobileRegex.test(formData.username) 
            ? formData.username 
            : formData.username; // If email, backend will handle

        const result = await login(mobile, formData.password);

        if (result.success) {
            // Check if institution
            if (result.role === 'institution') {
                navigate('/institution/dashboard');
            } else {
                setErrors({ 
                    username: '', 
                    password: 'Invalid credentials for institution login' 
                });
                localStorage.clear();
            }
        } else {
            setErrors({ 
                username: '', 
                password: result.error 
            });
        }
        
        setLoading(false);
    };

    const handleRegisterClick = () => {
        navigate('/register/institution');
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233480] mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-50 font-sans">
            {/* Banner Section */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-3xl font-bold text-white tracking-wider">{t('pages.auth.institution_login_title')}</h1>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center p-4 -mt-10 relative">
                <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-2xl overflow-hidden min-h-[400px]">

                    {/* Left Side - White Background with Branding */}
                    <div className="hidden md:flex md:w-5/12 bg-white p-8 flex-col justify-between relative">
                        <div className="z-10">
                            <h1 className="text-3xl font-bold text-[#233480] mb-2">Utkarsh Portal</h1>
                            <p className="text-gray-500 text-sm font-medium">{t('pages.auth.empowering_text')}</p>
                        </div>

                        <div className="z-10 mt-4 relative max-w-[300px] mx-auto">
                            <img
                                src="https://img.freepik.com/free-vector/recruitment-agency-searching-job-candidates_74855-6972.jpg?t=st=1738843350~exp=1738846950~hmac=6e1e3e7e8c3e6e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e&w=800"
                                alt="Institution Hiring"
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="z-10 text-[10px] text-gray-400 mt-4">
                            © 2026 Utkarsh Portal. {t('common.powered_by')} MPIDC.
                        </div>
                    </div>

                    {/* Right Side - Brand Blue Login Form with Organic Wave */}
                    <div className="w-full md:w-7/12 relative z-10 flex flex-col justify-center p-6 md:p-8">
                        {/* Organic Wavy SVG Shape handling full background */}
                        <div className="hidden md:block absolute inset-y-0 -left-4 w-[calc(100%+12rem)] h-full z-0 pointer-events-none">
                            <svg className="h-full w-full text-[#233480] fill-current" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path d="M100,0 L100,100 L5,100 C-5,85 15,75 5,50 C-5,25 15,15 5,0 Z" />
                            </svg>
                        </div>
                        {/* Mobile background (fallback) */}
                        <div className="md:hidden absolute inset-0 bg-[#233480] -z-10"></div>

                        <div className="relative z-10 max-w-xs mx-auto w-full">
                            {/* Logout Success Alert */}
                            {showLogoutAlert && (
                                <div className="mb-6 flex items-center justify-between bg-[#d1ecf1] border border-[#bee5eb] text-[#0c5460] px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2 text-[13px] font-medium">
                                        <Info size={16} className="text-[#0c5460]" />
                                        {t('pages.auth.sign_out_success')}
                                    </div>
                                    <button
                                        onClick={closeAlert}
                                        className="text-[#0c5460] hover:opacity-70 transition-opacity"
                                    >
                                        <CloseIcon size={14} />
                                    </button>
                                </div>
                            )}

                            <h2 className="text-2xl font-bold text-white mb-2">{t('pages.auth.institution_login_title')}</h2>
                            <p className="text-blue-100 text-xs mb-4">{t('pages.auth.recruiter_subheading')}</p>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-blue-100 text-xs font-medium mb-1 pl-1">{t('pages.auth.username_label')}</label>
                                    <input
                                        type="text"
                                        placeholder={t('pages.auth.username_placeholder')}
                                        value={formData.username}
                                        onChange={(e) => {
                                            setFormData({ ...formData, username: e.target.value });
                                            if (errors.username) setErrors({ ...errors, username: '' });
                                        }}
                                        disabled={loading}
                                        className={`w-full px-4 py-2.5 bg-[#1a2660] text-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-blue-300/50 text-sm transition-all shadow-inner disabled:opacity-50 ${errors.username ? 'border-red-500 ring-1 ring-red-500' : 'border-transparent'}`}
                                    />
                                    {errors.username && (
                                        <p className="text-red-400 text-[10px] mt-1 pl-1 flex items-center gap-1 font-medium">
                                            <span>⊗</span> {errors.username}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-blue-100 text-xs font-medium mb-1 pl-1">{t('pages.auth.password_label')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={t('pages.auth.password_placeholder')}
                                            value={formData.password}
                                            onChange={(e) => {
                                                setFormData({ ...formData, password: e.target.value });
                                                if (errors.password) setErrors({ ...errors, password: '' });
                                            }}
                                            disabled={loading}
                                            className={`w-full px-4 py-2.5 bg-[#1a2660] text-white border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-blue-300/50 text-sm transition-all pr-10 shadow-inner disabled:opacity-50 ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-transparent'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                                            disabled={loading}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-400 text-[10px] mt-1 pl-1 flex items-center gap-1 font-medium">
                                            <span>⊗</span> {errors.password}
                                        </p>
                                    )}
                                    <div className="flex justify-end mt-2">
                                        <Link to="/forgot-password" title={t('pages.auth.forgot_password_title')} className="text-blue-200 text-[11px] hover:text-white transition-colors">{t('pages.auth.forgot_password_link')}</Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-white text-[#233480] font-bold rounded-xl text-sm hover:bg-blue-50 transition-all shadow-lg mt-4 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Logging in...
                                        </span>
                                    ) : t('pages.auth.login_button')}
                                </button>

                                <div className="text-center mt-6">
                                    <p className="text-blue-200 text-xs">
                                        {t('pages.auth.no_account')} <button type="button" onClick={handleRegisterClick} className="text-white font-bold hover:underline transition-colors">{t('pages.auth.register_now')}</button>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dark Footer Section */}
            <div className="bg-[#1e293b] text-white py-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Utkarsh Portal</h2>
                <div className="flex items-center justify-center gap-2 mb-2 text-sm text-gray-300">
                    <span>{t('common.powered_by')}</span>
                    <span className="font-bold text-blue-400">MPIDC</span>
                    <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[8px]">M</div>
                </div>
                <p className="text-gray-400 text-sm">
                    <span className="font-bold text-gray-300">Email:</span> info@UtkarshPortal.com
                </p>
            </div>
        </div>
    );
};

export default InstitutionLogin;