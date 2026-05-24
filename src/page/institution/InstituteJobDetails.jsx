import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../../component/Footer';
import {
    Briefcase, MapPin, Clock, Building2, Eye, Edit, Trash2, Users, Loader2, X,
    CheckCircle, AlertCircle, Calendar, DollarSign, GraduationCap,
    ArrowLeft, Share2, ChevronDown, ChevronUp, ExternalLink,
    FileText, Mail, Phone, Target, Heart, MessageSquare, Send,
    Video, Award
} from 'lucide-react';
import { jobsAPI, applicationAPI } from '../../services/api';

// ═══════════════════════════════════════════════
//  HELPER COMPONENTS
// ═══════════════════════════════════════════════
const InfoBox = ({ icon, label, value, t }) => (
    <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-[#233480] mb-1">{icon}<span className="text-xs text-gray-500">{t ? t(label) : label}</span></div>
        <p className="text-sm font-semibold text-[#1e2a5a] truncate">{value}</p>
    </div>
);

const StatRow = ({ icon, label, value, color = 'text-[#1e2a5a]' }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-2 text-gray-600 text-sm">{icon}{label}</div>
        <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
);

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
//  MAIN COMPONENT
// ═══════════════════════════════════════════════
const InstitutionJobDetails = () => {
    const { t } = useTranslation();
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'applications' ? 'applications' : 'details');

    useEffect(() => { fetchJobDetails(); }, [jobId]);

    // URL se tab set karo
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'applications') setActiveTab('applications');
    }, [searchParams]);

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            const res = await jobsAPI.getById(jobId);
            setJob(res.data.data.job || res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || t('pages.institute_job_details.errors.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatSalary = (salary) => {
        if (!salary) return t('pages.institute_job_details.salary.not_disclosed');
        if (salary.isConfidential) return t('pages.institute_job_details.salary.confidential');
        return `₹${(salary.min / 100000).toFixed(1)} - ₹${(salary.max / 100000).toFixed(1)} LPA ${salary.isNegotiable ? `(${t('pages.institute_job_details.salary.negotiable')})` : ''}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-[#233480] mx-auto mb-3" /><p className="text-gray-500">{t('pages.institute_job_details.loading')}</p></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                    <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">{t('pages.institute_job_details.error_title')}</h3>
                    <p className="text-gray-500 mb-4">{error || t('pages.institute_job_details.errors.job_not_found')}</p>
                    <button onClick={() => navigate('/recent-jobs')} className="px-6 py-2 bg-[#233480] text-white rounded-lg hover:bg-[#1a2660]">{t('pages.institute_job_details.actions.go_back')}</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                    <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-wider text-center px-4">{t('pages.institute_job_details.title')}</h1>
                </div>

                <div className="max-w-6xl mx-auto px-4 -mt-6 mb-12 relative z-20">
                    <button onClick={() => navigate('/recent-jobs')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#233480] mb-4 bg-white px-4 py-2 rounded-lg shadow-sm">
                        <ArrowLeft size={16} /> {t('pages.institute_job_details.actions.back_to_jobs')}
                    </button>

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
                        <div className="flex border-b">
                            <button onClick={() => setActiveTab('details')}
                                className={`flex-1 py-3.5 px-4 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'details' ? 'text-[#233480] border-[#233480] bg-blue-50/50' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                                <FileText size={16} className="inline mr-2" />{t('pages.institute_job_details.tabs.details')}
                            </button>
                            <button onClick={() => setActiveTab('applications')}
                                className={`flex-1 py-3.5 px-4 text-sm font-semibold text-center border-b-2 transition-colors relative ${activeTab === 'applications' ? 'text-[#233480] border-[#233480] bg-blue-50/50' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                                <Users size={16} className="inline mr-2" />{t('pages.institute_job_details.tabs.applications')}
                                {(job.applicationsCount > 0) && <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{job.applicationsCount}</span>}
                            </button>
                        </div>
                    </div>

                    {activeTab === 'details' ? (
                        <JobDetailsTab job={job} navigate={navigate} formatDate={formatDate} formatSalary={formatSalary} t={t} />
                    ) : (
                        <ApplicationsTab jobId={jobId} t={t} />
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

// ═══════════════════════════════════════════════
//  JOB DETAILS TAB
// ═══════════════════════════════════════════════
const JobDetailsTab = ({ job, navigate, formatDate, formatSalary, t }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Job Banner */}
                {job.banner?.url && (
                    <div className="w-full h-48 md:h-56 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                        <img src={job.banner.url} alt={job.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl border-2 border-gray-100 flex items-center justify-center bg-white flex-shrink-0 p-2">
                            {job.institution?.logo?.url ? <img src={job.institution.logo.url} alt="" className="max-w-full max-h-full object-contain" /> : <Building2 size={28} className="text-gray-400" />}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#1e2a5a] mb-1">{job.title}</h1>
                            <p className="text-gray-600 flex items-center gap-2"><Building2 size={14} className="text-[#233480]" />{job.institution?.organizationName || 'Your Organization'}</p>
                        </div>

                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'active' ? 'bg-green-100 text-green-700' : job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : job.status === 'paused' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                            {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize">{job.jobType?.replace(/-/g, ' ')}</span>
                        {job.workMode && <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold capitalize">{job.workMode}</span>}
                        {job.experienceLevel && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold capitalize">{job.experienceLevel}</span>}
                        {job.isFeatured && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">⭐ Featured</span>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InfoBox icon={<MapPin size={16} />} label="pages.institute_job_details.fields.location" value={`${job.location?.city || t('pages.institute_job_details.na')}${job.location?.state ? `, ${job.location.state}` : ''}`} t={t} />
                        <InfoBox icon={<Briefcase size={16} />} label="pages.institute_job_details.fields.experience" value={job.experience ? `${job.experience.min}-${job.experience.max} ${t('pages.institute_job_details.years')}` : t('pages.institute_job_details.na')} t={t} />
                        <InfoBox icon={<DollarSign size={16} />} label="pages.institute_job_details.fields.salary" value={formatSalary(job.salary)} t={t} />
                        <InfoBox icon={<Target size={16} />} label="pages.institute_job_details.fields.vacancies" value={job.vacancies || t('pages.institute_job_details.na')} t={t} />
                    </div>
                </div>
            </div>

            {/* Description */}
            {job.description && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.description')}</h2>
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{job.description}</div>
                </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.requirements')}</h2>
                    <ul className="space-y-2">{job.requirements.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />{r}</li>)}</ul>
                </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.responsibilities')}</h2>
                    <ul className="space-y-2">{job.responsibilities.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><Target size={16} className="text-[#233480] flex-shrink-0 mt-0.5" />{r}</li>)}</ul>
                </div>
            )}

            {/* Qualifications */}
            {job.qualifications?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.qualifications')}</h2>
                    <ul className="space-y-2">{job.qualifications.map((q, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><GraduationCap size={16} className="text-[#233480] flex-shrink-0 mt-0.5" />{q}</li>)}</ul>
                </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.skills')}</h2>
                    <div className="flex flex-wrap gap-2">
                        {job.skills.map((s, i) => <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${s.isRequired ? 'bg-[#233480] text-white' : 'bg-gray-100 text-gray-700 border'}`}>{s.name || s}{s.isRequired && '*'}</span>)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">* {t('pages.institute_job_details.required')}</p>
                </div>
            )}

            {/* Benefits */}
            {job.benefits?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.benefits')}</h2>
                    <div className="flex flex-wrap gap-2">{job.benefits.map((b, i) => <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium"><Heart size={12} />{b}</span>)}</div>
                </div>
            )}

            {/* Screening Questions */}
            {job.screeningQuestions?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.screening_questions')}</h2>
                    <div className="space-y-3">
                        {job.screeningQuestions.map((q, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <span className="w-6 h-6 bg-[#233480] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                <div><p className="text-sm text-gray-700 font-medium">{q.question}</p><p className="text-xs text-gray-500 mt-1">{t('pages.institute_job_details.screening.type')}: {q.type} | {q.isRequired ? t('pages.institute_job_details.screening.required') : t('pages.institute_job_details.screening.optional')}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-[#1e2a5a] mb-4">{t('pages.institute_job_details.sections.stats')}</h3>
                <StatRow icon={<Eye size={16} />} label={t('pages.institute_job_details.stats.views')} value={job.views || 0} />
                <StatRow icon={<Users size={16} />} label={t('pages.institute_job_details.stats.applications')} value={job.applicationsCount || 0} color="text-green-600" />
                <StatRow icon={<Calendar size={16} />} label={t('pages.institute_job_details.stats.posted')} value={formatDate(job.createdAt)} />
                <StatRow icon={<AlertCircle size={16} />} label={t('pages.institute_job_details.stats.deadline')} value={formatDate(job.applicationDeadline)} />
                <StatRow icon={<GraduationCap size={16} />} label={t('pages.institute_job_details.stats.education')} value={job.education || t('pages.institute_job_details.any')} />
            </div>

            {job.applicationInstructions && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-[#1e2a5a] mb-3">{t('pages.institute_job_details.sections.instructions')}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{job.applicationInstructions}</p>
                    {job.applicationEmail && <div className="mt-3 flex items-center gap-2 text-sm"><Mail size={14} className="text-[#233480]" /><a href={`mailto:${job.applicationEmail}`} className="text-[#233480] hover:underline">{job.applicationEmail}</a></div>}
                </div>
            )}


        </div>
    </div>
);

// ═══════════════════════════════════════════════
//  APPLICATIONS TAB
// ═══════════════════════════════════════════════
const ApplicationsTab = ({ jobId, t }) => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusCounts, setStatusCounts] = useState({});
    const [filterStatus, setFilterStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [expandedApp, setExpandedApp] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    // Modals
    const [scheduleModal, setScheduleModal] = useState(null);
    const [interviewForm, setInterviewForm] = useState({ scheduledAt: '', type: 'video', round: 1, meetingLink: '', location: '', interviewers: '', notes: '' });
    const [interviewErrors, setInterviewErrors] = useState({});
    const [feedbackModal, setFeedbackModal] = useState(null);
    const [feedbackForm, setFeedbackForm] = useState({ interviewIndex: 1, feedback: '', rating: 3, status: 'completed' });
    const [offerModal, setOfferModal] = useState(null);
    const [offerForm, setOfferForm] = useState({ salary: '', joiningDate: '', designation: '' });
    const [noteModal, setNoteModal] = useState(null);
    const [noteContent, setNoteContent] = useState('');

    useEffect(() => { fetchApplications(); }, [jobId, page, filterStatus]);
    useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (filterStatus) params.status = filterStatus;
            const res = await applicationAPI.getForJob(jobId, params);
            const data = res.data.data;
            setApplications(data.applications || []);
            setStatusCounts(data.statusCounts || {});
            setPagination(data.pagination || { total: 0, pages: 1 });
        } catch (err) { setError(err.response?.data?.message || t('pages.institute_job_details.applications.load_failed')); }
        finally { setLoading(false); }
    };

    const doAction = async (fn, successMsg) => {
        try { await fn(); setSuccess(successMsg); fetchApplications(); }
        catch (err) { setError(err.response?.data?.message || 'Action failed'); }
        finally { setActionLoading(null); }
    };

    const handleShortlist = (id) => { setActionLoading(id); doAction(() => applicationAPI.shortlist(id, { remarks: t('pages.institute_job_details.applications.shortlisted') }), t('pages.institute_job_details.applications.shortlisted') + '!'); };

    const handleReject = (id) => {
        const reason = prompt(t('pages.institute_job_details.applications.rejection_reason_prompt'));
        if (reason === null) return;
        setActionLoading(id);
        doAction(() => applicationAPI.updateStatus(id, { status: 'rejected', remarks: reason || t('pages.institute_job_details.applications.rejected'), rejectionReason: reason || '' }), t('pages.institute_job_details.applications.rejected'));
    };

    const handleMarkViewed = (id) => { setActionLoading(id); doAction(() => applicationAPI.updateStatus(id, { status: 'viewed' }), t('pages.institute_job_details.applications.marked_viewed')); };
    const handleMarkHired = (id) => { if (!confirm(t('pages.institute_job_details.applications.confirm_hire'))) return; setActionLoading(id); doAction(() => applicationAPI.updateStatus(id, { status: 'hired' }), t('pages.institute_job_details.applications.hired')); };

    const handleScheduleInterview = async () => {
        const newErrors = {};
        if (!interviewForm.scheduledAt) newErrors.scheduledAt = t('pages.institute_job_details.applications.select_datetime');
        if (!interviewForm.type) newErrors.type = t('pages.institute_job_details.modals.schedule_interview.type_required');
        if (!interviewForm.round) newErrors.round = t('pages.institute_job_details.modals.schedule_interview.round_required');
        if (!interviewForm.interviewers.trim()) newErrors.interviewers = t('pages.institute_job_details.modals.schedule_interview.interviewers_required');
        if (interviewForm.type === 'video' && !interviewForm.meetingLink.trim()) newErrors.meetingLink = t('pages.institute_job_details.modals.schedule_interview.meeting_link_required');
        if (interviewForm.type === 'in-person' && !interviewForm.location.trim()) newErrors.location = t('pages.institute_job_details.modals.schedule_interview.location_required');

        setInterviewErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setActionLoading(scheduleModal);
        const payload = { scheduledAt: new Date(interviewForm.scheduledAt).toISOString(), type: interviewForm.type, round: Number(interviewForm.round), interviewers: interviewForm.interviewers.split(',').map(i => i.trim()).filter(Boolean), notes: interviewForm.notes };
        if (interviewForm.type === 'video') payload.meetingLink = interviewForm.meetingLink;
        else payload.location = interviewForm.location;
        doAction(() => applicationAPI.scheduleInterview(scheduleModal, payload), t('pages.institute_job_details.applications.interview_scheduled'));
        setScheduleModal(null);
        setInterviewForm({ scheduledAt: '', type: 'video', round: 1, meetingLink: '', location: '', interviewers: '', notes: '' });
        setInterviewErrors({});
    };

    const handleFeedback = async () => {
        if (!feedbackForm.feedback.trim()) { setError(t('pages.institute_job_details.applications.enter_feedback')); return; }
        setActionLoading(feedbackModal);
        const payload = { ...feedbackForm, interviewIndex: feedbackForm.interviewIndex - 1 };
        doAction(() => applicationAPI.addInterviewFeedback(feedbackModal, payload), t('pages.institute_job_details.applications.feedback_added'));
        setFeedbackModal(null);
        setFeedbackForm({ interviewIndex: 1, feedback: '', rating: 3, status: 'completed' });
    };

    const handleOffer = async () => {
        if (!offerForm.salary || !offerForm.joiningDate) { setError(t('pages.institute_job_details.applications.fill_salary_date')); return; }
        setActionLoading(offerModal);
        doAction(() => applicationAPI.makeOffer(offerModal, { salary: Number(offerForm.salary), joiningDate: offerForm.joiningDate, designation: offerForm.designation }), t('pages.institute_job_details.applications.offer_sent'));
        setOfferModal(null);
        setOfferForm({ salary: '', joiningDate: '', designation: '' });
    };

    const handleNote = async () => {
        if (!noteContent.trim()) return;
        setActionLoading(noteModal);
        doAction(() => applicationAPI.addNote(noteModal, { content: noteContent }), t('pages.institute_job_details.applications.note_added'));
        setNoteModal(null);
        setNoteContent('');
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : t('pages.institute_job_details.na');
    const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('pages.institute_job_details.na');

    const statusColors = {
        applied: 'bg-blue-100 text-blue-700', viewed: 'bg-gray-200 text-gray-700', shortlisted: 'bg-yellow-100 text-yellow-700',
        interview_scheduled: 'bg-purple-100 text-purple-700', interviewed: 'bg-indigo-100 text-indigo-700', offered: 'bg-orange-100 text-orange-700',
        hired: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', withdrawn: 'bg-gray-100 text-gray-500',
    };

    const getActions = (status) => {
        const map = {
            applied: ['view', 'shortlist', 'reject', 'note'],
            viewed: ['shortlist', 'reject', 'note'],
            shortlisted: ['schedule', 'reject', 'note'],
            interview_scheduled: ['feedback', 'reject', 'note'],
            interviewed: ['offer', 'schedule', 'reject', 'note'],
            offered: ['hire', 'note'],
            hired: ['note'], rejected: ['note'], withdrawn: ['note'],
        };
        return map[status] || ['note'];
    };

    if (loading && applications.length === 0) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#233480]" /></div>;

    return (
        <div>
            {/* Messages */}
            {success && <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center"><div className="flex items-center gap-2"><CheckCircle size={16} />{success}</div><button onClick={() => setSuccess('')}><X size={16} /></button></div>}
            {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center"><span>{error}</span><button onClick={() => setError('')}><X size={16} /></button></div>}

            {/* Status Chips */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setFilterStatus(''); setPage(1); }} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!filterStatus ? 'bg-[#233480] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {t('pages.institute_job_details.applications.all')} ({Object.values(statusCounts).reduce((a, b) => a + b, 0) || pagination.total})
                    </button>
                    {Object.entries(statusCounts).map(([s, c]) => (
                        <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${filterStatus === s ? 'bg-[#233480] text-white' : `${statusColors[s] || 'bg-gray-100'} hover:opacity-80`}`}>
                            {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({c})
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty */}
            {applications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md flex items-center justify-center min-h-[250px]">
                    <div className="text-center p-8"><Users size={48} className="text-gray-300 mx-auto mb-3" /><h3 className="text-lg font-bold text-gray-500">{t('pages.institute_job_details.applications.no_applications')}</h3></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {loading && <div className="flex justify-center py-3"><Loader2 className="w-6 h-6 animate-spin text-[#233480]" /></div>}

                    {applications.map((app) => {
                        const c = app.candidate || {};
                        const u = c.user || {};
                        const isExp = expandedApp === app._id;
                        const acts = getActions(app.status);
                        const isLoading = actionLoading === app._id;

                        return (
                            <div key={app._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-[#233480] text-white flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden">
                                            {u.avatar?.url ? <img src={u.avatar.url} alt="" className="w-full h-full object-cover" /> : (u.name || 'U').charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="text-base font-bold text-[#1e2a5a]">{u.name || 'Unknown'}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[app.status] || 'bg-gray-100'}`}>{app.status?.replace(/_/g, ' ').toUpperCase()}</span>
                                                {c.candidateType && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 capitalize">{c.candidateType}</span>}
                                            </div>
                                            {c.headline && <p className="text-sm text-gray-600 mb-2 truncate">{c.headline}</p>}
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                {u.email && <span className="flex items-center gap-1"><Mail size={11} />{u.email}</span>}
                                                {u.mobile && <span className="flex items-center gap-1"><Phone size={11} />{u.mobile}</span>}
                                                {c.currentAddress?.city && <span className="flex items-center gap-1"><MapPin size={11} />{c.currentAddress.city}</span>}
                                                {c.totalExperience && <span className="flex items-center gap-1"><Briefcase size={11} />{c.totalExperience.years}y {c.totalExperience.months}m</span>}
                                                <span className="flex items-center gap-1"><Clock size={11} />{t('pages.institute_job_details.applications.applied')} {fmtDate(app.createdAt)}</span>
                                            </div>
                                            {c.skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {c.skills.slice(0, 5).map((s, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">{s.name || s}</span>)}
                                                    {c.skills.length > 5 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]">+{c.skills.length - 5}</span>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Info */}
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            {app.expectedSalary && <span className="text-sm font-semibold text-green-600">₹{(app.expectedSalary / 100000).toFixed(1)} LPA</span>}
                                            {app.noticePeriod && <span className="text-xs text-gray-500">Notice: {app.noticePeriod}</span>}
                                            {c.profileCompletion && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-[#233480] rounded-full" style={{ width: `${c.profileCompletion}%` }} /></div>
                                                    <span className="text-[10px] text-gray-500">{c.profileCompletion}%</span>
                                                </div>
                                            )}
                                            <button onClick={() => setExpandedApp(isExp ? null : app._id)} className="flex items-center gap-1 text-xs text-[#233480] font-semibold hover:underline mt-1">
                                                {isExp ? <><ChevronUp size={14} />{t('pages.institute_job_details.applications.less')}</> : <><ChevronDown size={14} />{t('pages.institute_job_details.applications.more')}</>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                                        {isLoading ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" />{t('pages.institute_job_details.applications.processing')}</div>
                                        ) : (
                                            <>
                                                {acts.includes('view') && <button onClick={() => handleMarkViewed(app._id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 flex items-center gap-1"><Eye size={13} />{t('pages.institute_job_details.applications.marked_viewed_btn')}</button>}
                                                {acts.includes('shortlist') && <button onClick={() => handleShortlist(app._id)} className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-semibold rounded-lg hover:bg-yellow-600 flex items-center gap-1"><Award size={13} />{t('pages.institute_job_details.applications.shortlist')}</button>}
                                                {acts.includes('schedule') && <button onClick={() => setScheduleModal(app._id)} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-1"><Calendar size={13} />{t('pages.institute_job_details.applications.schedule_interview')}</button>}
                                                {acts.includes('feedback') && <button onClick={() => setFeedbackModal(app._id)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-1"><MessageSquare size={13} />{t('pages.institute_job_details.applications.feedback')}</button>}
                                                {acts.includes('offer') && <button onClick={() => setOfferModal(app._id)} className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 flex items-center gap-1"><Send size={13} />{t('pages.institute_job_details.applications.make_offer')}</button>}
                                                {acts.includes('hire') && <button onClick={() => handleMarkHired(app._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 flex items-center gap-1"><CheckCircle size={13} />{t('pages.institute_job_details.applications.hire')}</button>}
                                                {acts.includes('reject') && <button onClick={() => handleReject(app._id)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 flex items-center gap-1"><X size={13} />{t('pages.institute_job_details.applications.reject')}</button>}
                                                {acts.includes('note') && <button onClick={() => setNoteModal(app._id)} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1"><MessageSquare size={13} />{t('pages.institute_job_details.applications.note')}</button>}
                                                {c.resume?.url && <a href={c.resume.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-[#233480] text-[#233480] text-xs font-semibold rounded-lg hover:bg-blue-50 flex items-center gap-1"><FileText size={13} />{t('pages.institute_job_details.applications.resume')}</a>}
                                                {c._id && <button onClick={() => navigate(`/candidates/${c._id}`)} className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1"><ExternalLink size={13} />{t('pages.institute_job_details.applications.profile')}</button>}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExp && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Cover Letter */}
                                            {app.coverLetter && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.cover_letter')}</h4>
                                                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border max-h-40 overflow-y-auto">{app.coverLetter}</p>
                                                </div>
                                            )}

                                            {/* Screening Answers */}
                                            {app.screeningAnswers?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.screening_answers')}</h4>
                                                    <div className="space-y-2">
                                                        {app.screeningAnswers.map((sa, i) => (
                                                            <div key={i} className="bg-white p-3 rounded-lg border">
                                                                <p className="text-xs text-gray-500 font-medium">{t('pages.institute_job_details.applications.question')}: {sa.question}</p>
                                                                <p className="text-xs text-gray-700 font-semibold mt-1">{t('pages.institute_job_details.applications.answer')}: {sa.answer}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status History */}
                                            {app.statusHistory?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.status_history')}</h4>
                                                    <div className="space-y-1.5">
                                                        {app.statusHistory.map((sh, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[sh.status]?.split(' ')[0] || 'bg-gray-300'}`} />
                                                                <span className="font-semibold capitalize">{sh.status?.replace(/_/g, ' ')}</span>
                                                                <span className="text-gray-400">—</span>
                                                                <span className="text-gray-500">{fmtDateTime(sh.changedAt)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Interviews */}
                                            {app.interviews?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.interviews')}</h4>
                                                    <div className="space-y-2">
                                                        {app.interviews.map((iv, i) => (
                                                            <div key={i} className="bg-white p-3 rounded-lg border">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-bold text-purple-700">{t('pages.institute_job_details.applications.round')} {iv.round}</span>
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${iv.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{iv.status}</span>
                                                                    <span className="flex items-center gap-1 text-[10px] text-gray-500">{iv.type === 'video' ? <Video size={10} /> : <MapPin size={10} />}{iv.type}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-600">📅 {fmtDateTime(iv.scheduledAt)}</p>
                                                                {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"><ExternalLink size={10} />{t('pages.institute_job_details.applications.join')}</a>}
                                                                {iv.feedback && (
                                                                    <div className="mt-2 pt-2 border-t">
                                                                        <p className="text-xs text-gray-600"><strong>{t('pages.institute_job_details.applications.feedback')}:</strong> {iv.feedback}</p>
                                                                        {iv.rating && <div className="flex gap-0.5 mt-1">{[1, 2, 3, 4, 5].map(s => <span key={s} className={`text-sm ${s <= iv.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>)}</div>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {app.notes?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.notes')}</h4>
                                                    <div className="space-y-1.5">
                                                        {app.notes.map((n, i) => (
                                                            <div key={i} className="bg-white p-2.5 rounded-lg border text-xs">
                                                                <p className="text-gray-700">{n.content}</p>
                                                                <p className="text-gray-400 mt-1 text-[10px]">{fmtDateTime(n.createdAt)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Application Info */}
                                            <div>
                                                <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.application_info')}</h4>
                                                <div className="bg-white p-3 rounded-lg border space-y-1.5 text-xs">
                                                    {app.expectedSalary && <p><span className="text-gray-500">{t('pages.institute_job_details.applications.expected')}:</span> <strong>₹{(app.expectedSalary / 100000).toFixed(1)} LPA</strong></p>}
                                                    {app.noticePeriod && <p><span className="text-gray-500">{t('pages.institute_job_details.applications.notice')}:</span> <strong>{app.noticePeriod}</strong></p>}
                                                    {app.availableFrom && <p><span className="text-gray-500">{t('pages.institute_job_details.applications.available')}:</span> <strong>{fmtDate(app.availableFrom)}</strong></p>}
                                                    {app.source && <p><span className="text-gray-500">{t('pages.institute_job_details.applications.source')}:</span> <strong className="capitalize">{app.source}</strong></p>}
                                                    <p><span className="text-gray-500">{t('pages.institute_job_details.applications.applied')}:</span> <strong>{fmtDateTime(app.createdAt)}</strong></p>
                                                </div>
                                            </div>

                                            {/* Education */}
                                            {c.education?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.education')}</h4>
                                                    <div className="space-y-1.5">
                                                        {c.education.map((e, i) => (
                                                            <div key={i} className="bg-white p-2.5 rounded-lg border text-xs">
                                                                <p className="font-semibold text-gray-700">{e.degree} - {e.field}</p>
                                                                <p className="text-gray-500">{e.institution} ({e.passingYear})</p>
                                                                {e.percentage && <p className="text-gray-500">{e.percentage}%</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Experience */}
                                            {c.experience?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.institute_job_details.applications.experience')}</h4>
                                                    <div className="space-y-1.5">
                                                        {c.experience.map((ex, i) => (
                                                            <div key={i} className="bg-white p-2.5 rounded-lg border text-xs">
                                                                <p className="font-semibold text-gray-700">{ex.designation} {t('pages.institute_job_details.applications.at')} {ex.company}</p>
                                                                <p className="text-gray-500">{fmtDate(ex.from)} - {ex.isCurrent ? t('pages.institute_job_details.applications.present') : fmtDate(ex.to)}</p>
                                                                {ex.location && <p className="text-gray-500">📍 {ex.location}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-6">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">{t('pages.institute_job_details.applications.previous')}</button>
                            <span className="px-4 py-2 text-sm text-gray-600">{t('pages.institute_job_details.applications.page')} {page} {t('pages.institute_job_details.applications.of')} {pagination.pages}</span>
                            <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">{t('pages.institute_job_details.applications.next')}</button>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════ MODALS ═══════════ */}

            {/* ═══════════ MODALS ═══════════ */}

            {/* Schedule Interview Modal */}
            <Modal show={!!scheduleModal} onClose={() => { setScheduleModal(null); setInterviewErrors({}); }} title={t('pages.institute_job_details.modals.schedule_interview.title')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.schedule_interview.datetime')} *</label>
                        <input type="datetime-local" value={interviewForm.scheduledAt}
                            onChange={e => setInterviewForm(p => ({ ...p, scheduledAt: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent ${interviewErrors.scheduledAt ? 'border-red-500' : 'border-gray-300'}`} />
                        {interviewErrors.scheduledAt && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {interviewErrors.scheduledAt}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.schedule_interview.type')}</label>
                            <select value={interviewForm.type} onChange={e => setInterviewForm(p => ({ ...p, type: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent ${interviewErrors.type ? 'border-red-500' : 'border-gray-300'}`}>
                                <option value="video">{t('pages.institute_job_details.modals.schedule_interview.video_call')}</option>
                                <option value="phone">{t('pages.institute_job_details.modals.schedule_interview.phone')}</option>
                                <option value="in-person">{t('pages.institute_job_details.modals.schedule_interview.in_person')}</option>
                            </select>
                            {interviewErrors.type && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {interviewErrors.type}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.schedule_interview.round')} *</label>
                            <input type="number" min="1" max="10" value={interviewForm.round}
                                onChange={e => setInterviewForm(p => ({ ...p, round: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent ${interviewErrors.round ? 'border-red-500' : 'border-gray-300'}`} />
                            {interviewErrors.round && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {interviewErrors.round}</p>}
                        </div>
                    </div>
                    {interviewForm.type === 'video' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.schedule_interview.meeting_link')} *</label>
                            <input type="url" placeholder={t('pages.institute_job_details.modals.schedule_interview.meeting_link_placeholder')} value={interviewForm.meetingLink}
                                onChange={e => setInterviewForm(p => ({ ...p, meetingLink: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent ${interviewErrors.meetingLink ? 'border-red-500' : 'border-gray-300'}`} />
                            {interviewErrors.meetingLink && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {interviewErrors.meetingLink}</p>}
                        </div>
                    )}
                    {interviewForm.type === 'in-person' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.schedule_interview.location')} *</label>
                            <input type="text" placeholder={t('pages.institute_job_details.modals.schedule_interview.location_placeholder')} value={interviewForm.location}
                                onChange={e => setInterviewForm(p => ({ ...p, location: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent ${interviewErrors.location ? 'border-red-500' : 'border-gray-300'}`} />
                            {interviewErrors.location && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {interviewErrors.location}</p>}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.schedule_interview.interviewers')} *</label>
                        <input type="text" placeholder={t('pages.institute_job_details.modals.schedule_interview.interviewers_placeholder')} value={interviewForm.interviewers}
                            onChange={e => setInterviewForm(p => ({ ...p, interviewers: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent ${interviewErrors.interviewers ? 'border-red-500' : 'border-gray-300'}`} />
                        {interviewErrors.interviewers && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {interviewErrors.interviewers}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.schedule_interview.notes')}</label>
                        <textarea rows="3" placeholder={t('pages.institute_job_details.modals.schedule_interview.notes_placeholder')} value={interviewForm.notes}
                            onChange={e => setInterviewForm(p => ({ ...p, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent resize-none" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button onClick={() => { setScheduleModal(null); setInterviewErrors({}); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{t('pages.institute_job_details.modals.cancel')}</button>
                        <button onClick={handleScheduleInterview} disabled={actionLoading === scheduleModal || Object.keys(interviewErrors).length > 0}
                            className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {actionLoading === scheduleModal ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                            {t('pages.institute_job_details.modals.schedule_interview.schedule')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Interview Feedback Modal */}
            <Modal show={!!feedbackModal} onClose={() => setFeedbackModal(null)} title={t('pages.institute_job_details.modals.feedback.title')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.feedback.round')}</label>
                        <input type="number" min="1" value={feedbackForm.interviewIndex}
                            onChange={e => setFeedbackForm(p => ({ ...p, interviewIndex: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent" />
                        <p className="text-xs text-gray-400 mt-1">{t('pages.institute_job_details.modals.feedback.round_hint')}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('pages.institute_job_details.modals.feedback.rating')}</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(r => (
                                <button key={r} onClick={() => setFeedbackForm(p => ({ ...p, rating: r }))}
                                    className={`w-10 h-10 rounded-full text-lg font-bold transition-colors ${feedbackForm.rating >= r ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('pages.institute_job_details.modals.feedback.rating_hint')}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.feedback.status')}</label>
                        <select value={feedbackForm.status} onChange={e => setFeedbackForm(p => ({ ...p, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent">
                            <option value="completed">{t('pages.institute_job_details.modals.feedback.completed')}</option>
                            <option value="no_show">{t('pages.institute_job_details.modals.feedback.no_show')}</option>
                            <option value="rescheduled">{t('pages.institute_job_details.modals.feedback.rescheduled')}</option>
                            <option value="cancelled">{t('pages.institute_job_details.modals.feedback.cancelled')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.feedback.feedback')} *</label>
                        <textarea rows="4" placeholder={t('pages.institute_job_details.modals.feedback.feedback_placeholder')}
                            value={feedbackForm.feedback} onChange={e => setFeedbackForm(p => ({ ...p, feedback: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent resize-none" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button onClick={() => setFeedbackModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{t('pages.institute_job_details.modals.cancel')}</button>
                        <button onClick={handleFeedback} disabled={actionLoading === feedbackModal}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                            {actionLoading === feedbackModal ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                            {t('pages.institute_job_details.modals.feedback.submit')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Make Offer Modal */}
            <Modal show={!!offerModal} onClose={() => setOfferModal(null)} title={t('pages.institute_job_details.modals.offer.title')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.offer.salary')} *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input type="number" placeholder={t('pages.institute_job_details.modals.offer.salary_placeholder')} value={offerForm.salary}
                                onChange={e => setOfferForm(p => ({ ...p, salary: e.target.value }))}
                                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent" />
                        </div>
                        {offerForm.salary && <p className="text-xs text-gray-400 mt-1">≈ ₹{(offerForm.salary / 100000).toFixed(1)} LPA</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.offer.designation')} *</label>
                        <input type="text" placeholder={t('pages.institute_job_details.modals.offer.designation_placeholder')} value={offerForm.designation}
                            onChange={e => setOfferForm(p => ({ ...p, designation: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.offer.joining_date')} *</label>
                        <input type="date" value={offerForm.joiningDate}
                            onChange={e => setOfferForm(p => ({ ...p, joiningDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent" />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <button onClick={() => setOfferModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{t('pages.institute_job_details.modals.cancel')}</button>
                        <button onClick={handleOffer} disabled={actionLoading === offerModal}
                            className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                            {actionLoading === offerModal ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {t('pages.institute_job_details.modals.offer.send_offer')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Note Modal */}
            <Modal show={!!noteModal} onClose={() => setNoteModal(null)} title={t('pages.institute_job_details.modals.note.title')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('pages.institute_job_details.modals.note.note')}</label>
                        <textarea rows="4" placeholder={t('pages.institute_job_details.modals.note.placeholder')} value={noteContent}
                            onChange={e => setNoteContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480] focus:border-transparent resize-none" />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setNoteModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">{t('pages.institute_job_details.modals.cancel')}</button>
                        <button onClick={handleNote} disabled={actionLoading === noteModal || !noteContent.trim()}
                            className="px-5 py-2 bg-[#233480] text-white rounded-lg text-sm font-semibold hover:bg-[#1a2660] disabled:opacity-50 flex items-center gap-2">
                            {actionLoading === noteModal ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                            {t('pages.institute_job_details.modals.note.save')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InstitutionJobDetails;