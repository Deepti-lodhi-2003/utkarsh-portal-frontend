import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    ChevronDown,
    ChevronLeft,
    LayoutDashboard,
    LogOut,
    Search,
    GraduationCap,
    Users,
    Briefcase,
    FilePlus,
    BookOpen,
    Store,
    Package,
    Loader2,
    Menu,
    X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../dashboard/context/AuthContext';
import { authAPI, institutionsAPI } from '../services/api';
import LanguageSelector from './LanguageSelector';

const InstitutionHeader = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout: contextLogout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [institutionType, setInstitutionType] = useState('');
    const [orgName, setOrgName] = useState('');
    const dropdownRef = useRef(null);

    const userName = user?.name || 'Institution';

    // ── Fetch institution type on mount ──
    useEffect(() => {
        fetchInstitutionType();
    }, []);

    const fetchInstitutionType = async () => {
        try {
            const res = await institutionsAPI.getProfile();
            const profile = res.data.data;
            setInstitutionType(profile.institutionType || '');
            setOrgName(profile.organizationName || '');
        } catch (err) {
            console.error('Failed to fetch institution type:', err);
        }
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Logout
    const handleLogout = async (e) => {
        e.preventDefault();
        if (isLoggingOut) return;

        try {
            setIsLoggingOut(true);
            setIsDropdownOpen(false);

            try {
                await authAPI.logout();
            } catch (apiError) {
                console.error('API logout error:', apiError);
            }

            contextLogout();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userType');
            window.dispatchEvent(new Event('auth-change'));
            toast.success(t('pages.auth.sign_out_success', 'Logged out successfully'));

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

    // ════════════════════════════════════════════════════════
    //  ROLE-BASED MENU CONFIGURATION
    // ════════════════════════════════════════════════════════

    // ── Top Navigation Bar Links ──
    const getNavLinks = () => {
        const links = [];

        if (['industry', 'university'].includes(institutionType)) {
            links.push({
                label: t('header.search_candidate'),
                icon: <Search size={18} className="text-[#233480]" />,
                to: '/search-candidate'
            });
            links.push({
                label: t('header.post_job'),
                icon: <GraduationCap size={18} className="text-[#233480]" />,
                to: '/post-job'
            });
        }

        if (['training_institute', 'university'].includes(institutionType)) {
            links.push({
                label: t('header.post_training'),
                icon: <BookOpen size={18} className="text-[#233480]" />,
                to: '/post-training'
            });
        }

        if (institutionType === 'vendor') {
            links.push({
                label: t('header.vendor_profile'),
                icon: <Store size={18} className="text-[#233480]" />,
                to: '/post-vendors'
            });
        }

        return links;
    };

    // ── Dropdown Menu Items ──
    const getDropdownItems = () => {
        const items = [];

        // ──── COMMON: Dashboard (always shown) ────
        items.push({
            label: t('header.dashboard'),
            icon: <LayoutDashboard size={16} />,
            to: '/institution/dashboard'
        });

        // ──── INDUSTRY ────
        if (institutionType === 'industry') {
            items.push(
                {
                    label: t('header.post_job'),
                    icon: <Briefcase size={16} />,
                    to: '/post-job'
                },
                {
                    label: t('header.shortlisted_candidate'),
                    icon: <Users size={16} />,
                    to: '/shortlisted-candidates'
                },
                {
                    label: t('header.recent_jobs'),
                    icon: <Briefcase size={16} />,
                    to: '/recent-jobs'
                }
            );
        }

        // ──── TRAINING INSTITUTE ────
        if (institutionType === 'training_institute') {
            items.push(
                {
                    label: t('header.my_trainings'),
                    icon: <BookOpen size={16} />,
                    to: '/my-training'
                },
                {
                    label: t('header.post_training'),
                    icon: <FilePlus size={16} />,
                    to: '/post-training'
                }
            );
        }

        // ──── UNIVERSITY ────
        if (institutionType === 'university') {
            items.push(
                {
                    label: t('header.post_job'),
                    icon: <Briefcase size={16} />,
                    to: '/post-job'
                },
                {
                    label: t('header.shortlisted_candidate'),
                    icon: <Users size={16} />,
                    to: '/shortlisted-candidates'
                },
                {
                    label: t('header.recent_jobs'),
                    icon: <Briefcase size={16} />,
                    to: '/recent-jobs'
                },
                {
                    label: t('header.my_trainings'),
                    icon: <BookOpen size={16} />,
                    to: '/my-training'
                },
                {
                    label: t('header.post_training'),
                    icon: <FilePlus size={16} />,
                    to: '/post-training'
                }
            );
        }

        // ──── VENDOR ────
        if (institutionType === 'vendor') {
            items.push(
                {
                    label: t('header.my_vendor_profile'),
                    icon: <Store size={16} />,
                    to: '/my-vendor'
                },
                {
                    label: t('header.create_edit_vendor'),
                    icon: <Package size={16} />,
                    to: '/post-vendors'
                }
            );
        }

        return items;
    };

    // ── Institution Type Badge ──
    const getTypeBadge = () => {
        const badges = {
            industry: { label: 'Industry', color: 'bg-blue-100 text-blue-700' },
            training_institute: { label: 'Training Institute', color: 'bg-green-100 text-green-700' },
            university: { label: 'University', color: 'bg-purple-100 text-purple-700' },
            vendor: { label: 'Vendor', color: 'bg-orange-100 text-orange-700' }
        };
        return badges[institutionType] || null;
    };

    const navLinks = getNavLinks();
    const dropdownItems = getDropdownItems();
    const typeBadge = getTypeBadge();

    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-[100] border-b border-gray-100">
            <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

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
                            onClick={() => navigate('/institution/dashboard')}
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

                    {/* ══ Top Navigation Links (Role Based) — Desktop ══ */}
                    <nav className="hidden lg:flex items-center gap-5 ml-auto mr-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex items-center gap-2 text-[#1e2a5a] font-bold text-[12px] hover:text-[#233480] uppercase tracking-wide transition-colors relative group py-2"
                            >
                                {link.icon}
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#233480] transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Language + Profile + Mobile Toggle */}
                    <div className="flex items-center gap-3">

                        {/* Language Selector — desktop */}
                        <div className="hidden lg:flex items-center">
                            <LanguageSelector />
                        </div>

                        {/* ══ Profile Dropdown ══ */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 group focus:outline-none py-2"
                                disabled={isLoggingOut}
                            >
                                {user?.avatar?.url ? (
                                    <img src={user.avatar.url} alt={userName}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-[#233480] transition-colors" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-[#233480] transition-colors overflow-hidden">
                                        <User size={20} />
                                    </div>
                                )}
                                <span className="text-[#1e2a5a] font-bold text-sm tracking-wide hidden sm:inline-block">
                                    {userName}
                                </span>
                                <ChevronDown size={16}
                                    className={`text-[#1e2a5a] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* ══ Dropdown ══ */}
                            {isDropdownOpen && (
                                <div className="absolute top-full right-0 mt-1 w-60 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="h-1 bg-[#233480] w-full"></div>

                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <p className="text-sm font-bold text-gray-900">{userName}</p>
                                        {orgName && (
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{orgName}</p>
                                        )}
                                        {user?.email && (
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                                        )}
                                        {typeBadge && (
                                            <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeBadge.color}`}>
                                                {typeBadge.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* ══ Dynamic Menu Items ══ */}
                                    <div className="py-1 max-h-[400px] overflow-y-auto">
                                        {dropdownItems.map((item, index) => (
                                            <Link
                                                key={index}
                                                to={item.to}
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#233480] transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <span className="opacity-70">{item.icon}</span>
                                                {item.label}
                                            </Link>
                                        ))}

                                        {/* ══ Divider ══ */}
                                        <div className="h-px bg-gray-200 my-1"></div>

                                        {/* ══ Logout ══ */}
                                        <button
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <span className="opacity-70">
                                                {isLoggingOut
                                                    ? <Loader2 size={16} className="animate-spin" />
                                                    : <LogOut size={16} />
                                                }
                                            </span>
                                            {isLoggingOut ? t('header.logging_out') : t('header.logout')}
                                        </button>
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

            {/* ══ Mobile Slide-Down Menu ══ */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <nav className="flex flex-col px-4 pt-2 pb-4 border-t border-gray-100 bg-white overflow-y-auto">

                    {/* Nav Links */}
                    {navLinks.length > 0 && (
                        <div className="mb-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 pt-2 pb-1">Navigation</p>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 text-[#1e2a5a] font-bold text-sm hover:text-[#233480] hover:bg-blue-50 rounded-md px-3 py-2.5 uppercase tracking-wide transition-colors"
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Account Links */}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider px-2 pb-1">My Account</p>

                        {/* User info strip */}
                        <div className="flex items-center gap-3 px-3 py-2 mb-1 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-[#233480] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {userName?.charAt(0)?.toUpperCase() || 'I'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                {orgName && <p className="text-xs text-gray-500 truncate">{orgName}</p>}
                                {typeBadge && (
                                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${typeBadge.color}`}>
                                        {typeBadge.label}
                                    </span>
                                )}
                            </div>
                        </div>

                        {dropdownItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#233480] rounded-md transition-colors"
                            >
                                <span className="opacity-70">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}

                        {/* Logout */}
                        <button
                            onClick={(e) => { handleLogout(e); setMobileMenuOpen(false); }}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <span className="opacity-70">
                                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                            </span>
                            {isLoggingOut ? t('header.logging_out') : t('header.logout')}
                        </button>
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

export default InstitutionHeader;