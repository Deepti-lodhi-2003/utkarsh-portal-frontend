

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { institutionsAPI } from '../../services/api';

const InstitutionProfile = () => {
    const { t } = useTranslation();
    // ── State ──
    const [formData, setFormData] = useState({
        organisationName: '',
        email: '',
        mobile: '',
        contactPersonName: '',
        designation: '',
        officeAddress: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        officeMobileNo: '',
        websiteUrl: '',
        offeringIndustries: [],
        aboutOrganisation: '',
        skillsOrServices: '',
        logo: null
    });

    const [originalData, setOriginalData] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [existingLogo, setExistingLogo] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const availableIndustries = [
        'IT & Software', 'Healthcare', 'Education', 'Manufacturing',
        'Finance', 'Retail', 'Construction', 'Hospitality'
    ];

    const getIndustryLabel = (industry) => {
        const industryMap = {
            'IT & Software': t('pages.institution_profile.industries.it_software'),
            'Healthcare': t('pages.institution_profile.industries.healthcare'),
            'Education': t('pages.institution_profile.industries.education'),
            'Manufacturing': t('pages.institution_profile.industries.manufacturing'),
            'Finance': t('pages.institution_profile.industries.finance'),
            'Retail': t('pages.institution_profile.industries.retail'),
            'Construction': t('pages.institution_profile.industries.construction'),
            'Hospitality': t('pages.institution_profile.industries.hospitality')
        };
        return industryMap[industry] || industry;
    };

    // ── Fetch profile on mount ──
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await institutionsAPI.getProfile();
            const profile = res.data.data;

            const mapped = {
                organisationName: profile.organizationName || '',
                email: profile.user?.email || '',
                mobile: profile.user?.mobile || '',
                contactPersonName: profile.contactPerson?.name || '',
                designation: profile.contactPerson?.designation || '',
                officeAddress: profile.address?.street || '',
                city: profile.address?.city || '',
                district: profile.address?.district || '',
                state: profile.address?.state || '',
                pincode: profile.address?.pincode || '',
                officeMobileNo: profile.officeMobile || '',
                websiteUrl: profile.website || '',
                offeringIndustries: Array.isArray(profile.industryType) ? profile.industryType : (profile.industryType ? [profile.industryType] : []),
                aboutOrganisation: profile.about || '',
                skillsOrServices: profile.services?.join(', ') || '',
                logo: null
            };

            setFormData(mapped);
            setOriginalData(mapped);

            if (profile.logo?.url) {
                setExistingLogo(profile.logo.url);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setErrorMessage(t('pages.institution_profile.errors.load_failed'));
            setShowErrorAlert(true);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 250 * 1024) {
            alert(t('pages.institution_profile.errors.logo_size'));
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert(t('pages.institution_profile.errors.logo_type'));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);

        setFormData(prev => ({ ...prev, logo: file }));
    };

    const removeLogo = () => {
        setLogoPreview(null);
        setFormData(prev => ({ ...prev, logo: null }));
        const fileInput = document.getElementById('logoInput');
        if (fileInput) fileInput.value = '';
    };

    const toggleIndustry = (industry) => {
        setFormData(prev => ({
            ...prev,
            offeringIndustries: prev.offeringIndustries.includes(industry)
                ? prev.offeringIndustries.filter(i => i !== industry)
                : [...prev.offeringIndustries, industry]
        }));
    };

    const hasChanges = () => {
        if (!originalData) return false;
        const { logo, ...current } = formData;
        const { logo: _, ...original } = originalData;
        return JSON.stringify(current) !== JSON.stringify(original) || formData.logo !== null;
    };

    const handleUpdate = async () => {
        setShowSuccessAlert(false);
        setShowErrorAlert(false);

        if (!hasChanges()) {
            setErrorMessage(t('pages.institution_profile.errors.no_changes'));
            setShowErrorAlert(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setUpdating(true);

        try {
            // 1) Update profile data
            await institutionsAPI.updateProfile({
                organizationName: formData.organisationName,
                about: formData.aboutOrganisation,
                industryType: formData.offeringIndustries,
                services: formData.skillsOrServices.split(',').map(s => s.trim()).filter(Boolean),
                officeMobile: formData.officeMobileNo,
                website: formData.websiteUrl && !/^https?:\/\//i.test(formData.websiteUrl)
                    ? `https://${formData.websiteUrl}`
                    : formData.websiteUrl,
                contactPerson: {
                    name: formData.contactPersonName,
                    designation: formData.designation,
                    email: formData.email,
                    phone: formData.mobile
                },
                address: {
                    street: formData.officeAddress,
                    city: formData.city,
                    district: formData.district,
                    state: formData.state,
                    pincode: formData.pincode
                }
            });

            // 2) Upload logo if changed
            if (formData.logo) {
                const logoForm = new FormData();
                logoForm.append('logo', formData.logo);
                await institutionsAPI.uploadLogo(logoForm);
            }

            setShowSuccessAlert(true);
            removeLogo();

            // Refresh data
            await fetchProfile();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Update error:', err);
            setErrorMessage(err.response?.data?.message || t('pages.institution_profile.errors.update_failed'));
            setShowErrorAlert(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#233480]" />
            </div>
        );
    }

    return (
        <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl md:text-2xl font-bold text-[#1e2a5a] mb-6">{t('pages.institution_profile.title')}</h2>

            {/* Error Alert */}
            {showErrorAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-[14px]">
                        <AlertCircle size={16} className="text-[#721c24] stroke-[3px]" />
                        {errorMessage}
                    </div>
                    <button onClick={() => setShowErrorAlert(false)} className="text-[#721c24] hover:opacity-70 transition-opacity">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-[14px]">
                        <Check size={16} className="text-[#155724] stroke-[3px]" />
                        {t('pages.institution_profile.update_success')}
                    </div>
                    <button onClick={() => setShowSuccessAlert(false)} className="text-[#155724] hover:opacity-70 transition-opacity">
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">
                        {t('pages.institution_profile.fields.organisation_name')} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="organisationName" value={formData.organisationName} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">
                        {t('pages.institution_profile.fields.email')} <span className="text-red-500">*</span>
                    </label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">
                        {t('pages.institution_profile.fields.mobile')} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="mobile" value={formData.mobile} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">
                        {t('pages.institution_profile.fields.contact_person_name')} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">
                        {t('pages.institution_profile.fields.designation')} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleInputChange}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">
                    {t('pages.institution_profile.fields.office_address')} <span className="text-red-500">*</span>
                </label>
                <textarea name="officeAddress" value={formData.officeAddress} onChange={handleInputChange} rows="2"
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors resize-none" />
            </div>

            {/* City, District, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.city')}</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder={t('pages.institution_profile.placeholders.city')}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors placeholder:text-gray-400" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.district')}</label>
                    <input type="text" name="district" value={formData.district} onChange={handleInputChange} placeholder={t('pages.institution_profile.placeholders.district')}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors placeholder:text-gray-400" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.state')}</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder={t('pages.institution_profile.placeholders.state')}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors placeholder:text-gray-400" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.pincode')}</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder={t('pages.institution_profile.placeholders.pincode')} maxLength="6"
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors placeholder:text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.office_mobile')}</label>
                    <input type="text" name="officeMobileNo" value={formData.officeMobileNo} onChange={handleInputChange} placeholder={t('pages.institution_profile.placeholders.office_mobile')}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors placeholder:text-gray-400" />
                </div>
                <div className="col-span-1">
                    <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.website_url')}</label>
                    <input type="text" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} placeholder={t('pages.institution_profile.placeholders.website_url')}
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors placeholder:text-gray-400" />
                </div>
            </div>

            {/* Offering Industries */}
            <div className="mb-6">
                <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">
                    {t('pages.institution_profile.fields.offering_industries')} <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {availableIndustries.map(industry => (
                        <button key={industry} onClick={() => toggleIndustry(industry)}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[11px] md:text-[13px] font-bold flex items-center gap-1.5 md:gap-2 transition-all ${formData.offeringIndustries.includes(industry)
                                ? 'bg-green-100 text-green-600 border border-green-200'
                                : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                            {formData.offeringIndustries.includes(industry) && <Check size={12} />}
                            {getIndustryLabel(industry)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.about_organisation')}</label>
                <textarea name="aboutOrganisation" value={formData.aboutOrganisation} onChange={handleInputChange} rows="3" placeholder={t('pages.institution_profile.placeholders.about_organisation')}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors resize-none placeholder:text-gray-400" />
            </div>

            <div className="mb-6">
                <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.institution_profile.fields.skills_services')}</label>
                <textarea name="skillsOrServices" value={formData.skillsOrServices} onChange={handleInputChange} rows="3" placeholder={t('pages.institution_profile.placeholders.skills_services')}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors resize-none placeholder:text-gray-400" />
            </div>

            {/* Upload Logo */}
            <div className="mb-8">
                <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-3 text-center">{t('pages.institution_profile.logo.title')}</label>
                <div className="flex flex-col items-center">
                    {logoPreview || existingLogo ? (
                        <div className="relative mb-4">
                            <img src={logoPreview || existingLogo} alt="Logo Preview" className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg p-2" />
                            {logoPreview && (
                                <button onClick={removeLogo} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="mb-4">
                            <label htmlFor="logoInput" className="flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <Upload size={32} className="text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">{t('pages.institution_profile.logo.click_upload')}</span>
                            </label>
                            <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        </div>
                    )}
                    {!logoPreview && !existingLogo && (
                        <input id="logoInput" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    )}
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Upload size={12} /> {t('pages.institution_profile.logo.hint')}
                    </p>
                </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-center pb-20">
                <button onClick={handleUpdate} disabled={updating}
                    className={`w-full md:w-auto bg-[#233480] hover:bg-[#1e2a5a] text-white font-bold py-3 px-12 rounded shadow-lg transition-all text-sm uppercase tracking-wide ${updating ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                    {updating ? (
                        <span className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> {t('pages.institution_profile.actions.updating')}
                        </span>
                    ) : t('pages.institution_profile.actions.update')}
                </button>
            </div>
        </div>
    );
};

export default InstitutionProfile;