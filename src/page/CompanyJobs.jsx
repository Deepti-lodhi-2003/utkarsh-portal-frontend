import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, Clock, MapPin, DollarSign, Building2, Calendar, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { jobsAPI, institutionsAPI, applicationAPI } from '../services/api'; // Adjust path as needed
import { useAuth } from '../dashboard/context/AuthContext'; // Adjust path as needed
import Footer from '../component/Footer';

const CompanyJobs = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appliedJobs, setAppliedJobs] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchOrganizationAndJobs();
        if (user) {
            fetchAppliedJobs();
        }
    }, [id, user]);

    const fetchOrganizationAndJobs = async () => {
        try {
            setLoading(true);

            // Fetch organization details
            const orgResponse = await institutionsAPI.getById(id);
            if (orgResponse.data.success) {
                setOrganization(orgResponse.data.data.institution);
            }

            // Fetch jobs posted by this organization
            const jobsResponse = await jobsAPI.getAll({
                institution: id,
                status: 'active',
                limit: 100
            });

            if (jobsResponse.data.success) {
                setJobs(jobsResponse.data.data.jobs || []);
            }
        } catch (error) {
            console.error('Error fetching organization jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppliedJobs = async () => {
        try {
            const response = await applicationAPI.getMyApplications({ limit: 1000 });
            if (response.data.success) {
                const applications = response.data.data.applications || [];
                const appliedJobIds = applications.map(app => app.job?._id || app.job);
                setAppliedJobs(appliedJobIds);
            }
        } catch (error) {
            console.error('Error fetching applied jobs:', error);
        }
    };

    const handleApply = (jobId) => {
        if (!user) {
            navigate(`/login/candidate?redirect=/job-details/${jobId}`);
            return;
        }
        navigate(`/job-details/${jobId}`);
    };

    const formatSalary = (salary) => {
        if (!salary) return t('pages.company_jobs.not_disclosed');

        const currency = salary.currency === 'INR' ? '₹' : '$';
        const period = salary.period === 'monthly' ? '/month' : salary.period === 'yearly' ? '/year' : '';

        if (salary.isConfidential) return t('pages.company_jobs.confidential');

        if (salary.min && salary.max) {
            if (salary.min === salary.max) {
                return `${currency}${salary.min.toLocaleString()}${period}`;
            }
            return `${currency}${salary.min.toLocaleString()} - ${currency}${salary.max.toLocaleString()}${period}`;
        }
        if (salary.min) {
            return `${currency}${salary.min.toLocaleString()}+${period}`;
        }
        return t('pages.company_jobs.not_disclosed');
    };

    const formatLocation = (location) => {
        if (!location) return t('pages.company_jobs.location_not_specified');
        const parts = [];
        if (location.city) parts.push(location.city);
        if (location.state) parts.push(location.state);
        return parts.join(', ') || t('pages.company_jobs.location_not_specified');
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return null;
        const date = new Date(deadline);
        const now = new Date();
        const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return t('pages.company_jobs.expired');
        if (daysLeft === 0) return t('pages.company_jobs.today');
        if (daysLeft === 1) return t('pages.company_jobs.one_day_left');
        if (daysLeft <= 7) return t('pages.company_jobs.days_left', { count: daysLeft });
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const companyName = organization?.organizationName || 'the Company';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#233480] mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('pages.company_jobs.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">
            {/* Banner with Dynamic Title */}
            <div className="relative w-full py-10 md:py-16 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white tracking-widest drop-shadow-lg">
                        {t('pages.company_jobs.jobs_posted_by', { company: companyName })}
                    </h1>
                    {organization && (
                        <p className="text-white/90 mt-2 text-sm md:text-base">
                            {jobs.length} {jobs.length === 1 ? t('pages.company_jobs.job_singular') : t('pages.company_jobs.job_plural')} {t('pages.company_jobs.available')}
                        </p>
                    )}
                </div>
            </div>

            {/* Jobs List Section */}
            <div className="max-w-6xl mx-auto w-full px-4 -mt-7 md:-mt-9 relative z-20 mb-20">
                <div className="bg-white shadow-xl border-b-[6px] border-[#233480] min-h-[300px] flex flex-col overflow-hidden rounded-sm">
                    {jobs.length > 0 ? (
                        <div className="p-4 md:p-10 space-y-5">
                            {jobs.map(job => {
                                const isApplied = appliedJobs.includes(job._id);
                                const deadline = formatDeadline(job.applicationDeadline);

                                return (
                                    <div
                                        key={job._id}
                                        className="group flex flex-col md:flex-row items-center justify-between p-5 md:p-8 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-100 relative overflow-hidden cursor-pointer"
                                        onClick={() => navigate(`/job-details/${job._id}`)}
                                    >
                                        {/* Accent Bar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#233480] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 w-full">
                                            {/* Logo */}
                                            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300 bg-gray-50 rounded-lg border border-gray-100 p-2">
                                                {organization?.logo?.url ? (
                                                    <img
                                                        src={organization.logo.url}
                                                        alt={organization.organizationName}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <Building2 className="text-gray-300" size={40} />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 space-y-3 md:space-y-4 w-full">
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="text-lg md:text-xl font-bold text-[#1e2a5a] group-hover:text-[#233480] transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    {job.isFeatured && (
                                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full shrink-0">
                                                            ⭐ {t('pages.company_jobs.featured')}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                        <MapPin size={16} className="text-[#233480]" />
                                                        {formatLocation(job.location)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                        <Clock size={16} className="text-[#233480]" />
                                                        {job.experienceLevel || t('pages.company_jobs.fresher')}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                        <DollarSign size={16} className="text-[#233480]" />
                                                        {formatSalary(job.salary)}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-full border border-green-200">
                                                        {job.jobType || t('pages.company_jobs.full_time')}
                                                    </span>
                                                    {job.workMode && (
                                                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                                                            {job.workMode}
                                                        </span>
                                                    )}
                                                    {job.vacancies && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Users size={14} />
                                                            {job.vacancies} {job.vacancies === 1 ? t('pages.company_jobs.vacancy_singular') : t('pages.company_jobs.vacancy_plural')}
                                                        </span>
                                                    )}
                                                    {deadline && (
                                                        <span className={`flex items-center gap-1 text-xs ${deadline === 'Expired' ? 'text-red-600' :
                                                                deadline.includes('day') ? 'text-orange-600' : 'text-gray-600'
                                                            }`}>
                                                            <Calendar size={14} />
                                                            {deadline}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Skills */}
                                                {job.skills && job.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {job.skills.slice(0, 4).map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {job.skills.length > 4 && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                                +{job.skills.length - 4} {t('pages.company_jobs.more')}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Button */}
                                            <div className="shrink-0 w-full md:w-auto mt-6 md:mt-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApply(job._id);
                                                    }}
                                                    disabled={isApplied}
                                                    className={`w-full md:w-32 py-3 font-black text-sm tracking-widest uppercase transition-all shadow-md ${isApplied
                                                            ? 'bg-gray-100 text-[#233480] border border-[#233480] cursor-default'
                                                            : 'bg-[#233480] text-white hover:bg-[#1a2660] active:scale-95'
                                                        }`}
                                                >
                                                    {isApplied ? t('pages.company_jobs.applied') : t('pages.company_jobs.apply')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200">
                                <span className="text-gray-300 text-3xl">📭</span>
                            </div>
                            <p className="text-gray-400 text-lg font-bold tracking-wider italic">
                                {t('pages.company_jobs.no_jobs_yet')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CompanyJobs;