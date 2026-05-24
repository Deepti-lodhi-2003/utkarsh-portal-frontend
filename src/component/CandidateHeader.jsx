import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, ChevronLeft, LayoutDashboard, Search, FileText, LogOut, Store, Send, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../dashboard/context/AuthContext';
import { authAPI } from '../services/api';
import LanguageSelector from './LanguageSelector';

const CandidateHeader = ({ userName }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout: contextLogout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const displayName = userName || user?.name || 'User';   

    // Nav links — same as main Header, using React Router Link (no reload)
    const navLinks = [
        { label: t('header.home'), to: '/' },
        { label: t('header.company_jobs'), to: '/search-job' },
        { label: t('header.kaushal_setu'), to: '/kaushal-setu' },
        { label: t('header.industry_services'), to: '/industry-service' },
        { label: t('header.vendor_directory'), to: '/vendor-directory' },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();

        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);
            setIsDropdownOpen(false);

            try {
                await authAPI.logout();
            } catch (apiError) {
                console.error('API logout error (continuing anyway):', apiError);
            }

            contextLogout();

            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userType');

            window.dispatchEvent(new Event('auth-change'));

            toast.success('Logged out successfully');

            await new Promise(resolve => setTimeout(resolve, 100));

            window.location.href = '/';

        } catch (error) {
            console.error('Logout error:', error);
            contextLogout();
            localStorage.clear();
            window.location.href = '/';
        } finally {
            setIsLoggingOut(false);
        }
    };

    const menuItems = [
        {
            label: t('header.dashboard'),
            icon: <LayoutDashboard size={16} />,
            to: '/candidate/dashboard',
        },
        {
            label: t('header.view_job'),
            icon: <Search size={16} />,
            to: '/search-job',
        },
        {
            label: t('header.applied_job'),
            icon: <FileText size={16} />,
            to: '/applied-job',
        },
        {
            label: t('header.find_services'),
            icon: <Store size={16} />,
            to: '/vendor-directory',
        },
        {
            label: t('header.my_enquiries'),
            icon: <Send size={16} />,
            to: '/my-enquiries',
        },
        {
            label: t('header.my_trainings'),
            icon: <Send size={16} />,
            to: '/my-trainings',
        },
        {
            label: t('header.logout'),
            icon: <LogOut size={16} />,
            onClick: handleLogout,
            className: 'text-red-600 hover:bg-red-50',
            disabled: isLoggingOut
        },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100 z-[100]">
            <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-0">

                    {/* Back Button + Logo */}
                    <div className="flex items-center gap-1">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-shrink-0 p-2 text-[#233480] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Go back"
                        >
                            <ChevronLeft size={24} className="stroke-[2]" />
                        </button>

                        {/* Logo */}
                        <div
                            className="flex flex-col items-start leading-none cursor-pointer flex-shrink-0"
                            onClick={() => navigate('/candidate/dashboard')}
                        >
                        <div className="flex items-center gap-1">
                            <h1 className="text-xl md:text-2xl font-black text-[#233480] tracking-tight">UtkarshPortal</h1>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-gray-400 font-medium">Powered by</span>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-[#b91c1c]">MPIDC</span>
                                <div className="w-4 h-4 bg-[#b91c1c] rounded-full flex items-center justify-center text-[7px] text-white font-bold italic">M</div>
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Desktop Nav Links — React Router Link (no page reload) */}
                    <nav className="hidden lg:flex items-center gap-5">
                        {navLinks.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="relative group text-[#1e2a5a] font-bold text-[12px] hover:text-[#233480] transition-colors uppercase tracking-wide py-2"
                            >
                                {item.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#233480] transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right Side: Language + Profile + Mobile Toggle */}
                    <div className="flex items-center gap-3">

                        {/* Language Selector — desktop */}
                        <div className="hidden lg:flex items-center">
                            <LanguageSelector />
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 group focus:outline-none py-2"
                                disabled={isLoggingOut}
                            >
                                {user?.avatar?.url ? (
                                    <img
                                        src={user.avatar.url}
                                        alt={displayName}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-[#233480] transition-colors"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-[#233480] transition-colors overflow-hidden">
                                        <User size={20} />
                                    </div>
                                )}

                                <span className="text-[#1e2a5a] font-bold text-sm tracking-wide hidden sm:inline-block">
                                    {displayName}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`text-[#1e2a5a] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="h-1 bg-[#233480] w-full"></div>

                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <p className="text-sm font-bold text-gray-900">{displayName}</p>
                                        {user?.email && (
                                            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                                        )}
                                        <p className="text-xs text-[#233480] capitalize mt-1">
                                            {user?.role || 'Candidate'}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        {menuItems.map((item, index) =>
                                            item.onClick ? (
                                                // Logout button
                                                <button
                                                    key={index}
                                                    onClick={item.onClick}
                                                    disabled={item.disabled}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors border-b border-gray-50 last:border-0 ${item.className || 'text-gray-600 hover:bg-gray-50 hover:text-[#233480]'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span className="opacity-70">{item.icon}</span>
                                                    {item.disabled ? 'Logging out...' : item.label}
                                                </button>
                                            ) : (
                                                // React Router Link — no reload
                                                <Link
                                                    key={index}
                                                    to={item.to}
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#233480] transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    <span className="opacity-70">{item.icon}</span>
                                                    {item.label}
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-gray-700 hover:text-[#233480] transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <nav className="flex flex-col px-4 pt-2 pb-4 border-t border-gray-100 bg-white overflow-y-auto">

                    {/* Public Nav Links */}
                    <div className="mb-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 pt-2 pb-1">Navigation</p>
                        {navLinks.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center text-[#1e2a5a] font-bold text-sm hover:text-[#233480] hover:bg-blue-50 rounded-md px-3 py-2.5 uppercase tracking-wide transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Account Links */}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 pb-1">My Account</p>

                        {/* User info strip */}
                        <div className="flex items-center gap-3 px-3 py-2 mb-1 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-[#233480] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {displayName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                                {user?.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                            </div>
                        </div>

                        {menuItems.map((item, index) =>
                            item.onClick ? (
                                <button
                                    key={index}
                                    onClick={(e) => { item.onClick(e); setMobileMenuOpen(false); }}
                                    disabled={item.disabled}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${item.className || 'text-gray-700 hover:bg-gray-50 hover:text-[#233480]'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="opacity-70">{item.icon}</span>
                                    {item.disabled ? 'Logging out...' : item.label}
                                </button>
                            ) : (
                                <Link
                                    key={index}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#233480] rounded-md transition-colors"
                                >
                                    <span className="opacity-70">{item.icon}</span>
                                    {item.label}
                                </Link>
                            )
                        )}
                    </div>

                    {/* Language Selector */}
                    <div className="border-t border-gray-100 mt-2 pt-3 px-2 pb-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                            {t('language.label', 'Language')}
                        </p>
                        <LanguageSelector />
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default CandidateHeader;