// src/pages/InstitutionRegister.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../component/Footer';
import OtpVerification from '../component/OtpVerification';
import useOtpVerification from '../hooks/useOtpVerification';
import { authAPI, institutionsAPI } from '../services/api';

const InstitutionRegister = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [logoName, setLogoName] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // OTP Hook
    const otpHook = useOtpVerification('registration');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        contactPerson: '',
        designation: '',
        officeAddress: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        officeMobile: '',
        website: '',
        offeringIndustries: '',
        about: '',
        skills: ''
    });
    const [errors, setErrors] = useState({});

    const categories = [
        { id: 'Industry', label: 'Industry' },
        { id: 'University', label: 'University' },
        { id: 'Training Institute', label: 'Training Institute' },
        { id: 'Vendor', label: 'Vendor' },
    ];

    // ── Map category to API institutionType ──
    const getCategoryApiValue = (category) => {
        const map = {
            'Industry': 'industry',
            'University': 'university',
            'Training Institute': 'training_institute',
            'Vendor': 'vendor',
        };
        return map[category] || 'industry';
    };

    const getNameLabel = () => {
        if (selectedCategory === 'University') return t('pages.register.university_name_label');
        if (selectedCategory === 'Training Institute') return t('pages.register.training_institute_name_label');
        if (selectedCategory === 'Vendor') return t('pages.register.vendor_name_label');
        return t('pages.register.organisation_name_label');
    };

    const getSkillsLabel = () => {
        if (selectedCategory === 'Industry') return t('pages.register.required_skills_label');
        return t('pages.register.skills_provided_label');
    };

    const getSkillsPlaceholder = () => {
        if (selectedCategory === 'Industry') return t('pages.register.required_skills_placeholder');
        return t('pages.register.skills_provided_placeholder');
    };

    const validateField = (name, value) => {
        let error = "";
        const requiredFields = ["name", "email", "mobile", "password", "contactPerson", "designation", "officeAddress"];
        if (selectedCategory === 'Industry') requiredFields.push("offeringIndustries");

        if (requiredFields.includes(name) && !value.trim()) {
            if (name === "name") error = t('pages.errors.name_required', 'Please enter name');
            else if (name === "email") error = t('pages.errors.email_required', 'Please enter email');
            else if (name === "mobile") error = t('pages.errors.mobile_required', 'Please enter mobile no.');
            else if (name === "password") error = t('pages.errors.password_required', 'Please enter password');
            else if (name === "contactPerson") error = t('pages.errors.contact_person_required', 'Please enter contact person name');
            else if (name === "designation") error = t('pages.errors.designation_required', 'Please enter designation');
            else if (name === "officeAddress") error = t('pages.errors.office_address_required', 'Please enter office address');
            else if (name === "offeringIndustries") error = t('pages.errors.offering_industries_required', 'Please enter offering industries');
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

        // Mobile: only digits, max 10
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

    // ── Handle Category Change ──
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        // Clear category-specific errors
        setErrors(prev => ({ ...prev, offeringIndustries: '' }));
    };

    // ── Build API Payload ──
    const buildPayload = () => {
        const payload = {
            name: formData.contactPerson.trim() || formData.name.trim(),
            email: formData.email.trim(),
            mobile: formData.mobile.trim(),
            password: formData.password,
            institutionType: getCategoryApiValue(selectedCategory),
            organizationName: formData.name.trim(),
            contactPerson: {
                name: formData.contactPerson.trim(),
                designation: formData.designation.trim(),
                email: formData.email.trim(),
                phone: formData.mobile.trim(),
            },
            address: {
                street: formData.officeAddress.trim(),
                city: formData.city?.trim() || '',
                district: formData.district?.trim() || '',
                state: formData.state?.trim() || '',
                pincode: formData.pincode?.trim() || '',
            },
            // Include all form fields
            officeMobile: formData.officeMobile?.trim() || '',
            website: formData.website?.trim() || '',
            about: formData.about?.trim() || '',
        };

        // Add offeringIndustries as array
        if (formData.offeringIndustries?.trim()) {
            payload.offeringIndustries = formData.offeringIndustries
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
        }

        // Add skills/requiredSkills as array
        if (formData.skills?.trim()) {
            const skillsArray = formData.skills
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);

            if (selectedCategory === 'Industry') {
                payload.requiredSkills = skillsArray;
            } else {
                payload.services = skillsArray;
            }
        }

        return payload;
    };

    // ── Handle Submit ──
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Step 1: Check category selected
        if (!selectedCategory) {
            toast.error('Please select a registration category');
            return;
        }

        // Step 2: Check OTP verified
        if (!otpHook.otpVerified) {
            toast.error('Please verify your mobile number first! 📱');
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
            const response = await authAPI.registerInstitution(payload);

            if (response.data.success) {
                const { accessToken, refreshToken, user, institution } = response.data.data;

                // Save tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('role', user.role);
                localStorage.setItem('institutionId', institution.id);

                // Upload logo if selected
                if (logoFile) {
                    try {
                        const logoFormData = new FormData();
                        logoFormData.append('logo', logoFile);
                        await institutionsAPI.uploadLogo(logoFormData);
                        toast.success('Logo uploaded successfully! ');
                    } catch (logoError) {
                        console.error('Logo upload failed:', logoError);
                        toast.error('Registration successful but logo upload failed. You can upload it later from your profile.');
                    }
                }

                toast.success('Registration successful! ');

                // Navigate based on institution type
                const dashboardPath = selectedCategory === 'Vendor'
                    ? '/vendor/dashboard'
                    : '/institution/dashboard';

                setTimeout(() => {
                    navigate(dashboardPath, { replace: true });
                }, 500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);

            if (error.response?.status === 409) {
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
                <h1 className="relative z-10 text-3xl font-bold text-white tracking-wider">{t('pages.register.institution_title')}</h1>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex items-center justify-center p-4 -mt-10 relative z-20">
                <div className={`w-full max-w-6xl bg-white shadow-2xl overflow-hidden p-8 md:p-12 flex flex-col items-center border-b-4 border-[#233480] transition-all duration-500 ${selectedCategory ? 'min-h-[600px]' : 'min-h-[250px]'}`}>

                    <h2 className="text-xl font-bold text-[#1e2a5a] mb-8">{t('pages.register.i_want_to_register_as')}</h2>

                    <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-4 mb-10 w-full">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryChange(category.id)}
                                className={`px-4 py-3 font-medium rounded-sm transition-all min-w-0 md:min-w-[140px] text-xs md:text-sm flex items-center justify-center gap-2 ${selectedCategory === category.id
                                    ? 'bg-[#c1f0d0] text-green-900 shadow-sm'
                                    : 'bg-[#ffe8cc] text-orange-800 hover:bg-[#ffd699]'
                                    }`}
                            >
                                {selectedCategory === category.id && <Check size={16} />}
                                {t(`pages.register.${category.id.toLowerCase().replace(' ', '_')}`)}
                            </button>
                        ))}
                    </div>

                    {/* Form Section */}
                    {selectedCategory && (
                        <form onSubmit={handleSubmit} className="w-full space-y-6 text-left animate-in fade-in slide-in-from-top-4 duration-500">

                            {/* Row 1: Name + Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">{getNameLabel()} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder={getNameLabel()}
                                        className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.name}</p>}
                                </div>
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
                            </div>

                            {/* ═══════ Row 2: Mobile (OTP) + Password ═══════ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mobile + OTP */}
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
                                        className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.mobile ? 'border-red-500' :
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
                                        onEditMobile={otpHook.editMobile}
                                    />
                                </div>

                                {/* Password with Show/Hide */}
                                <div>
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
                            {/* ═══════ END Mobile + Password ═══════ */}

                            {/* Row 3: Contact Person + Designation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.contact_person_name_label')} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleInputChange}
                                        placeholder={t('pages.register.contact_person_name_label')}
                                        className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.contactPerson ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors.contactPerson && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.contactPerson}</p>}
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
                            </div>

                            {/* Office Address */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.office_address_label')} <span className="text-red-500">*</span></label>
                                <textarea
                                    name="officeAddress"
                                    value={formData.officeAddress}
                                    onChange={handleInputChange}
                                    placeholder={t('pages.register.office_address_label')}
                                    rows="2"
                                    className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.officeAddress ? 'border-red-500' : 'border-gray-200'}`}
                                ></textarea>
                                {errors.officeAddress && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.officeAddress}</p>}
                            </div>

                            {/* City, District, State, Pincode */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Enter city"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">District</label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        placeholder="Enter district"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Enter state"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="Enter pincode"
                                        maxLength="6"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Office Mobile, Website */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.office_mobile_label')}</label>
                                    <input
                                        type="text"
                                        name="officeMobile"
                                        value={formData.officeMobile}
                                        onChange={handleInputChange}
                                        placeholder={t('pages.register.office_mobile_label')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.website_url_label')}</label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        placeholder={t('pages.register.website_url_label')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Offering Industries (Industry Only) */}
                            {selectedCategory === 'Industry' && (
                                <div>
                                    <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.offering_industries_label')} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="offeringIndustries"
                                        value={formData.offeringIndustries}
                                        onChange={handleInputChange}
                                        placeholder={t('pages.register.offering_industries_label')}
                                        className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-none focus:border-blue-500 text-sm ${errors.offeringIndustries ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors.offeringIndustries && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1 font-medium">⊗ {errors.offeringIndustries}</p>}
                                </div>
                            )}

                            {/* About Organisation */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2">{t('pages.register.about_organisation_label')}</label>
                                <textarea
                                    name="about"
                                    value={formData.about}
                                    onChange={handleInputChange}
                                    placeholder={t('pages.register.about_organisation_placeholder')}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                ></textarea>
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-gray-700 text-xs font-bold mb-2">{getSkillsLabel()}</label>
                                <textarea
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleInputChange}
                                    placeholder={getSkillsPlaceholder()}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-blue-500 text-sm"
                                ></textarea>
                            </div>

                            {/* Logo Upload and Submit */}
                            <div className="flex flex-col items-center gap-6 mt-8 w-full border-t border-gray-100 pt-8">

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
                                            id="logo-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files.length > 0) {
                                                    const file = e.target.files[0];
                                                    // Validate file size (250KB for logo)
                                                    if (file.size > 250 * 1024) {
                                                        toast.error('Logo size must be less than 250KB');
                                                        return;
                                                    }
                                                    setLogoName(file.name);
                                                    setLogoFile(file);
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-all duration-300 text-[11px] md:text-sm w-full truncate"
                                        >
                                            <span className="text-gray-400">📎</span>
                                            <span className="text-gray-500 truncate">{logoName ? logoName : t('pages.register.logo_upload_label')}</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !otpHook.otpVerified}
                                        className={`w-full md:w-auto min-w-[160px] px-10 py-3.5 font-bold rounded-sm transition-all duration-300 text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${otpHook.otpVerified
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
                            </div>
                        </form>
                    )}

                </div>
            </div>

            <Footer />
        </div>
    );
};

export default InstitutionRegister;