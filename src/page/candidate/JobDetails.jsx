import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, User, Check, Beaker, Landmark, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../dashboard/context/AuthContext';
import api from '../../services/api';
import Footer from '../../component/Footer';

const JobDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [applySuccess, setApplySuccess] = useState(false);

    // ─── FETCH JOB DETAILS ───
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchJobDetails();
    }, [id]);

    // ─── NAVIGATE AFTER APPLY SUCCESS ───
    useEffect(() => {
        if (applySuccess) {
            const timer = setTimeout(() => {
                navigate('/applied-job');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [applySuccess, navigate]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            setErrorMsg('');

            const res = await api.get(`/jobs/${id}`);
            const data = res.data.data;

            setJobData(data.job || data);
            setIsApplied(data.hasApplied || false);
        } catch (error) {
            console.error('Failed to load job:', error);
            setErrorMsg(error.response?.data?.message || t('pages.job_details.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    // ─── APPLY FOR JOB ───
    const handleApply = async () => {
        if (!user) {
            navigate(`/login/candidate?redirect=/job-details/${id}`);
            return;
        }

        if (isApplied) return;

        try {
            setApplying(true);
            setErrorMsg('');

            const formData = new FormData();
            formData.append('coverLetter', '');
            formData.append('source', 'direct');

            await api.post(`/jobs/${id}/apply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsApplied(true);
            setApplySuccess(true);
        } catch (error) {
            console.error('Apply failed:', error);
            const msg = error.response?.data?.message || t('pages.job_details.apply_failed');
            if (msg.toLowerCase().includes('already')) {
                setIsApplied(true);
            } else {
                setErrorMsg(msg);
            }
        } finally {
            setApplying(false);
        }
    };

    // ─── HELPERS ───
    const formatSalary = (salary) => {
        if (!salary) return t('pages.job_details.not_disclosed');
        if (salary.isConfidential) return t('pages.job_details.confidential');
        const min = salary.min ? `₹${(salary.min / 100000).toFixed(1)}L` : '';
        const max = salary.max ? `₹${(salary.max / 100000).toFixed(1)}L` : '';
        if (min && max) return `${min} - ${max} PA`;
        if (min) return `${min}+ PA`;
        return t('pages.job_details.not_disclosed');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return t('pages.job_details.posted_today');
        if (diffDays === 1) return t('pages.job_details.posted_1_day');
        return t('pages.job_details.posted_days', { count: diffDays });
    };

    // Get contact person details with fallbacks
    const getContactPerson = () => {
        const institution = jobData?.institution;
        const postedBy = jobData?.postedBy;

        return {
            name: institution?.contactPerson?.name ||
                postedBy?.name ||
                institution?.user?.name ||
                'Not Available',
            designation: institution?.contactPerson?.designation ||
                postedBy?.designation ||
                'Not Available'
        };
    };

    // ─── LOADING ───
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#233480]" size={40} />
            </div>
        );
    }

    // ─── ERROR ───
    if (errorMsg && !jobData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <AlertCircle size={48} className="text-red-400 mb-4" />
                <p className="text-gray-600 text-lg">{errorMsg}</p>
                <button onClick={() => navigate(-1)}
                    className="mt-4 px-6 py-2 bg-[#233480] text-white rounded font-bold text-sm">
                    {t('pages.job_details.go_back')}
                </button>
            </div>
        );
    }

    if (!jobData) return null;

    const contactPerson = getContactPerson();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header */}
            <div className="relative w-full h-32 md:h-40 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-widest text-center px-4 uppercase">
                    {t('pages.job_details.title')}
                </h1>
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 -mt-8 md:-mt-9 mb-12 relative z-20">
                <div className="bg-white overflow-hidden border-b-4 border-[#233480]">
                    {/* Job Banner */}
                    {jobData.banner?.url && (
                        <div className="w-full h-48 md:h-64 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                            <img src={jobData.banner.url} alt={jobData.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    {/* Job Header Info */}
                    <div className="p-6 md:p-8 border-b border-gray-200">
                        {/* Apply Success */}
                        {applySuccess && (
                            <div className="mb-4 flex items-center gap-2 bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-md text-sm">
                                <Check size={16} className="stroke-[3px]" />
                                {t('pages.job_details.apply_success')}
                            </div>
                        )}

                        {/* Error */}
                        {errorMsg && (
                            <div className="mb-4 bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-md text-sm">
                                {errorMsg}
                            </div>
                        )}

                        <div className="space-y-1">
                            <h2 className="text-xl md:text-2xl font-semibold text-[#1e2a5a]">
                                {jobData.title}
                            </h2>
                            <p className="text-gray-500 font-medium text-sm">
                                {jobData.institution?.organizationName || t('pages.job_details.na')}
                            </p>

                            {/* Meta Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3 gap-x-12 pt-4">
                                <div className="flex items-center gap-3 text-gray-500 font-medium whitespace-nowrap">
                                    <Beaker size={17} className="text-green-600" />
                                    <span className="text-sm">
                                        {jobData.experience
                                            ? `${jobData.experience.min} - ${jobData.experience.max} Years`
                                            : jobData.experienceLevel || t('pages.job_details.na')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 font-medium whitespace-nowrap">
                                    <MapPin size={17} className="text-green-600" />
                                    <span className="text-sm">
                                        {jobData.location?.city || t('pages.job_details.na')}
                                        {jobData.location?.state && `, ${jobData.location.state}`}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    {/* <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">
                                        {t('pages.job_details.posted_by')}
                                    </p> */}
                                    {/* <div className="flex items-center gap-3 text-gray-600 font-medium">
                                        <User size={17} className="text-gray-400" />
                                        <span className="text-sm">
                                            {contactPerson.name}
                                        </span>
                                    </div> */}
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 font-medium whitespace-nowrap">
                                    <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center text-white text-[9px] font-bold">₹</div>
                                    <span className="text-sm">{formatSalary(jobData.salary)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500 font-medium whitespace-nowrap">
                                    <Clock size={17} className="text-green-600" />
                                    <span className="text-sm">{formatDate(jobData.createdAt)}</span>
                                </div>
                                {/* <div className="flex items-center gap-3 text-gray-600 font-medium">
                                    <Briefcase size={17} className="text-gray-400" />
                                    <span className="text-sm">
                                        {contactPerson.designation}
                                    </span>
                                </div> */}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 mt-10 pt-6 border-t border-gray-300">
                            {isApplied ? (
                                <button disabled
                                    className="flex items-center justify-center gap-2 px-10 py-2.5 rounded bg-[#7C87B2] text-white font-bold tracking-wide shadow-md cursor-not-allowed opacity-90">
                                    <Check size={18} strokeWidth={3} />
                                    {t('pages.job_details.applied')}
                                </button>
                            ) : (
                                <button onClick={handleApply} disabled={applying}
                                    className={`flex items-center justify-center gap-2 px-10 py-2.5 rounded bg-[#233480] text-white font-bold tracking-wide shadow-md hover:bg-[#1a2660] transition-all ${applying ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                                    {applying ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            {t('pages.job_details.applying')}
                                        </>
                                    ) : (
                                        t('pages.job_details.apply_now')
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => navigate(`/org-details/${jobData.institution?._id}`, { state: { fromOrg: true } })}
                                className="flex items-center gap-2 px-8 py-2.5 rounded bg-[#00A99D] text-white font-bold tracking-wide hover:bg-[#008c82] transition-all shadow-md active:scale-95">
                                <Landmark size={18} />
                                {t('pages.job_details.org_details')}
                            </button>
                        </div>
                    </div>

                    {/* Job Details Content */}
                    <div className="p-6 md:p-8 space-y-10">
                        {/* Description */}
                        <div>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base text-justify">
                                {jobData.description}
                            </p>
                        </div>

                        {/* Requirements */}
                        {jobData.requirements?.length > 0 && (
                            <div>
                                <div className="px-6 py-3 border-l-4 border-[#233480] bg-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 tracking-wider">{t('pages.job_details.requirements')}</h3>
                                </div>
                                <div className="p-6 space-y-2">
                                    {jobData.requirements.map((req, i) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <span className="text-[#233480] font-bold">»</span>
                                            <p className="text-sm text-gray-600">{req}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Key Details Card */}
                        <div>
                            <div className="px-6 py-3 border-l-4 border-[#233480] bg-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 tracking-wider">
                                    {t('pages.job_details.key_details')}
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="text-[#233480] font-bold">»</span>
                                    <p className="text-sm md:text-base text-gray-600">
                                        <span className="font-semibold text-gray-700">{t('pages.job_details.employment_type')}:</span>{' '}
                                        {jobData.jobType ? jobData.jobType.charAt(0).toUpperCase() + jobData.jobType.slice(1) : t('pages.job_details.na')}
                                    </p>
                                </div>
                                {jobData.workMode && (
                                    <div className="flex items-start gap-4">
                                        <span className="text-[#233480] font-bold">»</span>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-700">{t('pages.job_details.work_mode')}:</span>{' '}
                                            {jobData.workMode.charAt(0).toUpperCase() + jobData.workMode.slice(1)}
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-start gap-4">
                                    <span className="text-[#233480] font-bold">»</span>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-gray-700">{t('pages.job_details.vacancy')}:</span>{' '}
                                        {jobData.vacancies ?? t('pages.job_details.na')}
                                    </p>
                                </div>
                                {jobData.skills?.length > 0 && (
                                    <div className="flex items-start gap-4">
                                        <span className="text-[#233480] font-bold">»</span>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-700">{t('pages.job_details.key_skills')}:</span>{' '}
                                            {jobData.skills.map(s => s.name || s).join(', ')}
                                        </p>
                                    </div>
                                )}
                                {jobData.benefits?.length > 0 && (
                                    <div className="flex items-start gap-4">
                                        <span className="text-[#233480] font-bold">»</span>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-700">{t('pages.job_details.benefits')}:</span>{' '}
                                            {jobData.benefits.join(', ')}
                                        </p>
                                    </div>
                                )}
                                {jobData.applicationDeadline && (
                                    <div className="flex items-start gap-4">
                                        <span className="text-[#233480] font-bold">»</span>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-700">{t('pages.job_details.deadline')}:</span>{' '}
                                            {new Date(jobData.applicationDeadline).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Similar Jobs */}
                        <SimilarJobs jobId={id} navigate={navigate} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

// ─── SIMILAR JOBS SUB-COMPONENT ───
const SimilarJobs = ({ jobId, navigate }) => {
    const { t } = useTranslation();
    const [similarJobs, setSimilarJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const res = await api.get(`/jobs/${jobId}/similar`);
                setSimilarJobs(res.data.data || []);
            } catch (error) {
                console.error('Failed to load similar jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchSimilar();
    }, [jobId]);

    if (loading || similarJobs.length === 0) return null;

    return (
        <div>
            <div className="px-6 py-3 border-l-4 border-[#233480] bg-gray-200 mb-4">
                <h3 className="text-sm font-bold text-gray-700 tracking-wider">{t('pages.job_details.similar_jobs')}</h3>
            </div>
            <div className="space-y-3">
                {similarJobs.slice(0, 5).map((job) => (
                    <div key={job._id}
                        onClick={() => navigate(`/job-details/${job._id}`)}
                        className="p-4 border border-gray-100 rounded hover:border-blue-100 hover:shadow-sm transition-all cursor-pointer">
                        <h4 className="text-sm font-medium text-[#1e2a5a]">{job.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            {job.location?.city && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {job.location.city}
                                </span>
                            )}
                            {job.jobType && (
                                <span className="capitalize">{job.jobType}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobDetails;