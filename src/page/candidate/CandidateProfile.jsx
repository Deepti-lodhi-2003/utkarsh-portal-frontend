import React, { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../dashboard/context/AuthContext';
import api from '../../services/api';

const CandidateProfile = () => {
    const { t } = useTranslation();
    const { user, checkAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [skillInput, setSkillInput] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        dob: '',
        gender: '',
        fatherName: '',
        motherName: '',
        industryType: '',
        experience: '',
        country: '',
        preferredLocations: [],
        currentLocation: '',
        internshipDetails: '',
        certificationDetails: '',
        isPhysicallyDisabled: 'Not',
        hasApprenticeship: 'No',
        skills: [],
        resumeHeadline: ''
    });

    const availableSkills = [
        'Plumber', 'Electrician', 'Sanitary Worker', 'Accountant',
        'Wireman', 'IT', 'Student', 'Finance', 'Call Center', 'BPO'
    ];

    // ─── FETCH PROFILE ON MOUNT ───
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const [profileRes, meRes] = await Promise.all([
                api.get('/candidates/profile'),
                api.get('/auth/me')
            ]);

            const profile = profileRes.data.data;
            const userData = meRes.data.data.user;

            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                mobile: userData.mobile || '',
                dob: profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
                    : '',
                gender: profile.gender
                    ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                    : '',
                fatherName: profile.fatherName || '',
                motherName: profile.motherName || '',
                industryType: profile.preferredIndustries?.[0] || '',
                experience: profile.candidateType === 'fresher' ? 'Fresher' : (profile.totalExperience?.years ? `${profile.totalExperience.years} Years` : 'Fresher'),
                country: profile.nationality || '',
                preferredLocations: profile.preferredLocations || [],
                currentLocation: profile.currentAddress?.city || '',
                internshipDetails: profile.internshipDetails || '',
                certificationDetails: profile.certificationDetails || '',
                isPhysicallyDisabled: profile.isPhysicallyDisabled ? 'Yes' : 'Not',
                hasApprenticeship: profile.hasApprenticeship ? 'Yes' : 'No',
                skills: profile.skills?.map(s => (typeof s === 'string' ? s : s.name)) || [],
                resumeHeadline: profile.headline || ''
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
            setErrorMsg(t('pages.candidate_profile.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, skillInput.trim()]
                }));
            }
            setSkillInput('');
        }
    };

    // ─── UPDATE PROFILE - 3 API CALLS ───
    const handleUpdate = async () => {
        try {
            setSaving(true);
            setShowSuccessAlert(false);
            setErrorMsg('');

            // 1️⃣ Update user basic info (name, email)
            await api.put('/auth/update-profile', {
                name: formData.name,
                email: formData.email
            });

            // 2️⃣ Update candidate profile
            const dobParts = formData.dob?.split('/');
            const candidatePayload = {
                fatherName: formData.fatherName,
                dateOfBirth: dobParts?.length === 3
                    ? new Date(`${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`).toISOString()
                    : undefined,
                gender: formData.gender?.toLowerCase(),
                nationality: formData.country,
                currentAddress: {
                    city: formData.currentLocation
                },
                preferredLocations: formData.preferredLocations.length > 0
                    ? formData.preferredLocations
                    : [formData.currentLocation].filter(Boolean),
                preferredIndustries: formData.industryType ? [formData.industryType] : [],
                headline: formData.resumeHeadline,
                isOpenToWork: true
            };

            await api.put('/candidates/profile', candidatePayload);

            // 3️⃣ Update skills
            if (formData.skills.length > 0) {
                await api.put('/candidates/skills', {
                    skills: formData.skills.map(skill => ({
                        name: skill,
                        level: 'intermediate'
                    }))
                });
            }

            // Refresh auth context
            await checkAuth();

            setShowSuccessAlert(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Update failed:', error);
            setErrorMsg(error.response?.data?.message || t('pages.candidate_profile.update_failed'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    // ─── LOADING STATE ───
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#233480]" size={40} />
            </div>
        );
    }

    return (
        <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-[14px]">
                        <Check size={16} className="text-[#155724] stroke-[3px]" />
                        {t('pages.candidate_profile.update_success')}
                    </div>
                    <button onClick={() => setShowSuccessAlert(false)} className="text-[#155724] hover:opacity-70 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
                <div className="mb-6 flex items-center justify-between bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-md">
                    <div className="flex items-center gap-2 text-[14px]">{errorMsg}</div>
                    <button onClick={() => setErrorMsg('')} className="text-[#721c24] hover:opacity-70">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_name')} <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_email')} <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_mobile')} <span className="text-red-500">*</span></label>
                    <input type="text" name="mobile" value={formData.mobile} readOnly
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-gray-100 border border-gray-200 rounded text-gray-500 text-sm cursor-not-allowed" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_dob')} <span className="text-red-500">*</span></label>
                    <input type="text" name="dob" value={formData.dob} onChange={handleInputChange} placeholder={t('pages.candidate_profile.dob_placeholder')}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_gender')} <span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors appearance-none">
                        <option value="">{t('pages.candidate_profile.select_gender')}</option>
                        <option value="Female">{t('pages.candidate_profile.gender_female')}</option>
                        <option value="Male">{t('pages.candidate_profile.gender_male')}</option>
                        <option value="Other">{t('pages.candidate_profile.gender_other')}</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_father_name')} <span className="text-red-500">*</span></label>
                    <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_mother_name')} <span className="text-red-500">*</span></label>
                    <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-600 mb-6 pb-2 border-b border-gray-100">{t('pages.candidate_profile.work_status')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_industry_type')} <span className="text-red-500">*</span></label>
                    <select name="industryType" value={formData.industryType} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors">
                        <option value="">{t('pages.candidate_profile.select_industry')}</option>
                        <option value="IT & Software">{t('pages.candidate_profile.industry_it')}</option>
                        <option value="Healthcare">{t('pages.candidate_profile.industry_healthcare')}</option>
                        <option value="Education">{t('pages.candidate_profile.industry_education')}</option>
                        <option value="Manufacturing">{t('pages.candidate_profile.industry_manufacturing')}</option>
                        <option value="Textile">{t('pages.candidate_profile.industry_textile')}</option>
                        <option value="Retail & E-commerce">{t('pages.candidate_profile.industry_retail')}</option>
                        <option value="Hospitality & Tourism">{t('pages.candidate_profile.industry_hospitality')}</option>
                        <option value="Construction">{t('pages.candidate_profile.industry_construction')}</option>
                        <option value="Automotive">{t('pages.candidate_profile.industry_automotive')}</option>
                        <option value="Agriculture">{t('pages.candidate_profile.industry_agriculture')}</option>
                        <option value="Banking & Finance">{t('pages.candidate_profile.industry_banking')}</option>
                        <option value="Telecommunications">{t('pages.candidate_profile.industry_telecom')}</option>
                        <option value="Energy & Utilities">{t('pages.candidate_profile.industry_energy')}</option>
                        <option value="Real Estate">{t('pages.candidate_profile.industry_real_estate')}</option>
                        <option value="Media & Entertainment">{t('pages.candidate_profile.industry_media')}</option>
                        <option value="Transportation">{t('pages.candidate_profile.industry_transportation')}</option>
                        <option value="Logistics">{t('pages.candidate_profile.industry_logistics')}</option>
                        <option value="Government & Public Administration">{t('pages.candidate_profile.industry_government')}</option>
                        <option value="NGO & Social Services">{t('pages.candidate_profile.industry_ngo')}</option>
                        <option value="Others">{t('pages.candidate_profile.industry_others')}</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_experience')} <span className="text-red-500">*</span></label>
                    <select name="experience" value={formData.experience} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors">
                        <option value="Fresher">{t('pages.candidate_profile.experience_fresher')}</option>
                        <option value="1 Year">{t('pages.candidate_profile.experience_1_year')}</option>
                        <option value="2 Years">{t('pages.candidate_profile.experience_2_years')}</option>
                        <option value="3 Years">{t('pages.candidate_profile.experience_3_years')}</option>
                        <option value="5+ Years">{t('pages.candidate_profile.experience_5_plus')}</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_country')} <span className="text-red-500">*</span></label>
                    <select name="country" value={formData.country} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors">
                        <option value="">{t('pages.candidate_profile.select_country')}</option>
                        <option value="Indian">{t('pages.candidate_profile.country_india')}</option>
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_current_location')} <span className="text-red-500">*</span></label>
                    <input type="text" name="currentLocation" value={formData.currentLocation} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-600 mb-6 pb-2 border-b border-gray-100">{t('pages.candidate_profile.additional_details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div>
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_internship')}</label>
                    <input type="text" name="internshipDetails" value={formData.internshipDetails} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div>
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_certification')}</label>
                    <input type="text" name="certificationDetails" value={formData.certificationDetails} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                    <div>
                        <label className="block text-[11px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_physically_disabled')} <span className="text-red-500">*</span></label>
                        <select name="isPhysicallyDisabled" value={formData.isPhysicallyDisabled} onChange={handleInputChange}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors">
                            <option value="Not">{t('pages.candidate_profile.option_not')}</option>
                            <option value="Yes">{t('pages.candidate_profile.option_yes')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_apprenticeship')} <span className="text-red-500">*</span></label>
                        <select name="hasApprenticeship" value={formData.hasApprenticeship} onChange={handleInputChange}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors">
                            <option value="Yes">{t('pages.candidate_profile.option_yes')}</option>
                            <option value="No">{t('pages.candidate_profile.option_no')}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Skills Section */}
            <div className="mb-8">
                <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_profile.label_primary_skills')} <span className="text-red-500">*</span></label>
                <div className="relative mb-4">
                    <input type="text" placeholder={t('pages.candidate_profile.skills_placeholder')} value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill}
                        className="w-full px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {availableSkills.map(skill => (
                        <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[11px] md:text-[13px] font-bold flex items-center gap-1.5 md:gap-2 transition-all ${formData.skills.includes(skill)
                                ? 'bg-[#233480] text-white shadow-md'
                                : 'bg-orange-50 text-orange-400 border border-orange-100'}`}>
                            {formData.skills.includes(skill) && <Check size={12} />}
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resume Headline */}
            <div>
                <label className="block text-sm font-bold text-[#1e2a5a] mb-2">{t('pages.candidate_profile.label_resume_headline')} <span className="text-red-500">*</span></label>
                <textarea name="resumeHeadline" value={formData.resumeHeadline} onChange={handleInputChange} rows="3"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors resize-none mb-4" />
            </div>

            <div className="flex justify-center pb-20">
                <button onClick={handleUpdate} disabled={saving}
                    className={`w-full md:w-auto bg-[#233480] hover:bg-[#1e2a5a] text-white font-bold py-3 px-12 rounded shadow-lg transition-all text-sm uppercase tracking-wide ${saving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> {t('pages.candidate_profile.updating')}
                        </span>
                    ) : t('pages.candidate_profile.update_profile')}
                </button>
            </div>
        </div>
    );
};

export default CandidateProfile;