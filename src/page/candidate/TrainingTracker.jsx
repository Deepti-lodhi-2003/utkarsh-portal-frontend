import React, { useState, useEffect } from 'react';
import Footer from '../../component/Footer';
import {
    BookOpen, MapPin, Clock, Users, Award, Calendar,
    DollarSign, Loader2, X, ChevronDown, ChevronUp,
    CheckCircle2, Circle, AlertCircle, RefreshCw,
    FileText, Star, Eye, Send, GraduationCap, Wifi,
    Building2, Download, BadgeCheck
} from 'lucide-react';
import { trainingsAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

// ══════════════════════════════════════════════
//  STATUS CONFIG (labels resolved via t() at render time)
// ══════════════════════════════════════════════
const STATUS_CONFIG = {
    pending: {
        labelKey: 'training_tracker.status.pending',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        icon: AlertCircle,
        step: 1,
    },
    confirmed: {
        labelKey: 'training_tracker.status.confirmed',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        icon: CheckCircle2,
        step: 2,
    },
    in_progress: {
        labelKey: 'training_tracker.status.in_progress',
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        dot: 'bg-green-500',
        icon: RefreshCw,
        step: 3,
    },
    completed: {
        labelKey: 'training_tracker.status.completed',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        icon: CheckCircle2,
        step: 4,
    },
    dropped: {
        labelKey: 'training_tracker.status.dropped',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        dot: 'bg-red-400',
        icon: X,
        step: 0,
    },
    cancelled: {
        labelKey: 'training_tracker.status.cancelled',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
        icon: X,
        step: 0,
    },
};

const JOURNEY_STEP_KEYS = [
    { key: 'pending', labelKey: 'training_tracker.journey.applied', icon: Circle },
    { key: 'confirmed', labelKey: 'training_tracker.journey.confirmed', icon: CheckCircle2 },
    { key: 'in_progress', labelKey: 'training_tracker.journey.training', icon: BookOpen },
    { key: 'completed', labelKey: 'training_tracker.journey.completed', icon: GraduationCap },
];

const MODE_CONFIG = {
    online: { labelKey: 'training_tracker.mode.online', bg: 'bg-cyan-100', text: 'text-cyan-700', icon: Wifi },
    offline: { labelKey: 'training_tracker.mode.offline', bg: 'bg-orange-100', text: 'text-orange-700', icon: Building2 },
    hybrid: { labelKey: 'training_tracker.mode.hybrid', bg: 'bg-violet-100', text: 'text-violet-700', icon: Building2 },
};

const CATEGORY_MAP = {
    it_software: 'IT & Software',
    manufacturing: 'Manufacturing',
    healthcare: 'Healthcare',
    retail: 'Retail',
    education: 'Education',
    construction: 'Construction',
    hospitality: 'Hospitality',
    automotive: 'Automotive',
    textile: 'Textile',
    banking: 'Banking',
    agriculture: 'Agriculture',
    other: 'Other',
};

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
const fmtDate = (d, tbd) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : tbd;

const fmtFees = (fees, freeLabel) =>
    fees?.isFree ? freeLabel : fees?.amount ? `₹${fees.amount.toLocaleString()}` : '—';

// ══════════════════════════════════════════════
//  STATUS BADGE
// ══════════════════════════════════════════════
const StatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
            {t(cfg.labelKey)}
        </span>
    );
};

// ══════════════════════════════════════════════
//  MODE BADGE
// ══════════════════════════════════════════════
const ModeBadge = ({ mode }) => {
    const { t } = useTranslation();
    const cfg = MODE_CONFIG[mode] || MODE_CONFIG.offline;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cfg.bg} ${cfg.text}`}>
            {t(cfg.labelKey)}
        </span>
    );
};

// ══════════════════════════════════════════════
//  JOURNEY TRACKER
// ══════════════════════════════════════════════
const JourneyTracker = ({ status }) => {
    const { t } = useTranslation();
    const cfg = STATUS_CONFIG[status];
    const isCancelled = status === 'dropped' || status === 'cancelled';
    const currentStep = cfg?.step ?? 0;

    if (isCancelled) {
        return (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].color} ${STATUS_CONFIG[status].border} border`}>
                <X size={14} />
                {t(STATUS_CONFIG[status].labelKey)}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {JOURNEY_STEP_KEYS.map((step, idx) => {
                const stepNum = idx + 1;
                const done = currentStep >= stepNum;
                const active = currentStep === stepNum;
                const Icon = step.icon;

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${done
                                    ? 'bg-[#233480] border-[#233480] text-white'
                                    : 'bg-white border-gray-200 text-gray-400'
                                } ${active ? 'ring-2 ring-[#233480]/30 ring-offset-1' : ''}`}>
                                <Icon size={12} />
                            </div>
                            <span className={`text-[9px] font-bold whitespace-nowrap ${done ? 'text-[#233480]' : 'text-gray-400'}`}>
                                {t(step.labelKey)}
                            </span>
                        </div>
                        {idx < JOURNEY_STEP_KEYS.length - 1 && (
                            <div className={`w-6 h-0.5 mb-3 rounded-full transition-all ${currentStep > stepNum ? 'bg-[#233480]' : 'bg-gray-200'
                                }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// ══════════════════════════════════════════════
//  DETAIL MODAL
// ══════════════════════════════════════════════
const DetailModal = ({ enrollment, onClose }) => {
    const { t } = useTranslation();
    if (!enrollment) return null;
    const training = enrollment.training || {};
    const certificate = enrollment.certificate;

    const tbd = t('training_tracker.date_tbd');
    const freeLabel = t('training_tracker.fees.free');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-[#233480] to-[#1a2660] text-white px-6 py-4 flex justify-between items-start rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold leading-tight">{training.title || t('training_tracker.modal.training_details')}</h3>
                        <p className="text-blue-200 text-xs mt-0.5">{t('training_tracker.modal.enrollment_details')}</p>
                    </div>
                    <button onClick={onClose}
                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors mt-0.5">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Status + Journey */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <StatusBadge status={enrollment.status} />
                            <span className="text-xs text-gray-400">
                                {t('training_tracker.modal.enrolled')} {fmtDate(enrollment.enrolledAt, tbd)}
                            </span>
                        </div>
                        <JourneyTracker status={enrollment.status} />
                    </div>

                    {/* Training Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Calendar, label: t('training_tracker.modal.start_date'), value: fmtDate(training.startDate, tbd) },
                            { icon: Calendar, label: t('training_tracker.modal.end_date'), value: fmtDate(training.endDate, tbd) },
                            {
                                icon: Clock, label: t('training_tracker.modal.duration'),
                                value: training.duration ? `${training.duration.value} ${training.duration.unit}` : t('training_tracker.na')
                            },
                            { icon: DollarSign, label: t('training_tracker.modal.fees'), value: fmtFees(training.fees, freeLabel) },
                            { icon: Users, label: t('training_tracker.modal.total_seats'), value: training.totalSeats ?? '—' },
                            {
                                icon: MapPin, label: t('training_tracker.modal.location'),
                                value: training.venue?.city || (training.mode === 'online' ? t('training_tracker.online') : '—')
                            },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#233480]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon size={14} className="text-[#233480]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                                    <p className="text-sm font-bold text-gray-800">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Skills Covered */}
                    {training.skillsCovered?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Star size={14} className="text-[#233480]" /> {t('training_tracker.modal.skills_covered')}
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {training.skillsCovered.map((s, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-[#233480]/8 border border-[#233480]/15 text-[#233480] rounded-lg text-xs font-semibold">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certification */}
                    {training.certification?.isProvided && (
                        <div className={`rounded-xl p-4 border flex items-start gap-3 ${certificate?.isIssued
                                ? 'bg-green-50 border-green-200'
                                : 'bg-amber-50 border-amber-200'
                            }`}>
                            <Award size={20} className={certificate?.isIssued ? 'text-green-600 mt-0.5' : 'text-amber-600 mt-0.5'} />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">
                                    {training.certification.certificateName || t('training_tracker.card.certificate_issued')}
                                </p>
                                {certificate?.isIssued ? (
                                    <div>
                                        <p className="text-xs text-green-700 font-medium mt-0.5">
                                            {t('training_tracker.modal.certificate_issued_on')} {fmtDate(certificate.issuedAt, tbd)}
                                        </p>
                                        {certificate.url && (
                                            <a href={certificate.url} target="_blank" rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">
                                                <Download size={12} /> {t('training_tracker.modal.download_certificate')}
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        {t('training_tracker.modal.certificate_pending')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Placement */}
                    {training.placementAssistance && training.placementDetails && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-[#233480] mb-2 flex items-center gap-2">
                                <BadgeCheck size={14} /> {t('training_tracker.modal.placement_assistance')}
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                {training.placementDetails.placementRate && (
                                    <div>
                                        <p className="text-gray-500">{t('training_tracker.modal.placement_rate')}</p>
                                        <p className="font-bold text-[#233480]">{training.placementDetails.placementRate}%</p>
                                    </div>
                                )}
                                {training.placementDetails.averageSalary && (
                                    <div>
                                        <p className="text-gray-500">{t('training_tracker.modal.avg_salary')}</p>
                                        <p className="font-bold text-[#233480]">₹{(training.placementDetails.averageSalary / 100000).toFixed(1)} LPA</p>
                                    </div>
                                )}
                            </div>
                            {training.placementDetails.companies?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-gray-500 text-xs mb-1">{t('training_tracker.modal.hiring_companies')}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {training.placementDetails.companies.map((c, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 rounded text-[10px] font-bold">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Institution */}
                    {training.institution && (
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-[#233480]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {training.institution.logo?.url
                                    ? <img src={training.institution.logo.url} alt="" className="w-full h-full object-contain p-1" />
                                    : <Building2 size={16} className="text-[#233480]" />
                                }
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{training.institution.organizationName}</p>
                                {training.institution.address?.city && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={10} /> {training.institution.address.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════
//  ENROLLMENT CARD
// ══════════════════════════════════════════════
const EnrollmentCard = ({ enrollment, onViewDetail }) => {
    const { t } = useTranslation();
    const training = enrollment.training || {};
    const status = enrollment.status || 'pending';
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    // Progress bar width
    const progressMap = { pending: 10, confirmed: 30, in_progress: 60, completed: 100, dropped: 0, cancelled: 0 };
    const progressPct = progressMap[status] ?? 0;

    // Certificate
    const hasCert = enrollment.certificate?.isIssued;

    return (
        <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border ${cfg.border} overflow-hidden`}>

            {/* Progress bar on top */}
            <div className="h-1 bg-gray-100">
                <div
                    className={`h-full transition-all duration-700 rounded-full ${status === 'completed' ? 'bg-purple-500' :
                            status === 'in_progress' ? 'bg-green-500' :
                                status === 'confirmed' ? 'bg-blue-500' :
                                    status === 'dropped' || status === 'cancelled' ? 'bg-red-400' :
                                        'bg-amber-400'
                        }`}
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">

                    {/* Left: Logo + Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Logo */}
                        <div className="w-14 h-14 rounded-xl border-2 border-gray-100 flex items-center justify-center bg-[#233480]/5 flex-shrink-0 overflow-hidden">
                            {training.banner
                                ? <img src={training.banner} alt="" className="w-full h-full object-cover" />
                                : training.institution?.logo?.url
                                    ? <img src={training.institution.logo.url} alt="" className="w-full h-full object-contain p-1" />
                                    : <BookOpen size={24} className="text-[#233480]" />
                            }
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-[#1e2a5a] leading-tight mb-1.5 truncate">
                                {training.title || t('training_tracker.card.training_program')}
                            </h3>

                            {/* Badges row */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                <StatusBadge status={status} />
                                {training.mode && <ModeBadge mode={training.mode} />}
                                {training.fees?.isFree && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">{t('training_tracker.card.free')}</span>
                                )}
                                {hasCert && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                                        <Award size={9} /> {t('training_tracker.card.certificate_issued')}
                                    </span>
                                )}
                            </div>

                            {/* Meta info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={11} className="text-[#233480] flex-shrink-0" />
                                    <span>{fmtDate(training.startDate, t('training_tracker.date_tbd'))}</span>
                                </div>
                                {training.duration && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={11} className="text-[#233480] flex-shrink-0" />
                                        <span>{training.duration.value} {training.duration.unit}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <DollarSign size={11} className="text-[#233480] flex-shrink-0" />
                                    <span>{fmtFees(training.fees, t('training_tracker.fees.free'))}</span>
                                </div>
                                {(training.venue?.city || training.mode === 'online') && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={11} className="text-[#233480] flex-shrink-0" />
                                        <span>{training.venue?.city || t('training_tracker.online')}</span>
                                    </div>
                                )}
                            </div>

                            {/* Institution name */}
                            {training.institution?.organizationName && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <Building2 size={10} />
                                    {training.institution.organizationName}
                                    {training.category && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold">
                                            {CATEGORY_MAP[training.category] || training.category}
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Journey + Action */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        {/* Compact journey */}
                        <div className="hidden md:block">
                            <JourneyTracker status={status} />
                        </div>

                        {/* View Details button */}
                        <button
                            onClick={() => onViewDetail(enrollment)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#233480] text-white text-xs font-bold rounded-xl hover:bg-[#1a2660] transition-colors shadow-sm">
                            <Eye size={13} /> {t('training_tracker.card.view_details')}
                        </button>
                    </div>
                </div>

                {/* Mobile: journey shown below */}
                <div className="md:hidden mt-4 pt-3 border-t border-gray-100">
                    <JourneyTracker status={status} />
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════
//  STATS BAR
// ══════════════════════════════════════════════
const StatsBar = ({ enrollments }) => {
    const { t } = useTranslation();
    const counts = enrollments.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
    }, {});

    const stats = [
        { label: t('training_tracker.stats.total'), value: enrollments.length, color: 'text-[#233480]', bg: 'bg-[#233480]/10' },
        { label: t('training_tracker.stats.in_progress'), value: counts.in_progress || 0, color: 'text-green-700', bg: 'bg-green-50' },
        { label: t('training_tracker.stats.confirmed'), value: counts.confirmed || 0, color: 'text-blue-700', bg: 'bg-blue-50' },
        { label: t('training_tracker.stats.completed'), value: counts.completed || 0, color: 'text-purple-700', bg: 'bg-purple-50' },
        { label: t('training_tracker.stats.certificates'), value: enrollments.filter(e => e.certificate?.isIssued).length, color: 'text-amber-700', bg: 'bg-amber-50' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {stats.map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-white/60`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
            ))}
        </div>
    );
};

// ══════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════
const TrainingTracker = () => {
    const { t } = useTranslation();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);

    const statusFilters = [
        { value: '', label: t('training_tracker.filters.all') },
        { value: 'pending', label: t('training_tracker.filters.pending') },
        { value: 'confirmed', label: t('training_tracker.filters.confirmed') },
        { value: 'in_progress', label: t('training_tracker.filters.in_progress') },
        { value: 'completed', label: t('training_tracker.filters.completed') },
        { value: 'dropped', label: t('training_tracker.filters.dropped') },
        { value: 'cancelled', label: t('training_tracker.filters.cancelled') },
    ];

    // ── Fetch Enrollments ──
    useEffect(() => {
        fetchEnrollments();
    }, [page, activeFilter]);

    const fetchEnrollments = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, limit: 10 };
            if (activeFilter) params.status = activeFilter;

            const res = await trainingsAPI.getMyEnrollments(params);
            const data = res.data.data;

            setEnrollments(data.enrollments || []);
            setPagination(data.pagination || { total: (data.enrollments || []).length, pages: 1 });
        } catch (err) {
            console.error('Fetch enrollments error:', err);
            setError(err.response?.data?.message || 'Failed to load your enrollments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (val) => {
        setActiveFilter(val);
        setPage(1);
    };

    // ════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">

            {/* ── Banner ── */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-wide">
                        {t('training_tracker.banner_title')}
                    </h1>
                    <p className="text-blue-200 text-sm mt-1 font-medium">{t('training_tracker.banner_subtitle')}</p>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="max-w-5xl mx-auto w-full px-4 -mt-5 mb-12 relative z-20 flex-1">

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </span>
                        <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-full" aria-label={t('training_tracker.error_dismiss')}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Stats - show when we have data */}
                {!loading && enrollments.length > 0 && activeFilter === '' && page === 1 && (
                    <StatsBar enrollments={enrollments} />
                )}

                {/* ── Filter + Refresh row ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map(f => (
                            <button
                                key={f.value}
                                onClick={() => handleFilterChange(f.value)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${activeFilter === f.value
                                        ? 'bg-[#233480] text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchEnrollments}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50">
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        {t('training_tracker.refresh')}
                    </button>
                </div>

                {/* ── Enrollment List ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#233480]" />
                        <p className="text-gray-500 text-sm font-medium">{t('training_tracker.loading')}</p>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-20 h-20 bg-[#233480]/8 rounded-full flex items-center justify-center mb-4">
                            <GraduationCap size={36} className="text-[#233480]/40" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">{t('training_tracker.no_trainings_title')}</h3>
                        <p className="text-gray-400 text-sm max-w-xs">
                            {activeFilter
                                ? t('training_tracker.no_trainings_filtered', { status: statusFilters.find(f => f.value === activeFilter)?.label })
                                : t('training_tracker.no_trainings_empty')}
                        </p>
                        {activeFilter && (
                            <button
                                onClick={() => handleFilterChange('')}
                                className="mt-4 px-5 py-2 bg-[#233480] text-white text-sm font-bold rounded-xl hover:bg-[#1a2660] transition-colors">
                                {t('training_tracker.view_all_enrollments')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pagination.total > 0 && (
                            <p className="text-xs text-gray-400 font-medium">
                                {t('training_tracker.showing', { count: enrollments.length, total: pagination.total })}
                            </p>
                        )}

                        {enrollments.map(enrollment => (
                            <EnrollmentCard
                                key={enrollment._id}
                                enrollment={enrollment}
                                onViewDetail={setSelectedEnrollment}
                            />
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-3 pt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                                    {t('training_tracker.pagination_prev')}
                                </button>
                                <span className="px-4 py-2 text-sm font-bold text-gray-600">
                                    {page} / {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                                    {t('training_tracker.pagination_next')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {selectedEnrollment && (
                <DetailModal
                    enrollment={selectedEnrollment}
                    onClose={() => setSelectedEnrollment(null)}
                />
            )}

            <Footer />
        </div>
    );
};

export default TrainingTracker;