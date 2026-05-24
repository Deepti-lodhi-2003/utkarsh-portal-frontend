import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../component/Footer';
import {
    FileText, Send, Clock, CheckCircle2, XCircle,
    Store, Trash2, Eye, Loader2, Package, X,
    AlertCircle, RefreshCw, Circle, Calendar,
    MessageSquare, IndianRupee, MapPin
} from 'lucide-react';
import { serviceRequestAPI } from '../../services/api';
import { useTranslation } from 'react-i18next';

// ══════════════════════════════════════════════
//  STATUS CONFIG (labels resolved via t() at render time)
// ══════════════════════════════════════════════
const STATUS_CONFIG = {
    pending: {
        labelKey: 'service_request_tracker.status.pending',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        icon: Send,
        step: 1,
    },
    viewed: {
        labelKey: 'service_request_tracker.status.viewed',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        icon: Eye,
        step: 2,
    },
    in_progress: {
        labelKey: 'service_request_tracker.status.in_progress',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        icon: RefreshCw,
        step: 3,
    },
    completed: {
        labelKey: 'service_request_tracker.status.completed',
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        dot: 'bg-green-500',
        icon: CheckCircle2,
        step: 4,
    },
    rejected: {
        labelKey: 'service_request_tracker.status.rejected',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        dot: 'bg-red-400',
        icon: XCircle,
        step: 0,
    },
    cancelled: {
        labelKey: 'service_request_tracker.status.cancelled',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
        icon: X,
        step: 0,
    },
};

const JOURNEY_STEP_KEYS = [
    { key: 'pending', labelKey: 'service_request_tracker.journey.sent', icon: Send },
    { key: 'viewed', labelKey: 'service_request_tracker.journey.viewed', icon: Eye },
    { key: 'in_progress', labelKey: 'service_request_tracker.journey.in_progress', icon: RefreshCw },
    { key: 'completed', labelKey: 'service_request_tracker.journey.completed', icon: CheckCircle2 },
];

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

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
//  JOURNEY TRACKER
// ══════════════════════════════════════════════
const JourneyTracker = ({ status }) => {
    const { t } = useTranslation();
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const isCancelled = status === 'rejected' || status === 'cancelled';
    const currentStep = cfg.step || 0;

    if (isCancelled) {
        return (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                <cfg.icon size={14} />
                {t(cfg.labelKey)}
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
const DetailModal = ({ req, onClose }) => {
    const { t } = useTranslation();
    if (!req) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-[#233480] to-[#1a2660] text-white px-6 py-4 flex justify-between items-start rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold leading-tight">{req.serviceName}</h3>
                        <p className="text-blue-200 text-xs mt-0.5">{t('service_request_tracker.modal.request_details')}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors mt-0.5">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status + Journey */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <StatusBadge status={req.status} />
                            <span className="text-xs text-gray-400">{t('service_request_tracker.modal.sent')} {fmtDate(req.createdAt)}</span>
                        </div>
                        <JourneyTracker status={req.status} />
                    </div>

                    {/* Vendor Info */}
                    {req.vendor && (
                        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {req.vendor.logo?.url
                                    ? <img src={req.vendor.logo.url} alt="" className="w-full h-full object-contain p-1" />
                                    : <Store size={20} className="text-gray-300" />
                                }
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('service_request_tracker.modal.vendor')}</p>
                                <h4 className="text-sm font-bold text-[#1e2a5a]">{req.vendor.organizationName || t('service_request_tracker.modal.vendor')}</h4>
                                {req.vendor.address?.city && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={10} /> {req.vendor.address.city}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Request Details */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: t('service_request_tracker.modal.budget'), value: req.budget ? `₹${Number(req.budget).toLocaleString()}` : t('service_request_tracker.modal.not_specified'), icon: IndianRupee },
                            { label: t('service_request_tracker.modal.timeline'), value: req.timeline || t('service_request_tracker.modal.not_specified'), icon: Clock },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                                    <Icon size={10} /> {label}
                                </p>
                                <p className="text-sm font-bold text-gray-800 mt-1">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Message */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare size={14} className="text-[#233480]" /> {t('service_request_tracker.modal.your_message')}
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap border border-gray-100">
                            {req.message}
                        </div>
                    </div>

                    {/* Vendor Note */}
                    {req.vendorNote && (
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 mb-2">{t('service_request_tracker.modal.note_from_vendor')}</h4>
                            <p className="text-sm text-blue-700">{req.vendorNote}</p>
                        </div>
                    )}

                    {/* Timeline History */}
                    {req.statusHistory?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Clock size={14} className="text-[#233480]" /> {t('service_request_tracker.modal.activity_log')}
                            </h4>
                            <div className="relative pl-4 border-l-2 border-gray-100 space-y-4">
                                {[...req.statusHistory].reverse().map((h, i) => {
                                    const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.pending;
                                    return (
                                        <div key={i} className="relative">
                                            <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`} />
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold ${cfg.color}`}>{t(cfg.labelKey)}</span>
                                                <span className="text-[10px] text-gray-400">{fmtTime(h.changedAt)}</span>
                                            </div>
                                            {h.note && <p className="text-xs text-gray-500 mt-0.5 bg-gray-50 p-2 rounded-lg inline-block">{h.note}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════
//  REQUEST CARD
// ══════════════════════════════════════════════
const RequestCard = ({ req, onViewDetail }) => {
    const { t } = useTranslation();
    const status = req.status || 'pending';
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    // Progress bar
    const progressMap = { pending: 25, viewed: 50, in_progress: 75, completed: 100, rejected: 0, cancelled: 0 };
    const progressPct = progressMap[status] ?? 0;

    return (
        <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border ${cfg.border} overflow-hidden group`}>
            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
                <div className={`h-full transition-all duration-700 rounded-full ${cfg.dot.replace('bg-', 'bg-')}`}
                    style={{ width: `${progressPct}%` }} />
            </div>

            <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Icon/Image */}
                    <div className="w-14 h-14 rounded-xl border-2 border-gray-100 flex items-center justify-center bg-[#233480]/5 flex-shrink-0 overflow-hidden">
                        {req.serviceImage
                            ? <img src={req.serviceImage} alt="" className="w-full h-full object-cover" />
                            : <Package size={24} className="text-[#233480]" />
                        }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                            <div>
                                <h3 className="text-base font-bold text-[#1e2a5a] truncate leading-tight">{req.serviceName}</h3>
                                {req.vendor && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Store size={10} /> {req.vendor.organizationName}
                                    </p>
                                )}
                            </div>
                            <StatusBadge status={status} />
                        </div>

                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-2mt-2 text-xs text-gray-500 mt-2">
                            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                                <Calendar size={10} className="text-[#233480]" /> {fmtDate(req.createdAt)}
                            </span>
                            {req.budget > 0 && (
                                <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg text-green-700 font-semibold">
                                    <IndianRupee size={10} /> {Number(req.budget).toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Message Preview */}
                        <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">
                            "{req.message}"
                        </p>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="hidden md:block">
                            <JourneyTracker status={status} />
                        </div>
                        <button onClick={() => onViewDetail(req)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#233480] text-white text-xs font-bold rounded-xl hover:bg-[#1a2660] transition-colors shadow-sm whitespace-nowrap">
                            <Eye size={13} /> {t('service_request_tracker.card.view_details')}
                        </button>
                    </div>
                </div>
                {/* Mobile Journey */}
                <div className="md:hidden mt-4 pt-3 border-t border-gray-100">
                    <JourneyTracker status={status} />
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════
const ServiceRequestTracker = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [selectedReq, setSelectedReq] = useState(null);

    const filters = [
        { value: '', label: t('service_request_tracker.filters.all') },
        { value: 'pending', label: t('service_request_tracker.filters.pending') },
        { value: 'viewed', label: t('service_request_tracker.filters.viewed') },
        { value: 'in_progress', label: t('service_request_tracker.filters.in_progress') },
        { value: 'completed', label: t('service_request_tracker.filters.completed') },
        { value: 'rejected', label: t('service_request_tracker.filters.rejected') },
    ];

    // Fetch Requests
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            setError('');
            try {
                const params = { page, limit: 10 };
                if (filter) params.status = filter;
                const res = await serviceRequestAPI.getMyRequests(params);
                const data = res.data.data;
                setRequests(data.requests || []);
                setPagination(data.pagination || { total: 0, pages: 1 });
            } catch (err) {
                console.error(err);
                setError('Failed to load service requests.');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [page, filter]);

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Banner */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                        {t('service_request_tracker.banner_title')}
                    </h1>
                    <p className="text-blue-200 text-sm mt-1 font-medium">{t('service_request_tracker.banner_subtitle')}</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full px-4 -mt-5 mb-12 relative z-20 flex-1">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    {filters.map(f => (
                        <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === f.value
                                ? 'bg-[#233480] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#233480]" />
                        <p className="text-gray-500 text-sm">{t('service_request_tracker.loading')}</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">{t('service_request_tracker.no_requests_title')}</h3>
                        <p className="text-gray-400 text-sm max-w-xs mt-1">
                            {filter
                                ? t('service_request_tracker.no_requests_filtered')
                                : t('service_request_tracker.no_requests_empty')}
                        </p>
                        {!filter && (
                            <button onClick={() => navigate('/vendor-directory')}
                                className="mt-4 px-5 py-2.5 bg-[#233480] text-white text-sm font-bold rounded-xl hover:bg-[#1a2660] transition-colors">
                                {t('service_request_tracker.browse_vendors')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map(req => (
                            <RequestCard key={req._id} req={req} onViewDetail={setSelectedReq} />
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-3 pt-6">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50">
                                    {t('service_request_tracker.pagination_prev')}
                                </button>
                                <span className="text-sm font-bold text-gray-600">{page} / {pagination.pages}</span>
                                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50">
                                    {t('service_request_tracker.pagination_next')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <DetailModal req={selectedReq} onClose={() => setSelectedReq(null)} />

            <Footer />
        </div>
    );
};

export default ServiceRequestTracker;