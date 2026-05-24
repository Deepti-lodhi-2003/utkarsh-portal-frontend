import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Paperclip, Upload, Loader2, AlertCircle } from 'lucide-react';
import Footer from '../component/Footer';
import api, { trainingsAPI } from '../services/api';

const KaushalSetuApply = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [training, setTraining] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Use training banner instead of institution logo
    const institutionName = training?.institution?.organizationName || training?.institution?.name || training?.institutionName || 'ITI Ujjain';
    const trainingBanner = training?.banner?.url || training?.banner || 'https://utkarshujjain.com/assets/img/banner-10.jpg';

    const isLoggedIn = !!localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        const fetchTrainingTitle = async () => {
            try {
                setLoading(true);
                const res = await trainingsAPI.getById(id);
                if (res.data.status === 'success' || res.data.success) {
                    setTraining(res.data.data.training || res.data.data);
                }
            } catch (error) {
                console.error('Error fetching training title:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTrainingTitle();
        } else {
            setLoading(false);
        }
    }, [id]);

    const programTitle = training?.title || location.state?.title || t('pages.kaushal_setu.title');

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        gender: '',
        fatherName: '',
        education: '',
        resume: null
    });

    const [errors, setErrors] = useState({});

    // Pre-fill if logged in
    useEffect(() => {
        if (!isLoggedIn) return;

        // Basic details from cached user object
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setFormData(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            mobile: user.mobile || prev.mobile
        }));

        // Additional details from candidate profile (server)
        if (userRole === 'candidate') {
            const fetchProfile = async () => {
                try {
                    const res = await api.get('/candidates/profile');
                    const profile = res.data.data || {};

                    // Map backend gender (male/female/other) to form values (Male/Female/Other)
                    const gender =
                        profile.gender
                            ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)
                            : '';

                    // Try to infer highest education from education array
                    let education = '';
                    if (Array.isArray(profile.education) && profile.education.length > 0) {
                        const sorted = [...profile.education].sort(
                            (a, b) => (b.passingYear || 0) - (a.passingYear || 0)
                        );
                        const latest = sorted[0] || {};
                        const degree = (latest.degree || '').toLowerCase();

                        if (degree.includes('10')) education = '10th';
                        else if (degree.includes('12')) education = '12th';
                        else if (degree.includes('iti')) education = 'ITI';
                        else if (degree.includes('diploma')) education = 'Diploma';
                        else if (degree.includes('post') || degree.includes('pg'))
                            education = 'Post Graduate';
                        else if (degree.includes('grad')) education = 'Graduate';
                    }

                    // Fetch resume if available
                    if (profile.resume?.url) {
                        try {
                            const resumeResponse = await fetch(profile.resume.url);
                            if (resumeResponse.ok) {
                                const blob = await resumeResponse.blob();
                                const fileName = profile.resume.filename || `resume_${Date.now()}.pdf`;
                                const file = new File([blob], fileName, { type: blob.type || 'application/pdf' });
                                
                                setFormData(prev => ({
                                    ...prev,
                                    gender: gender || prev.gender,
                                    fatherName: profile.fatherName || prev.fatherName,
                                    education: education || prev.education,
                                    resume: file
                                }));
                            } else {
                                // If fetch fails, still set other fields
                                setFormData(prev => ({
                                    ...prev,
                                    gender: gender || prev.gender,
                                    fatherName: profile.fatherName || prev.fatherName,
                                    education: education || prev.education
                                }));
                            }
                        } catch (resumeErr) {
                            console.error('Failed to fetch resume file:', resumeErr);
                            // Still set other fields even if resume fetch fails
                            setFormData(prev => ({
                                ...prev,
                                gender: gender || prev.gender,
                                fatherName: profile.fatherName || prev.fatherName,
                                education: education || prev.education
                            }));
                        }
                    } else {
                        // No resume, just set other fields
                        setFormData(prev => ({
                            ...prev,
                            gender: gender || prev.gender,
                            fatherName: profile.fatherName || prev.fatherName,
                            education: education || prev.education
                        }));
                    }
                } catch (err) {
                    console.error('Failed to prefill from candidate profile:', err);
                }
            };

            fetchProfile();
        }
    }, [isLoggedIn, userRole]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, resume: e.target.files[0] });
        if (errors.resume) {
            setErrors({ ...errors, resume: '' });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t('pages.kaushal_setu_apply.errors.name');
        if (!formData.mobile.trim()) newErrors.mobile = t('pages.kaushal_setu_apply.errors.mobile');
        if (!formData.email.trim()) newErrors.email = t('pages.kaushal_setu_apply.errors.email');
        if (!formData.gender) newErrors.gender = t('pages.kaushal_setu_apply.errors.gender');
        if (!formData.fatherName.trim()) newErrors.fatherName = t('pages.kaushal_setu_apply.errors.father_name');
        if (!formData.education) newErrors.education = t('pages.kaushal_setu_apply.errors.education');
        if (!formData.resume) newErrors.resume = t('pages.kaushal_setu_apply.errors.resume');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLoggedIn) {
            setErrorMsg('Please login as a candidate to enroll in this training.');
            return;
        }

        if (userRole !== 'candidate') {
            setErrorMsg('Only candidates can enroll in training programs.');
            return;
        }

        if (validate()) {
            try {
                setIsSubmitting(true);
                setErrorMsg('');

                //  Create FormData object with all form fields
                const enrollData = new FormData();
                enrollData.append('name', formData.name);
                enrollData.append('mobile', formData.mobile);
                enrollData.append('email', formData.email);
                enrollData.append('gender', formData.gender);
                enrollData.append('fatherName', formData.fatherName);
                enrollData.append('education', formData.education);
                if (formData.resume) {
                    enrollData.append('resume', formData.resume);
                }

                //  Send FormData to API
                const res = await trainingsAPI.enroll(id, enrollData);

                if (res.data.success || res.data.status === 'success') {
                    setIsSubmitted(true);
                    window.scrollTo(0, 0);
                }
            } catch (error) {
                console.error('Enrollment error:', error);
                setErrorMsg(error.response?.data?.message || 'Failed to enroll. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={48} className="text-[#233480] animate-spin" />
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen overflow-hidden bg-white flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-2xl">
                    <h1 className="text-6xl md:text-7xl font-bold text-[#233480]">{t('pages.kaushal_setu_apply.thank_you')}</h1>
                    <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                        {t('pages.kaushal_setu_apply.request_submitted')}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-[#233480] text-white rounded-full font-medium hover:bg-[#1a2660] transition-colors shadow-lg mt-8 inline-block"
                    >
                        {t('pages.kaushal_setu_apply.home_button')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex flex-col pb-20 overflow-hidden">
            {/* Training Banner */}
            <div className="flex flex-col items-center justify-center mt-8 mb-4">
                <div className="w-24 h-16 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden mb-2">
                    <img
                        src={trainingBanner}
                        alt={training?.title || 'Training'}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://utkarshujjain.com/assets/img/banner-10.jpg'; }}
                    />
                </div>
                <div className="text-[#233480] font-bold text-lg text-center">{institutionName}</div>
            </div>
            {/* Banner */}
            <div className="relative w-full py-12 md:py-16 pb-24 overflow-hidden flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/90 mix-blend-multiply"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('pages.kaushal_setu_apply.title')}</h1>
                    <p className="text-xl md:text-2xl text-white/90 font-medium">
                        {programTitle}
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 -mt-9 relative z-20 mb-20">
                <div className="bg-white overflow-hidden border-b-4 border-[#233480] shadow-lg p-8 md:p-12">
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{errorMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* Name */}
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder={t('pages.kaushal_setu_apply.form.name')}
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:border-[#233480] placeholder-gray-400 text-gray-700`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span className="text-red-500 text-xs">⊘</span>{errors.name}</p>}
                        </div>

                        {/* Mobile No */}
                        <div>
                            <input
                                type="tel"
                                name="mobile"
                                placeholder={t('pages.kaushal_setu_apply.form.mobile')}
                                value={formData.mobile}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border ${errors.mobile ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:border-[#233480] placeholder-gray-400 text-gray-700`}
                            />
                            {errors.mobile && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span className="text-red-500 text-xs">⊘</span>{errors.mobile}</p>}
                        </div>

                        {/* Email ID */}
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder={t('pages.kaushal_setu_apply.form.email')}
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:border-[#233480] placeholder-gray-400 text-gray-700`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span className="text-red-500 text-xs">⊘</span>{errors.email}</p>}
                        </div>

                        {/* Gender */}
                        <div>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border ${errors.gender ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:border-[#233480] text-gray-700 bg-white`}
                            >
                                <option value="">{t('pages.kaushal_setu_apply.form.gender')}</option>
                                <option value="Male">{t('pages.kaushal_setu_apply.options.male')}</option>
                                <option value="Female">{t('pages.kaushal_setu_apply.options.female')}</option>
                                <option value="Other">{t('pages.kaushal_setu_apply.options.other')}</option>
                            </select>
                            {errors.gender && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span className="text-red-500 text-xs">⊘</span>{errors.gender}</p>}
                        </div>

                        {/* Father Name */}
                        <div>
                            <input
                                type="text"
                                name="fatherName"
                                placeholder={t('pages.kaushal_setu_apply.form.father_name')}
                                value={formData.fatherName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border ${errors.fatherName ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:border-[#233480] placeholder-gray-400 text-gray-700`}
                            />
                            {errors.fatherName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span className="text-red-500 text-xs">⊘</span>{errors.fatherName}</p>}
                        </div>

                        {/* Education */}
                        <div>
                            <select
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 border ${errors.education ? 'border-red-500' : 'border-gray-200'} rounded focus:outline-none focus:border-[#233480] text-gray-700 bg-white`}
                            >
                                <option value="">{t('pages.kaushal_setu_apply.form.education')}</option>
                                <option value="10th">10th</option>
                                <option value="12th">12th</option>
                                <option value="Graduate">Graduate</option>
                                <option value="Post Graduate">Post Graduate</option>
                                <option value="ITI">ITI</option>
                                <option value="Diploma">Diploma</option>
                            </select>
                            {errors.education && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span className="text-red-500 text-xs">⊘</span>{errors.education}</p>}
                        </div>

                        {/* File Upload & Submit Button */}
                        <div className="md:col-span-2 flex flex-col items-center mt-6 gap-4">
                            {errors.resume && <p className="text-red-500 text-sm mb-2">{errors.resume}</p>}

                            {/* Desktop View - Side by Side */}
                            <div className="hidden md:flex w-full max-w-md">
                                <label className="flex-1 flex items-center px-4 py-3 bg-white text-gray-500 border border-gray-200 rounded-l cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Paperclip size={18} className="mr-2 text-gray-400" />
                                    <span className="text-sm truncate">{formData.resume ? formData.resume.name : t('pages.kaushal_setu_apply.form.resume_label')}</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                </label>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-[#233480] text-white font-medium rounded-r hover:bg-[#1a2660] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                    {isSubmitting ? 'Submitting...' : t('pages.kaushal_setu_apply.form.submit')}
                                </button>
                            </div>

                            {/* Mobile View - Stacked */}
                            <div className="md:hidden w-full max-w-md flex flex-col gap-3">
                                <label className="w-full flex items-center px-4 py-3 bg-white text-gray-500 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Paperclip size={18} className="mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm truncate">{formData.resume ? formData.resume.name : t('pages.kaushal_setu_apply.form.resume_label')}</span>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                </label>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full px-8 py-3 bg-[#233480] text-white font-medium rounded hover:bg-[#1a2660] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                    {isSubmitting ? 'Submitting...' : t('pages.kaushal_setu_apply.form.submit')}
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 font-semibold text-center mt-2">{t('pages.kaushal_setu_apply.form.max_file_size')}</p>
                        </div>

                    </form>
                </div>
            </div>

            {!isSubmitted && <Footer />}
        </div>
    );
};

export default KaushalSetuApply;  