import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../../component/Footer';
import { Bold, Italic, Underline, List, ListOrdered, X, Loader2, Upload, Image } from 'lucide-react';
import { jobsAPI } from '../../services/api';

const EditJob = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const id = params.id || params.jobId;
    const editorRef = useRef(null);

    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showDescriptionError, setShowDescriptionError] = useState(false);

    // Banner
    const bannerRef = useRef(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [existingBanner, setExistingBanner] = useState(null);

    const [formData, setFormData] = useState({
        title: '', description: '', industryType: '',
        employmentType: '', jobType: '', minSalary: '', maxSalary: '',
        minExperience: '', maxExperience: '', education: '',
        vacancy: '', location: '', applicationDeadline: ''
    });

    const reverseJobTypeMap = {
        'full-time': 'Full Time', 'part-time': 'Part Time',
        'contract': 'Contract', 'internship': 'Internship'
    };
    const reverseWorkModeMap = {
        'remote': 'Remote', 'onsite': 'On-Site', 'hybrid': 'Hybrid'
    };
    const reverseEducationMap = {
        'graduate': 'Graduate', 'postgraduate': 'Post Graduate',
        'diploma': 'Diploma', 'any': 'Any'
    };

    useEffect(() => {
        if (!id) {
            setLoadError(t('pages.edit_job.errors.no_job_id', { url: location.pathname }));
            setLoading(false);
            return;
        }
        fetchJob();
    }, [id]);

    const fetchJob = async () => {
        setLoading(true);
        setLoadError('');
        try {
            const res = await jobsAPI.getById(id);
            const job = res.data.data?.job || res.data.data;

            if (!job) {
                setLoadError(t('pages.edit_job.errors.job_not_found'));
                return;
            }

            setFormData({
                title: job.title || '',
                description: job.description || '',
                industryType: job.industry || job.industryType || job.category || '',
                employmentType: reverseJobTypeMap[job.jobType] || '',
                jobType: reverseWorkModeMap[job.workMode] || '',
                minSalary: job.salary?.min?.toString() || '',
                maxSalary: job.salary?.max?.toString() || '',
                minExperience: job.experience?.min?.toString() || '',
                maxExperience: job.experience?.max?.toString() || '',
                education: reverseEducationMap[job.education] || job.education || '',
                vacancy: job.vacancies?.toString() || '',
                location: job.location?.city || '',
                applicationDeadline: job.applicationDeadline
                    ? new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
            });

            // Set existing banner if available
            if (job.banner?.url) {
                setExistingBanner(job.banner.url);
            }

            if (job.skills?.length) {
                setSkills(job.skills.map(s => typeof s === 'string' ? s : s.name || '').filter(Boolean));
            }

            setTimeout(() => {
                if (editorRef.current && job.description) {
                    editorRef.current.innerHTML = job.description;
                }
            }, 200);

        } catch (err) {
            setLoadError(err.response?.data?.message || err.message || t('pages.edit_job.errors.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleFormat = (cmd) => {
        document.execCommand(cmd, false, null);
        editorRef.current?.focus();
        updateDescription();
    };

    const updateDescription = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            setFormData(prev => ({ ...prev, description: content }));
            if (content.trim()) setShowDescriptionError(false);
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const s = skillInput.trim().replace(/,/g, '');
            if (s && !skills.includes(s)) {
                setSkills([...skills, s]);
                setSkillInput('');
                setErrors(prev => ({ ...prev, skills: '' }));
            }
        }
    };

    const removeSkill = (s) => setSkills(skills.filter(sk => sk !== s));

    // Banner handlers
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, banner: t('pages.edit_job.errors.banner_type') }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, banner: t('pages.edit_job.errors.banner_size') }));
            return;
        }
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setErrors(prev => { const n = { ...prev }; delete n.banner; return n; });
    };

    const removeBanner = () => {
        setBannerFile(null);
        setBannerPreview(null);
        setExistingBanner(null);
        if (bannerRef.current) bannerRef.current.value = '';
    };

    const validateField = (name, value) => {
        if (!value || (typeof value === 'string' && !value.trim())) return t('pages.edit_job.errors.required');
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const buildPayload = () => {
        const jobTypeMap = { 'Full Time': 'full-time', 'Part Time': 'part-time', 'Contract': 'contract', 'Internship': 'internship' };
        const workModeMap = { 'Remote': 'remote', 'On-Site': 'onsite', 'Hybrid': 'hybrid' };
        const educationMap = { 'Graduate': 'graduate', 'Post Graduate': 'postgraduate', 'Diploma': 'diploma', 'Any': 'any' };

        const minExp = Number(formData.minExperience) || 0;
        let experienceLevel = 'fresher';
        if (minExp >= 5) experienceLevel = 'senior';
        else if (minExp >= 2) experienceLevel = 'mid';

        return {
            title: formData.title,
            description: formData.description,
            skills: skills.map(s => ({ name: s, isRequired: false })),
            jobType: jobTypeMap[formData.employmentType] || 'full-time',
            workMode: workModeMap[formData.jobType] || 'onsite',
            experienceLevel,
            experience: { min: Number(formData.minExperience) || 0, max: Number(formData.maxExperience) || 0 },
            education: educationMap[formData.education] || 'graduate',
            industry: formData.industryType,
            salary: { min: Number(formData.minSalary) || 0, max: Number(formData.maxSalary) || 0, currency: 'INR', period: 'yearly' },
            location: { city: formData.location, state: 'Madhya Pradesh' },
            vacancies: Number(formData.vacancy) || 1,
            applicationDeadline: formData.applicationDeadline || undefined,
        };
    };

    //  handleSubmit accepts event OR can be called directly
    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        setSubmitError('');
        setSubmitSuccess(false);

        // Validate
        const newErrors = {};
        ['title', 'industryType', 'employmentType', 'jobType', 'minSalary', 'maxSalary', 'minExperience', 'maxExperience', 'location']
            .forEach(f => {
                const err = validateField(f, formData[f]);
                if (err) newErrors[f] = err;
            });

        if (skills.length === 0) newErrors.skills = t('pages.edit_job.errors.skills_required');

        const descContent = editorRef.current?.innerHTML?.trim();
        if (!descContent) {
            setShowDescriptionError(true);
        } else {
            setShowDescriptionError(false);
        }

        setErrors(newErrors);
        setTouched(
            ['title', 'industryType', 'employmentType', 'jobType', 'minSalary', 'maxSalary', 'minExperience', 'maxExperience', 'location']
                .reduce((acc, curr) => ({ ...acc, [curr]: true }), { skills: true })
        );

        if (Object.keys(newErrors).length > 0 || !descContent) {
            const firstError = document.querySelector('.border-red-500');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        //  Call update API
        submitUpdate();
    };

    const submitUpdate = async () => {
        setSubmitting(true);
        try {
            const payload = buildPayload();
            console.log('Updating job:', id, payload);
            await jobsAPI.update(id, payload);

            // Upload banner if new file selected
            if (bannerFile) {
                const fd = new FormData();
                fd.append('banner', bannerFile);
                try {
                    await jobsAPI.uploadBanner(id, fd);
                } catch (err) {
                    console.error('Banner upload failed:', err);
                }
            }

            setSubmitSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => navigate(-1), 2000);
        } catch (err) {
            console.error('Update error:', err);
            setSubmitError(err.response?.data?.message || t('pages.edit_job.update_failed'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const suggestions = ["Plumber", "Electrician", "Sanitary Worker", "Accountant", "Wireman", "IT", "Student", "Finance", "Call Center", "BPO"];

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#233480] mx-auto mb-3" />
                    <p className="text-gray-500">{t('pages.edit_job.loading')}</p>
                </div>
            </div>
        );
    }

    // ── Load Error ──
    if (loadError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t('pages.edit_job.load_failed_title')}</h3>
                    <p className="text-gray-500 mb-2">{loadError}</p>
                    <p className="text-xs text-gray-400 mb-4">{t('pages.edit_job.debug_info', { url: location.pathname, params: JSON.stringify(params) })}</p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-300 rounded hover:bg-gray-50">{t('pages.edit_job.actions.back')}</button>
                        <button onClick={fetchJob} className="px-5 py-2.5 bg-[#233480] text-white rounded hover:bg-[#1a2660]">{t('pages.edit_job.actions.retry')}</button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main Form ──
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <style>{`
                #description-editor ul { list-style-type: disc !important; padding-left: 20px !important; margin: 10px 0 !important; }
                #description-editor ol { list-style-type: decimal !important; padding-left: 20px !important; margin: 10px 0 !important; }
                #description-editor li { display: list-item !important; }
            `}</style>

            {/* Banner */}
            <div className="relative w-full h-32 flex flex-col items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white tracking-wider text-center px-4">{t('pages.edit_job.title')}</h1>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20 flex-1">
                <div className="bg-white border-b-4 border-[#233480] shadow-lg p-8">

                    <button type="button" onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#233480] mb-6 text-sm font-medium">
                        ← {t('pages.edit_job.actions.back_to_jobs')}
                    </button>

                    {submitSuccess && (
                        <div className="mb-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded">
                             {t('pages.edit_job.update_success')}
                        </div>
                    )}
                    {submitError && (
                        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                            <span>{submitError}</span>
                            <button type="button" onClick={() => setSubmitError('')}><X size={16} /></button>
                        </div>
                    )}

                    {/*  NO onSubmit on form */}
                    <div className="space-y-6">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.title')} <span className="text-red-500">*</span></label>
                            <input type="text" name="title" placeholder={t('pages.edit_job.placeholders.title')}
                                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.title} onChange={handleChange} onBlur={handleBlur} />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Banner Upload */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                    <Image size={16} /> {t('pages.edit_job.banner.title')}
                                </h3>
                            </div>

                            {bannerPreview || existingBanner ? (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={bannerPreview || existingBanner}
                                        alt="Banner"
                                        className="w-full h-48 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeBanner}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                    {bannerFile && (
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                            {bannerFile.name}
                                        </div>
                                    )}
                                    {existingBanner && !bannerFile && (
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                            {t('pages.edit_job.banner.current')}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    onClick={() => bannerRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
                                        hover:border-[#233480] hover:bg-blue-50/30 transition-all
                                        ${errors.banner ? 'border-red-400 bg-red-50/20' : 'border-gray-300'}`}
                                >
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">{t('pages.edit_job.banner.click_upload')}</p>
                                    <p className="text-xs text-gray-400 mt-1">{t('pages.edit_job.banner.hint')}</p>
                                </div>
                            )}

                            <input
                                ref={bannerRef}
                                type="file"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className="hidden"
                            />
                            {errors.banner && (
                                <p className="text-red-500 text-xs mt-1">{errors.banner}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.description')} <span className="text-red-500">*</span></label>
                            <p className="text-xs text-gray-500 mb-2">{t('pages.edit_job.description_tip')}</p>
                            <div className={`border rounded overflow-hidden ${showDescriptionError ? 'border-red-500' : 'border-gray-300'}`}>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-300">
                                    <button type="button" onClick={() => handleFormat('bold')} className="p-1 hover:bg-gray-200 rounded"><Bold size={16} /></button>
                                    <button type="button" onClick={() => handleFormat('italic')} className="p-1 hover:bg-gray-200 rounded"><Italic size={16} /></button>
                                    <button type="button" onClick={() => handleFormat('underline')} className="p-1 hover:bg-gray-200 rounded"><Underline size={16} /></button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1 hover:bg-gray-200 rounded"><List size={16} /></button>
                                    <button type="button" onClick={() => handleFormat('insertOrderedList')} className="p-1 hover:bg-gray-200 rounded"><ListOrdered size={16} /></button>
                                </div>
                                <div ref={editorRef} id="description-editor" contentEditable
                                    className="p-4 min-h-[150px] focus:outline-none bg-white"
                                    onInput={updateDescription}></div>
                            </div>
                            {showDescriptionError && <p className="text-red-500 text-xs mt-1">{t('pages.edit_job.errors.description_required')}</p>}
                        </div>

                        {/* Skills */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-600">{t('pages.edit_job.sections.skills')}</h3>
                            </div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.skills')} <span className="text-red-500">*</span></label>
                            <input type="text" value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                placeholder={t('pages.edit_job.placeholders.skills')}
                                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 mb-2 ${errors.skills ? 'border-red-500' : 'border-gray-300'}`} />
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((skill) => (
                                    <button key={skill} type="button"
                                        onClick={() => {
                                            if (!skills.includes(skill)) {
                                                setSkills([...skills, skill]);
                                                setErrors(prev => ({ ...prev, skills: '' }));
                                            }
                                        }}
                                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${skills.includes(skill) ? 'bg-[#233480] text-white' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`}>
                                        {skill}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.map((skill, i) => (
                                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-[#233480] text-white text-xs font-medium rounded-full">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
                        </div>

                        {/* Work Status */}
                        <div className="border-l-4 border-[#233480] pl-3 mb-4 mt-8">
                            <h3 className="text-sm font-semibold text-gray-600">{t('pages.edit_job.sections.work_status')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.industry_type')} <span className="text-red-500">*</span></label>
                                <select name="industryType"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.industryType ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.industryType} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.edit_job.placeholders.select_industry')}</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="IT/Software">IT/Software</option>
                                    <option value="Education">Education</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Automobile">Automobile</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Telecom/BPO">Telecom/BPO</option>
                                    <option value="Food Processing">Food Processing</option>
                                    <option value="Textile">Textile</option>
                                    <option value="Pharmaceutical">Pharmaceutical</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Logistics">Logistics</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.industryType && <p className="text-red-500 text-xs mt-1">{errors.industryType}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.employment_type')} <span className="text-red-500">*</span></label>
                                <select name="employmentType"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.employmentType ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.employmentType} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.edit_job.placeholders.select')}</option>
                                    <option value="Full Time">{t('pages.edit_job.job_types.full_time')}</option>
                                    <option value="Part Time">{t('pages.edit_job.job_types.part_time')}</option>
                                    <option value="Contract">{t('pages.edit_job.job_types.contract')}</option>
                                    <option value="Internship">{t('pages.edit_job.job_types.internship')}</option>
                                </select>
                                {errors.employmentType && <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.job_type')} <span className="text-red-500">*</span></label>
                                <select name="jobType"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.jobType ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.jobType} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.edit_job.placeholders.select')}</option>
                                    <option value="Remote">{t('pages.edit_job.work_modes.remote')}</option>
                                    <option value="On-Site">{t('pages.edit_job.work_modes.onsite')}</option>
                                    <option value="Hybrid">{t('pages.edit_job.work_modes.hybrid')}</option>
                                </select>
                                {errors.jobType && <p className="text-red-500 text-xs mt-1">{errors.jobType}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.min_salary')} <span className="text-red-500">*</span></label>
                                <select name="minSalary"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.minSalary ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.minSalary} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.edit_job.placeholders.min_salary')}</option>
                                    <option value="120000">₹1.2 LPA</option>
                                    <option value="180000">₹1.8 LPA</option>
                                    <option value="250000">₹2.5 LPA</option>
                                    <option value="300000">₹3 LPA</option>
                                    <option value="400000">₹4 LPA</option>
                                    <option value="500000">₹5 LPA</option>
                                </select>
                                {errors.minSalary && <p className="text-red-500 text-xs mt-1">{errors.minSalary}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.max_salary')} <span className="text-red-500">*</span></label>
                                <select name="maxSalary"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.maxSalary ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.maxSalary} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.edit_job.placeholders.max_salary')}</option>
                                    <option value="250000">₹2.5 LPA</option>
                                    <option value="350000">₹3.5 LPA</option>
                                    <option value="500000">₹5 LPA</option>
                                    <option value="600000">₹6 LPA</option>
                                    <option value="800000">₹8 LPA</option>
                                    <option value="1000000">₹10 LPA</option>
                                </select>
                                {errors.maxSalary && <p className="text-red-500 text-xs mt-1">{errors.maxSalary}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.min_experience')} <span className="text-red-500">*</span></label>
                                <select name="minExperience"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.minExperience ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.minExperience} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.edit_job.placeholders.min_exp')}</option>
                                    <option value="0">{t('pages.edit_job.experience.fresher')}</option>
                                    <option value="1">{t('pages.edit_job.experience.1_year')}</option>
                                    <option value="2">{t('pages.edit_job.experience.2_years')}</option>
                                    <option value="3">{t('pages.edit_job.experience.3_years')}</option>
                                    <option value="5">{t('pages.edit_job.experience.5_years')}</option>
                                </select>
                                {errors.minExperience && <p className="text-red-500 text-xs mt-1">{errors.minExperience}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.max_experience')} <span className="text-red-500">*</span></label>
                                <select name="maxExperience"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.maxExperience ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.maxExperience} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.edit_job.placeholders.max_exp')}</option>
                                    <option value="1">{t('pages.edit_job.experience.1_year')}</option>
                                    <option value="2">{t('pages.edit_job.experience.2_years')}</option>
                                    <option value="3">{t('pages.edit_job.experience.3_years')}</option>
                                    <option value="5">{t('pages.edit_job.experience.5_years')}</option>
                                    <option value="10">{t('pages.edit_job.experience.10_years')}</option>
                                </select>
                                {errors.maxExperience && <p className="text-red-500 text-xs mt-1">{errors.maxExperience}</p>}
                            </div>
                        </div>

                        {/* Education & Vacancy */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.education')}</label>
                                <select name="education"
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50"
                                    value={formData.education} onChange={handleChange}>
                                    <option value="">{t('pages.edit_job.placeholders.select')}</option>
                                    <option value="Graduate">{t('pages.edit_job.education.graduate')}</option>
                                    <option value="Post Graduate">{t('pages.edit_job.education.post_graduate')}</option>
                                    <option value="Diploma">{t('pages.edit_job.education.diploma')}</option>
                                    <option value="Any">{t('pages.edit_job.education.any')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.vacancies')}</label>
                                <input type="number" name="vacancy" min="1" placeholder={t('pages.edit_job.placeholders.vacancies')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50"
                                    value={formData.vacancy} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Location & Deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.location')} <span className="text-red-500">*</span></label>
                                <input type="text" name="location" placeholder={t('pages.edit_job.placeholders.location')}
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.location} onChange={handleChange} onBlur={handleBlur} />
                                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.edit_job.fields.deadline')}</label>
                                <input type="date" name="applicationDeadline"
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50"
                                    value={formData.applicationDeadline} onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>

                        {/*  BUTTONS - type="button" with onClick */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-3 border-2 border-gray-300 text-gray-600 font-bold rounded hover:bg-gray-50 transition-colors"
                            >
                                {t('pages.edit_job.actions.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`px-8 py-3 bg-[#233480] text-white font-bold rounded hover:bg-[#1a2660] transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> {t('pages.edit_job.actions.updating')}
                                    </span>
                                ) : t('pages.edit_job.actions.update_job')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default EditJob;