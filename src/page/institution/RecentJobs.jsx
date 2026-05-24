import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../../component/Footer';
import {
    Briefcase, MapPin, Clock, Building2, Eye, Edit, Trash2, Users,
    Loader2, X, CheckCircle, PauseCircle, AlertCircle, ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { jobsAPI } from '../../services/api';

const statusConfig = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    paused: { label: 'Paused', color: 'bg-orange-100 text-orange-700', icon: PauseCircle },
    closed: { label: 'Closed', color: 'bg-red-100 text-red-700', icon: X },
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Edit },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: X },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500', icon: Clock },
};

const RecentJobs = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [statusChanging, setStatusChanging] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => { fetchMyJobs(); }, [page, filterStatus]);
    useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 3000); return () => clearTimeout(t); } }, [success]);

    const fetchMyJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, limit: 10 };
            if (filterStatus) params.status = filterStatus;
            const res = await jobsAPI.getMyJobs(params);
            const data = res.data.data;
            const mappedJobs = (data.jobs || []).map(job => ({
                id: job._id,
                title: job.title || '',
                company: job.institution?.organizationName || '',
                experience: job.experience ? `${job.experience.min} - ${job.experience.max} Years` : 'N/A',
                type: job.jobType || 'full-time',
                workMode: job.workMode || '',
                location: job.location?.city || 'N/A',
                state: job.location?.state || '',
                salary: job.salary ? `₹${(job.salary.min / 100000).toFixed(1)}-${(job.salary.max / 100000).toFixed(1)} LPA` : null,
                isConfidential: job.salary?.isConfidential || false,
                postedDate: job.createdAt,
                deadline: job.applicationDeadline,
                applicants: job.applicationsCount || 0,
                vacancies: job.vacancies || 0,
                views: job.views || 0,
                logo: job.institution?.logo?.url || '',
                banner: job.banner?.url || '',
                status: job.status || 'pending',
                isFeatured: job.isFeatured || false,
            }));
            setJobs(mappedJobs);
            setPagination(data.pagination || { total: 0, pages: 1 });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    //  View Job Details + Applications
    const handleViewJob = (jobId) => navigate(`/job/${jobId}`);

    //  Edit Job
    const handleEditJob = (jobId) => navigate(`edit-job/${jobId}`);

    //  View Applications
    const handleViewApplications = (jobId) => navigate(`/job/${jobId}?tab=applications`);

    //  Delete Job
    const handleDeleteJob = async (jobId) => {
        setDeleting(true);
        try {
            await jobsAPI.delete(jobId);
            setJobs(prev => prev.filter(j => j.id !== jobId));
            setDeleteConfirm(null);
            setSuccess('Job deleted successfully!');
            setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete job');
        } finally {
            setDeleting(false);
        }
    };

    //  Pause/Resume Job
    const handleStatusChange = async (jobId, newStatus) => {
        setStatusChanging(jobId);
        try {
            await jobsAPI.changeStatus(jobId, { status: newStatus });
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
            setSuccess(`Job ${newStatus} successfully!`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change status');
        } finally {
            setStatusChanging(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                <Icon size={12} />{config.label}
            </span>
        );
    };

    if (loading && jobs.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#233480] mx-auto mb-3" />
                    <p className="text-gray-500">{t('institution.recentJobs.loadingJobs')}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                {/* Banner */}
                <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                    <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-wider text-center px-4">{t('institution.recentJobs.myPostedJobs')}</h1>
                </div>

                <div className="max-w-6xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20">

                    {/* Success */}
                    {success && (
                        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
                            <div className="flex items-center gap-2"><CheckCircle size={16} /><span>{success}</span></div>
                            <button onClick={() => setSuccess('')}><X size={16} /></button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')}><X size={16} /></button>
                        </div>
                    )}

                    {/* Filter Bar */}
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#1e2a5a]">{t('institution.recentJobs.jobsPosted', { count: pagination.total })}</h2>
                                <p className="text-sm text-gray-500">{t('institution.recentJobs.manageListings')}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#233480]">
                                    <option value="">{t('institution.recentJobs.allStatus')}</option>
                                    <option value="active">{t('institution.jobStatus.active')}</option>
                                    <option value="pending">{t('institution.jobStatus.pending')}</option>
                                    <option value="paused">{t('institution.jobStatus.paused')}</option>
                                    <option value="closed">{t('institution.jobStatus.closed')}</option>
                                    <option value="draft">{t('institution.jobStatus.draft')}</option>
                                    <option value="rejected">{t('institution.jobStatus.rejected')}</option>
                                </select>
                                <button onClick={() => navigate('/post-job')}
                                    className="px-4 py-2 bg-[#233480] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2660]">
                                    + {t('institution.recentJobs.postNewJob')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Delete Modal */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={24} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-[#1e2a5a] text-center mb-2">{t('institution.recentJobs.deleteJobTitle')}</h3>
                                <p className="text-gray-600 text-center mb-6 text-sm">{t('institution.recentJobs.deleteJobConfirm')}</p>
                                <div className="flex gap-3 justify-center">
                                    <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">{t('common.cancel')}</button>
                                    <button onClick={() => handleDeleteJob(deleteConfirm)} disabled={deleting}
                                        className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 font-medium disabled:opacity-50">
                                        {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                        {deleting ? t('institution.recentJobs.deleting') : t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No Jobs */}
                    {jobs.length === 0 && !loading ? (
                        <div className="bg-white rounded-xl border-b-4 border-[#233480] shadow-xl flex items-center justify-center min-h-[300px]">
                            <div className="text-center p-8">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Briefcase size={48} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-[#1e2a5a] mb-2">{t('institution.recentJobs.noJobsFound')}</h3>
                                <p className="text-gray-500 mb-6">{filterStatus ? t('institution.recentJobs.noStatusJobs', { status: filterStatus }) : t('institution.recentJobs.noJobsYet')}</p>
                                <button onClick={() => navigate('/post-job')}
                                    className="px-6 py-3 bg-[#233480] text-white font-semibold rounded-lg hover:bg-[#1a2660]">
                                    {t('institution.recentJobs.postFirstJob')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loading && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-[#233480]" /></div>}

                            {jobs.map((job) => (
                                <div key={job.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                                    {job.isFeatured && (
                                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-4 py-1 text-center">⭐ Featured Job</div>
                                    )}
                                    <div className="p-5 md:p-6">
                                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                                            {/* Banner/Logo */}
                                            <div className="w-full md:w-32 h-20 md:h-20 rounded-lg overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
                                                {job.banner ? (
                                                    <img src={job.banner} alt={job.title} className="w-full h-full object-cover" />
                                                ) : job.logo ? (
                                                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain bg-white p-2"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3E${job.company.charAt(0)}%3C/text%3E%3C/svg%3E`; }} />
                                                ) : (
                                                    <Building2 size={28} className="text-white" />
                                                )}
                                            </div>

                                            {/* Job Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-start gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-[#1e2a5a] leading-tight">{job.title}</h3>
                                                    {getStatusBadge(job.status)}
                                                </div>
                                                <p className="text-gray-600 text-sm mb-3 flex items-center gap-1.5">
                                                    <Building2 size={13} className="text-[#233480]" />{job.company}
                                                </p>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Briefcase size={13} className="text-[#233480]" /><span className="truncate">{job.experience}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <MapPin size={13} className="text-[#233480]" /><span className="truncate">{job.location}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        {job.isConfidential ? <span className="text-gray-500">Confidential</span> : job.salary ? <span className="font-semibold text-green-600">{job.salary}</span> : <span className="text-gray-500">Not Disclosed</span>}
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium capitalize">{job.type.replace(/-/g, ' ')}</span>
                                                        {job.workMode && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium capitalize">{job.workMode}</span>}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Clock size={12} />Posted {formatDate(job.postedDate)}</span>
                                                    {job.deadline && <span className="flex items-center gap-1"><AlertCircle size={12} />Deadline: {formatDate(job.deadline)}</span>}
                                                    <span className="flex items-center gap-1"><Users size={12} /><strong className="text-[#233480]">{job.applicants}</strong> Applicants</span>
                                                    <span className="flex items-center gap-1"><Eye size={12} />{job.views} Views</span>
                                                </div>
                                            </div>

                                            {/*  Action Buttons */}
                                            <div className="flex flex-row md:flex-col gap-2 md:min-w-[150px]">
                                                {/* View Details */}
                                                <button onClick={() => handleViewJob(job.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-[#233480] text-white text-sm font-semibold rounded-lg hover:bg-[#1a2660]">
                                                    <Eye size={15} /> {t('common.view')}
                                                </button>

                                                {/* Applications */}
                                                <button onClick={() => handleViewApplications(job.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 relative">
                                                    <Users size={15} /> {t('institution.recentJobs.applications')}
                                                    {job.applicants > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                            {job.applicants > 99 ? '99+' : job.applicants}
                                                        </span>
                                                    )}
                                                </button>

                                                {/* Edit */}
                                                <button onClick={() => handleEditJob(job.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-blue-500 text-blue-500 text-sm font-semibold rounded-lg hover:bg-blue-50">
                                                    <Edit size={15} /> {t('common.edit')}
                                                </button>

                                                {/* Pause/Resume */}
                                                {job.status === 'active' && (
                                                    <button onClick={() => handleStatusChange(job.id, 'paused')} disabled={statusChanging === job.id}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-orange-500 text-orange-500 text-sm font-semibold rounded-lg hover:bg-orange-50 disabled:opacity-50">
                                                        {statusChanging === job.id ? <Loader2 size={15} className="animate-spin" /> : <PauseCircle size={15} />} {t('institution.recentJobs.pause')}
                                                    </button>
                                                )}
                                                {job.status === 'paused' && (
                                                    <button onClick={() => handleStatusChange(job.id, 'active')} disabled={statusChanging === job.id}
                                                        className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-green-500 text-green-500 text-sm font-semibold rounded-lg hover:bg-green-50 disabled:opacity-50">
                                                        {statusChanging === job.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />} {t('institution.recentJobs.resume')}
                                                    </button>
                                                )}

                                                {/* Delete */}
                                                <button onClick={() => setDeleteConfirm(job.id)}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-red-500 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-50">
                                                    <Trash2 size={15} /> {t('common.delete')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center items-center gap-2 pt-6 pb-4">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                        className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
                                        <ChevronLeft size={16} /> {t('common.previous')}
                                    </button>
                                    <span className="px-4 py-2 text-sm text-gray-600">{t('common.pagination', { page, total: pagination.pages })}</span>
                                    <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                                        className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
                                        {t('common.next')} <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default RecentJobs;