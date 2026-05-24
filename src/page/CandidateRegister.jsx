// src/pages/CandidateRegister.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../component/Footer';
import OtpVerification from '../component/OtpVerification';
import useOtpVerification from '../hooks/useOtpVerification';
import { authAPI, candidateAPI } from '../services/api';

const CandidateRegister = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [experienceType, setExperienceType] = useState(null);
    const [resumeName, setResumeName] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [skills, setSkills] = useState([]);
    const [isWorkingCurrently, setIsWorkingCurrently] = useState(true);
    const [highestEducation, setHighestEducation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passingYear, setPassingYear] = useState(new Date().toISOString().slice(0, 7));

    // OTP Hook
    const otpHook = useOtpVerification('registration');

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        dob: '',
        gender: '',
        fatherName: '',
        motherName: '',
        industryType: '',
        experience: '',
        preferredLocations: '',
        currentLocation: '',
        employerName: '',
        designation: '',
        salaryLacs: '0 Lacs',
        salaryThousands: '0 Thousand',
        universityName: '',
        course: '',
        specialization: '',
        resumeHeadline: '',
        // Additional fields
        internshipDetails: '',
        certificationDetails: '',
        passingYear: '',
        result: '',
        isPhysicallyDisabled: 'Not',
        hasApprenticeship: 'No'
    });
    const [errors, setErrors] = useState({});

    const handleSkillClick = (skill) => {
        if (skills.includes(skill)) {
            setSkills(skills.filter(s => s !== skill));
        } else {
            setSkills([...skills, skill]);
        }
    };

    const validateField = (name, value) => {
        let error = "";
        const requiredFields = ["name", "mobile", "email", "password"];

        if (experienceType) {
            requiredFields.push("dob", "gender", "fatherName", "motherName", "industryType", "experience", "preferredLocations", "currentLocation", "resumeHeadline");
            if (highestEducation) requiredFields.push("universityName");
        }

        if (experienceType === 'experienced') {
            requiredFields.push("employerName", "designation");
        }

        if (requiredFields.includes(name) && !value.trim()) {
            if (name === "name") error = t('pages.errors.name_required', 'Please enter name');
            else if (name === "mobile") error = t('pages.errors.mobile_required', 'Please enter mobile no.');
            else if (name === "email") error = t('pages.errors.email_required', 'Please enter email');
            else if (name === "password") error = t('pages.errors.password_required', 'Please enter password');
            else if (name === "dob") error = t('pages.errors.dob_required', 'Please enter date of birth');
            else if (name === "gender") error = t('pages.errors.gender_required', 'Please select gender');
            else if (name === "fatherName") error = t('pages.errors.father_name_required', 'Please enter father name');
            else if (name === "motherName") error = t('pages.errors.mother_name_required', 'Please enter mother name');
            else if (name === "industryType") error = t('pages.errors.industry_required', 'Please select industry');
            else if (name === "experience") error = t('pages.errors.experience_required', 'Please select experience');
            else if (name === "preferredLocations") error = t('pages.errors.locations_required', 'Please enter preferred locations');
            else if (name === "currentLocation") error = t('pages.errors.current_location_required', 'Please enter current location');
            else if (name === "employerName") error = t('pages.errors.employer_required', 'Please enter employer name');
            else if (name === "designation") error = t('pages.errors.designation_required', 'Please enter designation');
            else if (name === "resumeHeadline") error = t('pages.errors.headline_required', 'Please enter resume headline');
            else if (name === "universityName") error = t('pages.errors.university_required', 'Please enter university/institute name');
        }

        // Email validation
        if (name === "email" && value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) error = 'Please enter a valid email address';
        }

        // Mobile validation
        if (name === "mobile" && value.trim()) {
            if (!/^\d{10}$/.test(value)) error = 'Please enter valid 10 digit mobile number';
        }

        // Password validation
        if (name === "password" && value.trim()) {
            if (value.length < 6) error = 'Password must be at least 6 characters';
        }

        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Mobile number: only digits, max 10
        if (name === 'mobile') {
            const cleanValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: cleanValue }));

            // Reset OTP if mobile changes
            if (cleanValue !== formData.mobile && otpHook.otpSent) {
                otpHook.resetOtp();
            }

            const error = validateField(name, cleanValue);
            setErrors(prev => ({ ...prev, [name]: error }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // ── Build API Payload ──
    const buildPayload = () => {
        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            mobile: formData.mobile.trim(),
            password: formData.password,
            candidateType: experienceType || 'fresher',
        };

        // Add optional fields only if they have values
        if (formData.dob) {
            // Date input returns YYYY-MM-DD format directly
            payload.dateOfBirth = formData.dob;
        }
        if (formData.gender) payload.gender = formData.gender.toLowerCase();
        if (formData.fatherName?.trim()) payload.fatherName = formData.fatherName.trim();
        if (formData.motherName?.trim()) payload.motherName = formData.motherName.trim();

        // Address
        if (formData.currentLocation?.trim()) {
            payload.currentAddress = {
                city: formData.currentLocation.trim(),
                state: 'Madhya Pradesh'
            };
        }

        // Professional Details
        if (formData.resumeHeadline?.trim()) payload.headline = formData.resumeHeadline.trim();
        if (formData.preferredLocations) {
            const locations = formData.preferredLocations.split(',').map(loc => loc.trim()).filter(loc => loc);
            if (locations.length > 0) payload.preferredLocations = locations;
        }
        if (formData.industryType) payload.preferredIndustries = [formData.industryType];
        if (skills.length > 0) payload.skills = skills.map(skill => ({ name: skill, level: 'beginner' }));

        // Add experience if experienced
        if (experienceType === 'experienced' && formData.employerName && formData.designation) {
            payload.experience = [{
                company: formData.employerName.trim(),
                designation: formData.designation.trim(),
                isCurrent: isWorkingCurrently,
                salary: formData.salaryLacs && formData.salaryThousands ?
                    parseInt(formData.salaryLacs) * 100000 + parseInt(formData.salaryThousands) * 1000 : undefined
            }];
            if (payload.experience[0].salary) payload.currentSalary = payload.experience[0].salary;
        }

        // Add education if provided
        if (highestEducation && formData.universityName) {
            const eduEntry = {
                degree: highestEducation,
                field: formData.specialization || formData.course,
                institution: formData.universityName.trim(),
                isCurrent: false
            };
            // Add passing year if available
            if (passingYear) {
                const year = parseInt(passingYear.split('-')[0]);
                if (year) eduEntry.passingYear = year;
            }
            // Add result/CGPA if available
            if (formData.result?.trim()) {
                eduEntry.percentage = formData.result.trim();
            }
            payload.education = [eduEntry];
        }

        // Parse total experience
        if (formData.experience && experienceType === 'experienced') {
            const expMatch = formData.experience.match(/(\d+)\s*(?:Years?|Months?)/i);
            if (expMatch) {
                const years = parseInt(expMatch[1]);
                payload.totalExperience = { years, months: 0 };
            }
        }

        // Additional information
        if (formData.internshipDetails?.trim()) payload.internshipDetails = formData.internshipDetails.trim();
        if (formData.certificationDetails?.trim()) payload.certificationDetails = formData.certificationDetails.trim();
        if (passingYear) payload.passingYear = passingYear;
        if (formData.result?.trim()) payload.result = formData.result.trim();
        if (formData.isPhysicallyDisabled) payload.isPhysicallyDisabled = formData.isPhysicallyDisabled === 'Yes';
        if (formData.hasApprenticeship) payload.hasApprenticeship = formData.hasApprenticeship === 'Yes';

        return payload;
    };

    // ── Handle Submit ──
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Step 1: Check OTP verified
        if (!otpHook.otpVerified) {
            toast.error('Please verify your mobile number first! 📱');
            return;
        }

        // Step 2: Check experience type selected
        if (!experienceType) {
            toast.error('Please select Fresher or Experienced');
            return;
        }

        // Step 3: Validate all fields
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fill all required fields correctly');

            // Scroll to first error
            const firstErrorKey = Object.keys(newErrors)[0];
            const firstErrorElement = document.querySelector(`[name="${firstErrorKey}"]`);
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorElement.focus();
            }
            return;
        }

        // Step 4: Call Registration API
        setIsSubmitting(true);

        try {
            const payload = buildPayload();
            const response = await authAPI.registerCandidate(payload);

            if (response.data.success) {
                const { accessToken, refreshToken, user, candidate } = response.data.data;

                // Save tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('role', user.role);

                // Step 5: Upload resume if selected
                if (resumeFile) {
                    try {
                        const formDataWithResume = new FormData();
                        formDataWithResume.append('resume', resumeFile);

                        await candidateAPI.uploadResume(formDataWithResume);
                        toast.success('Resume uploaded successfully!');
                    } catch (resumeError) {
                        console.error('Resume upload failed:', resumeError);
                        toast.warning('Profile created but resume upload failed. You can upload later.');
                    }
                }

                toast.success('Registration successful! ');

                // Navigate to dashboard or profile completion
                setTimeout(() => {
                    navigate('/candidate/dashboard', { replace: true });
                }, 500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);

            // Handle specific errors
            if (error.response?.status === 409) {
                // User already exists
                toast.error('This mobile/email is already registered. Please login.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-gray-50 font-sans">
            {/* Banner Section */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-3xl font-bold text-white tracking-wider">{t('pages.register.candidate_title')}</h1>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center p-4 -mt-10 relative z-20">
                <div className="w-full max-w-6xl bg-white shadow-2xl overflow-hidden min-h-[400px] p-8 md:p-12 border-b-4 border-[#233480]">

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 1: Name and Mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.full_name_label')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder={t('pages.register.full_name_placeholder')}
                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.name && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.name}</p>}
                            </div>

                            {/* ═══════ MOBILE + OTP SECTION ═══════ */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2">
                                    {t('pages.register.mobile_label')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    placeholder={t('pages.register.mobile_placeholder')}
                                    disabled={otpHook.otpVerified || otpHook.otpSent}
                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${
                                        errors.mobile ? 'border-red-500' :
                                        otpHook.otpVerified ? 'border-green-500 bg-green-50' :
                                        'border-gray-200'
                                    } ${(otpHook.otpVerified || otpHook.otpSent) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                                {errors.mobile && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.mobile}</p>}

                                {/* OTP Component */}
                                <OtpVerification
                                    mobile={formData.mobile}
                                    otpState={otpHook}
                                    onSendOtp={otpHook.sendOtp}
                                    onVerifyOtp={otpHook.verifyOtp}
                                    onResendOtp={otpHook.resendOtp}
                                    onOtpChange={otpHook.setOtp}
                                    onEditMobile={() => {
                                        otpHook.editMobile();
                                        // Re-enable mobile input
                                    }}
                                />
                            </div>
                            {/* ═══════ END MOBILE + OTP ═══════ */}
                        </div>

                        {/* Row 2: Email and Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.email_label')} <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder={t('pages.register.email_placeholder')}
                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.email && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.email}</p>}
                            </div>
                            <div className="relative">
                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.auth.password_label')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder={t('pages.auth.password_placeholder')}
                                        className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm pr-10 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.password}</p>}
                            </div>
                        </div>

                        {/* I am Section */}
                        <div className="text-center pt-4">
                            <h3 className="text-lg font-bold text-[#1e2a5a] mb-4">{t('pages.register.i_am_heading')}</h3>
                            <div className="flex justify-center gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setExperienceType(prev => prev === 'fresher' ? null : 'fresher')}
                                    className={`px-8 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${experienceType === 'fresher'
                                        ? 'bg-[#c3e6cb] text-green-800 border-2 border-[#c3e6cb]'
                                        : 'bg-[#ffe8cc] text-orange-800 border-2 border-[#ffe8cc] hover:bg-[#ffd699]'
                                        }`}
                                >
                                    {experienceType === 'fresher' && <span>✓</span>}
                                    {t('pages.register.fresher')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExperienceType(prev => prev === 'experienced' ? null : 'experienced')}
                                    className={`px-8 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${experienceType === 'experienced'
                                        ? 'bg-[#c3e6cb] text-green-800 border-2 border-[#c3e6cb]'
                                        : 'bg-[#ffe8cc] text-orange-800 border-2 border-[#ffe8cc] hover:bg-[#ffd699]'
                                        }`}
                                >
                                    {experienceType === 'experienced' && <span>✓</span>}
                                    {t('pages.register.experienced')}
                                </button>
                            </div>

                            {/* Fresher & Experienced Form Details */}
                            {(experienceType === 'fresher' || experienceType === 'experienced') && (
                                <div className="space-y-8 mt-8 text-left">
                                    {/* Personal Details */}
                                    <div>
                                        <h4 className="text-[#1e2a5a] font-bold border-l-4 border-[#1e2a5a] pl-3 mb-6 bg-gray-50 py-2">{t('pages.register.personal_details')}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.dob_label')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="date"
                                                    name="dob"
                                                    value={formData.dob}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.dob ? 'border-red-500' : 'border-gray-200'}`}
                                                />
                                                {errors.dob && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.dob}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.gender_label')} <span className="text-red-500">*</span></label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500 ${errors.gender ? 'border-red-500' : 'border-gray-200'}`}
                                                >
                                                    <option value="">{t('pages.register.select_gender')}</option>
                                                    <option value="Male">{t('pages.register.male')}</option>
                                                    <option value="Female">{t('pages.register.female')}</option>
                                                    <option value="Other">{t('pages.register.other')}</option>
                                                </select>
                                                {errors.gender && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.gender}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.father_name_label')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="fatherName"
                                                    value={formData.fatherName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('pages.register.father_name_label')}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.fatherName ? 'border-red-500' : 'border-gray-200'}`}
                                                />
                                                {errors.fatherName && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.fatherName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.mother_name_label')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="motherName"
                                                    value={formData.motherName}
                                                    onChange={handleInputChange}
                                                    placeholder={t('pages.register.mother_name_label')}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.motherName ? 'border-red-500' : 'border-gray-200'}`}
                                                />
                                                {errors.motherName && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.motherName}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Work Status */}
                                    <div>
                                        <h4 className="text-[#1e2a5a] font-bold border-l-4 border-[#1e2a5a] pl-3 mb-6 bg-gray-50 py-2">{t('pages.register.work_status')}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.industry_type_label')} <span className="text-red-500">*</span></label>
                                                <select
                                                    name="industryType"
                                                    value={formData.industryType}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500 ${errors.industryType ? 'border-red-500' : 'border-gray-200'}`}
                                                >
                                                    <option value="">{t('pages.register.select_industry')}</option>
                                                    <option value="IT & Software">IT & Software</option>
                                                    <option value="Healthcare">Healthcare</option>
                                                    <option value="Education">Education</option>
                                                    <option value="Manufacturing">Manufacturing</option>
                                                    <option value="Textile">Textile</option>
                                                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                                                    <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                                                    <option value="Construction">Construction</option>
                                                
                                                    
                                                    <option value="Others">Others</option>
                                                </select>
                                                {errors.industryType && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.industryType}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.experience_label')} <span className="text-red-500">*</span></label>
                                                <select
                                                    name="experience"
                                                    value={formData.experience}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500 ${errors.experience ? 'border-red-500' : 'border-gray-200'}`}
                                                >
                                                    {experienceType === 'fresher' ? (
                                                        <>
                                                            <option value="">{t('pages.register.select_experience')}</option>
                                                            <option value="Fresher">{t('pages.register.fresher')}</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="">{t('pages.register.select_experience')}</option>
                                                            <option value="1 Year">1 Year</option>
                                                            <option value="2 Years">2 Years</option>
                                                            <option value="3 Years">3 Years</option>
                                                            <option value="4 Years">4 Years</option>
                                                            <option value="5+ Years">5+ Years</option>
                                                        </>
                                                    )}
                                                </select>
                                                {errors.experience && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.experience}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.preferred_locations_label')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="preferredLocations"
                                                    value={formData.preferredLocations}
                                                    onChange={handleInputChange}
                                                    placeholder={t('pages.register.preferred_locations_label')}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.preferredLocations ? 'border-red-500' : 'border-gray-200'}`}
                                                />
                                                {errors.preferredLocations && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.preferredLocations}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.current_location_label')} <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="currentLocation"
                                                    value={formData.currentLocation}
                                                    onChange={handleInputChange}
                                                    placeholder={t('pages.register.current_location_label')}
                                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.currentLocation ? 'border-red-500' : 'border-gray-200'}`}
                                                />
                                                {errors.currentLocation && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.currentLocation}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Employment Details (Only for Experienced) */}
                                    {experienceType === 'experienced' && (
                                        <div>
                                            <h4 className="text-[#1e2a5a] font-bold border-l-4 border-[#1e2a5a] pl-3 mb-6 bg-gray-50 py-2">{t('pages.register.employment_details')}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.employer_name_label')} <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="employerName"
                                                        value={formData.employerName}
                                                        onChange={handleInputChange}
                                                        placeholder={t('pages.register.employer_name_label')}
                                                        className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.employerName ? 'border-red-500' : 'border-gray-200'}`}
                                                    />
                                                    {errors.employerName && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.employerName}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.designation_label')} <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="text"
                                                        name="designation"
                                                        value={formData.designation}
                                                        onChange={handleInputChange}
                                                        placeholder={t('pages.register.designation_label')}
                                                        className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.designation ? 'border-red-500' : 'border-gray-200'}`}
                                                    />
                                                    {errors.designation && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.designation}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.salary_lacs_label')}</label>
                                                    <select
                                                        name="salaryLacs"
                                                        value={formData.salaryLacs}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500"
                                                    >
                                                        <option value="0 Lacs">Salary(0 Lacs)</option>
                                                        <option value="1 Lacs">1 Lacs</option>
                                                        <option value="2 Lacs">2 Lacs</option>
                                                        <option value="3 Lacs">3 Lacs</option>
                                                        <option value="4 Lacs">4 Lacs</option>
                                                        <option value="5+ Lacs">5+ Lacs</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.salary_thousands_label')}</label>
                                                    <select
                                                        name="salaryThousands"
                                                        value={formData.salaryThousands}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500"
                                                    >
                                                        <option value="0 Thousand">Salary(0 Thousand)</option>
                                                        <option value="10-20 Thousand">10-20 Thousand</option>
                                                        <option value="20-30 Thousand">20-30 Thousand</option>
                                                        <option value="30-40 Thousand">30-40 Thousand</option>
                                                        <option value="40-50 Thousand">40-50 Thousand</option>
                                                        <option value="50+ Thousand">50+ Thousand</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                                        <div className="flex items-center border border-gray-200 rounded-sm bg-white px-3 py-3">
                                                            <span className="bg-[#233480] text-white text-xs px-2 py-1 mr-2 rounded-sm">From</span>
                                                            <input type="month" defaultValue={new Date().toISOString().slice(0, 7)} className="flex-grow outline-none text-sm text-gray-600 bg-transparent" />
                                                        </div>
                                                        <div className="flex items-center gap-4 h-full">
                                                            <label className="flex items-center text-sm text-gray-600 gap-2 cursor-pointer whitespace-nowrap min-w-fit">
                                                                <input type="checkbox" className="form-checkbox text-[#233480] rounded-sm w-4 h-4" checked={isWorkingCurrently} onChange={(e) => setIsWorkingCurrently(e.target.checked)} />
                                                                {t('pages.register.present')}
                                                            </label>
                                                            {!isWorkingCurrently && (
                                                                <div className="flex-grow flex items-center border border-gray-200 rounded-sm bg-white px-3 py-3">
                                                                    <span className="bg-[#233480] text-white text-xs px-2 py-1 mr-2 rounded-sm">To</span>
                                                                    <input type="month" defaultValue={new Date().toISOString().slice(0, 7)} className="flex-grow outline-none text-sm text-gray-600 bg-transparent" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Education Details */}
                                    <div>
                                        <h4 className="text-[#1e2a5a] font-bold border-l-4 border-[#1e2a5a] pl-3 mb-6 bg-gray-50 py-2">{t('pages.register.education_details')}</h4>
                                        <div className="w-full max-sm">
                                            <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.highest_education_label')} <span className="text-red-500">*</span></label>
                                            <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500" value={highestEducation} onChange={(e) => setHighestEducation(e.target.value)}>
                                                <option value="">{t('pages.register.select_qualification')}</option>
                                                <option value="12th">{t('pages.register.twelfth_diploma')}</option>
                                                <option value="graduate">{t('pages.register.graduate')}</option>
                                                <option value="postgraduate">{t('pages.register.postgraduate')}</option>
                                            </select>
                                        </div>

                                        {(highestEducation === '12th' || highestEducation === 'graduate' || highestEducation === 'postgraduate') && (
                                            <div className="mt-6 p-4 bg-gray-50 rounded-sm border border-gray-200">
                                                <h5 className="text-sm font-bold text-gray-700 mb-4">{t('pages.register.twelfth_diploma_details')}</h5>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.university_institute_name')} <span className="text-red-500">*</span></label>
                                                        <input type="text" name="universityName" value={formData.universityName} onChange={handleInputChange} placeholder={t('pages.register.school_institute_placeholder')} className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.universityName ? 'border-red-500' : 'border-gray-200'}`} />
                                                        {errors.universityName && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.universityName}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.course')}</label>
                                                        <input type="text" name="course" value={formData.course} onChange={handleInputChange} placeholder="Course eg. DCA" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.stream_specialization')}</label>
                                                        <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder={t('pages.register.stream_specialization')} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.passout_year')}</label>
                                                            <div className="flex items-center border border-gray-200 rounded-sm bg-white px-3 py-3">
                                                                <span className="bg-[#233480] text-white text-xs px-2 py-1 mr-2 rounded-sm">{t('pages.register.year')}</span>
                                                                <input type="month" value={passingYear} onChange={(e) => setPassingYear(e.target.value)} className="flex-grow outline-none text-sm text-gray-600 bg-transparent" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.result')}</label>
                                                            <input type="text" name="result" value={formData.result} onChange={handleInputChange} placeholder="e.g. 75%, 8.5 CGPA" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional information */}
                                    <div>
                                        <h4 className="text-[#1e2a5a] font-bold border-l-4 border-[#1e2a5a] pl-3 mb-6 bg-gray-50 py-2">{t('pages.register.additional_info')}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.internship_details_label')}</label>
                                                <input type="text" name="internshipDetails" value={formData.internshipDetails} onChange={handleInputChange} placeholder={t('pages.register.internship_details_label')} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.certification_details_label')}</label>
                                                <input type="text" name="certificationDetails" value={formData.certificationDetails} onChange={handleInputChange} placeholder={t('pages.register.certification_details_label')} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.physically_disabled_label')} <span className="text-red-500">*</span></label>
                                                <select name="isPhysicallyDisabled" value={formData.isPhysicallyDisabled} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500">
                                                    <option value="Not">{t('pages.register.physically_disabled_not')}</option>
                                                    <option value="Yes">{t('pages.register.physically_disabled_yes')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.apprenticeship_registration_label')} <span className="text-red-500">*</span></label>
                                                <select name="hasApprenticeship" value={formData.hasApprenticeship} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm text-gray-500">
                                                    <option value="No">{t('pages.header.apply')}</option>
                                                    <option value="Yes">{t('pages.register.apprenticeship_yes')}</option>
                                                    <option value="No">{t('pages.register.apprenticeship_no')}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add Skills */}
                                    <div>
                                        <h4 className="text-[#1e2a5a] font-bold border-l-4 border-[#1e2a5a] pl-3 mb-6 bg-gray-50 py-2">{t('pages.register.add_skills')}</h4>
                                        <div className="w-full">
                                            <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.skills_label')} <span className="text-red-500">*</span></label>
                                            <input type="text" placeholder="Add Skills e.g. Electrican, IT..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm" value={skills.join(", ")} readOnly />
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {['Plumber', 'Electrican', 'Sanitary Worker', 'Accountant', 'Wireman', 'IT', 'Student', 'Finance', 'Call Center', 'BPO'].map(skill => (
                                                    <span key={skill} onClick={() => handleSkillClick(skill)} className={`px-3 py-1 text-xs rounded-sm cursor-pointer transition-colors border ${skills.includes(skill) ? 'bg-[#c3e6cb] text-green-800 border-[#c3e6cb] font-semibold' : 'bg-[#ffe8cc] text-orange-800 border-[#ffe8cc] hover:bg-[#ffd699]'}`}>
                                                        {skills.includes(skill) && <span className="mr-1">✓</span>}
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resume Headline */}
                                    <div>
                                        <h4 className="text-[#1e2a5a] font-bold border-l-4 border-[#1e2a5a] pl-3 mb-6 bg-gray-50 py-2">{t('pages.register.resume_headline_label')}</h4>
                                        <div>
                                            <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.resume_headline_label')} <span className="text-red-500">*</span></label>
                                            <textarea name="resumeHeadline" value={formData.resumeHeadline} onChange={handleInputChange} placeholder={t('pages.register.resume_headline_label')} rows="3" className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.resumeHeadline ? 'border-red-500' : 'border-gray-200'}`}></textarea>
                                            {errors.resumeHeadline && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.resumeHeadline}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resume Upload and Submit */}
                            <div className="flex flex-col items-center gap-4 mt-8 w-full border-t border-gray-100 pt-8">
                                {/* Mobile not verified warning */}
                                {!otpHook.otpVerified && (
                                    <div className="w-full max-w-2xl px-4">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-3 flex items-center gap-2">
                                            <span className="text-yellow-600 text-lg">⚠️</span>
                                            <p className="text-yellow-800 text-xs font-medium">
                                                Please verify your mobile number before submitting the form.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-2xl px-4">
                                    <div className="relative w-full md:flex-grow">
                                                                               <input
                                            type="file"
                                            id="resume-upload"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                if (e.target.files.length > 0) {
                                                    const file = e.target.files[0];
                                                    // Validate file size (3MB max)
                                                    if (file.size > 3 * 1024 * 1024) {
                                                        toast.error('File size must be less than 3MB');
                                                        return;
                                                    }
                                                    setResumeName(file.name);
                                                    setResumeFile(file);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="resume-upload"
                                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-all duration-300 text-sm w-full truncate"
                                        >
                                            <span className="text-gray-400">📎</span>
                                            <span className="text-gray-500 truncate">{resumeName ? resumeName : t('pages.register.choose_resume')}</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !otpHook.otpVerified}
                                        className={`w-full md:w-auto min-w-[160px] px-10 py-3.5 font-bold rounded-sm transition-all duration-300 text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${
                                            otpHook.otpVerified
                                                ? 'bg-[#233480] text-white hover:bg-[#1a2660]'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Registering...
                                            </>
                                        ) : (
                                            t('pages.register.submit')
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium italic">
                                    {t('pages.register.max_file_size')}
                                </p>
                            </div>
                        </div>
                    </form>

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CandidateRegister;