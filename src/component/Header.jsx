import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, ChevronLeft, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../dashboard/context/AuthContext';
import { authAPI } from '../services/api';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: t('header.home'), href: '/' },
    { label: t('header.company_jobs'), href: '/search-job' },
    { label: t('header.kaushal_setu'), href: '/kaushal-setu' },
    { label: t('header.industry_services'), href: '/industry-service' },
    { label: t('header.vendor_directory'), href: '/vendor-directory' },
  ];

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const toggleMobileDropdown = (name) => {
    setActiveMobileDropdown(activeMobileDropdown === name ? null : name);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle logout with proper cleanup
  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // Try to call logout API (don't fail if it errors)
      try {
        await authAPI.logout();
      } catch (apiError) {
        console.error('API logout error (continuing anyway):', apiError);
      }

      // Always clear local state
      contextLogout();
      
      toast.success('Logged out successfully');
      navigate('/', { replace: true });

    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'candidate':
        return '/candidate/dashboard';
      case 'institution':
        return '/institution/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white shadow-sm border-b border-gray-100`}
    >
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
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
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => navigate('/')}
            >
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-[#1e2a5a] tracking-tight">
                Utkarsh<span className="text-[#233480]">Portal</span>
              </h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {t('common.powered_by')} MPIDC
              </p>
            </div>
          </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative group text-[#1e2a5a] font-bold text-[13px] hover:text-[#233480] transition-colors uppercase tracking-wide py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#233480] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}

            {/* Conditional Rendering based on User Login Status */}
            {!user ? (
              <>
                {/* Login Dropdown */}
                <div
                  className="relative dropdown-container h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown('login')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className="flex items-center gap-1 text-[#1e2a5a] font-bold text-[13px] hover:text-[#233480] uppercase tracking-wide focus:outline-none transition-colors py-8"
                  >
                    {t('header.login')} 
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ${activeDropdown === 'login' ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {activeDropdown === 'login' && (
                    <div className="absolute top-full right-0 w-48 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="h-1 bg-[#233480] w-full"></div>
                      <a 
                        href="/login/candidate" 
                        className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#233480] transition-colors text-left border-b border-gray-50 last:border-0"
                      >
                        {t('header.candidate')}
                      </a>
                      <a 
                        href="/login/institution" 
                        className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#233480] transition-colors text-left"
                      >
                        {t('header.institution')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Register Dropdown */}
                <div
                  className="relative dropdown-container h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown('register')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className="flex items-center gap-1 text-[#1e2a5a] font-bold text-[13px] hover:text-[#233480] uppercase tracking-wide focus:outline-none transition-colors py-8"
                  >
                    {t('header.register')} 
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ${activeDropdown === 'register' ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  {activeDropdown === 'register' && (
                    <div className="absolute top-full right-0 w-48 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="h-1 bg-[#233480] w-full"></div>
                      <a 
                        href="/register/candidate" 
                        className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#233480] transition-colors text-left border-b border-gray-50 last:border-0"
                      >
                        {t('header.candidate')}
                      </a>
                      <a 
                        href="/register/institution" 
                        className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#233480] transition-colors text-left"
                      >
                        {t('header.institution')}
                      </a>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* User Profile Dropdown */
              <div
                className="relative dropdown-container h-full flex items-center"
                onMouseEnter={() => setActiveDropdown('profile')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className="flex items-center gap-2 text-[#1e2a5a] font-bold text-[13px] hover:text-[#233480] uppercase tracking-wide focus:outline-none transition-colors py-8"
                >
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#233480]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#233480] flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block">{user?.name || 'User'}</span>
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-300 ${activeDropdown === 'profile' ? 'rotate-180' : ''}`} 
                  />
                </button>

                {activeDropdown === 'profile' && (
                  <div className="absolute top-full right-0 w-56 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="h-1 bg-[#233480] w-full"></div>
                    
                    {/* User Info */}
                    <div className="px-5 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                      <p className="text-xs text-[#233480] capitalize mt-1">{user?.role || 'user'}</p>
                    </div>

                    {/* Dashboard Link */}
                    <a 
                      href={getDashboardLink()} 
                      className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#233480] transition-colors border-b border-gray-50"
                    >
                      <User size={16} />
                      Dashboard
                    </a>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2 px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut size={16} />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="flex items-center ml-4">
              <LanguageSelector />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`xl:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col gap-2 pt-2 pb-4 border-t border-gray-100">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 font-bold text-sm hover:text-blue-600 px-2 py-2"
              >
                {item.label}
              </a>
            ))}
            <div className="h-px bg-gray-100 my-1"></div>

            {!user ? (
              <>
                {/* Mobile Login Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileDropdown('login')}
                    className="w-full flex justify-between items-center text-left text-gray-700 font-bold text-sm hover:text-blue-600 px-2 py-2"
                  >
                    {t('header.login')} 
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ${activeMobileDropdown === 'login' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeMobileDropdown === 'login' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col bg-gray-50 rounded-md mx-2 mt-1">
                      <a href="/login/candidate" className="px-4 py-2 text-sm text-gray-600 hover:text-[#233480]">
                        {t('header.candidate')}
                      </a>
                      <a href="/login/institution" className="px-4 py-2 text-sm text-gray-600 hover:text-[#233480]">
                        {t('header.institution')}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Mobile Register Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileDropdown('register')}
                    className="w-full flex justify-between items-center text-left text-gray-700 font-bold text-sm hover:text-blue-600 px-2 py-2"
                  >
                    {t('header.register')} 
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ${activeMobileDropdown === 'register' ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeMobileDropdown === 'register' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col bg-gray-50 rounded-md mx-2 mt-1">
                      <a href="/register/candidate" className="px-4 py-2 text-sm text-gray-600 hover:text-[#233480]">
                        {t('header.candidate')}
                      </a>
                      <a href="/register/institution" className="px-4 py-2 text-sm text-gray-600 hover:text-[#233480]">
                        {t('header.institution')}
                      </a>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Mobile User Profile */
              <div className="px-2 py-3 border-t border-gray-50 mt-2">
                <div className="flex items-center gap-3 mb-3">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'User'} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#233480]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#233480] flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                    <p className="text-xs text-[#233480] capitalize">{user?.role || 'user'}</p>
                  </div>
                </div>
                
                <a 
                  href={getDashboardLink()} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mb-2"
                >
                  <User size={16} />
                  Dashboard
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}

            {/* Language Selector for Mobile */}
            <div className="px-2 py-4 border-t border-gray-50 mt-2">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2 ml-1">
                {t('language.label', 'Language')}
              </p>
              <LanguageSelector />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}