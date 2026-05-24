import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Clock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../dashboard/context/AuthContext';
import api from '../../services/api';
import Footer from '../../component/Footer';

const CandidateSearchJob = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);

    const [searchParams, setSearchParams] = useState({
        keyword: '',
        location: '',
        experience: ''
    });

    // ─── FETCH JOBS ON MOUNT & PAGE CHANGE ───
    useEffect(() => {
        fetchJobs();
    }, [currentPage]);

    const fetchJobs = async (isSearch = false) => {
        try {
            if (isSearch) {
                setSearching(true);
                setCurrentPage(1);
            } else {
                setLoading(true);
            }
            setErrorMsg('');

            // Build query params
            const params = {
                page: isSearch ? 1 : currentPage,
                limit: 10
            };

            if (searchParams.keyword) params.q = searchParams.keyword;
            if (searchParams.location) params.location = searchParams.location;
            if (searchParams.experience) {
                if (searchParams.experience === 'fresher') {
                    params.experienceLevel = 'fresher';
                } else {
                    params.experienceMin = 0;
                    params.experienceMax = parseInt(searchParams.experience);
                }
            }

            const res = await api.get('/jobs', { params });
            const data = res.data.data;

            const jobsList = (data.jobs || []).map(job => ({
                id: job._id,
                title: job.title || 'N/A',
                company: job.institution?.organizationName || 'N/A',
                experience: job.experience
                    ? `${job.experience.min} - ${job.experience.max} Years`
                    : 'N/A',
                type: job.jobType
                    ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1).replace('-', ' ')
                    : t('pages.candidate_search.full_time'),
                location: job.location?.city || 'N/A',
                logo: job.institution?.logo?.url
                    || 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
                banner: job.banner?.url || '',
                slug: job.slug,
                salary: job.salary,
                createdAt: job.createdAt
            }));

            setJobs(jobsList);
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setErrorMsg(error.response?.data?.message || t('pages.candidate_search.load_failed'));
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    // ─── HANDLE SEARCH ───
    const handleSearch = (e) => {
        e?.preventDefault();
        fetchJobs(true);
    };

    // ─── HANDLE APPLY ───
    const handleApply = (jobId) => {
        if (user) {
            navigate(`/job-details/${jobId}`);
        } else {
            navigate(`/login/candidate?redirect=/job-details/${jobId}`);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Blue Banner with Search */}
                <div className="relative w-full py-8 md:py-16 pb-32 md:pb-48 overflow-hidden flex items-start justify-center bg-cover bg-center"
                    style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
                    </div>

                    {/* Search Box */}
                    <form onSubmit={handleSearch} className="max-w-6xl mx-auto px-4 w-full relative z-10">
                        <div className="bg-white p-4 md:p-6 rounded-xl shadow-2xl flex flex-col md:flex-row items-stretch gap-4">
                            {/* Keyword */}
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    {t('pages.candidate_search.keyword')}
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text"
                                        placeholder={t('pages.candidate_search.keyword_placeholder')}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#233480]/20 transition-all font-medium"
                                        value={searchParams.keyword}
                                        onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })} />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    {t('pages.candidate_search.location')}
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text"
                                        placeholder={t('pages.candidate_search.location_placeholder')}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#233480]/20 transition-all font-medium"
                                        value={searchParams.location}
                                        onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })} />
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                                    {t('pages.candidate_search.experience')}
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#233480]/20 transition-all font-medium appearance-none"
                                        value={searchParams.experience}
                                        onChange={(e) => setSearchParams({ ...searchParams, experience: e.target.value })}>
                                        <option value="">{t('pages.candidate_search.experience_placeholder')}</option>
                                        <option value="fresher">{t('pages.candidate_search.fresher')}</option>
                                        <option value="1">1 {t('pages.candidate_search.years')}</option>
                                        <option value="2">2 {t('pages.candidate_search.years')}</option>
                                        <option value="3">3 {t('pages.candidate_search.years')}</option>
                                        <option value="5">5 {t('pages.candidate_search.years')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="md:self-end md:w-44">
                                <button type="submit" disabled={searching}
                                    className="w-full py-3 md:py-3.5 bg-[#233480] text-white font-bold rounded-lg hover:bg-[#1a2660] transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs md:text-sm disabled:opacity-70">
                                    {searching ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 size={14} className="animate-spin" /> {t('pages.candidate_search.searching')}
                                        </span>
                                    ) : t('pages.candidate_search.search')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Jobs List */}
                <div className="max-w-6xl mx-auto px-4 -mt-24 md:-mt-36 relative z-20">
                    <div className="bg-white shadow-lg border-b-4 border-[#233480] p-4 md:p-8">

                        {/* Error */}
                        {errorMsg && (
                            <div className="mb-4 bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded text-sm">
                                {errorMsg}
                            </div>
                        )}

                        {/* Loading */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="animate-spin text-[#233480]" size={40} />
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-20">
                                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg font-medium">{t('pages.candidate_search.no_jobs_found')}</p>
                                <p className="text-gray-400 text-sm mt-2">{t('pages.candidate_search.try_different_filters')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Results count */}
                                <p className="text-xs text-gray-400 mb-2">
                                    {t('pages.candidate_search.showing_jobs', { count: jobs.length, total: pagination.total })}
                                </p>

                                {jobs.map((job) => (
                                    <div key={job.id}
                                        className="group flex flex-col md:flex-row items-center justify-between p-5 md:p-6 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-100 relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#233480] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full">
                                            <div className="w-full md:w-32 h-20 md:h-20 rounded-lg overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                {job.banner ? (
                                                    <img src={job.banner} alt={job.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={job.logo} alt={job.company}
                                                        className="w-full h-full object-contain bg-white p-2"
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Logo'; }} />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2 md:space-y-3 w-full">
                                                <h3 className="text-base md:text-lg font-medium text-[#1e2a5a] leading-tight group-hover:text-[#233480] transition-colors">
                                                    {job.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 text-xs md:text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                                        <Briefcase size={14} className="text-blue-600" />
                                                        <span className="line-clamp-1">{job.company}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                                        <Clock size={14} className="text-blue-600" />
                                                        {job.experience}
                                                    </div>
                                                    <div className="px-2.5 py-1 bg-green-50 text-green-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
                                                        {job.type}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                                        <MapPin size={14} className="text-blue-600" />
                                                        {job.location}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                                <button onClick={() => handleApply(job.id)}
                                                    className="w-full md:w-28 py-2 md:py-2.5 font-bold text-xs md:text-sm tracking-wider uppercase transition-all shadow-sm bg-[#233480] text-white hover:bg-[#1a2660] active:scale-95">
                                                    {t('pages.candidate_search.apply')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-center gap-4 pt-6">
                                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-40">
                                            {t('pages.candidate_search.previous')}
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            {t('pages.candidate_search.page_of', { current: currentPage, total: pagination.pages })}
                                        </span>
                                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                                            disabled={currentPage === pagination.pages}
                                            className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-40">
                                            {t('pages.candidate_search.next')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CandidateSearchJob;