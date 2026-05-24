import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Upload, X, CheckCircle2, User, Phone, Mail, GraduationCap, BookOpen, Calendar, Percent } from 'lucide-react';
import Footer from '../component/Footer';

const TrainingRequest = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        dob: '',
        gender: '',
        fatherName: '',
        education: '',
        instituteName: '',
        course: '',
        specialization: '',
        passingYear: '2026-02', // Default YYYY-MM
        result: '',
        skills: ['Plumber', 'Electrican', 'Sanitary Worker', 'Accountant', 'Wireman', 'IT', 'Student', 'Finance', 'Call Center', 'BPO'],
        selectedSkills: [],
        trainingRequired: '',
        resume: null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!value.trim()) error = t('pages.training_request.errors.name');
                break;
            case 'mobile':
                if (!/^[0-9]{10}$/.test(value)) error = t('pages.training_request.errors.mobile');
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = t('pages.training_request.errors.email');
                break;
            case 'dob':
                if (!value) error = t('pages.training_request.errors.dob');
                break;
            case 'gender':
                if (!value) error = t('pages.training_request.errors.gender');
                break;
            case 'fatherName':
                if (!value.trim()) error = t('pages.training_request.errors.father_name');
                break;
            case 'education':
                if (!value) error = t('pages.training_request.errors.education');
                break;
            case 'instituteName':
                if (!value.trim()) error = t('pages.training_request.errors.institute_name');
                break;
            case 'course':
                if (!value.trim()) error = t('pages.training_request.errors.course');
                break;
            case 'result':
                if (!value || isNaN(value) || value < 0 || value > 100) error = t('pages.training_request.errors.result');
                break;
            case 'trainingRequired':
                if (!value.trim()) error = t('pages.training_request.errors.training_required');
                break;
            default:
                break;
        }
        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Inline validation
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSkillToggle = (skill) => {
        setFormData(prev => ({
            ...prev,
            selectedSkills: prev.selectedSkills.includes(skill)
                ? prev.selectedSkills.filter(s => s !== skill)
                : [...prev.selectedSkills, skill]
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, resume: t('pages.training_request.errors.file_size') }));
                return;
            }
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, resume: t('pages.training_request.errors.file_type') }));
                return;
            }
            setFormData(prev => ({ ...prev, resume: file }));
            setErrors(prev => ({ ...prev, resume: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (!['skills', 'selectedSkills', 'resume', 'specialization'].includes(key)) {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });

        if (!formData.resume) {
            newErrors.resume = t('pages.training_request.errors.resume');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            window.scrollTo(0, 0);
        }, 1500);
    };

    // Success Screen Render
    if (isSubmitted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-white">
                <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in duration-700">
                    <h1 className="text-5xl md:text-7xl font-bold text-[#233480] tracking-tight">
                        {t('pages.training_request.thank_you')}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        {t('pages.training_request.request_submitted')}
                    </p>
                    <div className="pt-8">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#233480] text-white px-12 py-3.5 rounded-full font-bold text-lg hover:bg-[#1a2660] transform transition-all active:scale-95 shadow-lg"
                        >
                            {t('pages.training_request.home_button')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header Banner */}
            <div className="relative w-full h-40 md:h-48 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-xl md:text-4xl font-bold text-white tracking-widest text-center px-4 uppercase">
                    {t('pages.training_request.title')}
                </h1>
            </div>

            {/* Form Container */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-10 md:-mt-12 mb-20 relative z-20">
                <div className="bg-white border-b-4 border-[#233480] overflow-hidden shadow-lg">
                    <form onSubmit={handleSubmit} className="p-6 md:p-12 space-y-12">

                        {/* Section 1: Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <input type="text" name="name" placeholder={t('pages.training_request.form.name')} value={formData.name} onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                {errors.name && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.name}</p>}
                            </div>
                            <div className="relative">
                                <input type="text" name="mobile" placeholder={t('pages.training_request.form.mobile')} value={formData.mobile} onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.mobile ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                {errors.mobile && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.mobile}</p>}
                            </div>
                            <div className="relative">
                                <input type="email" name="email" placeholder={t('pages.training_request.form.email')} value={formData.email} onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                {errors.email && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.email}</p>}
                            </div>
                            <div className="relative">
                                <input type="text" name="dob" placeholder={t('pages.training_request.form.dob')} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => !formData.dob && (e.target.type = 'text')} value={formData.dob} onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.dob ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                {errors.dob && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.dob}</p>}
                            </div>
                            <div className="relative">
                                <select name="gender" value={formData.gender} onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border focus:outline-none transition-all text-sm appearance-none ${errors.gender ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'} ${!formData.gender ? 'text-gray-400' : 'text-gray-700'}`}>
                                    <option value="" disabled>{t('pages.training_request.form.gender')}</option>
                                    <option value="Male">{t('pages.training_request.options.male')}</option>
                                    <option value="Female">{t('pages.training_request.options.female')}</option>
                                    <option value="Other">{t('pages.training_request.options.other')}</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                {errors.gender && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.gender}</p>}
                            </div>
                            <div className="relative">
                                <input type="text" name="fatherName" placeholder={t('pages.training_request.form.father_name')} value={formData.fatherName} onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.fatherName ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                {errors.fatherName && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.fatherName}</p>}
                            </div>
                        </div>

                        {/* Section 2: Education */}
                        <div className="space-y-6">
                            <div className="border-l-4 border-[#233480] bg-gray-50 px-4 py-2">
                                <h2 className="text-gray-700 font-bold text-[13px] tracking-wide">{t('pages.training_request.form.higher_education_details')}</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <select name="education" value={formData.education} onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border focus:outline-none transition-all text-sm appearance-none ${errors.education ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'} ${!formData.education ? 'text-gray-400' : 'text-gray-700'}`}>
                                        <option value="" disabled>{t('pages.training_request.form.education')}</option>
                                        <option value="12th">{t('pages.training_request.options.12th')}</option>
                                        <option value="Diploma">{t('pages.training_request.options.diploma')}</option>
                                        <option value="Graduate">{t('pages.training_request.options.graduate')}</option>
                                        <option value="Post Graduate">{t('pages.training_request.options.post_graduate')}</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                    {errors.education && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.education}</p>}
                                </div>
                                <div className="relative">
                                    <input type="text" name="instituteName" placeholder={t('pages.training_request.form.institute_name')} value={formData.instituteName} onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.instituteName ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                    {errors.instituteName && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.instituteName}</p>}
                                </div>
                                <div className="relative">
                                    <input type="text" name="course" placeholder={t('pages.training_request.form.course')} value={formData.course} onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.course ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                    {errors.course && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.course}</p>}
                                </div>
                                <div className="relative">
                                    <input type="text" name="specialization" placeholder={t('pages.training_request.form.specialization')} value={formData.specialization} onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#233480] transition-all placeholder-gray-400 text-sm" />
                                </div>

                                {/* Passout Year with Calendar (Year-Month) Picker */}
                                <div className="relative flex flex-col md:flex-row items-stretch gap-0 border border-gray-200">
                                    <div className="bg-[#233480] text-white px-6 py-3 text-[13px] font-bold whitespace-nowrap flex items-center justify-center">
                                        {t('pages.training_request.form.passing_year')}
                                    </div>
                                    <input
                                        type="month"
                                        name="passingYear"
                                        value={formData.passingYear}
                                        onChange={handleInputChange}
                                        className="flex-1 px-4 py-2.5 text-gray-600 text-sm focus:outline-none cursor-pointer"
                                    />
                                </div>

                                <div className="relative">
                                    <input type="text" name="result" placeholder={t('pages.training_request.form.result')} value={formData.result} onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm pr-20 ${errors.result ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">{t('pages.training_request.form.result')}</div>
                                    {errors.result && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.result}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Skills */}
                        <div className="space-y-6">
                            <div className="border-l-4 border-[#233480] bg-gray-50 px-4 py-2">
                                <h2 className="text-gray-700 font-bold text-[13px] tracking-wide">{t('pages.training_request.form.your_skills')}</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white border border-gray-200 px-4 py-3 min-h-[50px] flex flex-wrap gap-2 items-center">
                                    {formData.selectedSkills.map(skill => (
                                        <div key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-sm text-xs font-bold border border-green-200 flex items-center gap-2">
                                            ✓ {skill}
                                            <button type="button" onClick={() => handleSkillToggle(skill)}><X size={12} /></button>
                                        </div>
                                    ))}
                                    {formData.selectedSkills.length === 0 && <span className="text-gray-300 text-sm italic">{t('pages.training_request.form.select_skills')}</span>}
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {formData.skills.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => handleSkillToggle(skill)}
                                            className={`px-4 py-1.5 rounded-sm text-sm transition-all border ${formData.selectedSkills.includes(skill)
                                                ? 'bg-green-100 text-green-800 border-green-200 scale-105'
                                                : 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Training Required */}
                        <div className="space-y-6">
                            <div className="border-l-4 border-[#233480] bg-gray-50 px-4 py-2">
                                <h2 className="text-gray-700 font-bold text-[13px] tracking-wide">{t('pages.training_request.form.training_required_title')}</h2>
                            </div>
                            <div className="relative">
                                <textarea name="trainingRequired" placeholder={t('pages.training_request.form.training_required_placeholder')} value={formData.trainingRequired} onChange={handleInputChange} rows={4}
                                    className={`w-full px-4 py-3 border focus:outline-none transition-all placeholder-gray-400 text-sm ${errors.trainingRequired ? 'border-red-500' : 'border-gray-200 focus:border-[#233480]'}`} />
                                {errors.trainingRequired && <p className="text-red-500 text-[10px] absolute -bottom-4 left-1 font-bold">{errors.trainingRequired}</p>}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-8 border-t border-gray-100 flex flex-col items-center gap-6">
                            <div className="flex flex-col md:flex-row items-center border border-gray-100 rounded shadow-sm overflow-hidden">
                                <label className="cursor-pointer bg-white px-8 py-3 flex items-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors text-sm">
                                    <Upload size={18} className="text-[#233480]" />
                                    <span>{formData.resume ? formData.resume.name : t('pages.training_request.form.resume_label')}</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                </label>
                                <button type="submit" disabled={isSubmitting} className="bg-[#233480] text-white px-10 py-3 font-bold text-sm uppercase tracking-widest hover:bg-[#1a2660] disabled:bg-gray-400 transition-all active:scale-95 flex items-center gap-3">
                                    {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : t('pages.training_request.form.submit')}
                                </button>
                            </div>
                            <div className="text-center">
                                <p className="text-[11px] font-bold text-gray-500">{t('pages.training_request.form.max_file_size')}</p>
                                {errors.resume && <p className="text-red-500 text-xs mt-2 font-bold italic">{errors.resume}</p>}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {!isSubmitted && <Footer />}
        </div>
    );
};

export default TrainingRequest;
