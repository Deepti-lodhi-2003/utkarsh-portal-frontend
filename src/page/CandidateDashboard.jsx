import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    User,
    GraduationCap,
    FileText,
    Bell,
    Settings,
    Briefcase
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../dashboard/context/AuthContext'; // Adjust the path as needed
import { candidateAPI, applicationAPI } from '../services/api'; // Adjust the path as needed

// Modular Components
import CandidateMatches from './candidate/CandidateMatches';
import CandidateProfile from './candidate/CandidateProfile';
import CandidateEducation from './candidate/CandidateEducation';
import CandidateResume from './candidate/CandidateResume';
import CandidateAlert from './candidate/CandidateAlert';
import CandidateSettings from './candidate/CandidateSettings';
import Footer from "../component/Footer";

const CandidateDashboard = () => {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth(); // Get user from AuthContext
    const [activeTab, setActiveTab] = useState('MATCHES');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: t('dashboard.jobs_posted'), value: '0', color: 'text-red-500' },
        { label: t('dashboard.applied_by_you'), value: '0', color: 'text-blue-500' },
        { label: t('dashboard.institution_expressed_interest'), value: '0', color: 'text-amber-600' },
    ]);

    const tabs = [
        { id: 'MATCHES', label: t('dashboard.matches'), icon: <Briefcase size={16} /> },
        { id: 'PROFILE', label: t('dashboard.profile'), icon: <User size={16} /> },
        { id: 'EDUCATION', label: t('dashboard.education'), icon: <GraduationCap size={16} /> },
        { id: 'RESUME', label: t('dashboard.resume'), icon: <FileText size={16} /> },
        { id: 'ALERT', label: t('dashboard.alert'), icon: <Bell size={16} /> },
        { id: 'SETTINGS', label: t('dashboard.settings'), icon: <Settings size={16} /> },
    ];

    // Get user name from auth context
    const userName = user?.name || user?.firstName || 'User';

    // Fetch stats on component mount
    useEffect(() => {
        if (user) {
            fetchDashboardStats();
        }
    }, [user]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);

            // Fetch applications to get stats
            const applicationsResponse = await applicationAPI.getMyApplications({ 
                limit: 1000 // Get all applications for accurate count
            });

            if (applicationsResponse.data.success) {
                const applications = applicationsResponse.data.data.applications || [];
                const totalApplied = applications.length;
                
                // Count institutions that expressed interest (shortlisted, interview scheduled, etc.)
                const interestedInstitutions = applications.filter(app => 
                    ['shortlisted', 'interview_scheduled', 'offer_made'].includes(app.status)
                ).length;

                // Update stats
                setStats([
                    { label: t('dashboard.jobs_posted'), value: '0', color: 'text-red-500' }, // This is for institutions
                    { label: t('dashboard.applied_by_you'), value: totalApplied.toString(), color: 'text-blue-500' },
                    { label: t('dashboard.institution_expressed_interest'), value: interestedInstitutions.toString(), color: 'text-amber-600' },
                ]);
            }

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Handle error gracefully - keep default values
        } finally {
            setLoading(false);
        }
    };

    // Show loading if auth is still loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233480] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Blue Banner */}
                <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                    <h1 className="relative z-10 text-4xl font-bold text-white tracking-wider">{t('header.dashboard')}</h1>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto w-full px-4 -mt-6 pb-24 relative z-20">
                    {/* Stats Card */}
                    <div className="bg-white shadow-xl p-4 md:p-8 mb-6 border-b-4 border-[#233480]">
                        <div className="text-center mb-6 md:mb-8">
                            <h2 className="text-xl md:text-3xl font-bold text-[#1e2a5a] mb-1">
                                {t('dashboard.welcome')} {userName}
                            </h2>
                        </div>

                        <div className="grid grid-cols-3 gap-2 md:gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className={`text-xl md:text-4xl font-bold ${stat.color} mb-1 md:mb-2`}>
                                        {loading ? (
                                            <span className="animate-pulse">-</span>
                                        ) : (
                                            stat.value
                                        )}
                                    </div>
                                    <div className="text-gray-500 text-[10px] md:text-sm font-medium leading-tight">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-white rounded-lg shadow-lg min-h-[200px] overflow-visible">
                        {/* Tabs - Mobile: Icons only, Desktop: Icons + Text */}
                        <div className="flex justify-between md:justify-start border-b border-gray-200 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center md:gap-2 px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-[13px] font-semibold tracking-wider transition-all relative flex-1 md:flex-initial ${activeTab === tab.id
                                        ? 'text-[#233480] bg-blue-100/100'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {/* Icon - always visible */}
                                    <span className={`${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                                        {tab.icon}
                                    </span>
                                    {/* Text - only on desktop */}
                                    <span className="hidden md:inline">{tab.label}</span>

                                    {/* Active indicator */}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#233480]"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-4 md:p-12">
                            {activeTab === 'MATCHES' ? (
                                <CandidateMatches />
                            ) : activeTab === 'PROFILE' ? (
                                <CandidateProfile />
                            ) : activeTab === 'EDUCATION' ? (
                                <CandidateEducation />
                            ) : activeTab === 'RESUME' ? (
                                <CandidateResume />
                            ) : activeTab === 'ALERT' ? (
                                <CandidateAlert />
                            ) : activeTab === 'SETTINGS' ? (
                                <CandidateSettings />
                            ) : (
                                <div className="text-center animate-in fade-in duration-500">
                                    <p className="text-gray-400 md:text-base text-xs">
                                        Content for {tabLabelMap[activeTab] || activeTab.toLowerCase()} will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

// Helper for labels
const tabLabelMap = {
    'EDUCATION': 'education',
    'RESUME': 'resume',
    'ALERT': 'alerts',
    'SETTINGS': 'settings'
};

export default CandidateDashboard;