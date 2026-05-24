import React, { useState, useEffect } from 'react';
import Footer from '../component/Footer';
import InstitutionProfile from './institution/InstitutionProfile';
import InstitutionSettings from './institution/InstitutionSettings';
import {
    List,
    User,
    Settings,
    Briefcase,
    MapPin,
    Loader2,
    BookOpen,
    Store,
    Package,
    Users,
    GraduationCap,
    Calendar,
    Clock,
    DollarSign,
    Award,
    Eye,
    Star,
    ShieldCheck,
    Shield,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../dashboard/context/AuthContext';
import { institutionsAPI, jobsAPI, trainingsAPI, vendorAPI } from '../services/api';

const InstitutionDashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // ── State ──
    const [activeTab, setActiveTab] = useState('');
    const [institutionType, setInstitutionType] = useState('');
    const [institutionProfile, setInstitutionProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Stats
    const [stats, setStats] = useState({});

    // Data lists
    const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [myTrainings, setMyTrainings] = useState([]);
    const [vendorProfile, setVendorProfile] = useState(null);
    const [vendorProducts, setVendorProducts] = useState([]);

    // ── Fetch on mount ──
    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Set default tab when institution type is known
    useEffect(() => {
        if (institutionType && !activeTab) {
            const defaultTabs = {
                industry: 'SHORTLISTED CANDIDATES',
                university: 'SHORTLISTED CANDIDATES',
                training_institute: 'MY TRAININGS',
                vendor: 'MY SERVICES'
            };
            setActiveTab(defaultTabs[institutionType] || 'PROFILE');
        }
    }, [institutionType]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const profileRes = await institutionsAPI.getProfile();
            const profile = profileRes.data.data;
            setInstitutionProfile(profile);
            setInstitutionType(profile.institutionType || '');

            const statsRes = await institutionsAPI.getDashboardStats();
            const dashStats = statsRes.data.data.stats || {};
            setStats(dashStats);

            if (['industry', 'university'].includes(profile.institutionType)) {
                const recentApps = statsRes.data.data.recentApplications || [];
                setShortlistedCandidates(
                    recentApps.filter(app => app.status === 'shortlisted')
                );
                try {
                    const jobsRes = await jobsAPI.getMyJobs({ page: 1, limit: 5 });
                    setRecentJobs(jobsRes.data.data.jobs || []);
                } catch (e) { console.error('Jobs fetch:', e); }
            }

            if (['training_institute', 'university'].includes(profile.institutionType)) {
                try {
                    const trainRes = await trainingsAPI.getMyTrainings({ page: 1, limit: 5 });
                    setMyTrainings(trainRes.data.data.trainings || []);
                } catch (e) { console.error('Trainings fetch:', e); }
            }

            if (profile.institutionType === 'vendor') {
                try {
                    const vendorRes = await vendorAPI.getProfile();
                    const vData = vendorRes.data.data;
                    setVendorProfile(vData);
                    setVendorProducts(vData.products || []);
                } catch (e) {
                    if (e.response?.status !== 404) console.error('Vendor fetch:', e);
                }
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    // ════════════════════════════════════════
    //  ROLE-BASED STATS
    // ════════════════════════════════════════
    const getStatsCards = () => {
        switch (institutionType) {
            case 'industry':
                return [
                    { label: t('dashboard.jobs_posted'), value: stats.totalJobsPosted || 0, color: 'text-red-500', bg: 'bg-red-50', icon: <Briefcase size={20} /> },
                    { label: t('dashboard.candidate_shortlisted'), value: stats.shortlistedCandidates || 0, color: 'text-gray-800', bg: 'bg-gray-50', icon: <Users size={20} /> },

                    { label: 'Total Hires', value: stats.totalHires || 0, color: 'text-green-500', bg: 'bg-green-50', icon: <Award size={20} /> },
                ];
            case 'university':
                return [
                    { label: t('dashboard.jobs_posted'), value: stats.totalJobsPosted || 0, color: 'text-red-500', bg: 'bg-red-50', icon: <Briefcase size={20} /> },
                    { label: t('dashboard.candidate_shortlisted'), value: stats.shortlistedCandidates || 0, color: 'text-gray-800', bg: 'bg-gray-50', icon: <Users size={20} /> },
                    { label: 'Trainings', value: myTrainings.length || 0, color: 'text-purple-500', bg: 'bg-purple-50', icon: <BookOpen size={20} /> },

                ];
            case 'training_institute':
                return [
                    { label: 'Total Trainings', value: myTrainings.length || 0, color: 'text-purple-500', bg: 'bg-purple-50', icon: <BookOpen size={20} /> },
                    { label: 'Active Trainings', value: myTrainings.filter(t => t.status === 'ongoing').length || 0, color: 'text-green-500', bg: 'bg-green-50', icon: <Clock size={20} /> },
                    { label: 'Upcoming', value: myTrainings.filter(t => t.status === 'upcoming').length || 0, color: 'text-blue-500', bg: 'bg-blue-50', icon: <Calendar size={20} /> },
                    { label: 'Total Enrollments', value: myTrainings.reduce((sum, t) => sum + (t.enrollmentCount || 0), 0), color: 'text-orange-500', bg: 'bg-orange-50', icon: <Users size={20} /> },
                ];
            case 'vendor':
                return [
                    { label: 'Products', value: vendorProducts.length || 0, color: 'text-blue-500', bg: 'bg-blue-50', icon: <Package size={20} /> },
                    { label: 'Services', value: vendorProfile?.services?.length || 0, color: 'text-green-500', bg: 'bg-green-50', icon: <Store size={20} /> },
                    { label: 'Service Areas', value: vendorProfile?.serviceAreas?.length || 0, color: 'text-purple-500', bg: 'bg-purple-50', icon: <MapPin size={20} /> },
                    { label: 'Reviews', value: vendorProfile?.rating?.count || 0, color: 'text-orange-500', bg: 'bg-orange-50', icon: <Star size={20} /> },
                ];
            default:
                return [
                    { label: 'Status', value: 'Active', color: 'text-green-500', bg: 'bg-green-50', icon: <ShieldCheck size={20} /> },
                ];
        }
    };

    // ════════════════════════════════════════
    //  ROLE-BASED TABS
    // ════════════════════════════════════════
    const getTabs = () => {
        const tabs = [];
        if (['industry', 'university'].includes(institutionType)) {
            tabs.push(
                { id: 'SHORTLISTED CANDIDATES', label: t('dashboard.shortlisted_candidates'), icon: <List size={18} /> },
                { id: 'RECENT JOBS', label: 'Recent Jobs', icon: <Briefcase size={18} /> }
            );
        }
        if (['training_institute', 'university'].includes(institutionType)) {
            tabs.push({ id: 'MY TRAININGS', label: 'My Trainings', icon: <BookOpen size={18} /> });
        }
        if (institutionType === 'vendor') {
            tabs.push(
                { id: 'MY SERVICES', label: 'My Services', icon: <Store size={18} /> },
                { id: 'MY PRODUCTS', label: 'Products', icon: <Package size={18} /> }
            );
        }
        tabs.push(
            { id: 'PROFILE', label: t('dashboard.profile'), icon: <User size={18} /> },
            { id: 'SETTINGS', label: t('dashboard.settings'), icon: <Settings size={18} /> }
        );
        return tabs;
    };

    // ════════════════════════════════════════
    //  TAB CONTENT COMPONENTS
    // ════════════════════════════════════════

    const ShortlistedTab = () => (
        <div className="space-y-3 sm:space-y-4">
            {shortlistedCandidates.length > 0 ? (
                shortlistedCandidates.map((app) => (
                    <div
                        key={app._id}
                        className="group flex flex-col px-4 py-4 sm:px-5 sm:py-4 md:px-6 md:py-3 
                                   bg-white border border-gray-100 shadow-sm hover:shadow-md 
                                   transition-all duration-300 rounded-lg 
                                   hover:border-l-4 hover:border-l-[#233480] relative overflow-hidden"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1.5 flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#44528c] 
                                               hover:text-[#233480] cursor-pointer transition-colors truncate">
                                    {app.candidate?.user?.name || 'N/A'}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 font-normal truncate">
                                    {app.candidate?.headline || 'No headline'}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-gray-500">
                                    <div className="flex items-center gap-1 font-normal">
                                        <Briefcase size={14} className="text-[#1e2a5a] flex-shrink-0" />
                                        <span>
                                            {app.candidate?.totalExperience
                                                ? `${app.candidate.totalExperience.years || 0} Year`
                                                : 'Fresher'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 font-normal">
                                        <MapPin size={14} className="text-[#1e2a5a] flex-shrink-0" />
                                        <span>{app.candidate?.currentAddress?.city || 'N/A'}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 font-normal line-clamp-1">
                                    {app.candidate?.skills?.map(s => s.name).join(', ') || ''}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <p className="text-xs text-gray-400 font-normal tracking-tight whitespace-nowrap">
                                    {t('dashboard.updated')}{' '}
                                    {new Date(app.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <EmptyState icon={<Users size={36} />} message={t('dashboard.no_candidate_shortlisted')} />
            )}
        </div>
    );

    const RecentJobsTab = () => (
        <div className="space-y-3 sm:space-y-4">
            {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                    <div
                        key={job._id}
                        className="flex flex-col px-4 py-3 sm:px-5 sm:py-4 bg-white border border-gray-100 
                                   shadow-sm hover:shadow-md transition-all rounded-lg 
                                   hover:border-l-4 hover:border-l-[#233480]"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-[#44528c] truncate">
                                    {job.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs sm:text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={13} className="text-[#233480] flex-shrink-0" />
                                        <span className="truncate">{job.location?.city || 'N/A'}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Briefcase size={13} className="text-[#233480] flex-shrink-0" />
                                        {job.jobType || 'Full-time'}
                                    </span>
                                    {job.salary && (
                                        <span className="text-green-600 font-semibold text-xs">
                                            ₹{(job.salary.min / 100000).toFixed(0)}-{(job.salary.max / 100000).toFixed(0)} LPA
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                                        job.status === 'active' ? 'bg-green-100 text-green-700'
                                        : job.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                                <span className="flex items-center gap-1">
                                    <Eye size={12} /> {job.applicationsCount || 0} Apps
                                </span>
                                <span>
                                    {new Date(job.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <EmptyState icon={<Briefcase size={36} />} message="No jobs posted yet" />
            )}
        </div>
    );

    const MyTrainingsTab = () => (
        <div className="space-y-3 sm:space-y-4">
            {myTrainings.length > 0 ? (
                myTrainings.map((training) => (
                    <div
                        key={training._id}
                        className="flex flex-col px-4 py-3 sm:px-5 sm:py-4 bg-white border border-gray-100 
                                   shadow-sm hover:shadow-md transition-all rounded-lg 
                                   hover:border-l-4 hover:border-l-[#233480]"
                    >
                        <h3 className="text-base sm:text-lg font-bold text-[#44528c] truncate">
                            {training.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-[#233480] flex-shrink-0" />
                                {training.startDate
                                    ? new Date(training.startDate).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })
                                    : 'TBD'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={13} className="text-[#233480] flex-shrink-0" />
                                {training.duration
                                    ? `${training.duration.value} ${training.duration.unit}`
                                    : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users size={13} className="text-[#233480] flex-shrink-0" />
                                {training.enrollmentCount || 0}/{training.totalSeats || 0}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                                training.mode === 'online' ? 'bg-cyan-100 text-cyan-700'
                                : training.mode === 'offline' ? 'bg-orange-100 text-orange-700'
                                : 'bg-violet-100 text-violet-700'
                            }`}>
                                {training.mode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                                training.status === 'ongoing' ? 'bg-green-100 text-green-700'
                                : training.status === 'upcoming' ? 'bg-blue-100 text-blue-700'
                                : training.status === 'completed' ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                                {training.status}
                            </span>
                        </div>
                        {training.fees && (
                            <p className="text-xs text-green-600 font-semibold mt-1.5">
                                {training.fees.isFree ? '🆓 Free' : `₹${training.fees.amount?.toLocaleString()}`}
                            </p>
                        )}
                    </div>
                ))
            ) : (
                <EmptyState icon={<BookOpen size={36} />} message="No training programs yet" />
            )}
        </div>
    );

    const MyServicesTab = () => (
        <div className="space-y-4">
            {vendorProfile ? (
                <div>
                    {/* Vendor Summary Card */}
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 border border-gray-200">
                        <div className="flex flex-col xs:flex-row items-start gap-3 sm:gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                                            flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                                {vendorProfile.businessName?.charAt(0) || 'V'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-[#1e2a5a] truncate">
                                    {vendorProfile.businessName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] sm:text-[10px] font-bold">
                                        {vendorProfile.businessType?.replace('_', ' ').toUpperCase()}
                                    </span>
                                    {vendorProfile.isVerified ? (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] sm:text-[10px] font-bold">
                                            <ShieldCheck size={10} /> Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[9px] sm:text-[10px] font-bold">
                                            <Shield size={10} /> Pending
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-2 line-clamp-2">
                                    {vendorProfile.businessDescription}
                                </p>
                            </div>
                        </div>

                        {vendorProfile.services?.length > 0 && (
                            <div className="mt-3 sm:mt-4">
                                <p className="text-[10px] sm:text-xs font-bold text-gray-500 mb-1.5 uppercase">Services</p>
                                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                    {vendorProfile.services.map((s, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] sm:text-xs text-gray-600">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {vendorProfile.serviceAreas?.length > 0 && (
                            <div className="mt-2.5 sm:mt-3 flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                <MapPin size={13} className="text-[#233480] flex-shrink-0" />
                                <span className="truncate">
                                    {vendorProfile.serviceAreas.map(a => a.city).filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    {vendorProfile.rating?.count > 0 && (
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <Star key={n} size={14}
                                        className={n <= Math.round(vendorProfile.rating.average || 0)
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                        }
                                    />
                                ))}
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500">
                                {vendorProfile.rating.average?.toFixed(1)} ({vendorProfile.rating.count} reviews)
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState icon={<Store size={36} />} message="No vendor profile created yet" />
            )}
        </div>
    );

    const MyProductsTab = () => (
        <div className="space-y-3">
            {vendorProducts.length > 0 ? (
                vendorProducts.map((product) => (
                    <div
                        key={product._id}
                        className="flex items-start gap-3 sm:gap-4 px-3 py-3 sm:px-5 sm:py-4 
                                   bg-white border border-gray-100 shadow-sm rounded-lg 
                                   hover:shadow-md transition-all"
                    >
                        {product.image?.url ? (
                            <img
                                src={product.image.url}
                                alt=""
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border flex-shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Package size={20} className="text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1e2a5a] truncate">
                                {product.name}
                            </h4>
                            {product.category && (
                                <p className="text-[10px] sm:text-xs text-gray-400 truncate">{product.category}</p>
                            )}
                            {product.price > 0 && (
                                <p className="text-xs sm:text-sm font-semibold text-green-600 mt-0.5">
                                    ₹{Number(product.price).toLocaleString()}
                                    {product.unit && ` / ${product.unit}`}
                                </p>
                            )}
                            {product.description && (
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                                    {product.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <EmptyState icon={<Package size={36} />} message="No products added yet" />
            )}
        </div>
    );

    // ── Reusable Empty State ──
    const EmptyState = ({ icon, message }) => (
        <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="mx-auto text-gray-300 mb-3">{icon}</div>
            <p className="text-gray-400 text-sm sm:text-base italic px-4">{message}</p>
        </div>
    );

    // ── Render Tab Content ──
    const renderTabContent = () => {
        switch (activeTab) {
            case 'SHORTLISTED CANDIDATES': return <ShortlistedTab />;
            case 'RECENT JOBS': return <RecentJobsTab />;
            case 'MY TRAININGS': return <MyTrainingsTab />;
            case 'MY SERVICES': return <MyServicesTab />;
            case 'MY PRODUCTS': return <MyProductsTab />;
            case 'PROFILE': return <InstitutionProfile />;
            case 'SETTINGS': return <InstitutionSettings />;
            default: return null;
        }
    };

    const getTypeLabel = () => {
        const labels = {
            industry: '🏭 Industry',
            university: '🎓 University',
            training_institute: '📚 Training Institute',
            vendor: '🏪 Vendor'
        };
        return labels[institutionType] || '';
    };

    const userName = user?.name || 'User';
    const companyName = institutionProfile?.organizationName || '';
    const statCards = getStatsCards();
    const tabs = getTabs();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-[#233480]" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">

            {/* ═══ Banner ═══ */}
            <div
                className="relative w-full h-28 sm:h-36 md:h-43 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}
            >
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                <h1 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider">
                    {t('header.dashboard')}
                </h1>
            </div>

            {/* ═══ Main Content ═══ */}
            <div className="max-w-[1400px] mx-auto w-full px-3 sm:px-4 lg:px-6 -mt-6 sm:-mt-8 md:-mt-10 mb-8 sm:mb-12 relative z-20">

                {/* Error */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* ═══ Stats Card ═══ */}
                <div className="bg-white shadow-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border-b-4 border-[#233480] rounded">

                    {/* Welcome Header */}
                    <div className="text-center mb-4 sm:mb-6 md:mb-10">
                        <h2 className="text-lg sm:text-xl md:text-3xl font-semibold text-[#1e2a5a] mb-0.5 sm:mb-1 uppercase">
                            {t('dashboard.welcome')}{' '}
                            <span className="text-gray-600 block sm:inline mt-0.5 sm:mt-0">{userName}</span>
                        </h2>
                        <p className="text-gray-500 font-medium text-[11px] sm:text-xs md:text-base italic truncate px-4">
                            {companyName}
                        </p>
                        {institutionType && (
                            <span className="inline-block mt-1.5 sm:mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#233480]/10 text-[#233480] rounded-full text-[10px] sm:text-xs font-bold">
                                {getTypeLabel()}
                            </span>
                        )}
                    </div>

                    {/* ═══ Stats Grid — Fixed responsive grid ═══ */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-8 mb-2 sm:mb-4 max-w-5xl mx-auto">
                        {statCards.map((stat, index) => (
                            <div
                                key={index}
                                className={`text-center p-3 sm:p-4 rounded-xl ${stat.bg} transition-transform hover:scale-105`}
                            >
                                <div className="flex items-center justify-center mb-1.5 sm:mb-2 opacity-40">
                                    {stat.icon}
                                </div>
                                <div className={`text-lg sm:text-xl md:text-4xl font-bold ${stat.color} mb-0.5 sm:mb-2`}>
                                    {stat.value}
                                </div>
                                <div className="text-gray-500 text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-wider uppercase leading-tight">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ═══ Tabs Section ═══ */}
                <div className="bg-white border border-gray-100 shadow-sm overflow-hidden min-h-[300px] sm:min-h-[400px] rounded-lg">

                    {/* ── Mobile Tab Dropdown Toggle ── */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="w-full flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-200 text-sm font-bold text-[#1e2a5a]"
                        >
                            <div className="flex items-center gap-2">
                                {tabs.find(tab => tab.id === activeTab)?.icon}
                                <span className="uppercase text-xs">
                                    {tabs.find(tab => tab.id === activeTab)?.label}
                                </span>
                            </div>
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>

                        {/* Mobile Dropdown Menu */}
                        {mobileMenuOpen && (
                            <div className="border-b border-gray-200 bg-gray-50 shadow-inner">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-5 py-3 text-xs font-semibold tracking-tight transition-all border-b border-gray-100 last:border-b-0 ${
                                            activeTab === tab.id
                                                ? 'text-[#233480] bg-[#e6f2ff] border-l-4 border-l-[#233480]'
                                                : 'text-[#8a99af] hover:text-gray-600 hover:bg-white'
                                        }`}
                                    >
                                        <span className={activeTab === tab.id ? 'text-[#233480]' : 'text-[#8a99af]'}>
                                            {tab.icon}
                                        </span>
                                        <span className="uppercase">{tab.label}</span>
                                        {activeTab === tab.id && (
                                            <ChevronRight size={14} className="ml-auto text-[#233480]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Desktop Tab Headers — Scrollable ── */}
                    <div className="hidden sm:flex bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3.5 md:py-6 
                                           text-[10px] md:text-[13px] font-bold tracking-tight transition-all 
                                           border-r border-gray-200 last:border-r-0 whitespace-nowrap flex-shrink-0 ${
                                    activeTab === tab.id
                                        ? 'text-[#4e678b] bg-[#e6f2ff] border-b-2 border-b-[#233480]'
                                        : 'text-[#8a99af] hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span className={activeTab === tab.id ? 'text-[#233480]' : 'text-[#8a99af]'}>
                                    {tab.icon}
                                </span>
                                <span className="uppercase">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="p-3 sm:p-5 md:p-8 bg-white">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default InstitutionDashboard;