import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Building2,
    ExternalLink,
    Star,
    Search,
    Users,
    Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { jobsAPI, candidateAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const CandidateMatches = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [filterType, setFilterType] = useState('all'); // all, high-match, recent
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMatchedJobs();
    }, []);

    const fetchMatchedJobs = async () => {
        try {
            setLoading(true);

            // Fetch candidate profile to get skills, education, etc.
            const profileResponse = await candidateAPI.getProfile();
            const profile = profileResponse.data.data;

            // Fetch all active jobs
            const jobsResponse = await jobsAPI.getAll({
                status: 'active',
                limit: 50
            });

            if (jobsResponse.data.success) {
                const jobs = jobsResponse.data.data.jobs || jobsResponse.data.data || [];

                // Calculate match score for each job
                const jobsWithScores = jobs.map(job => ({
                    ...job,
                    matchScore: calculateMatchScore(job, profile)
                }));

                // Sort by match score (highest first)
                const sortedJobs = jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

                setMatchedJobs(sortedJobs);
            }
        } catch (error) {
            console.error('Error fetching matched jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate match score based on skills, education, location, etc.
    const calculateMatchScore = (job, profile) => {
        let score = 0;

        // Skills matching (40% weight)
        if (job.skills && job.skills.length > 0 && profile.skills && profile.skills.length > 0) {
            const jobSkills = job.skills.map(s => s.toLowerCase());
            const candidateSkills = profile.skills.map(s => s.toLowerCase());
            const matchingSkills = jobSkills.filter(skill =>
                candidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))
            );
            score += (matchingSkills.length / jobSkills.length) * 40;
        }

        // Experience level matching (30% weight)
        if (job.experienceLevel) {
            const experienceLevels = ['fresher', 'entry', 'mid', 'senior', 'lead'];
            const jobExpIndex = experienceLevels.indexOf(job.experienceLevel);

            // Get candidate's experience level or calculate from experience array
            let candidateExpIndex = 0;
            if (profile.experienceLevel) {
                candidateExpIndex = experienceLevels.indexOf(profile.experienceLevel);
            } else if (profile.experience && profile.experience.length > 0) {
                const totalYears = profile.experience.reduce((total, exp) => {
                    const years = calculateYearsOfExperience(exp.startDate, exp.endDate);
                    return total + years;
                }, 0);

                // Map years to experience level
                if (totalYears === 0) candidateExpIndex = 0; // fresher
                else if (totalYears < 2) candidateExpIndex = 1; // entry
                else if (totalYears < 5) candidateExpIndex = 2; // mid
                else if (totalYears < 10) candidateExpIndex = 3; // senior
                else candidateExpIndex = 4; // lead
            }

            if (candidateExpIndex >= jobExpIndex) {
                score += 30;
            } else if (Math.abs(candidateExpIndex - jobExpIndex) === 1) {
                score += 20; // Close match
            } else {
                score += 10; // Some match
            }
        } else {
            score += 30; // No specific experience requirement
        }

        // Experience years matching (20% weight)
        if (job.experience && job.experience.min !== undefined) {
            const requiredMin = job.experience.min || 0;
            const requiredMax = job.experience.max || 100;

            if (profile.experience && profile.experience.length > 0) {
                const totalExperience = profile.experience.reduce((total, exp) => {
                    const years = calculateYearsOfExperience(exp.startDate, exp.endDate);
                    return total + years;
                }, 0);

                if (totalExperience >= requiredMin && totalExperience <= requiredMax) {
                    score += 20;
                } else if (totalExperience >= requiredMin) {
                    score += 15; // More experience than required
                } else if (requiredMin === 0) {
                    score += 20; // No experience required
                } else {
                    score += (totalExperience / requiredMin) * 20;
                }
            } else if (requiredMin === 0) {
                score += 20; // Fresher position, no experience needed
            }
        } else {
            score += 20; // No specific experience requirement
        }

        // Location preference (10% weight)
        if (job.location && job.location.city) {
            const jobCity = job.location.city.toLowerCase();
            const jobState = job.location.state ? job.location.state.toLowerCase() : '';

            if (profile.preferredLocations && profile.preferredLocations.length > 0) {
                const locationMatch = profile.preferredLocations.some(loc => {
                    const prefLoc = loc.toLowerCase();
                    return jobCity.includes(prefLoc) || prefLoc.includes(jobCity) ||
                        jobState.includes(prefLoc) || prefLoc.includes(jobState);
                });

                if (locationMatch) score += 10;
            } else {
                score += 5; // Partial score if no preference set
            }
        } else {
            score += 5; // Partial score if location not specified
        }

        return Math.round(score);
    };

    const calculateYearsOfExperience = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        return Math.max(0, years);
    };

    // Filter jobs based on selected filter
    const getFilteredJobs = () => {
        let filtered = matchedJobs;

        // Apply filter type
        if (filterType === 'high-match') {
            filtered = filtered.filter(job => job.matchScore >= 60);
        } else if (filterType === 'recent') {
            filtered = [...filtered].sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(job =>
                job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.institution?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location?.state?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    };

    const getMatchScoreColor = (score) => {
        if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (score >= 25) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getMatchLabelKey = (score) => {
        if (score >= 75) return 'excellent_match';
        if (score >= 50) return 'good_match';
        if (score >= 25) return 'partial_match';
        return 'low_match';
    };

    const handleJobClick = (jobId) => {
        navigate(`/job-details/${jobId}`);
    };

    const formatSalary = (salary) => {
        if (!salary) return t('pages.candidate_matches.not_disclosed');
        if (salary.min && salary.max) {
            return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
        }
        if (salary.min) {
            return `₹${salary.min.toLocaleString()}+`;
        }
        return t('pages.candidate_matches.not_disclosed');
    };

    const formatLocation = (location) => {
        if (!location) return t('pages.candidate_matches.location_not_specified');
        const parts = [];
        if (location.city) parts.push(location.city);
        if (location.state) parts.push(location.state);
        if (location.country) parts.push(location.country);
        return parts.join(', ') || t('pages.candidate_matches.location_not_specified');
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return null;
        const date = new Date(deadline);
        const now = new Date();
        const daysLeft = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) return t('pages.candidate_matches.expired');
        if (daysLeft === 0) return t('pages.candidate_matches.today');
        if (daysLeft === 1) return t('pages.candidate_matches.day_left');
        if (daysLeft <= 7) return t('pages.candidate_matches.days_left', { count: daysLeft });
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const filteredJobs = getFilteredJobs();

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#233480] mx-auto mb-4"></div>
                <p className="text-gray-600">{t('pages.candidate_matches.loading')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        {t('pages.candidate_matches.title')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {t('pages.candidate_matches.subtitle')}
                    </p>
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="font-semibold text-[#233480]">{filteredJobs.length}</span> {t('pages.candidate_matches.matches_found')}
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('pages.candidate_matches.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233480] focus:border-transparent"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'all'
                                ? 'bg-[#233480] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {t('pages.candidate_matches.filter_all')}
                    </button>
                    <button
                        onClick={() => setFilterType('high-match')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'high-match'
                                ? 'bg-[#233480] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {t('pages.candidate_matches.filter_high_match')}
                    </button>
                    <button
                        onClick={() => setFilterType('recent')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filterType === 'recent'
                                ? 'bg-[#233480] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {t('pages.candidate_matches.filter_recent')}
                    </button>
                </div>
            </div>

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <Briefcase className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('pages.candidate_matches.no_matches')}</h3>
                    <p className="text-gray-500">
                        {searchTerm
                            ? t('pages.candidate_matches.try_search')
                            : t('pages.candidate_matches.complete_profile')
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredJobs.map((job) => (
                        <div
                            key={job._id}
                            onClick={() => handleJobClick(job._id)}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                {/* Left Side - Job Info */}
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        {/* Institution Logo */}
                                        {/* Job Banner / Institution Logo */}
                                        <div className="w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center">
                                            {job.banner?.url ? (
                                                <img
                                                    src={job.banner.url}
                                                    alt={job.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : job.institution?.logo?.url ? (
                                                <img
                                                    src={job.institution.logo.url}
                                                    alt={job.institution.name}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            ) : (
                                                <Building2 className="text-gray-400" size={24} />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            {/* Job Title */}
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#233480] transition-colors">
                                                {job.title}
                                            </h3>

                                            {/* Institution Name */}
                                            <p className="text-gray-600 font-medium flex items-center gap-1 mt-1">
                                                <Building2 size={16} />
                                                {job.institution?.name || t('pages.candidate_matches.institution_name')}
                                            </p>

                                            {/* Job Details */}
                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={16} />
                                                    {formatLocation(job.location)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <DollarSign size={16} />
                                                    {formatSalary(job.salary)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    {job.jobType || t('pages.candidate_matches.full_time')}
                                                </span>
                                                {job.workMode && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                        {job.workMode}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Additional Info */}
                                            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                                                {job.vacancies && (
                                                    <span className="flex items-center gap-1">
                                                        <Users size={14} />
                                                        {job.vacancies} {job.vacancies === 1 ? t('pages.candidate_matches.vacancy') : t('pages.candidate_matches.vacancies')}
                                                    </span>
                                                )}
                                                {job.applicationDeadline && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {t('pages.candidate_matches.apply_by')}: {formatDeadline(job.applicationDeadline)}
                                                    </span>
                                                )}
                                                {/* {job.applicationsCount > 0 && (
                                                    <span className="text-blue-600">
                                                        {job.applicationsCount} {job.applicationsCount === 1 ? 'application' : 'applications'}
                                                    </span>
                                                )} */}
                                            </div>

                                            {/* Required Skills */}
                                            {job.skills && job.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {job.skills.slice(0, 5).map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {job.skills.length > 5 && (
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                            {t('pages.candidate_matches.more_skills', { count: job.skills.length - 5 })}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Match Score */}
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-4 py-2 rounded-lg border-2 ${getMatchScoreColor(job.matchScore)}`}>
                                        <div className="flex items-center gap-2">
                                            <Star size={18} fill="currentColor" />
                                            <span className="font-bold text-lg">{job.matchScore}%</span>
                                        </div>
                                        <p className="text-xs font-medium mt-1">
                                            {t('pages.candidate_matches.' + getMatchLabelKey(job.matchScore))}
                                        </p>
                                    </div>

                                    {job.isFeatured && (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                            ⭐ {t('pages.candidate_matches.featured')}
                                        </span>
                                    )}

                                    <button className="text-[#233480] hover:text-[#1a2560] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        {t('pages.candidate_matches.view_details')}
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateMatches;