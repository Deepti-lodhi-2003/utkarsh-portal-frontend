// pages/candidate/CandidateProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar,
    Download, FileText, Award, Globe, Linkedin, Github, ExternalLink,
    ChevronDown, ChevronUp, Loader2, ArrowLeft, X, Star, Clock,
    Building2, BookOpen, Code, CheckCircle
} from 'lucide-react';
import { candidateAPI } from '../../services/api';
import Footer from '../../component/Footer';

const CandidateProfilePublic = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('about');
    const [expandedExp, setExpandedExp] = useState(null);
    const [expandedEdu, setExpandedEdu] = useState(null);

    useEffect(() => {
        if (id) fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Fetching candidate:', id);
            const res = await candidateAPI.getPublicProfile(id);
            console.log('Response:', res.data);
            setProfile(res.data.data);
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || t('pages.candidate_public_profile.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    // ── Helpers ──
    const formatDate = (date) => {
        if (!date) return t('pages.candidate_public_profile.na');
        return new Date(date).toLocaleDateString('en-IN', {
            month: 'short', year: 'numeric'
        });
    };

    const formatFullDate = (date) => {
        if (!date) return t('pages.candidate_public_profile.na');
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getExperienceYears = () => {
        if (!profile?.experience?.length) return t('pages.candidate_public_profile.fresher');
        let totalMonths = 0;
        profile.experience.forEach(exp => {
            const start = new Date(exp.startDate);
            const end = exp.isCurrent ? new Date() : new Date(exp.endDate);
            totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        });
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        if (years === 0) return `${months} ${t('pages.candidate_public_profile.months')}`;
        if (months === 0) return `${years} ${t('pages.candidate_public_profile.years')}`;
        return `${years}${t('pages.candidate_public_profile.years_plus')}`;
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#233480] mx-auto mb-3" />
                    <p className="text-gray-500">{t('pages.candidate_public_profile.loading')}</p>
                </div>
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t('pages.candidate_public_profile.profile_not_found')}</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button type="button" onClick={() => navigate(-1)}
                                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                                {t('pages.candidate_public_profile.go_back')}
                            </button>
                            <button type="button" onClick={fetchProfile}
                                className="px-5 py-2.5 bg-[#233480] text-white rounded-lg hover:bg-[#1a2660] font-medium">
                                {t('pages.candidate_public_profile.retry')}
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!profile) return null;

    const userName = profile.user?.name || profile.fullName || t('pages.candidate_public_profile.unknown');
    const avatarUrl = profile.user?.avatar?.url || profile.avatar?.url || null;
    const email = profile.user?.email || profile.email || '';
    const phone = profile.user?.phone || profile.phone || '';

    const tabs = [
        { id: 'about', label: t('pages.candidate_public_profile.tab_about'), icon: User },
        { id: 'experience', label: t('pages.candidate_public_profile.tab_experience'), icon: Briefcase },
        { id: 'education', label: t('pages.candidate_public_profile.tab_education'), icon: GraduationCap },
        { id: 'skills', label: t('pages.candidate_public_profile.tab_skills'), icon: Code },
        { id: 'additional', label: t('pages.candidate_public_profile.tab_additional'), icon: Star },
    ];

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                {/* Banner */}
                <div className="relative w-full h-48 md:h-56 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/85 mix-blend-multiply" />

                    {/* Back Button */}
                    <button type="button" onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm transition">
                        <ArrowLeft size={16} /> {t('pages.candidate_public_profile.back')}
                    </button>
                </div>

                <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-10 pb-12">

                    {/* ═══ Profile Header Card ═══ */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row gap-6">

                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={userName}
                                            className="w-28 h-28 md:w-32 md:h-32 rounded-xl object-cover border-4 border-white shadow-md"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    ) : null}
                                    <div className={`w-28 h-28 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-[#233480] to-[#3a4fa0] flex items-center justify-center border-4 border-white shadow-md ${avatarUrl ? 'hidden' : ''}`}>
                                        <span className="text-3xl md:text-4xl font-bold text-white">
                                            {getInitials(userName)}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#1e2a5a] mb-1">
                                        {userName}
                                    </h1>

                                    {profile.headline && (
                                        <p className="text-gray-600 text-lg mb-3">{profile.headline}</p>
                                    )}

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 mb-4">
                                        {(profile.city || profile.location?.city) && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-[#233480]" />
                                                {profile.city || profile.location?.city}
                                                {(profile.state || profile.location?.state) && `, ${profile.state || profile.location?.state}`}
                                            </span>
                                        )}
                                        {email && (
                                            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-[#233480] transition">
                                                <Mail size={14} className="text-[#233480]" />
                                                {email}
                                            </a>
                                        )}
                                        {phone && (
                                            <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-[#233480] transition">
                                                <Phone size={14} className="text-[#233480]" />
                                                {phone}
                                            </a>
                                        )}
                                        {profile.dateOfBirth && (
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-[#233480]" />
                                                {formatFullDate(profile.dateOfBirth)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="flex flex-wrap gap-3">
                                        <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                                            <Briefcase size={14} /> {getExperienceYears()} {t('pages.candidate_public_profile.exp')}
                                        </span>
                                        {profile.skills?.length > 0 && (
                                            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                                                <Code size={14} /> {profile.skills.length} {t('pages.candidate_public_profile.skills_count')}
                                            </span>
                                        )}
                                        {profile.education?.length > 0 && (
                                            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                                                <GraduationCap size={14} /> {profile.education.length} {t('pages.candidate_public_profile.degrees')}
                                            </span>
                                        )}
                                        {profile.candidateType && (
                                            <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium capitalize flex items-center gap-1.5">
                                                <User size={14} /> {profile.candidateType}
                                            </span>
                                        )}
                                        {profile.gender && (
                                            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium capitalize">
                                                {profile.gender}
                                            </span>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    {(profile.website || profile.linkedin || profile.github || profile.socialLinks) && (
                                        <div className="flex gap-3 mt-4">
                                            {(profile.linkedin || profile.socialLinks?.linkedin) && (
                                                <a href={profile.linkedin || profile.socialLinks?.linkedin}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-9 h-9 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition">
                                                    <Linkedin size={16} />
                                                </a>
                                            )}
                                            {(profile.github || profile.socialLinks?.github) && (
                                                <a href={profile.github || profile.socialLinks?.github}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-9 h-9 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition">
                                                    <Github size={16} />
                                                </a>
                                            )}
                                            {(profile.website || profile.socialLinks?.website) && (
                                                <a href={profile.website || profile.socialLinks?.website}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="w-9 h-9 bg-green-100 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-200 transition">
                                                    <Globe size={16} />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Resume Download */}
                                {profile.resume?.url && (
                                    <div className="flex-shrink-0">
                                        <a href={profile.resume.url} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#233480] text-white rounded-lg hover:bg-[#1a2660] font-semibold text-sm transition shadow-md">
                                            <Download size={16} /> {t('pages.candidate_public_profile.download_resume')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ═══ Tabs ═══ */}
                    <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
                        <div className="flex overflow-x-auto border-b">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                                            ? 'border-[#233480] text-[#233480] bg-blue-50/50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                            }`}>
                                        <Icon size={16} /> {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ═══ TAB: About ═══ */}
                    {activeTab === 'about' && (
                        <div className="space-y-6">
                            {/* About Me */}
                            {profile.about && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                        <User size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.about_me')}
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {profile.about}
                                    </p>
                                </div>
                            )}

                            {/* Personal Info */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                    <FileText size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.personal_info')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow icon={User} label={t('pages.candidate_public_profile.label_full_name')} value={userName} />
                                    <InfoRow icon={Mail} label={t('pages.candidate_public_profile.label_email')} value={email} isLink={`mailto:${email}`} />
                                    <InfoRow icon={Phone} label={t('pages.candidate_public_profile.label_phone')} value={phone} isLink={`tel:${phone}`} />
                                    <InfoRow icon={MapPin} label={t('pages.candidate_public_profile.label_location')}
                                        value={[profile.city || profile.location?.city, profile.state || profile.location?.state].filter(Boolean).join(', ')} />
                                    <InfoRow icon={Calendar} label={t('pages.candidate_public_profile.label_dob')} value={formatFullDate(profile.dateOfBirth)} />
                                    <InfoRow icon={Globe} label={t('pages.candidate_public_profile.label_nationality')} value={profile.nationality} />
                                    <InfoRow icon={User} label={t('pages.candidate_public_profile.label_father_name')} value={profile.fatherName} />
                                    <InfoRow icon={User} label={t('pages.candidate_public_profile.label_mother_name')} value={profile.motherName} />
                                    <InfoRow icon={Briefcase} label={t('pages.candidate_public_profile.label_experience')} value={getExperienceYears()} />
                                    {profile.headline && <InfoRow icon={Award} label={t('pages.candidate_public_profile.label_headline')} value={profile.headline} />}
                                    <InfoRow icon={CheckCircle} label={t('pages.candidate_public_profile.label_profile_score')} value={profile.profileCompletion ? `${profile.profileCompletion}%` : null} />
                                </div>
                            </div>

                            {/* Preferences */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                    <Star size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.preferences_status')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoRow icon={MapPin} label={t('pages.candidate_public_profile.label_preferred_locations')} value={profile.preferredLocations?.join(', ')} />
                                    <InfoRow icon={Building2} label={t('pages.candidate_public_profile.label_preferred_industries')} value={profile.preferredIndustries?.join(', ')} />
                                    <InfoRow icon={Briefcase} label={t('pages.candidate_public_profile.label_job_types')} value={profile.preferredJobTypes?.join(', ')} />
                                    <InfoRow icon={Globe} label={t('pages.candidate_public_profile.label_willing_relocate')} value={profile.willingToRelocate ? t('pages.candidate_public_profile.yes') : t('pages.candidate_public_profile.no')} />
                                    <InfoRow icon={CheckCircle} label={t('pages.candidate_public_profile.label_open_to_work')} value={profile.isOpenToWork ? t('pages.candidate_public_profile.yes') : t('pages.candidate_public_profile.no')} />
                                    <InfoRow icon={User} label={t('pages.candidate_public_profile.label_physically_disabled')} value={profile.isPhysicallyDisabled ? t('pages.candidate_public_profile.yes') : t('pages.candidate_public_profile.no')} />
                                    <InfoRow icon={Award} label={t('pages.candidate_public_profile.label_hiring_status')} value={profile.hiringStatus} />
                                </div>
                            </div>

                            {/* Resume */}
                            {profile.resume && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.resume')}
                                    </h2>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText size={24} className="text-red-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate">
                                                {profile.resume.filename || 'Resume.pdf'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {profile.resume.uploadedAt && `${t('pages.candidate_public_profile.uploaded')} ${formatDate(profile.resume.uploadedAt)}`}
                                            </p>
                                        </div>
                                        {profile.resume.url && (
                                            <a href={profile.resume.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-4 py-2 bg-[#233480] text-white rounded-lg text-sm font-medium hover:bg-[#1a2660] transition">
                                                <Download size={14} /> {t('pages.candidate_public_profile.download')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quick Skills Preview */}
                            {profile.skills?.length > 0 && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-[#1e2a5a] flex items-center gap-2">
                                            <Code size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.top_skills')}
                                        </h2>
                                        <button type="button" onClick={() => setActiveTab('skills')}
                                            className="text-sm text-[#233480] font-medium hover:underline">
                                            {t('pages.candidate_public_profile.view_all')}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.slice(0, 10).map((skill, i) => {
                                            const skillName = typeof skill === 'string' ? skill : skill.name || '';
                                            const level = typeof skill === 'object' ? skill.level : null;
                                            return (
                                                <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                                                    {skillName}
                                                    {level && (
                                                        <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded capitalize">
                                                            {level}
                                                        </span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                        {profile.skills.length > 10 && (
                                            <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                                                {t('pages.candidate_public_profile.more_skills', { count: profile.skills.length - 10 })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ TAB: Experience ═══ */}
                    {activeTab === 'experience' && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-[#1e2a5a] mb-6 flex items-center gap-2">
                                <Briefcase size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.work_experience')}
                            </h2>

                            {!profile.experience?.length ? (
                                <div className="text-center py-12">
                                    <Briefcase size={48} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium">{t('pages.candidate_public_profile.no_experience')}</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200 hidden md:block"></div>

                                    <div className="space-y-6">
                                        {profile.experience.map((exp, index) => (
                                            <div key={exp._id || index} className="relative flex gap-4">
                                                {/* Timeline Dot */}
                                                <div className="hidden md:flex flex-shrink-0 w-10 h-10 rounded-full bg-[#233480] items-center justify-center z-10">
                                                    <Briefcase size={16} className="text-white" />
                                                </div>

                                                {/* Card */}
                                                <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-[#1e2a5a]">
                                                                {exp.designation || exp.title}
                                                            </h3>
                                                            <p className="text-[#233480] font-medium flex items-center gap-1.5">
                                                                <Building2 size={14} /> {exp.company || exp.organization}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {exp.isCurrent && (
                                                                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                                                    <CheckCircle size={10} /> {t('pages.candidate_public_profile.current')}
                                                                </span>
                                                            )}
                                                            {exp.employmentType && (
                                                                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium capitalize">
                                                                    {exp.employmentType.replace(/-/g, ' ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={13} />
                                                            {formatDate(exp.from)} - {exp.isCurrent ? t('pages.candidate_public_profile.present') : formatDate(exp.to)}
                                                        </span>
                                                        {(exp.city || exp.location) && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={13} /> {exp.city || exp.location}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {exp.description && (
                                                        <>
                                                            <p className={`text-gray-600 text-sm leading-relaxed ${expandedExp === index ? '' : 'line-clamp-3'}`}>
                                                                {exp.description}
                                                            </p>
                                                            {exp.description.length > 200 && (
                                                                <button type="button" onClick={() => setExpandedExp(expandedExp === index ? null : index)}
                                                                    className="text-[#233480] text-xs font-medium mt-1 flex items-center gap-1 hover:underline">
                                                                    {expandedExp === index ? <><ChevronUp size={12} /> {t('pages.candidate_public_profile.show_less')}</> : <><ChevronDown size={12} /> {t('pages.candidate_public_profile.show_more')}</>}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ TAB: Education ═══ */}
                    {activeTab === 'education' && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-[#1e2a5a] mb-6 flex items-center gap-2">
                                <GraduationCap size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.education')}
                            </h2>

                            {!profile.education?.length ? (
                                <div className="text-center py-12">
                                    <GraduationCap size={48} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium">{t('pages.candidate_public_profile.no_education')}</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200 hidden md:block"></div>

                                    <div className="space-y-6">
                                        {profile.education.map((edu, index) => (
                                            <div key={edu._id || index} className="relative flex gap-4">
                                                <div className="hidden md:flex flex-shrink-0 w-10 h-10 rounded-full bg-green-600 items-center justify-center z-10">
                                                    <GraduationCap size={16} className="text-white" />
                                                </div>

                                                <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
                                                    <h3 className="text-lg font-bold text-[#1e2a5a] mb-1">
                                                        {edu.degree}
                                                        {edu.field && <span className="text-gray-500 font-normal"> in {edu.field}</span>}
                                                    </h3>
                                                    <p className="text-[#233480] font-medium flex items-center gap-1.5 mb-2">
                                                        <Building2 size={14} /> {edu.institution || edu.school}
                                                        {edu.board && <span className="text-gray-400 text-sm font-normal">({edu.board})</span>}
                                                    </p>

                                                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={13} />
                                                            {t('pages.candidate_public_profile.pass_year')}: {edu.passingYear || t('pages.candidate_public_profile.na')}
                                                        </span>
                                                        {(edu.percentage || edu.cgpa) && (
                                                            <span className="flex items-center gap-1">
                                                                <Star size={13} className="text-yellow-500" />
                                                                {edu.percentage ? `${t('pages.candidate_public_profile.percentage')}: ${edu.percentage}%` : `${t('pages.candidate_public_profile.cgpa')}: ${edu.cgpa}`}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {edu.description && (
                                                        <>
                                                            <p className={`text-gray-600 text-sm leading-relaxed ${expandedEdu === index ? '' : 'line-clamp-2'}`}>
                                                                {edu.description}
                                                            </p>
                                                            {edu.description.length > 150 && (
                                                                <button type="button" onClick={() => setExpandedEdu(expandedEdu === index ? null : index)}
                                                                    className="text-[#233480] text-xs font-medium mt-1 flex items-center gap-1 hover:underline">
                                                                    {expandedEdu === index ? <><ChevronUp size={12} /> {t('pages.candidate_public_profile.less')}</> : <><ChevronDown size={12} /> {t('pages.candidate_public_profile.more')}</>}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══ TAB: Skills ═══ */}
                    {activeTab === 'skills' && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-lg font-bold text-[#1e2a5a] mb-6 flex items-center gap-2">
                                <Code size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.skills_expertise')}
                            </h2>

                            {!profile.skills?.length ? (
                                <div className="text-center py-12">
                                    <Code size={48} className="text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium">{t('pages.candidate_public_profile.no_skills')}</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Skills Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {profile.skills.map((skill, i) => {
                                            const skillName = typeof skill === 'string' ? skill : skill.name || '';
                                            const level = typeof skill === 'object' ? skill.level : null;
                                            const levelColors = {
                                                beginner: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                                                intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
                                                advanced: 'bg-green-100 text-green-700 border-green-200',
                                                expert: 'bg-purple-100 text-purple-700 border-purple-200',
                                            };
                                            const levelWidths = {
                                                beginner: '25%', intermediate: '50%',
                                                advanced: '75%', expert: '100%',
                                            };

                                            return (
                                                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-800">{skillName}</span>
                                                        {level && (
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize border ${levelColors[level] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                                {level}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {level && (
                                                        <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#233480] rounded-full transition-all duration-500"
                                                                style={{ width: levelWidths[level] || '50%' }}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Languages */}
                                    {profile.languages?.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-md font-bold text-[#1e2a5a] mb-3">{t('pages.candidate_public_profile.languages')}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.languages.map((lang, i) => (
                                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills Summary */}
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                        <p className="text-sm text-blue-700">
                                            <strong>{profile.skills.length}</strong> {t('pages.candidate_public_profile.skills_listed')}
                                            {profile.skills.some(s => typeof s === 'object' && s.level === 'expert') &&
                                                ` • ${profile.skills.filter(s => s.level === 'expert').length} ${t('pages.candidate_public_profile.expert_level')}`}
                                            {profile.skills.some(s => typeof s === 'object' && s.level === 'advanced') &&
                                                ` • ${profile.skills.filter(s => s.level === 'advanced').length} ${t('pages.candidate_public_profile.advanced_level')}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}



                    {/* ═══ TAB: Additional Details (Internships, Certifications, etc.) ═══ */}
                    {activeTab === 'additional' && (
                        <div className="space-y-6">
                            {/* Internship Details */}
                            {profile.internshipDetails && profile.internshipDetails !== 'no' && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                        <Briefcase size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.internship_details')}
                                    </h2>
                                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{profile.internshipDetails}</p>
                                </div>
                            )}

                            {/* Certification Details */}
                            {profile.certificationDetails && profile.certificationDetails !== 'no' && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                        <Award size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.certifications')}
                                    </h2>
                                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{profile.certificationDetails}</p>
                                </div>
                            )}

                            {/* Apprenticeship */}
                            {profile.hasApprenticeship && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                        <BookOpen size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.apprenticeship')}
                                    </h2>
                                    <p className="text-gray-600">{t('pages.candidate_public_profile.has_apprenticeship')}</p>
                                </div>
                            )}

                            {/* Academic Results */}
                            {(profile.passingYear || profile.result) && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-lg font-bold text-[#1e2a5a] mb-4 flex items-center gap-2">
                                        <GraduationCap size={20} className="text-[#233480]" /> {t('pages.candidate_public_profile.academic_overview')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow icon={Calendar} label={t('pages.candidate_public_profile.label_passing_year')} value={profile.passingYear} />
                                        <InfoRow icon={Star} label={t('pages.candidate_public_profile.label_result_cgpa')} value={profile.result} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div >
            <Footer />
        </>
    );
};

// ── InfoRow Component ──
const InfoRow = ({ icon: Icon, label, value, isLink }) => {
    const { t } = useTranslation();
    if (!value || value === 'N/A' || value === t('pages.candidate_public_profile.na') || value === 'Invalid Date') return null;
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-[#233480]" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                {isLink ? (
                    <a href={isLink} className="text-sm font-medium text-gray-800 hover:text-[#233480] transition truncate block">
                        {value}
                    </a>
                ) : (
                    <p className="text-sm font-medium text-gray-800 capitalize">{value}</p>
                )}
            </div>
        </div>
    );
};

export default CandidateProfilePublic;