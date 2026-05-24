// src/page/institution/MyServices.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Footer from '../../component/Footer';
import {
    FileText, Plus, Edit, Trash2, Loader2, X, Package, Tag,
    Eye, Store, AlertCircle, Search, IndianRupee, Clock,
    Check, BarChart2, BadgeCheck, ShieldAlert, Star,
    Building2, RefreshCw, MapPin, Send, MessageSquare,
    Calendar, CheckCircle2, XCircle, Wrench
} from 'lucide-react';
import { vendorAPI, serviceRequestAPI } from '../../services/api';
import ServiceRequestModal from './ServiceRequestModal';

// ─────────────────────────────────────────
//  REQUEST STATUS CONFIG
// ─────────────────────────────────────────
const REQ_STATUS = {
    pending: { labelKey: 'my_vendor_services.status.pending', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
    viewed: { labelKey: 'my_vendor_services.status.viewed', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
    in_progress: { labelKey: 'my_vendor_services.status.in_progress', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
    completed: { labelKey: 'my_vendor_services.status.completed', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
    rejected: { labelKey: 'my_vendor_services.status.rejected', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-400' },
    cancelled: { labelKey: 'my_vendor_services.status.cancelled', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ─────────────────────────────────────────
//  REQUEST STATUS BADGE
// ─────────────────────────────────────────
const ReqStatusBadge = ({ status }) => {
    const { t } = useTranslation();
    const c = REQ_STATUS[status] || REQ_STATUS.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${c.bg} ${c.color} ${c.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{t(c.labelKey)}
        </span>
    );
};

// ─────────────────────────────────────────
//  REQUEST DETAIL MODAL (vendor side)
// ─────────────────────────────────────────
const RequestDetailModal = ({ req: sr, onClose, onStatusUpdate, updating }) => {
    const { t } = useTranslation();
    const [note, setNote] = React.useState(sr?.vendorNote || '');
    if (!sr) return null;
    const canAct = !['completed', 'rejected', 'cancelled'].includes(sr.status);
    const ACTIONS = {
        pending: [{ status: 'viewed', label: 'actions.mark_viewed', cls: 'bg-blue-500 hover:bg-blue-600' },
        { status: 'rejected', label: 'actions.reject', cls: 'bg-red-500 hover:bg-red-600' }],
        viewed: [{ status: 'in_progress', label: 'actions.start_working', cls: 'bg-green-500 hover:bg-green-600' },
        { status: 'rejected', label: 'actions.reject', cls: 'bg-red-500 hover:bg-red-600' }],
        in_progress: [{ status: 'completed', label: 'actions.mark_complete', cls: 'bg-purple-500 hover:bg-purple-600' },
        { status: 'rejected', label: 'actions.reject', cls: 'bg-red-500 hover:bg-red-600' }],
    };
    const actions = ACTIONS[sr.status] || [];
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-gradient-to-r from-[#233480] to-[#1a2660] text-white px-6 py-4 flex justify-between items-start rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold">{sr.serviceName}</h3>
                        <p className="text-blue-200 text-xs mt-0.5">{t('my_vendor_services.modal_titles.requester_info')} - {sr.requesterName}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-2 bg-gray-50 rounded-xl p-3">
                        <ReqStatusBadge status={sr.status} />
                        <span className="text-xs text-gray-400">Received: {fmtDate(sr.createdAt)}</span>
                    </div>
                    {/* Requester */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">{t('my_vendor_services.modal_titles.requester_info')}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">{t('my_vendor_services.modal_titles.name')}</p><p className="font-bold text-gray-800">{sr.requesterName}</p></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">{t('my_vendor_services.modal_titles.mobile')}</p><p className="font-bold text-gray-800">{sr.requesterMobile}</p></div>
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">{t('my_vendor_services.modal_titles.email')}</p><p className="font-semibold text-gray-700 truncate">{sr.requesterEmail}</p></div>
                            {sr.organizationName && <div><p className="text-[10px] text-gray-400 font-bold uppercase">{t('my_vendor_services.modal_titles.organization')}</p><p className="font-bold text-gray-800">{sr.organizationName}</p></div>}
                        </div>
                    </div>
                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3">
                        {[{ label: t('my_vendor_services.modal_titles.budget'), value: sr.maxBudget > 0 ? `₹${sr.maxBudget.toLocaleString()}` : 'Not specified' },
                        { label: t('my_vendor_services.modal_titles.expected_by'), value: sr.expectedDate ? fmtDate(sr.expectedDate) : 'Not specified' }
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
                                <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><MessageSquare size={13} className="text-[#233480]" /> {t('my_vendor_services.modal_titles.message')}</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">{sr.message}</p>
                    </div>
                    {sr.requirements && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-2">{t('my_vendor_services.modal_titles.requirements')}</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">{sr.requirements}</p>
                        </div>
                    )}
                    {/* Timeline */}
                    {sr.statusHistory?.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Clock size={13} className="text-[#233480]" /> {t('my_vendor_services.modal_titles.timeline')}</h4>
                            <div className="space-y-2">
                                {[...sr.statusHistory].reverse().map((h, i) => {
                                    const cfg = REQ_STATUS[h.status] || REQ_STATUS.pending;
                                    return (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-xs font-bold ${cfg.color}`}>{t(cfg.labelKey)}</span>
                                                    <span className="text-[10px] text-gray-400">{fmtTime(h.changedAt)}</span>
                                                </div>
                                                {h.note && <p className="text-xs text-gray-500 mt-0.5">{h.note}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* Actions */}
                    {canAct && actions.length > 0 && (
                        <div className="pt-3 border-t border-gray-100 space-y-3">
                            <h4 className="text-sm font-bold text-gray-700">{t('my_vendor_services.modal_titles.update_status')}</h4>
                            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                                placeholder={t('my_vendor_services.modal_titles.add_note')}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#233480]/30 focus:border-[#233480]" />
                            <div className="flex flex-wrap gap-2">
                                {actions.map(a => (
                                    <button key={a.status} disabled={updating}
                                        onClick={() => onStatusUpdate(sr._id, a.status, note)}
                                        className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl flex items-center gap-2 disabled:opacity-60 ${a.cls}`}>
                                        {updating ? <Loader2 size={13} className="animate-spin" /> : null}{t(`my_vendor_services.${a.label}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
//  REQUEST ROW CARD
// ─────────────────────────────────────────
const RequestRow = ({ sr, onView, onQuickUpdate, updatingId }) => {
    const { t } = useTranslation();
    const cfg = REQ_STATUS[sr.status] || REQ_STATUS.pending;
    const NEXT = { pending: 'viewed', viewed: 'in_progress', in_progress: 'completed' };
    const NLBL = { pending: 'actions.mark_viewed', viewed: 'actions.start_working', in_progress: 'actions.mark_complete' };
    const NCLS = { pending: 'bg-blue-500 hover:bg-blue-600', viewed: 'bg-green-500 hover:bg-green-600', in_progress: 'bg-purple-500 hover:bg-purple-600' };
    const canAct = !['completed', 'rejected', 'cancelled'].includes(sr.status);
    return (
        <div className={`bg-white rounded-xl border ${cfg.border} p-4 hover:shadow-sm transition-all`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-bold text-[#1e2a5a] truncate">{sr.serviceName}</h4>
                        <ReqStatusBadge status={sr.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{sr.requesterName}</span>
                        <span>{sr.requesterMobile}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {fmtDate(sr.createdAt)}</span>
                        {sr.maxBudget > 0 && <span className="text-green-600 font-semibold flex items-center gap-0.5"><IndianRupee size={10} />{sr.maxBudget.toLocaleString()}</span>}
                    </div>
                    {sr.vendorNote && <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><MessageSquare size={9} />{sr.vendorNote.length > 70 ? sr.vendorNote.slice(0, 70) + '...' : sr.vendorNote}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {canAct && NEXT[sr.status] && (
                        <button onClick={() => onQuickUpdate(sr._id, NEXT[sr.status], '')}
                            disabled={updatingId === sr._id}
                            className={`px-3 py-1.5 text-white text-[10px] font-black rounded-lg flex items-center gap-1 disabled:opacity-60 ${NCLS[sr.status]}`}>
                            {updatingId === sr._id ? <Loader2 size={10} className="animate-spin" /> : null}{t(`my_vendor_services.${NLBL[sr.status]}`)}
                        </button>
                    )}
                    <button onClick={() => onView(sr)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#233480] text-white text-[10px] font-black rounded-lg hover:bg-[#1a2660]">
                        <Eye size={11} /> {t('common.view_details')}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
//  STATS CARD (for Reports tab)
// ─────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`${bg} rounded-xl p-4 border border-white/60`}>
        <div className="flex items-start justify-between">
            <div>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
            <div className={`w-9 h-9 ${bg.replace('50', '100').replace('/8', '/20')} rounded-lg flex items-center justify-center`}>
                <Icon size={18} className={color} />
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────
//  SERVICE CARD
// ─────────────────────────────────────────
const ServiceCard = ({ service, onEdit, onDelete }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden group">
            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-[#233480] to-blue-400" />

            <div className="p-5 flex items-start gap-4">
                {/* Image / Icon */}
                <div className="w-16 h-16 rounded-xl border-2 border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 bg-[#233480]/5">
                    {service.image?.url
                        ? <img src={service.image.url} alt="" className="w-full h-full object-cover" />
                        : <Package size={26} className="text-[#233480]/50" />
                    }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-[#1e2a5a] leading-tight truncate mb-1.5">
                        {service.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {service.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                                <Tag size={9} /> {service.category}
                            </span>
                        )}
                        {service.price > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                <IndianRupee size={11} />
                                {Number(service.price).toLocaleString()}
                                {service.unit && (
                                    <span className="text-gray-400 font-normal ml-0.5">/{service.unit}</span>
                                )}
                            </span>
                        )}
                    </div>

                    {service.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {service.description}
                        </p>
                    )}

                    {service.createdAt && (
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                            <Clock size={10} />
                            {t('my_vendor_services.table.added')} {new Date(service.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0">
                    <button onClick={() => onEdit(service)} title="Edit"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <Edit size={15} />
                    </button>
                    <button onClick={() => onDelete(service._id)} title="Delete"
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────
const MyServices = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [vendor, setVendor] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Modal
    const [modal, setModal] = useState({ open: false, service: null });
    const [submitting, setSubmitting] = useState(false);

    // Delete
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Tab
    const [activeTab, setActiveTab] = useState('services');

    // Requests state
    const [requests, setRequests] = useState([]);
    const [reqLoading, setReqLoading] = useState(false);
    const [reqFilter, setReqFilter] = useState('');
    const [reqPage, setReqPage] = useState(1);
    const [reqPagination, setReqPagination] = useState({ total: 0, pages: 1 });
    const [statusCounts, setStatusCounts] = useState({});
    const [selectedReq, setSelectedReq] = useState(null);
    const [updatingReq, setUpdatingReq] = useState(null);

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // ── Fetch ──
    useEffect(() => { fetchVendorData(); }, []);

    const fetchVendorData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await vendorAPI.getProfile();
            const data = res.data.data;
            setVendor(data);
            setServices(data.products || []);
        } catch (err) {
            if (err.response?.status === 404) {
                setVendor(null);
            } else {
                setError(err.response?.data?.message || t('my_vendor_services.messages.load_failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Fetch Requests ──
    useEffect(() => {
        if (activeTab === 'requests') fetchRequests();
    }, [activeTab, reqFilter, reqPage]);

    const fetchRequests = async () => {
        setReqLoading(true);
        try {
            const params = { page: reqPage, limit: 10 };
            if (reqFilter) params.status = reqFilter;
            const res = await serviceRequestAPI.getIncoming(params);
            const data = res.data.data;
            setRequests(data.requests || []);
            setStatusCounts(data.statusCounts || {});
            setReqPagination(data.pagination || { total: (data.requests || []).length, pages: 1 });
        } catch (err) {
            setError(err.response?.data?.message || t('my_vendor_services.messages.req_load_failed'));
        } finally { setReqLoading(false); }
    };

    // ── Update request status ──
    const handleStatusUpdate = async (reqId, status, note) => {
        setUpdatingReq(reqId);
        try {
            await serviceRequestAPI.updateStatus(reqId, { status, note });
            const patch = (r) => r._id === reqId
                ? {
                    ...r, status, vendorNote: note || r.vendorNote,
                    statusHistory: [...(r.statusHistory || []), { status, note, changedAt: new Date() }]
                }
                : r;
            setRequests(prev => prev.map(patch));
            if (selectedReq?._id === reqId) setSelectedReq(prev => patch(prev));
            setSuccessMsg(t('my_vendor_services.messages.status_updated', { status: t(REQ_STATUS[status]?.labelKey) }));
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('my_vendor_services.messages.update_failed'));
        } finally { setUpdatingReq(null); }
    };

    // ── Add / Edit Service ──
    const handleSubmitService = async (formData) => {
        setSubmitting(true);
        setError('');
        try {
            if (modal.service) {
                await vendorAPI.updateProduct(modal.service._id, formData);
                setSuccessMsg(t('my_vendor_services.messages.service_updated'));
            } else {
                await vendorAPI.addProduct(formData);
                setSuccessMsg(t('my_vendor_services.messages.service_added'));
            }
            setModal({ open: false, service: null });
            fetchVendorData();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('my_vendor_services.messages.save_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Delete ──
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await vendorAPI.deleteProduct(deleteId);
            setServices(prev => prev.filter(s => s._id !== deleteId));
            setDeleteId(null);
            setSuccessMsg(t('my_vendor_services.messages.service_deleted'));
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || t('my_vendor_services.messages.delete_failed'));
            setDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    // ── Filter ──
    const filteredServices = services.filter(s => {
        const matchSearch = !searchTerm ||
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = !filterCategory || s.category === filterCategory;
        return matchSearch && matchCat;
    });

    const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

    // ── Reports stats (derived from vendor profile) ──
    const reportStats = vendor ? [
        {
            icon: Package, label: t('my_vendor_services.total_services'),
            value: services.length,
            color: 'text-[#233480]', bg: 'bg-[#233480]/8'
        },
        {
            icon: BadgeCheck, label: t('my_vendor_services.verified'),
            value: vendor.isVerified ? 'Yes' : 'No',
            color: vendor.isVerified ? 'text-green-700' : 'text-amber-700',
            bg: vendor.isVerified ? 'bg-green-50' : 'bg-amber-50'
        },
        {
            icon: Star, label: t('my_vendor_services.rating'),
            value: vendor.rating?.average ? `${vendor.rating.average.toFixed(1)} ⭐` : 'N/A',
            color: 'text-amber-700', bg: 'bg-amber-50'
        },
        {
            icon: Building2, label: t('my_vendor_services.business_type'),
            value: vendor.businessType?.replace('_', ' ') || '—',
            color: 'text-blue-700', bg: 'bg-blue-50'
        },
        {
            icon: MapPin, label: t('my_vendor_services.service_areas'),
            value: vendor.serviceAreas?.length || 0,
            color: 'text-purple-700', bg: 'bg-purple-50'
        },
        {
            icon: Star, label: t('my_vendor_services.total_reviews'),
            value: vendor.rating?.count || 0,
            color: 'text-rose-700', bg: 'bg-rose-50'
        },
    ] : [];

    // ─────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#233480]" />
                <p className="text-sm text-gray-500 font-medium">{t('my_vendor_services.messages.loading_services')}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">

            {/* ── Banner ── */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-wide">
                        {t('my_vendor_services.title')}
                    </h1>
                    <p className="text-blue-200 text-sm mt-1 font-medium">{t('my_vendor_services.subtitle')}</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full px-4 -mt-5 mb-12 relative z-20 flex-1">

                {/* ── Modal ── */}
                <ServiceRequestModal
                    isOpen={modal.open}
                    onClose={() => setModal({ open: false, service: null })}
                    onSubmit={handleSubmitService}
                    service={modal.service}
                    loading={submitting}
                />

                {/* ── Delete Confirm ── */}
                {deleteId && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={22} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[#1e2a5a] mb-1 text-center">{t('my_vendor_services.modal_titles.delete_service')}</h3>
                            <p className="text-gray-500 mb-5 text-sm text-center">{t('my_vendor_services.modal_titles.delete_confirm')}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
                                    {t('my_vendor_services.modal_titles.cancel')}
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-60">
                                    {deleting ? <><Loader2 size={14} className="animate-spin" /> {t('my_vendor_services.modal_titles.deleting')}</> : <><Trash2 size={14} /> {t('my_vendor_services.modal_titles.delete')}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Success ── */}
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><Check size={16} /> {successMsg}</span>
                        <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-green-100 rounded-full"><X size={14} /></button>
                    </div>
                )}

                {/* ── Error ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
                        <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-full"><X size={14} /></button>
                    </div>
                )}

                {/* ── No Vendor Profile ── */}
                {!vendor ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-20 h-20 bg-[#233480]/8 rounded-full flex items-center justify-center mb-4">
                            <Store size={36} className="text-[#233480]/40" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1e2a5a] mb-1">{t('my_vendor_services.messages.no_profile')}</h3>
                        <p className="text-gray-400 text-sm mb-5">{t('my_vendor_services.messages.create_profile_first')}</p>
                        <button onClick={() => navigate('/post-vendors')}
                            className="px-6 py-2.5 bg-[#233480] text-white text-sm font-bold rounded-xl hover:bg-[#1a2660] flex items-center gap-2 transition-colors shadow-sm">
                            <Plus size={16} /> {t('my_vendor_services.messages.create_profile_btn')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">

                        {/* ── Vendor Summary Card ── */}
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    {vendor.logo?.url ? (
                                        <img src={vendor.logo.url} alt={vendor.businessName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#233480] to-blue-500 flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                                            {vendor.businessName?.charAt(0)?.toUpperCase() || 'V'}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-base font-bold text-[#1e2a5a]">{vendor.businessName}</h2>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${vendor.isVerified
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {vendor.isVerified ? <><BadgeCheck size={9} /> {t('my_vendor_services.verified')}</> : <><ShieldAlert size={9} /> {t('my_vendor_services.pending_verification')}</>}
                                            </span>
                                            <span className="text-xs text-gray-400">{services.length} {t('my_vendor_services.table.service')}</span>
                                            {(statusCounts.pending || 0) > 0 && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black animate-pulse">
                                                    {t('my_vendor_services.new_request', { count: statusCounts.pending, plural: statusCounts.pending > 1 ? 's' : '' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={fetchVendorData}
                                        className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
                                        <RefreshCw size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Tabs ── */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                            {/* Tab Headers */}
                            <div className="flex border-b border-gray-100">
                                {[
                                    { key: 'services', label: `${t('my_vendor_services.tabs.services')} (${services.length})`, icon: Package },
                                    { key: 'requests', label: t('my_vendor_services.tabs.requests'), icon: Send },
                                    { key: 'reports', label: t('my_vendor_services.tabs.stats'), icon: BarChart2 },
                                ].map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className={`flex-1 sm:flex-none px-5 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 relative ${activeTab === tab.key
                                            ? 'border-[#233480] text-[#233480] bg-[#233480]/3'
                                            : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                            }`}>
                                        <tab.icon size={15} /> {tab.label}
                                        {tab.key === 'requests' && (statusCounts.pending || 0) > 0 && (
                                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* ════════ TAB: Services ════════ */}
                            {activeTab === 'services' && (
                                <div className="p-5">

                                    {/* Toolbar */}
                                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                                        <div className="relative flex-1">
                                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                                placeholder={t('my_vendor_services.search_placeholder')}
                                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#233480]/30 focus:border-[#233480] transition-all" />
                                        </div>
                                        {categories.length > 0 && (
                                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#233480]/30 focus:border-[#233480] transition-all">
                                                <option value="">{t('my_vendor_services.all_categories')}</option>
                                                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                            </select>
                                        )}
                                        <button onClick={() => setModal({ open: true, service: null })}
                                            className="px-5 py-2.5 bg-[#233480] text-white text-sm font-bold rounded-xl hover:bg-[#1a2660] flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                                            <Plus size={15} /> {t('my_vendor_services.add_service')}
                                        </button>
                                    </div>

                                    {/* Service List */}
                                    {filteredServices.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-16 h-16 bg-[#233480]/8 rounded-full flex items-center justify-center mb-3">
                                                <Package size={28} className="text-[#233480]/40" />
                                            </div>
                                            <p className="text-gray-500 text-sm font-semibold">
                                                {searchTerm || filterCategory ? t('my_vendor_services.no_services_match') : t('my_vendor_services.no_services_added')}
                                            </p>
                                            {!searchTerm && !filterCategory && (
                                                <button onClick={() => setModal({ open: true, service: null })}
                                                    className="mt-3 text-sm text-[#233480] font-bold hover:underline flex items-center gap-1">
                                                    <Plus size={14} /> {t('my_vendor_services.add_first_service')}
                                                </button>
                                            )}
                                            {(searchTerm || filterCategory) && (
                                                <button onClick={() => { setSearchTerm(''); setFilterCategory(''); }}
                                                    className="mt-3 text-xs text-[#233480] font-bold hover:underline">
                                                    {t('my_vendor_services.clear_filters')}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs text-gray-400 font-medium">{t('my_vendor_services.service_found', { count: filteredServices.length })}</p>
                                            {filteredServices.map(service => (
                                                <ServiceCard
                                                    key={service._id}
                                                    service={service}
                                                    onEdit={(s) => setModal({ open: true, service: s })}
                                                    onDelete={(id) => setDeleteId(id)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ════════ TAB: Requests ════════ */}
                            {activeTab === 'requests' && (
                                <div className="p-5">
                                    {/* Modals */}
                                    {selectedReq && (
                                        <RequestDetailModal
                                            req={selectedReq}
                                            onClose={() => setSelectedReq(null)}
                                            onStatusUpdate={handleStatusUpdate}
                                            updating={updatingReq === selectedReq?._id}
                                        />
                                    )}

                                    {/* Filter + Refresh */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { value: '', label: `${t('my_vendor_services.messages.view_all')} (${Object.values(statusCounts).reduce((a, b) => a + b, 0)})` },
                                                { value: 'pending', label: `${t('my_vendor_services.status.pending')} (${statusCounts.pending || 0})` },
                                                { value: 'viewed', label: `${t('my_vendor_services.status.viewed')} (${statusCounts.viewed || 0})` },
                                                { value: 'in_progress', label: `${t('my_vendor_services.status.in_progress')} (${statusCounts.in_progress || 0})` },
                                                { value: 'completed', label: `${t('my_vendor_services.status.completed')} (${statusCounts.completed || 0})` },
                                                { value: 'rejected', label: `${t('my_vendor_services.status.rejected')} (${statusCounts.rejected || 0})` },
                                            ].map(f => (
                                                <button key={f.value} onClick={() => { setReqFilter(f.value); setReqPage(1); }}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${reqFilter === f.value
                                                        ? 'bg-[#233480] text-white shadow-sm'
                                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                        }`}>{f.label}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={fetchRequests} disabled={reqLoading}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-50 disabled:opacity-50">
                                            <RefreshCw size={12} className={reqLoading ? 'animate-spin' : ''} /> {t('my_vendor_services.refresh')}
                                        </button>
                                    </div>

                                    {reqLoading ? (
                                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-[#233480]" />
                                            <p className="text-gray-500 text-sm">{t('my_vendor_services.messages.loading_requests')}</p>
                                        </div>
                                    ) : requests.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-16 h-16 bg-[#233480]/8 rounded-full flex items-center justify-center mb-3">
                                                <Send size={28} className="text-[#233480]/40" />
                                            </div>
                                            <p className="text-gray-500 text-sm font-semibold">
                                                {reqFilter ? t('my_vendor_services.messages.no_req_status') : t('my_vendor_services.messages.no_req_yet')}
                                            </p>
                                            {reqFilter && (
                                                <button onClick={() => setReqFilter('')} className="mt-3 text-xs text-[#233480] font-bold hover:underline">{t('my_vendor_services.messages.view_all')}</button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-xs text-gray-400 font-medium">{t('my_vendor_services.new_request', { count: reqPagination.total, plural: reqPagination.total !== 1 ? 's' : '' })}</p>
                                            {requests.map(sr => (
                                                <RequestRow key={sr._id} sr={sr}
                                                    onView={setSelectedReq}
                                                    onQuickUpdate={handleStatusUpdate}
                                                    updatingId={updatingReq} />
                                            ))}
                                            {reqPagination.pages > 1 && (
                                                <div className="flex justify-center items-center gap-3 pt-4">
                                                    <button onClick={() => setReqPage(p => Math.max(1, p - 1))} disabled={reqPage === 1}
                                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                                                    <span className="text-sm font-bold text-gray-600">{reqPage}/{reqPagination.pages}</span>
                                                    <button onClick={() => setReqPage(p => Math.min(reqPagination.pages, p + 1))} disabled={reqPage === reqPagination.pages}
                                                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-gray-50">Next →</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ════════ TAB: Reports ════════ */}
                            {activeTab === 'reports' && (
                                <div className="p-5 space-y-6">

                                    {/* Stats Grid */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                                            <BarChart2 size={14} className="text-[#233480]" /> {t('my_vendor_services.table.vendor_overview')}
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {reportStats.map(s => (
                                                <StatCard key={s.label} {...s} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Services Breakdown Table */}
                                    {services.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                                                <Package size={14} className="text-[#233480]" /> {t('my_vendor_services.table.breakdown')}
                                            </h3>
                                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                                <table className="min-w-full divide-y divide-gray-100">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            {[t('my_vendor_services.table.service'), t('my_vendor_services.table.category'), t('my_vendor_services.table.price'), t('my_vendor_services.table.added')].map(h => (
                                                                <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-50">
                                                        {services.map(s => (
                                                            <tr key={s._id} className="hover:bg-gray-50/60 transition-colors">
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        {s.image?.url
                                                                            ? <img src={s.image.url} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                                                                            : <div className="w-7 h-7 bg-[#233480]/10 rounded-lg flex items-center justify-center flex-shrink-0"><Package size={12} className="text-[#233480]" /></div>
                                                                        }
                                                                        <span className="text-sm font-bold text-[#1e2a5a] truncate max-w-[160px]">{s.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {s.category
                                                                        ? <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">{s.category}</span>
                                                                        : <span className="text-gray-300 text-xs">—</span>
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {s.price > 0
                                                                        ? <span className="text-sm font-bold text-green-700">₹{Number(s.price).toLocaleString()}{s.unit ? ` / ${s.unit}` : ''}</span>
                                                                        : <span className="text-gray-400 text-xs">Not set</span>
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-gray-400">
                                                                    {s.createdAt
                                                                        ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                        : '—'
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Service Areas */}
                                    {vendor.serviceAreas?.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                                                <MapPin size={14} className="text-[#233480]" /> Service Areas
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {vendor.serviceAreas.map((area, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#233480]/8 text-[#233480] rounded-xl text-xs font-bold border border-[#233480]/15">
                                                        <MapPin size={10} /> {area.city || area.district || area.state}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Registration Details */}
                                    {vendor.registrationDetails && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                                                <FileText size={14} className="text-[#233480]" /> Registration Details
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {vendor.registrationDetails.gstNumber && (
                                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">GST Number</p>
                                                        <p className="text-sm font-bold text-gray-700">{vendor.registrationDetails.gstNumber}</p>
                                                    </div>
                                                )}
                                                {vendor.registrationDetails.panNumber && (
                                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">PAN Number</p>
                                                        <p className="text-sm font-bold text-gray-700">{vendor.registrationDetails.panNumber}</p>
                                                    </div>
                                                )}
                                                {vendor.registrationDetails.udyamNumber && (
                                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Udyam Number</p>
                                                        <p className="text-sm font-bold text-gray-700">{vendor.registrationDetails.udyamNumber}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {services.length === 0 && !vendor.serviceAreas?.length && (
                                        <div className="text-center py-10">
                                            <BarChart2 size={36} className="mx-auto text-gray-200 mb-3" />
                                            <p className="text-gray-400 text-sm">Add services to see detailed reports</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MyServices;