

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Briefcase, Calendar, X, Loader2 } from 'lucide-react';
import Footer from '../../component/Footer';
import { searchAPI, applicationAPI } from '../../services/api';

const SearchCandidate = () => {
    const { t } = useTranslation();
    const [searchType, setSearchType] = useState('Skills');
    const [inputValue, setInputValue] = useState('');
    const [tags, setTags] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shortlisting, setShortlisting] = useState(null);

    // ── Fetch candidates when tags change ──
    useEffect(() => {
        if (tags.length > 0) {
            searchCandidates();
        } else {
            fetchAllCandidates();
        }
    }, [tags]);

    // ── Initial load ──
    useEffect(() => {
        fetchAllCandidates();
    }, []);

    const fetchAllCandidates = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await searchAPI.candidates({});
            const data = res.data.data;

            const mapped = (data.candidates || []).map(c => ({
                id: c._id,
                name: c.user?.name || 'N/A',
                role: c.headline || 'N/A',
                company: c.experience?.[0]?.company || c.currentAddress?.city || '',
                experience: c.totalExperience
                    ? `${c.totalExperience.years || 0} Year`
                    : 'Fresher',
                location: c.currentAddress?.city || 'N/A',
                updatedDate: new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                isShortlisted: false,
                skills: c.skills?.map(s => s.name) || []
            }));

            setCandidates(mapped);
        } catch (err) {
            console.error('Fetch candidates error:', err);
            setError(err.response?.data?.message || t('pages.search_candidate.errors.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    const searchCandidates = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};

            tags.forEach(tag => {
                switch (tag.type) {
                    case 'Skills':
                        params.skills = params.skills ? `${params.skills},${tag.value}` : tag.value;
                        break;
                    case 'Location':
                        params.location = tag.value;
                        break;
                    case 'Designation':
                        params.q = tag.value;
                        break;
                    case 'Experience':
                        params.experienceMin = Number(tag.value) || 0;
                        params.experienceMax = (Number(tag.value) || 0) + 2;
                        break;
                }
            });

            const res = await searchAPI.candidates(params);
            const data = res.data.data;

            const mapped = (data.candidates || []).map(c => ({
                id: c._id,
                name: c.user?.name || 'N/A',
                role: c.headline || 'N/A',
                company: c.experience?.[0]?.company || c.currentAddress?.city || '',
                experience: c.totalExperience
                    ? `${c.totalExperience.years || 0} Year`
                    : 'Fresher',
                location: c.currentAddress?.city || 'N/A',
                updatedDate: new Date(c.updatedAt || c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                isShortlisted: false,
                skills: c.skills?.map(s => s.name) || []
            }));

            setCandidates(mapped);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.response?.data?.message || t('pages.search_candidate.errors.search_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = () => {
        if (inputValue.trim()) {
            setTags([...tags, { type: searchType, value: inputValue.trim() }]);
            setInputValue('');
        }
    };

    const handleRemoveTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const handleShortlist = async (candidateId) => {
        setShortlisting(candidateId);
        try {
            // Note: Shortlisting requires an application ID in the real API
            // For now we toggle locally. In production, integrate with applicationAPI.shortlist()
            setCandidates(prev =>
                prev.map(c => c.id === candidateId ? { ...c, isShortlisted: !c.isShortlisted } : c)
            );
        } catch (err) {
            console.error('Shortlist error:', err);
        } finally {
            setShortlisting(null);
        }
    };

    const getPlaceholder = () => {
        switch (searchType) {
            case 'Skills': return t('pages.search_candidate.placeholders.skill');
            case 'Location': return t('pages.search_candidate.placeholders.location');
            case 'Designation': return t('pages.search_candidate.placeholders.designation');
            case 'Experience': return t('pages.search_candidate.placeholders.experience');
            default: return t('pages.search_candidate.placeholders.search');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Banner */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-wider text-center px-4">{t('pages.search_candidate.title')}</h1>
            </div>

            {/* Search Section */}
            <div className="max-w-6xl mx-auto w-full px-4 -mt-8 relative z-20">
                <div className="bg-white shadow-lg p-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/4">
                        <select className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] text-gray-700 font-medium"
                            value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                            <option value="Skills">{t('pages.search_candidate.search_types.skills')}</option>
                            <option value="Designation">{t('pages.search_candidate.search_types.designation')}</option>
                            <option value="Experience">{t('pages.search_candidate.search_types.experience')}</option>
                            <option value="Location">{t('pages.search_candidate.search_types.location')}</option>
                        </select>
                    </div>
                    <div className="w-full md:w-2/4">
                        <input type="text" placeholder={getPlaceholder()}
                            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50"
                            value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} />
                    </div>
                    <div className="w-full md:w-1/4">
                        <button onClick={handleAddTag}
                            className="w-full px-6 py-3 bg-[#233480] text-white font-bold rounded hover:bg-[#1a2660] transition-colors uppercase tracking-wide">
                            {t('pages.search_candidate.actions.add')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div className="max-w-6xl mx-auto w-full px-4 mt-6">
                <div className="flex flex-wrap gap-3">
                    {tags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded shadow-sm">
                            <span className="text-sm font-medium mr-2">{tag.value}</span>
                            <button onClick={() => handleRemoveTag(index)} className="text-red-500 hover:text-red-700 font-bold">
                                <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="max-w-6xl mx-auto w-full px-4 mt-4">
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X size={16} /></button>
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="max-w-6xl mx-auto w-full px-4 mt-6 mb-12 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#233480]" />
                    </div>
                ) : candidates.length > 0 ? (
                    candidates.map(candidate => (
                        <div key={candidate.id}
                            className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center border border-gray-100 border-l-4 border-l-transparent hover:border-l-[#233480] transition-all duration-200 group">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#233480] mb-1">{candidate.name}</h3>
                                {candidate.company && candidate.company !== candidate.location ? (
                                    <p className="text-sm text-gray-500 mb-2">{candidate.role} @ {candidate.company}</p>
                                ) : (
                                    <p className="text-sm text-gray-500 mb-2">{candidate.role}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <span className="flex items-center gap-1"><Briefcase size={14} className="text-[#233480]" /> {candidate.experience}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} className="text-[#233480]" /> {candidate.location}</span>
                                </div>
                                <p className="text-xs text-gray-400">{candidate.skills.join(', ')}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                                <button onClick={() => handleShortlist(candidate.id)} disabled={shortlisting === candidate.id}
                                    className={`px-6 py-2 rounded text-sm font-medium transition-colors w-32 ${candidate.isShortlisted
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-[#233480] text-white hover:bg-[#1a2660]'}`}>
                                    {shortlisting === candidate.id ? (
                                        <Loader2 size={14} className="animate-spin mx-auto" />
                                    ) : candidate.isShortlisted ? t('pages.search_candidate.actions.shortlisted') : t('pages.search_candidate.actions.shortlist')}
                                </button>
                                <span className="text-xs text-gray-400 block pt-1">{t('pages.search_candidate.updated')} {candidate.updatedDate}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">{t('pages.search_candidate.no_candidates')}</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default SearchCandidate;