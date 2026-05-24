import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Briefcase, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { jobsAPI } from '../services/api';

const RecentJobs = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showAlreadyApplied, setShowAlreadyApplied] = useState({});
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch recent jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                // Fetch recent jobs - limit to 4 for home page
                const response = await jobsAPI.getAll({
                    limit: 4,
                    sort: '-createdAt'
                });

                console.log('Jobs API Response:', response.data);

                if (response.data.success) {
                    const jobsData = response.data.data?.jobs || [];
                    console.log('Jobs received:', jobsData);
                    setJobs(jobsData);
                }
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleApply = (jobId) => {
        const isLoggedIn = localStorage.getItem('accessToken');

        if (isLoggedIn) {
            const currentApplied = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            if (!currentApplied.includes(jobId)) {
                // If not applied, go to job details
                navigate(`/job-details/${jobId}`);
            } else {
                // If already applied, show "Already Applied" on the button
                setShowAlreadyApplied(prev => ({ ...prev, [jobId]: true }));
            }
        } else {
            // Redirect to login with redirect back to job details
            navigate(`/login/candidate?redirect=/job-details/${jobId}`);
        }
    };

    if (loading) {
        return (
            <section className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#233480] mb-2">
                            {t('home.recent_jobs.title')}
                        </h2>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={40} className="text-[#233480] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (jobs.length === 0) {
        return null; // Don't show section if no jobs
    }

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#233480] mb-2">{t('home.recent_jobs.title')}</h2>
                    <Link to="/search-job" className="text-[#233480] text-sm font-medium hover:underline flex items-center justify-center gap-1">
                        {t('home.recent_jobs.view_all')} <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="flex flex-col gap-4 max-w-7xl mx-auto">
                    {jobs.map((job, index) => {
                        //  Extract data matching exact API response structure
                        const jobId = job._id;
                        const title = job.title;

                        // Institution/Company data
                        const company = job.institution?.organizationName || 'Company';
                        const logo = job.institution?.logo?.url ||
                            'https://utkarshujjain.com/recruiterlogo/logo_ByteFlowTechnologiesPvtLtd202518121736646.jpg';

                        // Experience - handle min-max format
                        const expMin = job.experience?.min || 0;
                        const expMax = job.experience?.max || 0;
                        const experience = expMax > 0
                            ? `${expMin}-${expMax} years`
                            : (job.experienceLevel === 'fresher' ? 'Fresher' : `${expMin}+ years`);

                        // Job type - map jobType to display format
                        const jobTypeMap = {
                            'full-time': 'Full-time',
                            'part-time': 'Part-time',
                            'internship': 'Internship',
                            'contract': 'Contract',
                            'freelance': 'Freelance'
                        };
                        const jobType = jobTypeMap[job.jobType] || job.jobType || 'Full-time';

                        // Location
                        const location = job.location?.city && job.location?.state
                            ? `${job.location.city}, ${job.location.state}`
                            : job.location?.city || 'Location';

                        // Banner data
                        const banner = job.banner?.url;

                        return (
                            <motion.div
                                key={jobId}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border border-gray-100 rounded-lg p-6 shadow-shrink-0 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md hover:border-l-4 hover:border-l-[#233480] transition-all group"
                            >
                                <div className="flex flex-col md:flex-row items-start gap-4 w-full md:w-auto">
                                    {/* Company Logo / Banner */}
                                    <div className="w-full md:w-32 h-20 md:h-20 flex items-center justify-center shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                        {banner ? (
                                            <img
                                                src={banner}
                                                alt={title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={logo}
                                                alt={company}
                                                className="w-full h-full object-contain p-2"
                                                onError={(e) => {
                                                    e.target.src = 'https://utkarshujjain.com/recruiterlogo/logo_ByteFlowTechnologiesPvtLtd202518121736646.jpg';
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-[#233480] group-hover:text-blue-800 transition-colors">
                                            {title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1 mb-2">{company}</p>

                                        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Briefcase size={14} />
                                                <span>{experience}</span>
                                            </div>

                                            <div className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                                                {jobType}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                <span>{location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleApply(jobId)}
                                    className="w-full md:w-auto px-6 py-2 bg-[#233480] text-white font-medium text-sm rounded hover:bg-[#1a2560] transition-colors shadow-sm whitespace-nowrap"
                                >
                                    {showAlreadyApplied[jobId] ? t('common.already_applied') : t('common.apply')}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default RecentJobs;