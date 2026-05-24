import React, { useState, useEffect } from 'react';
import {
    Briefcase, Clock, MapPin, Loader2, ChevronLeft, ChevronRight,
    ChevronDown, ChevronUp, Calendar, Video, Phone, MapPinIcon,
    CheckCircle, XCircle, X, FileText, ExternalLink, DollarSign,
    AlertCircle, Star, MessageSquare, Send, Award, Eye, Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { applicationAPI } from '../../services/api';
import Footer from '../../component/Footer';

// ═══════════════════════════════════════════════
//  MODAL COMPONENT
// ═══════════════════════════════════════════════
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-[#1e2a5a]">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
//  TIMELINE COMPONENT
// ═══════════════════════════════════════════════
const StatusTimeline = ({ statusHistory }) => {
    const { t } = useTranslation();
    if (!statusHistory || statusHistory.length === 0) return null;

    const statusIcons = {
        applied: <FileText size={14} />,
        viewed: <Eye size={14} />,
        shortlisted: <Award size={14} />,
        interview_scheduled: <Calendar size={14} />,
        interviewed: <MessageSquare size={14} />,
        offered: <DollarSign size={14} />,
        hired: <CheckCircle size={14} />,
        rejected: <XCircle size={14} />,
        withdrawn: <XCircle size={14} />,
    };

    const statusColors = {
        applied: 'bg-blue-500',
        viewed: 'bg-gray-500',
        shortlisted: 'bg-yellow-500',
        interview_scheduled: 'bg-purple-500',
        interviewed: 'bg-indigo-500',
        offered: 'bg-orange-500',
        hired: 'bg-green-500',
        rejected: 'bg-red-500',
        withdrawn: 'bg-gray-400',
    };

    return (
        <div className="relative">
            <h4 className="text-sm font-bold text-[#1e2a5a] mb-3 flex items-center gap-2">
                <Clock size={14} className="text-[#233480]" /> {t('pages.candidate_applied_job.application_timeline')}
            </h4>
            <div className="space-y-0">
                {statusHistory.map((sh, i) => (
                    <div key={i} className="flex items-start gap-3 relative">
                        {i < statusHistory.length - 1 && (
                            <div className="absolute left-[15px] top-[30px] w-0.5 h-[calc(100%-6px)] bg-gray-200" />
                        )}
                        <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 text-white ${statusColors[sh.status] || 'bg-gray-400'}`}>
                            {statusIcons[sh.status] || <Clock size={14} />}
                        </div>
                        <div className="pb-4 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                                {sh.status?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[11px] text-gray-500">
                                {new Date(sh.changedAt).toLocaleString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                            {sh.remarks && (
                                <p className="text-xs text-gray-600 mt-1 bg-gray-50 px-2 py-1 rounded">{sh.remarks}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
//  INTERVIEW CARD COMPONENT
// ═══════════════════════════════════════════════
const InterviewCard = ({ interview, index }) => {
    const { t } = useTranslation();
    const typeIcons = {
        video: <Video size={14} className="text-purple-600" />,
        phone: <Phone size={14} className="text-blue-600" />,
        'in-person': <MapPin size={14} className="text-green-600" />,
    };

    const statusBadge = {
        scheduled: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
        rescheduled: 'bg-yellow-100 text-yellow-700',
        no_show: 'bg-gray-100 text-gray-700',
    };

    const isUpcoming = new Date(interview.scheduledAt) > new Date() && interview.status === 'scheduled';

    return (
        <div className={`border rounded-xl p-4 ${isUpcoming ? 'border-purple-300 bg-purple-50/50 ring-1 ring-purple-200' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-7 h-7 bg-[#233480] text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {interview.round || index + 1}
                    </span>
                    <span className="text-sm font-bold text-[#1e2a5a]">{t('pages.candidate_applied_job.round')} {interview.round || index + 1}</span>
                    {isUpcoming && (
                        <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                            {t('pages.candidate_applied_job.upcoming')}
                        </span>
                    )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge[interview.status] || 'bg-gray-100 text-gray-600'}`}>
                    {interview.status?.replace(/_/g, ' ').toUpperCase()}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={14} className="text-[#233480] flex-shrink-0" />
                    <span className="font-medium">
                        {new Date(interview.scheduledAt).toLocaleString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    {typeIcons[interview.type] || <Video size={14} />}
                    <span className="capitalize">{interview.type?.replace(/-/g, ' ') || 'Video'} {t('pages.candidate_applied_job.interview')}</span>
                </div>

                {interview.meetingLink && interview.status === 'scheduled' && (
                    <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all mt-1">
                        <Video size={13} /> {t('pages.candidate_applied_job.join_meeting')}
                        <ExternalLink size={11} />
                    </a>
                )}

                {interview.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-green-600 flex-shrink-0" />
                        <span>{interview.location}</span>
                    </div>
                )}

                {interview.interviewers?.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                        <Building2 size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{t('pages.candidate_applied_job.interviewers')}: {interview.interviewers.join(', ')}</span>
                    </div>
                )}

                {interview.notes && (
                    <div className="mt-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-700 mb-1">📋 {t('pages.candidate_applied_job.instructions')}</p>
                        <p className="text-xs text-yellow-800">{interview.notes}</p>
                    </div>
                )}

                {interview.feedback && (
                    <div className="mt-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-semibold text-green-700 mb-1">💬 {t('pages.candidate_applied_job.interviewer_feedback')}</p>
                        <p className="text-xs text-green-800">{interview.feedback}</p>
                        {interview.rating && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500">{t('pages.candidate_applied_job.rating')}:</span>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={12} className={s <= interview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
//  OFFER CARD COMPONENT (FIXED)
// ═══════════════════════════════════════════════
const OfferCard = ({ offer, onRespond, responding, applicationStatus }) => {
    const { t } = useTranslation();
    if (!offer) return null;

    // Determine effective offer status based on application status
    const getEffectiveOfferStatus = () => {
        if (applicationStatus === 'hired') return 'accepted';
        if (applicationStatus === 'rejected' || applicationStatus === 'withdrawn') return 'rejected';
        if (offer.status && offer.status !== 'pending') return offer.status;
        return offer.status || 'pending';
    };

    const effectiveStatus = getEffectiveOfferStatus();

    // Only show response buttons when offer is truly pending AND application is not already resolved
    const showResponseButtons = effectiveStatus === 'pending'
        && !['hired', 'rejected', 'withdrawn'].includes(applicationStatus);

    // Card border color based on effective status
    const getCardStyle = () => {
        if (effectiveStatus === 'accepted') return 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50';
        if (effectiveStatus === 'rejected') return 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50';
        return 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50';
    };

    // Header icon and text based on effective status
    const getHeaderContent = () => {
        if (effectiveStatus === 'accepted') {
            return { icon: '', color: 'text-green-800', bgColor: 'bg-green-500' };
        }
        if (effectiveStatus === 'rejected') {
            return { icon: '', color: 'text-red-800', bgColor: 'bg-red-500' };
        }
        return { icon: '', color: 'text-orange-800', bgColor: 'bg-orange-500' };
    };

    const headerContent = getHeaderContent();

    return (
        <div className={`border-2 rounded-xl p-5 ${getCardStyle()}`}>
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 ${headerContent.bgColor} text-white rounded-full flex items-center justify-center`}>
                    <Award size={16} />
                </div>
                <h4 className={`text-base font-bold ${headerContent.color}`}>
                    {headerContent.icon} {t('pages.candidate_applied_job.job_offer')}
                </h4>
                {/* Effective Status Badge */}
                <span className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold ${effectiveStatus === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    effectiveStatus === 'accepted' ? 'bg-green-200 text-green-800' :
                        'bg-red-200 text-red-800'
                    }`}>
                    {effectiveStatus?.toUpperCase()}
                </span>
            </div>

            {/* Offer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {offer.salary && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('pages.candidate_applied_job.salary')}</p>
                        <p className="text-lg font-bold text-green-600">₹{(offer.salary / 100000).toFixed(1)} LPA</p>
                    </div>
                )}
                {offer.designation && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('pages.candidate_applied_job.designation')}</p>
                        <p className="text-sm font-bold text-[#1e2a5a]">{offer.designation}</p>
                    </div>
                )}
                {offer.joiningDate && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{t('pages.candidate_applied_job.joining_date')}</p>
                        <p className="text-sm font-bold text-[#1e2a5a]">
                            {new Date(offer.joiningDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </p>
                    </div>
                )}
            </div>

            {/*  HIRED / ACCEPTED Success Banner */}
            {effectiveStatus === 'accepted' && (
                <div className="flex items-center gap-3 p-4 bg-green-100 border-2 border-green-300 rounded-xl mt-2">
                    <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-green-800">
                             Offer Accepted — Welcome Aboard!
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                            Congratulations! You have been successfully hired for this position.
                        </p>
                    </div>
                </div>
            )}

            {/*  DECLINED / REJECTED Banner */}
            {effectiveStatus === 'rejected' && (
                <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-200 rounded-xl mt-2">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <XCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-red-800">
                            This offer has been declined.
                        </p>
                    </div>
                </div>
            )}

            {/*  Only show Accept/Decline buttons when truly pending */}
            {showResponseButtons && (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => onRespond('accepted')}
                        disabled={responding}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50">
                        {responding ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        {t('pages.candidate_applied_job.accept_offer')}
                    </button>
                    <button
                        onClick={() => onRespond('rejected')}
                        disabled={responding}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50">
                        {responding ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        {t('pages.candidate_applied_job.decline_offer')}
                    </button>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
const CandidateAppliedJob = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedJob, setExpandedJob] = useState(null);
    const [expandedDetails, setExpandedDetails] = useState({});
    const [detailsLoading, setDetailsLoading] = useState(null);
    const [respondingOffer, setRespondingOffer] = useState(null);

    // Feedback Modal
    const [feedbackModal, setFeedbackModal] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({ rating: 3, feedback: '', wouldRecommend: true });
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    // Filter
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => { fetchAppliedJobs(); }, [currentPage, filterStatus]);
    useEffect(() => { if (successMsg) { const timer = setTimeout(() => setSuccessMsg(''), 4000); return () => clearTimeout(timer); } }, [successMsg]);

    // ─── FETCH APPLIED JOBS ───
    const fetchAppliedJobs = async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const params = { page: currentPage, limit: 10 };
            if (filterStatus) params.status = filterStatus;

            const res = await api.get('/applications/my-applications', { params });
            const data = res.data.data;
            const applications = data.applications || [];

            const mapped = applications.map(app => ({
                id: app._id,
                jobId: app.job?._id,
                title: app.job?.title || 'N/A',
                company: app.job?.institution?.organizationName || 'N/A',
                experience: app.job?.experience
                    ? `${app.job.experience.min} - ${app.job.experience.max} Years`
                    : 'N/A',
                type: app.job?.jobType
                    ? app.job.jobType.charAt(0).toUpperCase() + app.job.jobType.slice(1).replace('-', ' ')
                    : 'Full Time',
                location: app.job?.location?.city || 'N/A',
                logo: app.job?.institution?.logo?.url
                    || 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
                banner: app.job?.banner?.url || '',
                status: formatStatus(app.status),
                rawStatus: app.status,
                appliedDate: app.createdAt,
                slug: app.job?.slug,
                interviews: app.interviews || [],
                offer: app.offer || null,
                statusHistory: app.statusHistory || [],
                notes: app.notes || [],
                coverLetter: app.coverLetter,
                screeningAnswers: app.screeningAnswers || [],
                expectedSalary: app.expectedSalary,
                noticePeriod: app.noticePeriod,
                rejectionReason: app.rejectionReason,
                feedback: app.feedback,
            }));

            setAppliedJobs(mapped);
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Failed to load applications:', error);
            setErrorMsg(error.response?.data?.message || t('pages.candidate_applied_job.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    // ─── FETCH APPLICATION DETAILS ───
    const fetchApplicationDetails = async (applicationId) => {
        if (expandedDetails[applicationId]) return;
        setDetailsLoading(applicationId);
        try {
            const res = await applicationAPI.getDetails(applicationId);
            const detail = res.data.data.application || res.data.data;
            setExpandedDetails(prev => ({ ...prev, [applicationId]: detail }));
        } catch (err) {
            console.error('Failed to load details:', err);
            setErrorMsg(t('pages.candidate_applied_job.details_load_failed'));
        } finally {
            setDetailsLoading(null);
        }
    };

    // ─── TOGGLE EXPAND ───
    const toggleExpand = (jobId, applicationId) => {
        if (expandedJob === jobId) {
            setExpandedJob(null);
        } else {
            setExpandedJob(jobId);
            fetchApplicationDetails(applicationId);
        }
    };

    // ─── FORMAT STATUS ───
    const formatStatus = (status) => {
        const statusKeyMap = {
            'applied': 'status_applied',
            'viewed': 'status_viewed',
            'shortlisted': 'status_shortlisted',
            'interview_scheduled': 'status_interview',
            'interviewed': 'status_interviewed',
            'offered': 'status_offered',
            'hired': 'status_hired',
            'rejected': 'status_rejected',
            'withdrawn': 'status_withdrawn'
        };
        const key = statusKeyMap[status];
        return key ? t(`pages.candidate_applied_job.${key}`) : status;
    };

    // ─── STATUS COLOR ───
    const getStatusColor = (rawStatus) => {
        const colors = {
            'applied': 'bg-[#233480]',
            'viewed': 'bg-blue-500',
            'shortlisted': 'bg-yellow-500',
            'interview_scheduled': 'bg-purple-600',
            'interviewed': 'bg-indigo-600',
            'offered': 'bg-orange-500',
            'hired': 'bg-green-600',
            'rejected': 'bg-red-500',
            'withdrawn': 'bg-gray-500'
        };
        return colors[rawStatus] || 'bg-[#233480]';
    };

    const getStatusBgLight = (rawStatus) => {
        const colors = {
            'applied': 'bg-blue-50 border-blue-200',
            'viewed': 'bg-blue-50 border-blue-200',
            'shortlisted': 'bg-yellow-50 border-yellow-200',
            'interview_scheduled': 'bg-purple-50 border-purple-200',
            'interviewed': 'bg-indigo-50 border-indigo-200',
            'offered': 'bg-orange-50 border-orange-200',
            'hired': 'bg-green-50 border-green-200',
            'rejected': 'bg-red-50 border-red-200',
            'withdrawn': 'bg-gray-50 border-gray-200'
        };
        return colors[rawStatus] || 'bg-gray-50 border-gray-200';
    };

    // ─── STATUS MESSAGE ───
    const getStatusMessage = (rawStatus) => {
        const messages = {
            'applied': '📝 Your application has been submitted successfully.',
            'viewed': '👀 The employer has viewed your application.',
            'shortlisted': '⭐ Great news! You have been shortlisted.',
            'interview_scheduled': '📅 Your interview has been scheduled. Check details below.',
            'interviewed': ' Your interview is complete. Awaiting feedback.',
            'offered': ' Congratulations! You have received a job offer!',
            'hired': ' Welcome aboard! You have been hired!',
            'rejected': '😔 Unfortunately, your application was not selected.',
            'withdrawn': '↩️ You have withdrawn this application.'
        };
        return messages[rawStatus] || '';
    };

    // ─── WITHDRAW APPLICATION ───
    const handleWithdraw = async (applicationId) => {
        if (!window.confirm(t('pages.candidate_applied_job.withdraw_confirm'))) return;
        try {
            await api.post(`/applications/${applicationId}/withdraw`, {
                reason: 'Withdrawn by candidate'
            });
            setSuccessMsg(t('pages.candidate_applied_job.withdraw_success'));
            await fetchAppliedJobs();
        } catch (error) {
            console.error('Withdraw failed:', error);
            setErrorMsg(error.response?.data?.message || t('pages.candidate_applied_job.withdraw_failed'));
        }
    };

    // ─── RESPOND TO OFFER ───
    const handleRespondOffer = async (applicationId, response) => {
        const confirmMsg = response === 'accepted'
            ? t('pages.candidate_applied_job.accept_confirm')
            : t('pages.candidate_applied_job.decline_confirm');

        if (!window.confirm(confirmMsg)) return;

        setRespondingOffer(applicationId);
        try {
            await applicationAPI.respondToOffer(applicationId, { response });
            setSuccessMsg(response === 'accepted' ? t('pages.candidate_applied_job.offer_accepted') : t('pages.candidate_applied_job.offer_declined'));
            setExpandedDetails(prev => {
                const copy = { ...prev };
                delete copy[applicationId];
                return copy;
            });
            await fetchAppliedJobs();
        } catch (error) {
            console.error('Respond offer failed:', error);
            setErrorMsg(error.response?.data?.message || t('pages.candidate_applied_job.offer_respond_failed'));
        } finally {
            setRespondingOffer(null);
        }
    };

    // ─── SUBMIT FEEDBACK ───
    const handleSubmitFeedback = async () => {
        if (!feedbackForm.feedback.trim()) {
            setErrorMsg(t('pages.candidate_applied_job.feedback_required'));
            return;
        }
        setFeedbackLoading(true);
        try {
            await applicationAPI.submitFeedback(feedbackModal, {
                rating: feedbackForm.rating,
                feedback: feedbackForm.feedback,
                wouldRecommend: feedbackForm.wouldRecommend
            });
            setSuccessMsg(t('pages.candidate_applied_job.feedback_success'));
            setFeedbackModal(null);
            setFeedbackForm({ rating: 3, feedback: '', wouldRecommend: true });
            setExpandedDetails(prev => {
                const copy = { ...prev };
                delete copy[feedbackModal];
                return copy;
            });
            await fetchAppliedJobs();
        } catch (error) {
            setErrorMsg(error.response?.data?.message || t('pages.candidate_applied_job.feedback_failed'));
        } finally {
            setFeedbackLoading(false);
        }
    };

    // ─── STATUS FILTER CHIPS ───
    const allStatuses = [
        { key: '', label: t('pages.candidate_applied_job.filter_all') },
        { key: 'applied', label: t('pages.candidate_applied_job.status_applied') },
        { key: 'viewed', label: t('pages.candidate_applied_job.status_viewed') },
        { key: 'shortlisted', label: t('pages.candidate_applied_job.status_shortlisted') },
        { key: 'interview_scheduled', label: t('pages.candidate_applied_job.status_interview') },
        { key: 'interviewed', label: t('pages.candidate_applied_job.status_interviewed') },
        { key: 'offered', label: t('pages.candidate_applied_job.status_offered') },
        { key: 'hired', label: t('pages.candidate_applied_job.status_hired') },
        { key: 'rejected', label: t('pages.candidate_applied_job.status_rejected') },
        { key: 'withdrawn', label: t('pages.candidate_applied_job.status_withdrawn') },
    ];

    // Get data (prefer detailed if loaded)
    const getJobData = (job) => {
        const detail = expandedDetails[job.id];
        return {
            interviews: detail?.interviews || job.interviews || [],
            offer: detail?.offer || job.offer || null,
            statusHistory: detail?.statusHistory || job.statusHistory || [],
            rejectionReason: detail?.rejectionReason || job.rejectionReason,
            feedback: detail?.feedback || job.feedback,
        };
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Hero Banner */}
                <div className="relative w-full py-8 md:py-16 pb-15 overflow-hidden flex items-start justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                    </div>
                    <div className="relative z-10 text-center">
                        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-wider uppercase">
                            {t('pages.candidate_applied_job.title')}
                        </h1>
                        {!loading && (
                            <p className="text-white/70 text-sm mt-2">
                                {t('pages.candidate_applied_job.total_applications')}: {pagination.total}
                            </p>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
                    <div className="bg-white shadow-xl border-b-4 border-[#233480] p-4 md:p-8">

                        {/* Success Message */}
                        {successMsg && (
                            <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                                <div className="flex items-center gap-2"><CheckCircle size={16} />{successMsg}</div>
                                <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
                            </div>
                        )}

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                                <div className="flex items-center gap-2"><AlertCircle size={16} />{errorMsg}</div>
                                <button onClick={() => setErrorMsg('')}><X size={16} /></button>
                            </div>
                        )}

                        {/* Status Filter Chips */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {allStatuses.map(s => (
                                <button key={s.key}
                                    onClick={() => { setFilterStatus(s.key); setCurrentPage(1); }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s.key
                                        ? 'bg-[#233480] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-[#233480]" size={40} />
                            </div>
                        ) : appliedJobs.length === 0 ? (
                            <div className="text-center py-20">
                                <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">
                                    {filterStatus ? t('pages.candidate_applied_job.no_apps_status') : t('pages.candidate_applied_job.no_apps_yet')}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">{t('pages.candidate_applied_job.start_applying')}</p>
                                {!filterStatus && (
                                    <button onClick={() => navigate('/candidate/search-job')}
                                        className="mt-6 px-8 py-2.5 bg-[#233480] text-white font-bold rounded text-sm hover:bg-[#1a2660] transition-all">
                                        {t('pages.candidate_applied_job.browse_jobs')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {appliedJobs.map((job) => {
                                    const isExpanded = expandedJob === job.id;
                                    const jobData = getJobData(job);
                                    const hasInterviews = jobData.interviews.length > 0;
                                    const hasOffer = !!jobData.offer;
                                    const upcomingInterview = jobData.interviews.find(
                                        iv => iv.status === 'scheduled' && new Date(iv.scheduledAt) > new Date()
                                    );

                                    return (
                                        <div key={job.id}
                                            className={`group bg-white border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden rounded-xl ${isExpanded ? 'border-[#233480]/30 shadow-lg' : 'border-gray-100 hover:border-blue-100'
                                                }`}>
                                            {/* Left accent bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(job.rawStatus)} transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>

                                            {/* Main Card Content */}
                                            <div className="p-5 md:p-6">
                                                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full">
                                                    {/* Company Logo / Banner */}
                                                    <div className="w-full md:w-32 h-20 md:h-20 rounded-lg overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                        {job.banner ? (
                                                            <img src={job.banner} alt={job.company} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={job.logo} alt={job.company}
                                                                className="w-full h-full object-contain bg-white p-2"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Logo'; }} />
                                                        )}
                                                    </div>

                                                    {/* Job Details */}
                                                    <div className="flex-1 space-y-2 md:space-y-3 w-full">
                                                        <h3 className="text-base md:text-lg font-semibold text-[#1e2a5a] leading-tight group-hover:text-[#233480] transition-colors cursor-pointer"
                                                            onClick={() => navigate(`/job-details/${job.jobId}`)}>
                                                            {job.title}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 text-xs md:text-sm">
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <Building2 size={14} className="text-blue-600" />
                                                                <span className="line-clamp-1">{job.company}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <Clock size={14} className="text-blue-600" />
                                                                {job.experience}
                                                            </div>
                                                            <div className="px-2.5 py-1 bg-green-50 text-green-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
                                                                {job.type}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                                <MapPin size={14} className="text-blue-600" />
                                                                {job.location}
                                                            </div>
                                                        </div>

                                                        {/* Applied Date + Quick Status Indicators */}
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            {job.appliedDate && (
                                                                <p className="text-[10px] text-gray-400">
                                                                    {t('pages.candidate_applied_job.applied_on')}: {new Date(job.appliedDate).toLocaleDateString('en-IN', {
                                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                                    })}
                                                                </p>
                                                            )}

                                                            {/*  Upcoming Interview Indicator - only show if not hired/rejected */}
                                                            {upcomingInterview && !['hired', 'rejected', 'withdrawn'].includes(job.rawStatus) && (
                                                                <span className="flex items-center gap-1 text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full animate-pulse">
                                                                    <Calendar size={10} />
                                                                    Interview: {new Date(upcomingInterview.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            )}

                                                            {/*  Offer Indicator - only show if genuinely pending and not hired */}
                                                            {hasOffer
                                                                && job.rawStatus !== 'hired'
                                                                && job.rawStatus !== 'rejected'
                                                                && job.rawStatus !== 'withdrawn'
                                                                && (jobData.offer?.status === 'pending' || !jobData.offer?.status)
                                                                && job.rawStatus === 'offered' && (
                                                                    <span className="flex items-center gap-1 text-[10px] text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full animate-pulse">
                                                                        <Award size={10} /> {t('pages.candidate_applied_job.offer_pending')}
                                                                    </span>
                                                                )}

                                                            {/*  Hired Badge on collapsed card */}
                                                            {job.rawStatus === 'hired' && (
                                                                <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                                    <CheckCircle size={10} /> Hired 
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status + Actions */}
                                                    <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0 flex flex-col gap-2 items-end">
                                                        <button
                                                            className={`w-full md:w-44 py-2 md:py-2.5 font-bold text-xs md:text-sm tracking-wider uppercase transition-all shadow-sm rounded-lg text-white cursor-default ${getStatusColor(job.rawStatus)}`}>
                                                            {formatStatus(job.rawStatus)}
                                                        </button>

                                                        {/* Expand Button */}
                                                        <button
                                                            onClick={() => toggleExpand(job.id, job.id)}
                                                            className="w-full md:w-44 py-1.5 text-[11px] font-semibold tracking-wider text-[#233480] border border-[#233480]/30 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                                                            {isExpanded ? <><ChevronUp size={14} /> {t('pages.candidate_applied_job.hide_details')}</> : <><ChevronDown size={14} /> {t('pages.candidate_applied_job.view_details')}</>}
                                                        </button>

                                                        {/* Withdraw button - only for early stages */}
                                                        {['applied', 'viewed'].includes(job.rawStatus) && (
                                                            <button onClick={() => handleWithdraw(job.id)}
                                                                className="w-full md:w-44 py-1.5 text-[10px] font-bold tracking-wider uppercase text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-all">
                                                                {t('pages.candidate_applied_job.withdraw')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ═══════════ EXPANDED SECTION ═══════════ */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                                                    {detailsLoading === job.id ? (
                                                        <div className="flex items-center justify-center py-10">
                                                            <Loader2 className="animate-spin text-[#233480]" size={28} />
                                                            <span className="ml-2 text-sm text-gray-500">{t('pages.candidate_applied_job.loading_details')}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="p-0">
                                                            {/* Job Banner (Expanded View) */}
                                                            {job.banner && (
                                                                <div className="w-full h-40 md:h-56 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                                                                    <img src={job.banner} alt={job.title} className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                            <div className="p-5 md:p-6 space-y-6">

                                                                {/* Status Message Banner */}
                                                                <div className={`rounded-lg p-4 border ${getStatusBgLight(job.rawStatus)}`}>
                                                                    <p className="text-sm font-medium text-gray-700">
                                                                        {getStatusMessage(job.rawStatus)}
                                                                    </p>
                                                                    {job.rawStatus === 'rejected' && jobData.rejectionReason && (
                                                                        <p className="text-xs text-red-600 mt-2">
                                                                            <strong>{t('pages.candidate_applied_job.reason')}:</strong> {jobData.rejectionReason}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                                                    {/* ─── INTERVIEWS SECTION ─── */}
                                                                    {hasInterviews && (
                                                                        <div className="lg:col-span-2">
                                                                            <h4 className="text-sm font-bold text-[#1e2a5a] mb-3 flex items-center gap-2">
                                                                                <Calendar size={16} className="text-purple-600" />
                                                                                {t('pages.candidate_applied_job.interviews')} ({jobData.interviews.length})
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                {jobData.interviews.map((iv, i) => (
                                                                                    <InterviewCard key={i} interview={iv} index={i} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* ─── OFFER SECTION (FIXED) ─── */}
                                                                    {hasOffer && (
                                                                        <div className="lg:col-span-2">
                                                                            <OfferCard
                                                                                offer={jobData.offer}
                                                                                applicationStatus={job.rawStatus}
                                                                                onRespond={(response) => handleRespondOffer(job.id, response)}
                                                                                responding={respondingOffer === job.id}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    {/* ─── TIMELINE ─── */}
                                                                    {jobData.statusHistory.length > 0 && (
                                                                        <div>
                                                                            <StatusTimeline statusHistory={jobData.statusHistory} />
                                                                        </div>
                                                                    )}

                                                                    {/* ─── APPLICATION INFO ─── */}
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-[#1e2a5a] mb-3 flex items-center gap-2">
                                                                            <FileText size={14} className="text-[#233480]" /> {t('pages.candidate_applied_job.application_info')}
                                                                        </h4>
                                                                        <div className="bg-white border rounded-lg p-4 space-y-2 text-sm">
                                                                            {job.expectedSalary && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">{t('pages.candidate_applied_job.expected_salary')}</span>
                                                                                    <span className="font-semibold text-green-600">₹{(job.expectedSalary / 100000).toFixed(1)} LPA</span>
                                                                                </div>
                                                                            )}
                                                                            {job.noticePeriod && (
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-500">{t('pages.candidate_applied_job.notice_period')}</span>
                                                                                    <span className="font-semibold">{job.noticePeriod}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">{t('pages.candidate_applied_job.applied_on')}</span>
                                                                                <span className="font-semibold">
                                                                                    {new Date(job.appliedDate).toLocaleDateString('en-IN', {
                                                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between">
                                                                                <span className="text-gray-500">{t('pages.candidate_applied_job.status')}</span>
                                                                                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${getStatusColor(job.rawStatus)} text-white`}>
                                                                                    {formatStatus(job.rawStatus)}
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Cover Letter */}
                                                                        {job.coverLetter && (
                                                                            <div className="mt-3">
                                                                                <p className="text-xs font-semibold text-gray-500 mb-1">{t('pages.candidate_applied_job.cover_letter')}</p>
                                                                                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border max-h-32 overflow-y-auto whitespace-pre-line">
                                                                                    {job.coverLetter}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* ─── ACTIONS BAR ─── */}
                                                                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                                                    {/* View Job */}
                                                                    <button
                                                                        onClick={() => navigate(`/job-details/${job.jobId}`)}
                                                                        className="px-4 py-2 border border-[#233480] text-[#233480] text-xs font-semibold rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
                                                                        <ExternalLink size={13} /> {t('pages.candidate_applied_job.view_job')}
                                                                    </button>

                                                                    {/* Give Feedback - for interviewed/hired/offered */}
                                                                    {['interviewed', 'hired', 'offered'].includes(job.rawStatus) && !jobData.feedback && (
                                                                        <button
                                                                            onClick={() => setFeedbackModal(job.id)}
                                                                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-1.5">
                                                                            <MessageSquare size={13} /> {t('pages.candidate_applied_job.give_feedback')}
                                                                        </button>
                                                                    )}

                                                                    {/* Already given feedback */}
                                                                    {jobData.feedback && (
                                                                        <span className="px-4 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-green-200">
                                                                            <CheckCircle size={13} /> {t('pages.candidate_applied_job.feedback_submitted')}
                                                                        </span>
                                                                    )}

                                                                    {/* Withdraw */}
                                                                    {['applied', 'viewed', 'shortlisted'].includes(job.rawStatus) && (
                                                                        <button onClick={() => handleWithdraw(job.id)}
                                                                            className="px-4 py-2 text-red-500 border border-red-200 text-xs font-semibold rounded-lg hover:bg-red-50 flex items-center gap-1.5">
                                                                            <XCircle size={13} /> {t('pages.candidate_applied_job.withdraw_application')}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-center gap-4 pt-6">
                                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-sm text-gray-600 font-medium">
                                            {t('pages.candidate_applied_job.page')} {currentPage} {t('pages.candidate_applied_job.of')} {pagination.pages}
                                        </span>
                                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                                            disabled={currentPage === pagination.pages}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════ FEEDBACK MODAL ═══════════ */}
            <Modal show={!!feedbackModal} onClose={() => setFeedbackModal(null)} title={t('pages.candidate_applied_job.share_experience')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('pages.candidate_applied_job.overall_rating')}</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(r => (
                                <button key={r} onClick={() => setFeedbackForm(p => ({ ...p, rating: r }))}
                                    className={`w-11 h-11 rounded-full text-lg transition-all ${feedbackForm.rating >= r
                                        ? 'bg-yellow-400 text-white shadow-md scale-110'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}>
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {['', t('pages.candidate_applied_job.rating_poor'), t('pages.candidate_applied_job.rating_fair'), t('pages.candidate_applied_job.rating_good'), t('pages.candidate_applied_job.rating_very_good'), t('pages.candidate_applied_job.rating_excellent')][feedbackForm.rating]}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.candidate_applied_job.your_feedback')} *</label>
                        <textarea rows="4"
                            placeholder={t('pages.candidate_applied_job.feedback_placeholder')}
                            value={feedbackForm.feedback}
                            onChange={e => setFeedbackForm(p => ({ ...p, feedback: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent resize-none"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={feedbackForm.wouldRecommend}
                                onChange={e => setFeedbackForm(p => ({ ...p, wouldRecommend: e.target.checked }))}
                                className="w-4 h-4 text-[#233480] border-gray-300 rounded focus:ring-[#233480]" />
                            <span className="text-sm text-gray-700">{t('pages.candidate_applied_job.would_recommend')}</span>
                        </label>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button onClick={() => setFeedbackModal(null)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            {t('pages.candidate_applied_job.cancel')}
                        </button>
                        <button onClick={handleSubmitFeedback} disabled={feedbackLoading || !feedbackForm.feedback.trim()}
                            className="px-5 py-2 bg-[#233480] text-white rounded-lg text-sm font-semibold hover:bg-[#1a2660] disabled:opacity-50 flex items-center gap-2">
                            {feedbackLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {t('pages.candidate_applied_job.submit_feedback')}
                        </button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </>
    );
};

export default CandidateAppliedJob;