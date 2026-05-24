import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../../component/Footer';
import {
    User, Mail, Phone, MapPin, Briefcase, Calendar,
    Download, Eye, CheckCircle, XCircle, Loader2, X,
    Award
} from 'lucide-react';
import { applicationAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ShortlistedCandidates = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('shortlisted'); // 'shortlisted' or 'hired'
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchCandidates();
    }, [activeTab]);

    const fetchCandidates = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch based on active tab
            const res = await applicationAPI.getInstitutionApplications({
                status: activeTab,
                limit: 100 // Fetch decent amount
            });

            setCandidates(res.data.data.applications || []);
        } catch (err) {
            console.error('Fetch candidates error:', err);
            setError(err.response?.data?.message || 'Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (candidateId) => {
        // Open in new tab
        window.open(`/candidates/${candidateId}`, '_blank');
    };

    const handleDownloadResume = (url) => {
        if (url) {
            window.open(url, '_blank');
        } else {
            alert(t('institution.shortlistedCandidates.resumeNotAvailable'));
        }
    };

    const handleAction = async (applicationId, action) => {
        if (!window.confirm(t('institution.shortlistedCandidates.confirmAction', { action }))) return;

        setActionLoading(applicationId);
        try {
            let status = '';
            let remarks = '';

            if (action === 'accept') {
                status = 'interview_scheduled';
                remarks = 'Moved to interview stage via Shortlisted page';
            } else if (action === 'reject') {
                status = 'rejected';
                remarks = 'Rejected from Shortlisted page';
            }

            if (status) {
                await applicationAPI.updateStatus(applicationId, { status, remarks });
                // Remove from current list
                setCandidates(prev => prev.filter(c => c._id !== applicationId));
            }

        } catch (err) {
            console.error('Action error:', err);
            setError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            <div className="bg-gray-50 min-h-screen flex flex-col">
                {/* Banner */}
                <div className="relative w-full h-40 flex items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/85 mix-blend-multiply"></div>
                    <div className="relative z-10 text-center px-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider mb-2">{t('institution.shortlistedCandidates.myCandidates')}</h1>
                        <p className="text-white/80">{t('institution.shortlistedCandidates.manageTalent')}</p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto w-full px-4 -mt-8 relative z-20 pb-12 flex-grow">

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow-lg p-1 mb-6 inline-flex">
                        <button
                            onClick={() => setActiveTab('shortlisted')}
                            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'shortlisted'
                                    ? 'bg-[#233480] text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {t('institution.shortlistedCandidates.shortlisted')}
                        </button>
                        <button
                            onClick={() => setActiveTab('hired')}
                            className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${activeTab === 'hired'
                                    ? 'bg-[#233480] text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {t('institution.shortlistedCandidates.hired')}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')}><X size={18} /></button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-[#233480] mb-3" />
                            <p className="text-gray-500 font-medium">{t('institution.shortlistedCandidates.loadingCandidates')}</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'shortlisted' ? (
                                    <User size={32} className="text-gray-400" />
                                ) : (
                                    <Award size={32} className="text-gray-400" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {t('institution.shortlistedCandidates.noCandidates')}
                            </h3>
                            <p className="text-gray-500">
                                {activeTab === 'shortlisted'
                                    ? t('institution.shortlistedCandidates.noShortlistedYet')
                                    : t('institution.shortlistedCandidates.noHiredYet')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-[#1e2a5a] capitalize">
                                    {t('institution.shortlistedCandidates.candidatesList', { count: candidates.length })}
                                </h2>
                            </div>

                            {candidates.map((app) => {
                                const candidate = app.candidate;
                                const user = candidate?.user;
                                // Skip invalid records if any
                                if (!candidate || !user) return null;

                                return (
                                    <div key={app._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    {user.avatar?.url ? (
                                                        <img src={user.avatar.url} alt={user.name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#233480] to-[#4a5db0] flex items-center justify-center text-white text-2xl font-bold">
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-[#1e2a5a] mb-1">{user.name}</h3>
                                                            <p className="text-[#233480] font-medium mb-3 flex items-center gap-1.5">
                                                                <Briefcase size={14} /> {t('institution.shortlistedCandidates.appliedFor')} <span className="font-semibold">{app.job?.title || t('institution.shortlistedCandidates.unknownJob')}</span>
                                                            </p>

                                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Mail size={14} className="text-gray-400" /> {user.email}
                                                                </div>
                                                                {user.mobile && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Phone size={14} className="text-gray-400" /> {user.mobile}
                                                                    </div>
                                                                )}
                                                                {candidate.currentAddress?.city && (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <MapPin size={14} className="text-gray-400" /> {candidate.currentAddress.city}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1.5">
                                                                    <Briefcase size={14} className="text-gray-400" />
                                                                    {candidate.totalExperience?.years > 0
                                                                        ? t('institution.shortlistedCandidates.yearsExp', { years: candidate.totalExperience.years })
                                                                        : t('institution.shortlistedCandidates.fresher')}
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar size={14} className="text-gray-400" />
                                                                    {t('institution.shortlistedCandidates.applied')}: {new Date(app.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>

                                                            {/* Skills */}
                                                            {candidate.skills?.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {candidate.skills.slice(0, 5).map((skill, i) => (
                                                                        <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
                                                                            {skill.name || skill}
                                                                        </span>
                                                                    ))}
                                                                    {candidate.skills.length > 5 && (
                                                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs font-medium rounded-md">
                                                                            +{candidate.skills.length - 5}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                                            <button
                                                                onClick={() => handleViewProfile(candidate._id)}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#233480] text-white text-sm font-medium rounded-lg hover:bg-[#1a2660] transition shadow-sm"
                                                            >
                                                                <Eye size={16} /> {t('institution.shortlistedCandidates.viewProfile')}
                                                            </button>

                                                            {candidate.resume?.url && (
                                                                <button
                                                                    onClick={() => handleDownloadResume(candidate.resume.url)}
                                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                                                                >
                                                                    <Download size={16} /> {t('institution.shortlistedCandidates.resume')}
                                                                </button>
                                                            )}

                                                            {activeTab === 'shortlisted' && (
                                                                <div className="flex gap-2 mt-1">
                                                                    {/* Accept button can be enabled if we decide on a flow. For now, Shortlisted -> specific actions like Interview. */
                                                                    /* Uncomment if you want an explicit 'Accept' to move to next stage immediately */
                                                                    /*
                                                                    <button 
                                                                        onClick={() => handleAction(app._id, 'accept')}
                                                                        disabled={actionLoading === app._id}
                                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold hover:bg-green-100 transition disabled:opacity-50"
                                                                        title="Move to Interview"
                                                                    >
                                                                        {actionLoading === app._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                                        Accept
                                                                    </button> 
                                                                    */}

                                                                    <button
                                                                        onClick={() => handleAction(app._id, 'reject')}
                                                                        disabled={actionLoading === app._id}
                                                                        className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50"
                                                                    >
                                                                        {actionLoading === app._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                                                        {t('institution.shortlistedCandidates.reject')}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {activeTab === 'hired' && (
                                                                <div className="mt-1 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1">
                                                                    <CheckCircle size={14} /> {t('institution.shortlistedCandidates.hiredStatus')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ShortlistedCandidates;
