import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Footer from '../../component/Footer';
import {
    BookOpen, MapPin, Clock, Users, Eye, Edit, Trash2,
    Loader2, X, Calendar, DollarSign, Plus, Award, Save, Check, Upload, Image
} from 'lucide-react';
import { trainingsAPI } from '../../services/api';

const MyTrainings = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Delete
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // View Detail
    const [viewTraining, setViewTraining] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Edit
    const [editTraining, setEditTraining] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editSaving, setEditSaving] = useState(false);
    const [editBannerFile, setEditBannerFile] = useState(null);
    const [editBannerPreview, setEditBannerPreview] = useState(null);
    const editBannerRef = useRef(null);

    // Enrollments
    const [enrollmentsModal, setEnrollmentsModal] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
    const [enrollmentStatusUpdating, setEnrollmentStatusUpdating] = useState(null);

    // Filters & Pagination
    const [activeFilter, setActiveFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    const statusFilters = [
        { value: '', label: t('my_trainings.filters.all') },
        { value: 'draft', label: t('my_trainings.filters.draft') },
        { value: 'upcoming', label: t('my_trainings.filters.upcoming') },
        { value: 'ongoing', label: t('my_trainings.filters.ongoing') },
        { value: 'completed', label: t('my_trainings.filters.completed') },
        { value: 'cancelled', label: t('my_trainings.filters.cancelled') },
    ];

    useEffect(() => {
        fetchTrainings();
    }, [page, activeFilter]);

    // ════════════════════════════════════
    //  FETCH TRAININGS
    // ════════════════════════════════════
    const fetchTrainings = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, limit: 10 };
            if (activeFilter) params.status = activeFilter;

            const res = await trainingsAPI.getMyTrainings(params);
            const data = res.data.data;

            const mapped = (data.trainings || []).map(training => ({
                id: training._id,
                title: training.title,
                slug: training.slug,
                category: training.category || '',
                mode: training.mode || 'offline',
                startDate: training.startDate,
                endDate: training.endDate,
                duration: training.duration ? `${training.duration.value} ${training.duration.unit}` : t('my_trainings.na'),
                durationObj: training.duration || { value: 1, unit: 'months' },
                fees: training.fees?.isFree ? t('my_trainings.free') : `₹${(training.fees?.amount || 0).toLocaleString()}`,
                feesObj: training.fees || { amount: 0, isFree: false },
                isFree: training.fees?.isFree || false,
                totalSeats: training.totalSeats || 0,
                enrollmentCount: training.enrollmentCount || 0,
                availableSeats: training.availableSeats || 0,
                status: training.status || 'draft',
                isApproved: training.isApproved || false,
                certification: training.certification?.isProvided || false,
                placementAssistance: training.placementAssistance || false,
                venue: training.venue?.city || '',
                banner: training.banner?.url || null
            }));

            setTrainings(mapped);
            setPagination(data.pagination || { total: mapped.length, pages: 1 });
        } catch (err) {
            console.error('Fetch trainings error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    // ════════════════════════════════════
    //  VIEW TRAINING DETAIL
    // ════════════════════════════════════
    const handleView = async (trainingId) => {
        setViewLoading(true);
        setViewTraining(null);
        try {
            const res = await trainingsAPI.getById(trainingId);
            const data = res.data.data;
            setViewTraining(data.training || data);
        } catch (err) {
            console.error('View training error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.view_failed'));
        } finally {
            setViewLoading(false);
        }
    };

    // ════════════════════════════════════
    //  EDIT TRAINING
    // ════════════════════════════════════
    const handleOpenEdit = async (trainingId) => {
        setViewLoading(true);
        try {
            const res = await trainingsAPI.getById(trainingId);
            const training = res.data.data.training || res.data.data;

            setEditForm({
                title: training.title || '',
                description: training.description || '',
                startDate: training.startDate ? training.startDate.split('T')[0] : '',
                endDate: training.endDate ? training.endDate.split('T')[0] : '',
                totalSeats: training.totalSeats || 30,
                feesAmount: training.fees?.amount || 0,
                isFree: training.fees?.isFree || false,
                scholarshipAvailable: training.fees?.scholarshipAvailable || false,
                scholarshipDetails: training.fees?.scholarshipDetails || '',
                mode: training.mode || 'offline',
                status: training.status || 'upcoming',
                durationValue: training.duration?.value || 1,
                durationUnit: training.duration?.unit || 'months',
                venueCity: training.venue?.city || ''
            });
            setEditTraining(training);
            setEditBannerPreview(training.banner?.url || null);
            setEditBannerFile(null);
        } catch (err) {
            console.error('Edit fetch error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.edit_load_failed'));
        } finally {
            setViewLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError(t('my_trainings.errors.banner_type'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError(t('my_trainings.errors.banner_size'));
            return;
        }
        setEditBannerFile(file);
        setEditBannerPreview(URL.createObjectURL(file));
        setError('');
    };

    const removeEditBanner = () => {
        setEditBannerFile(null);
        setEditBannerPreview(editTraining?.banner?.url || null);
        if (editBannerRef.current) editBannerRef.current.value = '';
    };

    const handleEditSave = async () => {
        if (!editTraining?._id) return;
        setEditSaving(true);
        setError('');

        try {
            const payload = {
                title: editForm.title,
                description: editForm.description,
                startDate: editForm.startDate || undefined,
                endDate: editForm.endDate || undefined,
                totalSeats: Number(editForm.totalSeats),
                mode: editForm.mode,
                duration: {
                    value: Number(editForm.durationValue),
                    unit: editForm.durationUnit
                },
                fees: {
                    amount: editForm.isFree ? 0 : Number(editForm.feesAmount),
                    isFree: editForm.isFree,
                    scholarshipAvailable: editForm.scholarshipAvailable,
                    scholarshipDetails: editForm.scholarshipDetails
                },
                venue: editForm.mode !== 'online' ? {
                    city: editForm.venueCity
                } : undefined
            };

            await trainingsAPI.update(editTraining._id, payload);

            // Upload banner if changed
            if (editBannerFile) {
                const fd = new FormData();
                fd.append('banner', editBannerFile);
                try {
                    await trainingsAPI.uploadBanner(editTraining._id, fd);
                } catch (err) {
                    console.error('Banner upload failed:', err);
                }
            }

            setSuccessMsg(t('my_trainings.update_success'));
            setEditTraining(null);
            setEditBannerFile(null);
            setEditBannerPreview(null);
            fetchTrainings(); // Refresh list

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Edit save error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.update_failed'));
        } finally {
            setEditSaving(false);
        }
    };

    // ════════════════════════════════════
    //  DELETE TRAINING
    // ════════════════════════════════════
    const handleDelete = async (id) => {
        setDeleting(true);
        setError('');
        try {
            await trainingsAPI.delete(id);
            setTrainings(prev => prev.filter(t => t.id !== id));
            setDeleteConfirm(null);
            setSuccessMsg(t('my_trainings.delete_success'));
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Delete training error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.delete_failed'));
            setDeleteConfirm(null);
        } finally {
            setDeleting(false);
        }
    };

    // ════════════════════════════════════
    //  ENROLLMENTS
    // ════════════════════════════════════
    const handleOpenEnrollments = async (trainingId) => {
        setEnrollmentsModal(trainingId);
        setEnrollmentsLoading(true);
        setEnrollments([]);
        try {
            const res = await trainingsAPI.getEnrollments(trainingId, { page: 1, limit: 50 });
            setEnrollments(res.data.data.enrollments || []);
        } catch (err) {
            console.error('Enrollments fetch error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.enrollments_failed'));
        } finally {
            setEnrollmentsLoading(false);
        }
    };

    const handleUpdateEnrollmentStatus = async (enrollmentId, newStatus) => {
        setEnrollmentStatusUpdating(enrollmentId);
        try {
            await trainingsAPI.updateEnrollmentStatus(enrollmentId, { status: newStatus });

            // Update local state
            setEnrollments(prev =>
                prev.map(e => e._id === enrollmentId ? { ...e, status: newStatus } : e)
            );
            setSuccessMsg(t('my_trainings.enrollment_status_updated', { status: newStatus }));
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Update enrollment error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.enrollment_update_failed'));
        } finally {
            setEnrollmentStatusUpdating(null);
        }
    };

    const handleIssueCertificate = async (enrollmentId) => {
        setEnrollmentStatusUpdating(enrollmentId);
        try {
            const fd = new FormData();
            await trainingsAPI.issueCertificate(enrollmentId, fd);

            setEnrollments(prev =>
                prev.map(e => e._id === enrollmentId
                    ? { ...e, certificate: { isIssued: true } }
                    : e)
            );
            setSuccessMsg(t('my_trainings.certificate_issued'));
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Issue cert error:', err);
            setError(err.response?.data?.message || t('my_trainings.errors.certificate_failed'));
        } finally {
            setEnrollmentStatusUpdating(null);
        }
    };

    // ════════════════════════════════════
    //  HELPER COMPONENTS
    // ════════════════════════════════════
    const getStatusBadge = (status, isApproved) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-600',
            upcoming: 'bg-blue-100 text-blue-700',
            ongoing: 'bg-green-100 text-green-700',
            completed: 'bg-purple-100 text-purple-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return (
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.draft}`}>
                    {t(`my_trainings.statuses.${status}`, status.charAt(0).toUpperCase() + status.slice(1))}
                </span>
                {!isApproved && status !== 'draft' && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold">
                        {t('my_trainings.pending_approval')}
                    </span>
                )}
            </div>
        );
    };

    const getCategoryLabel = (val) => {
        const map = {
            it_software: t('my_trainings.categories.it_software'),
            manufacturing: t('my_trainings.categories.manufacturing'),
            healthcare: t('my_trainings.categories.healthcare'),
            retail: t('my_trainings.categories.retail'),
            education: t('my_trainings.categories.education'),
            construction: t('my_trainings.categories.construction'),
            other: t('my_trainings.categories.other')
        };
        return map[val] || val;
    };

    const getModeBadge = (mode) => {
        const styles = {
            online: 'bg-cyan-100 text-cyan-700',
            offline: 'bg-orange-100 text-orange-700',
            hybrid: 'bg-violet-100 text-violet-700'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[mode] || ''}`}>
                {mode}
            </span>
        );
    };

    const getEnrollmentStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            in_progress: 'bg-green-100 text-green-700',
            completed: 'bg-purple-100 text-purple-700',
            dropped: 'bg-red-100 text-red-700',
            cancelled: 'bg-gray-100 text-gray-600'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {status?.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    // ════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Banner */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-wider text-center px-4">
                    {t('my_trainings.title')}
                </h1>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20 flex-1">

                {/* Success */}
                {successMsg && (
                    <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                        <span className="flex items-center gap-2"><Check size={16} /> {successMsg}</span>
                        <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X size={16} /></button>
                    </div>
                )}

                {/* ══════════ DELETE MODAL ══════════ */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-[#1e2a5a] mb-2">{t('my_trainings.delete_modal.title')}</h3>
                            <p className="text-gray-600 mb-4">{t('my_trainings.delete_modal.message')}</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">{t('my_trainings.delete_modal.cancel')}</button>
                                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2">
                                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    {deleting ? t('my_trainings.delete_modal.deleting') : t('my_trainings.delete_modal.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ VIEW DETAIL MODAL ══════════ */}
                {(viewTraining || viewLoading) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-[#233480] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                                <h3 className="text-lg font-bold">{t('my_trainings.view_modal.title')}</h3>
                                <button onClick={() => setViewTraining(null)} className="hover:bg-white/20 p-1 rounded">
                                    <X size={20} />
                                </button>
                            </div>

                            {viewLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#233480]" />
                                </div>
                            ) : viewTraining && (
                                <div className="p-6 space-y-5">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#1e2a5a]">{viewTraining.title}</h2>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {getModeBadge(viewTraining.mode)}
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${viewTraining.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {viewTraining.status}
                                            </span>
                                            {viewTraining.fees?.isFree && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">{t('my_trainings.free').toUpperCase()}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-700 mb-1">{t('my_trainings.view_modal.description')}</h4>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewTraining.description}</p>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('my_trainings.view_modal.category')}</p>
                                            <p className="text-sm font-semibold text-gray-700">{getCategoryLabel(viewTraining.category)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('my_trainings.view_modal.duration')}</p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {viewTraining.duration ? `${viewTraining.duration.value} ${viewTraining.duration.unit}` : t('my_trainings.na')}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('my_trainings.view_modal.start_date')}</p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {viewTraining.startDate ? new Date(viewTraining.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : t('my_trainings.tbd')}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('my_trainings.view_modal.fees')}</p>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {viewTraining.fees?.isFree ? t('my_trainings.free') : `₹${(viewTraining.fees?.amount || 0).toLocaleString()}`}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('my_trainings.view_modal.seats')}</p>
                                            <p className="text-sm font-semibold text-gray-700">{viewTraining.totalSeats || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{t('my_trainings.view_modal.venue')}</p>
                                            <p className="text-sm font-semibold text-gray-700">{viewTraining.venue?.city || t('my_trainings.online')}</p>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {viewTraining.skillsCovered?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700 mb-2">{t('my_trainings.view_modal.skills_covered')}</h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {viewTraining.skillsCovered.map((s, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-[#233480]/10 text-[#233480] rounded text-xs font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Curriculum */}
                                    {viewTraining.curriculum?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700 mb-2">{t('my_trainings.view_modal.curriculum')}</h4>
                                            <div className="space-y-2">
                                                {viewTraining.curriculum.map((mod, i) => (
                                                    <div key={i} className="bg-gray-50 p-3 rounded border-l-3 border-[#233480]">
                                                        <p className="text-sm font-bold text-[#1e2a5a]">{mod.module}</p>
                                                        {mod.topics?.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-1">{mod.topics.join(', ')}</p>
                                                        )}
                                                        {mod.duration && <p className="text-[10px] text-gray-400 mt-1">{t('my_trainings.view_modal.duration_label')}: {mod.duration}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Trainers */}
                                    {viewTraining.trainers?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-700 mb-2">{t('my_trainings.view_modal.trainers')}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {viewTraining.trainers.map((tr, i) => (
                                                    <div key={i} className="bg-gray-50 p-3 rounded">
                                                        <p className="text-sm font-bold text-[#1e2a5a]">{tr.name}</p>
                                                        <p className="text-xs text-gray-500">{tr.designation} • {tr.experience}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════════ EDIT MODAL ══════════ */}
                {editTraining && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 bg-[#233480] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                                <h3 className="text-lg font-bold">{t('my_trainings.edit_modal.title')}</h3>
                                <button onClick={() => setEditTraining(null)} className="hover:bg-white/20 p-1 rounded">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.title_label')} *</label>
                                    <input type="text" name="title" value={editForm.title || ''} onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm" />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.description')}</label>
                                    <textarea name="description" rows="4" value={editForm.description || ''} onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm resize-none" />
                                </div>

                                {/* Banner Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-2">{t('my_trainings.edit_modal.banner')}</label>
                                    {editBannerPreview ? (
                                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                            <img src={editBannerPreview} alt="Banner" className="w-full h-40 object-cover" />
                                            <button
                                                type="button"
                                                onClick={removeEditBanner}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                            {editBannerFile && (
                                                <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded font-bold">
                                                    NEW
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => editBannerRef.current?.click()}
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#233480] hover:bg-blue-50/30 transition-all"
                                        >
                                            <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500 font-medium">{t('my_trainings.edit_modal.click_upload')}</p>
                                            <p className="text-xs text-gray-400 mt-1">{t('my_trainings.edit_modal.banner_hint')}</p>
                                        </div>
                                    )}
                                    <input
                                        ref={editBannerRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditBannerChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.start_date')}</label>
                                        <input type="date" name="startDate" value={editForm.startDate || ''} onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.end_date')}</label>
                                        <input type="date" name="endDate" value={editForm.endDate || ''} onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm" />
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.duration')}</label>
                                        <input type="number" name="durationValue" value={editForm.durationValue || ''} onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.unit')}</label>
                                        <select name="durationUnit" value={editForm.durationUnit || 'months'} onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm">
                                            <option value="days">{t('my_trainings.duration_units.days')}</option>
                                            <option value="weeks">{t('my_trainings.duration_units.weeks')}</option>
                                            <option value="months">{t('my_trainings.duration_units.months')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.mode')}</label>
                                        <select name="mode" value={editForm.mode || ''} onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm">
                                            <option value="online">{t('my_trainings.modes.online')}</option>
                                            <option value="offline">{t('my_trainings.modes.offline')}</option>
                                            <option value="hybrid">{t('my_trainings.modes.hybrid')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Seats & Fees */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.total_seats')}</label>
                                        <input type="number" name="totalSeats" value={editForm.totalSeats || ''} onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.fees')}</label>
                                        <input type="number" name="feesAmount" value={editForm.isFree ? '' : (editForm.feesAmount || '')}
                                            onChange={handleEditChange} disabled={editForm.isFree}
                                            className={`w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm ${editForm.isFree ? 'opacity-50' : ''}`} />
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="isFree" checked={editForm.isFree || false} onChange={handleEditChange}
                                            className="w-4 h-4 rounded border-gray-300 text-[#233480]" />
                                        <span className="text-sm text-gray-700">{t('my_trainings.edit_modal.free_training')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="scholarshipAvailable" checked={editForm.scholarshipAvailable || false} onChange={handleEditChange}
                                            className="w-4 h-4 rounded border-gray-300 text-[#233480]" />
                                        <span className="text-sm text-gray-700">{t('my_trainings.edit_modal.scholarship_available')}</span>
                                    </label>
                                </div>

                                {editForm.scholarshipAvailable && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.scholarship_details')}</label>
                                        <input type="text" name="scholarshipDetails" value={editForm.scholarshipDetails || ''} onChange={handleEditChange}
                                            placeholder={t('my_trainings.edit_modal.scholarship_placeholder')}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm" />
                                    </div>
                                )}

                                {/* Venue (if not online) */}
                                {editForm.mode !== 'online' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 mb-1">{t('my_trainings.edit_modal.city')}</label>
                                        <input type="text" name="venueCity" value={editForm.venueCity || ''} onChange={handleEditChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-sm" />
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button onClick={() => setEditTraining(null)}
                                        className="px-5 py-2.5 border border-gray-300 rounded text-gray-600 text-sm font-bold hover:bg-gray-50">
                                        {t('my_trainings.edit_modal.cancel')}
                                    </button>
                                    <button onClick={handleEditSave} disabled={editSaving}
                                        className={`px-6 py-2.5 bg-[#233480] text-white text-sm font-bold rounded hover:bg-[#1a2660] flex items-center gap-2 ${editSaving ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                        {editSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        {editSaving ? t('my_trainings.edit_modal.saving') : t('my_trainings.edit_modal.save')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ ENROLLMENTS MODAL ══════════ */}
                {enrollmentsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 bg-[#233480] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                                <h3 className="text-lg font-bold">{t('my_trainings.enrollments_modal.title', { count: enrollments.length })}</h3>
                                <button onClick={() => setEnrollmentsModal(null)} className="hover:bg-white/20 p-1 rounded">
                                    <X size={20} />
                                </button>
                            </div>

                            {enrollmentsLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-[#233480]" />
                                </div>
                            ) : enrollments.length === 0 ? (
                                <div className="text-center py-20">
                                    <Users size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-400">{t('my_trainings.enrollments_modal.no_enrollments')}</p>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t('my_trainings.enrollments_modal.candidate')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t('my_trainings.enrollments_modal.contact')}</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t('my_trainings.enrollments_modal.status')}</th>

                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{t('my_trainings.enrollments_modal.enrolled')}</th>
                                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">{t('my_trainings.enrollments_modal.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {enrollments.map((enr) => (
                                                    <tr key={enr._id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-bold text-[#1e2a5a]">
                                                                {enr.candidate?.user?.name || 'N/A'}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {enr.candidate?.currentAddress?.city || ''}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-xs text-gray-600">{enr.candidate?.user?.email || ''}</p>
                                                            <p className="text-xs text-gray-500">{enr.candidate?.user?.mobile || ''}</p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {getEnrollmentStatusBadge(enr.status)}
                                                        </td>
                                                        {/* <td className="px-4 py-3">
                                                            <span className={`text-xs font-bold ${enr.payment?.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                                {enr.payment?.status?.toUpperCase() || 'N/A'}
                                                            </span>
                                                            {enr.payment?.amount > 0 && (
                                                                <p className="text-[10px] text-gray-400">₹{enr.payment.amount.toLocaleString()}</p>
                                                            )}
                                                        </td> */}
                                                        <td className="px-4 py-3 text-xs text-gray-500">
                                                            {enr.enrolledAt
                                                                ? new Date(enr.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1 flex-wrap">
                                                                {/* Status Flow: pending → confirmed → in_progress → completed */}
                                                                {enr.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleUpdateEnrollmentStatus(enr._id, 'confirmed')}
                                                                        disabled={enrollmentStatusUpdating === enr._id}
                                                                        className="px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded hover:bg-blue-600 disabled:opacity-50">
                                                                        {enrollmentStatusUpdating === enr._id ? '...' : t('my_trainings.enrollments_modal.confirm')}
                                                                    </button>
                                                                )}
                                                                {enr.status === 'confirmed' && (
                                                                    <button
                                                                        onClick={() => handleUpdateEnrollmentStatus(enr._id, 'in_progress')}
                                                                        disabled={enrollmentStatusUpdating === enr._id}
                                                                        className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded hover:bg-green-600 disabled:opacity-50">
                                                                        {enrollmentStatusUpdating === enr._id ? '...' : t('my_trainings.enrollments_modal.start')}
                                                                    </button>
                                                                )}
                                                                {enr.status === 'in_progress' && (
                                                                    <button
                                                                        onClick={() => handleUpdateEnrollmentStatus(enr._id, 'completed')}
                                                                        disabled={enrollmentStatusUpdating === enr._id}
                                                                        className="px-2 py-1 bg-purple-500 text-white text-[10px] font-bold rounded hover:bg-purple-600 disabled:opacity-50">
                                                                        {enrollmentStatusUpdating === enr._id ? '...' : t('my_trainings.enrollments_modal.complete')}
                                                                    </button>
                                                                )}
                                                                {enr.status === 'completed' && !enr.certificate?.isIssued && (
                                                                    <button
                                                                        onClick={() => handleIssueCertificate(enr._id)}
                                                                        disabled={enrollmentStatusUpdating === enr._id}
                                                                        className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1">
                                                                        <Award size={10} />
                                                                        {enrollmentStatusUpdating === enr._id ? '...' : t('my_trainings.enrollments_modal.certificate')}
                                                                    </button>
                                                                )}
                                                                {enr.certificate?.isIssued && (
                                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded flex items-center gap-1">
                                                                        <Award size={10} /> {t('my_trainings.enrollments_modal.issued')}
                                                                    </span>
                                                                )}
                                                                {['pending', 'confirmed'].includes(enr.status) && (
                                                                    <button
                                                                        onClick={() => handleUpdateEnrollmentStatus(enr._id, 'cancelled')}
                                                                        disabled={enrollmentStatusUpdating === enr._id}
                                                                        className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded hover:bg-red-200 disabled:opacity-50">
                                                                        {t('my_trainings.enrollments_modal.cancel')}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════════ HEADER + FILTERS ══════════ */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map(f => (
                            <button key={f.value} onClick={() => { setActiveFilter(f.value); setPage(1); }}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === f.value
                                    ? 'bg-[#233480] text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => navigate('/post-training')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#233480] text-white text-sm font-bold rounded hover:bg-[#1a2660] transition-colors shadow">
                        <Plus size={16} /> {t('my_trainings.create_training')}
                    </button>
                </div>

                {/* ══════════ TRAINING LIST ══════════ */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-[#233480]" />
                    </div>
                ) : trainings.length === 0 ? (
                    <div className="bg-white border-b-4 border-[#233480] shadow-xl flex items-center justify-center min-h-[250px]">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <BookOpen size={40} className="text-gray-400" />
                            </div>
                            <p className="text-gray-400 mb-4">{t('my_trainings.no_trainings')}</p>
                            <button onClick={() => navigate('/post-training')}
                                className="px-6 py-2 bg-[#233480] text-white text-sm font-bold rounded hover:bg-[#1a2660]">
                                {t('my_trainings.create_first')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 font-medium">{t('my_trainings.trainings_found', { count: pagination.total })}</p>

                        {trainings.map((training) => (
                            <div key={training.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-lg border-2 border-gray-100 flex items-center justify-center bg-blue-50 flex-shrink-0 overflow-hidden">
                                                    {training.banner ? (
                                                        <img src={training.banner} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <BookOpen size={28} className="text-[#233480]" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-[#1e2a5a] mb-1">{training.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        {getStatusBadge(training.status, training.isApproved)}
                                                        {getModeBadge(training.mode)}
                                                        {training.isFree && (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">{t('my_trainings.free').toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar size={13} className="text-[#233480]" />
                                                            <span>{training.startDate ? new Date(training.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : t('my_trainings.tbd')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock size={13} className="text-[#233480]" />
                                                            <span>{training.duration}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <DollarSign size={13} className="text-[#233480]" />
                                                            <span>{training.fees}</span>
                                                        </div>
                                                        {training.venue && (
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin size={13} className="text-[#233480]" />
                                                                <span>{training.venue}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Users size={12} />
                                                            <span>{training.enrollmentCount}/{training.totalSeats} {t('my_trainings.enrolled')}</span>
                                                        </div>
                                                        {training.certification && (
                                                            <div className="flex items-center gap-1 text-green-600">
                                                                <Award size={12} />
                                                                <span>{t('my_trainings.certificate')}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-gray-400">{getCategoryLabel(training.category)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Action Buttons (NOW WORKING!) ── */}
                                        <div className="flex flex-col gap-2 md:min-w-[160px]">
                                            <button onClick={() => handleView(training.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#233480] text-white text-sm font-semibold rounded hover:bg-[#1a2660] transition-colors">
                                                <Eye size={14} /> {t('my_trainings.actions.view')}
                                            </button>
                                            <button onClick={() => handleOpenEdit(training.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-blue-500 text-blue-500 text-sm font-semibold rounded hover:bg-blue-50 transition-colors">
                                                <Edit size={14} /> {t('my_trainings.actions.edit')}
                                            </button>
                                            <button onClick={() => handleOpenEnrollments(training.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-green-500 text-green-500 text-sm font-semibold rounded hover:bg-green-50 transition-colors">
                                                <Users size={14} /> {t('my_trainings.actions.enrollments')}
                                            </button>
                                            <button onClick={() => setDeleteConfirm(training.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-red-500 text-red-500 text-sm font-semibold rounded hover:bg-red-50 transition-colors">
                                                <Trash2 size={14} /> {t('my_trainings.actions.delete')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 pt-6">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-4 py-2 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">{t('my_trainings.pagination.previous')}</button>
                                <span className="px-4 py-2 text-sm text-gray-600">{t('my_trainings.pagination.page_info', { page, total: pagination.pages })}</span>
                                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                                    className="px-4 py-2 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">{t('my_trainings.pagination.next')}</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MyTrainings;