import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Footer from '../../component/Footer';
import { Bold, Italic, Underline, List, ListOrdered, X, Loader2, Upload, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobsAPI } from '../../services/api';

const PostJob = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Banner
    const bannerRef = useRef(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        industryType: '',
        role: '',
        employmentType: '',
        jobType: '',
        minSalary: '',
        maxSalary: '',
        minExperience: '',
        maxExperience: '',
        education: '',
        vacancy: '',
        location: '',
        applicationDeadline: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showDescriptionError, setShowDescriptionError] = useState(false);

    const handleFormat = (command) => {
        document.execCommand(command, false, null);
        editorRef.current.focus();
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
            const newSkill = skillInput.trim().replace(/,/g, '');
            if (newSkill && !skills.includes(newSkill)) {
                setSkills([...skills, newSkill]);
                setSkillInput('');
                setErrors(prev => ({ ...prev, skills: '' }));
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    // Banner handlers
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, banner: t('pages.institution_post_job.validation.banner_type') }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, banner: t('pages.institution_post_job.validation.banner_size') }));
            return;
        }
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setErrors(prev => { const n = { ...prev }; delete n.banner; return n; });
    };

    const removeBanner = () => {
        setBannerFile(null);
        setBannerPreview(null);
        if (bannerRef.current) bannerRef.current.value = '';
    };

    const validateField = (name, value) => {
        if (!value || (typeof value === 'string' && !value.trim())) return t('pages.institution_post_job.validation.required');
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    // ── Extract requirements and responsibilities from description ──
    const extractListsFromHTML = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Try to extract bullet points as requirements (simple fallback)
        const listItems = doc.querySelectorAll('li');
        const items = Array.from(listItems).map(li => li.textContent.trim()).filter(Boolean);

        // If no lists found, create generic requirements
        if (items.length === 0) {
            return {
                requirements: ["Relevant qualifications and experience required"],
                responsibilities: ["As described in job description"]
            };
        }

        // Split items between requirements and responsibilities (simple heuristic)
        const midPoint = Math.ceil(items.length / 2);
        return {
            requirements: items.slice(0, midPoint),
            responsibilities: items.slice(midPoint)
        };
    };

    // ── Map form → API payload ──
    const buildPayload = () => {
        // Map employmentType → jobType for API
        const jobTypeMap = {
            'Full Time': 'full-time',
            'Part Time': 'part-time',
            'Contract': 'contract',
            'Internship': 'internship'
        };

        // Map jobType → workMode for API
        const workModeMap = {
            'Remote': 'remote',
            'On-Site': 'onsite',
            'Hybrid': 'hybrid'
        };

        // Map education to API format
        const educationMap = {
            '10th': '10th',
            '12th': '12th',
            'Graduate': 'graduate',
            'Post Graduate': 'post-graduate',
            'Diploma': 'diploma',
            'PhD': 'phd',
            'Any': 'any'
        };

        // Extract requirements and responsibilities from description
        const { requirements, responsibilities } = extractListsFromHTML(formData.description);

        // Determine experience level
        const minExp = Number(formData.minExperience) || 0;
        let experienceLevel = 'fresher';
        if (minExp >= 5) experienceLevel = 'senior';
        else if (minExp >= 2) experienceLevel = 'mid';

        return {
            title: formData.title,
            description: formData.description,
            requirements: requirements,
            responsibilities: responsibilities,
            skills: skills.map(s => ({ name: s, isRequired: false })),
            jobType: jobTypeMap[formData.employmentType] || 'full-time',
            workMode: workModeMap[formData.jobType] || 'onsite',
            experienceLevel: experienceLevel,
            experience: {
                min: Number(formData.minExperience) || 0,
                max: Number(formData.maxExperience) || 0
            },
            education: educationMap[formData.education] || formData.education.toLowerCase() || 'graduate',
            industry: formData.industryType,
            salary: {
                min: Number(formData.minSalary) || 0,
                max: Number(formData.maxSalary) || 0,
                currency: 'INR',
                period: 'yearly',
                isNegotiable: false
            },
            location: {
                city: formData.location,
                state: 'Madhya Pradesh'
            },
            vacancies: Number(formData.vacancy) || 1,
            applicationDeadline: formData.applicationDeadline || undefined,
            benefits: [
                "Competitive Salary",
                "Professional Development"
            ],
            status: 'pending'
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess(false);

        // Validate
        const newErrors = {};
        const fieldsToValidate = ['title', 'industryType', 'employmentType', 'jobType', 'minSalary', 'maxSalary', 'minExperience', 'maxExperience', 'location'];

        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (skills.length === 0) newErrors.skills = t('pages.institution_post_job.validation.skills_required');

        const descriptionContent = editorRef.current?.innerHTML;
        if (!descriptionContent?.trim()) {
            setShowDescriptionError(true);
        } else {
            setShowDescriptionError(false);
        }

        setErrors(newErrors);
        setTouched(fieldsToValidate.reduce((acc, curr) => ({ ...acc, [curr]: true }), { skills: true }));

        if (Object.keys(newErrors).length > 0 || !descriptionContent?.trim()) {
            const firstError = document.querySelector('.border-red-500');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Toast specific errors
            if (newErrors.skills) toast.error(newErrors.skills);
            if (!descriptionContent?.trim()) toast.error(t('pages.institution_post_job.validation.description_required'));
            if (Object.keys(newErrors).length > 0) toast.error(t('pages.institution_post_job.validation.fill_required'));

            return;
        }

        // ── API Call ──
        setSubmitting(true);
        try {
            const payload = buildPayload();
            console.log('Posting job with payload:', payload); // Debug log
            const res = await jobsAPI.create(payload);

            // Upload banner if selected
            if (bannerFile && res?.data?.data?._id) {
                const fd = new FormData();
                fd.append('banner', bannerFile);
                try {
                    await jobsAPI.uploadBanner(res.data.data._id, fd);
                } catch (err) {
                    console.error('Banner upload failed:', err);
                }
            }

            setSubmitSuccess(true);
            toast.success(t('pages.institution_post_job.success_msg'));
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Redirect after 2s
            setTimeout(() => {
                navigate('/recent-jobs');
            }, 2000);
        } catch (err) {
            console.error('Post job error:', err);
            const data = err.response?.data;
            const message = data?.message || 'Failed to post job. Please try again.';

            if (data?.errors && Array.isArray(data.errors)) {
                // Show each validation error via toast
                data.errors.forEach((validationError) => {
                    toast.error(validationError.message);
                });
                // Set the first error message to the state to display in the alert box
                setSubmitError(data.errors[0].message);
            } else {
                // Fallback for general errors
                setSubmitError(message);
                toast.error(message);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const suggestions = ["Plumber", "Electrician", "Sanitary Worker", "Accountant", "Wireman", "IT", "Student", "Finance", "Call Center", "BPO"];

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <style>{`
                #description-editor ul { list-style-type: disc !important; padding-left: 20px !important; margin: 10px 0 !important; }
                #description-editor ol { list-style-type: decimal !important; padding-left: 20px !important; margin: 10px 0 !important; }
                #description-editor li { display: list-item !important; }
            `}</style>

            {/* Banner */}
            <div className="relative w-full h-32 flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white tracking-wider text-center px-4">{t('pages.institution_post_job.title')}</h1>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20 flex-1">
                <div className="bg-white border-b-4 border-[#233480] shadow-lg p-8">

                    {/* Success */}
                    {submitSuccess && (
                        <div className="mb-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded">
                             {t('pages.institution_post_job.success_msg')}
                        </div>
                    )}

                    {/* Error */}
                    {submitError && (
                        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                            <span>{submitError}</span>
                            <button onClick={() => setSubmitError('')}><X size={16} /></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.title')} <span className="text-red-500">*</span></label>
                            <input type="text" name="title" placeholder={t('pages.institution_post_job.placeholders.title')}
                                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                value={formData.title} onChange={handleChange} onBlur={handleBlur} />
                            {errors.title && touched.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Banner Upload */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                    <Image size={16} /> {t('pages.institution_post_job.labels.job_banner')}
                                </h3>
                            </div>

                            {bannerPreview ? (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                    <img src={bannerPreview} alt="Banner" className="w-full h-48 object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeBanner}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                        {bannerFile?.name}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => bannerRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
                                        hover:border-[#233480] hover:bg-blue-50/30 transition-all
                                        ${errors.banner ? 'border-red-400 bg-red-50/20' : 'border-gray-300'}`}
                                >
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">{t('pages.institution_post_job.banner_upload.click_upload')}</p>
                                    <p className="text-xs text-gray-400 mt-1">{t('pages.institution_post_job.banner_upload.hint')}</p>
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

                        {/* Description Error */}
                        {showDescriptionError && (
                            <p className="text-red-500 text-xs mt-1">{t('pages.institution_post_job.validation.description_required')}</p>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.description')} <span className="text-red-500">*</span></label>
                            <p className="text-xs text-gray-500 mb-2">{t('pages.institution_post_job.description_tip')}</p>
                            <div className={`border rounded overflow-hidden ${showDescriptionError ? 'border-red-500' : 'border-gray-300'}`}>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-300">
                                    <button type="button" onClick={() => handleFormat('bold')} className="p-1 hover:bg-gray-200 rounded"><Bold size={16} /></button>
                                    <button type="button" onClick={() => handleFormat('italic')} className="p-1 hover:bg-gray-200 rounded"><Italic size={16} /></button>
                                    <button type="button" onClick={() => handleFormat('underline')} className="p-1 hover:bg-gray-200 rounded"><Underline size={16} /></button>
                                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                    <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="p-1 hover:bg-gray-200 rounded"><List size={16} /></button>
                                    <button type="button" onClick={() => handleFormat('insertOrderedList')} className="p-1 hover:bg-gray-200 rounded"><ListOrdered size={16} /></button>
                                </div>
                                <div ref={editorRef} id="description-editor" contentEditable className="p-4 min-h-[150px] focus:outline-none bg-white" onInput={updateDescription}></div>
                            </div>
                            {showDescriptionError && (
                                <p className="text-red-500 text-xs mt-1">{t('pages.institution_post_job.validation.description_required')}</p>
                            )}
                        </div>

                        {/* Skills */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-600">{t('pages.institution_post_job.labels.skills')}</h3>
                            </div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.skills')} <span className="text-red-500">*</span></label>
                            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
                                placeholder={t('pages.institution_post_job.placeholders.skills')}
                                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 mb-2 ${errors.skills ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.skills && touched.skills && <p className="text-red-500 text-xs mb-2">{errors.skills}</p>}
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((skill) => (
                                    <button key={skill} type="button"
                                        onClick={() => { if (!skills.includes(skill)) { setSkills([...skills, skill]); setErrors(prev => ({ ...prev, skills: '' })); } }}
                                        className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded hover:bg-orange-200 transition-colors">
                                        {skill}
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.map((skill, index) => (
                                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-[#233480] text-white text-xs font-medium rounded-full">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Work Status Section */}
                        <div className="border-l-4 border-[#233480] pl-3 mb-4 mt-8">
                            <h3 className="text-sm font-semibold text-gray-600">{t('pages.institution_post_job.labels.work_status')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.industry_type')} <span className="text-red-500">*</span></label>
                                <select name="industryType" className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.industryType ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.industryType} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.institution_post_job.options.select_industry')}</option>
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
                                {errors.industryType && touched.industryType && <p className="text-red-500 text-xs mt-1">{errors.industryType}</p>}
                            </div>
                            {/* <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Role <span className="text-red-500">*</span></label>
                                <input type="text" name="role" placeholder="Job Role"
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.role} onChange={handleChange} onBlur={handleBlur} />
                            </div> */}
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.employment_type')} <span className="text-red-500">*</span></label>
                                <select name="employmentType" className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.employmentType ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.employmentType} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.institution_post_job.options.select_employment_type')}</option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                                {errors.employmentType && touched.employmentType && <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.job_type')} <span className="text-red-500">*</span></label>
                                <select name="jobType" className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.jobType ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.jobType} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.institution_post_job.options.select_job_type')}</option>
                                    <option value="Remote">Remote</option>
                                    <option value="On-Site">On-Site</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                {errors.jobType && touched.jobType && <p className="text-red-500 text-xs mt-1">{errors.jobType}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.min_salary')} <span className="text-red-500">*</span></label>
                                <select name="minSalary" className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.minSalary ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.minSalary} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.institution_post_job.options.min_salary')}</option>
                                    <option value="120000">₹1.2 LPA</option>
                                    <option value="180000">₹1.8 LPA</option>
                                    <option value="250000">₹2.5 LPA</option>
                                    <option value="300000">₹3 LPA</option>
                                    <option value="400000">₹4 LPA</option>
                                    <option value="500000">₹5 LPA</option>
                                </select>
                                {errors.minSalary && touched.minSalary && <p className="text-red-500 text-xs mt-1">{errors.minSalary}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.max_salary')} <span className="text-red-500">*</span></label>
                                <select name="maxSalary" className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.maxSalary ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.maxSalary} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.institution_post_job.options.max_salary')}</option>
                                    <option value="250000">₹2.5 LPA</option>
                                    <option value="350000">₹3.5 LPA</option>
                                    <option value="500000">₹5 LPA</option>
                                    <option value="600000">₹6 LPA</option>
                                    <option value="800000">₹8 LPA</option>
                                    <option value="1000000">₹10 LPA</option>
                                </select>
                                {errors.maxSalary && touched.maxSalary && <p className="text-red-500 text-xs mt-1">{errors.maxSalary}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.min_experience')} <span className="text-red-500">*</span></label>
                                <select name="minExperience" className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.minExperience ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.minExperience} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.institution_post_job.options.min_experience')}</option>
                                    <option value="0">{t('pages.institution_post_job.options.fresher')}</option>
                                    <option value="1">1 Year</option>
                                    <option value="2">2 Years</option>
                                    <option value="3">3 Years</option>
                                    <option value="5">5 Years</option>
                                </select>
                                {errors.minExperience && touched.minExperience && <p className="text-red-500 text-xs mt-1">{errors.minExperience}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.max_experience')} <span className="text-red-500">*</span></label>
                                <select name="maxExperience" className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.maxExperience ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.maxExperience} onChange={handleChange} onBlur={handleBlur}>
                                    <option value="">{t('pages.institution_post_job.options.max_experience')}</option>
                                    <option value="1">1 Year</option>
                                    <option value="2">2 Years</option>
                                    <option value="3">3 Years</option>
                                    <option value="5">5 Years</option>
                                    <option value="10">10 Years</option>
                                </select>
                                {errors.maxExperience && touched.maxExperience && <p className="text-red-500 text-xs mt-1">{errors.maxExperience}</p>}
                            </div>
                        </div>

                        {/* Education & Vacancy */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.education')}</label>
                                <select name="education"
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50"
                                    value={formData.education} onChange={handleChange}>
                                    <option value="">{t('pages.institution_post_job.options.select_education')}</option>
                                    <option value="10th">10th</option>
                                    <option value="12th">12th</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Post Graduate">Post Graduate</option>
                                    <option value="PhD">PhD</option>
                                    <option value="Any">{t('pages.institution_post_job.options.any')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.vacancies')}</label>
                                <input type="number" name="vacancy" placeholder={t('pages.institution_post_job.placeholders.vacancy')} min="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50"
                                    value={formData.vacancy} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Location & Deadline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.location')} <span className="text-red-500">*</span></label>
                                <input type="text" name="location" placeholder={t('pages.institution_post_job.placeholders.location')}
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.location} onChange={handleChange} onBlur={handleBlur} />
                                {errors.location && touched.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.institution_post_job.labels.deadline')}</label>
                                <input type="date" name="applicationDeadline"
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50"
                                    value={formData.applicationDeadline} onChange={handleChange} />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col items-center pt-6">
                            {showDescriptionError && (
                                <p className="text-[#a54443] text-lg mb-2">{t('pages.institution_post_job.validation.description_required')}</p>
                            )}
                            <button type="submit" disabled={submitting}
                                className={`px-8 py-3 bg-[#233480] text-white font-bold rounded hover:bg-[#1a2660] transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> {t('pages.institution_post_job.buttons.posting')}
                                    </span>
                                ) : t('pages.institution_post_job.buttons.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PostJob;