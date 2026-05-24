import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../component/Footer';
import { useTranslation } from 'react-i18next';
import {
    X, Loader2, AlertCircle, Check,
    BookOpen, Clock, MapPin, Image,
    DollarSign, Award, Upload
} from 'lucide-react';
import { trainingsAPI } from '../../services/api';

// ═══════════════════════════════════════
//  REUSABLE COMPONENTS
// ═══════════════════════════════════════

const InputField = React.memo(({
    label, name, type = 'text', placeholder,
    required, value, onChange, onBlur, error,
    disabled, className = '', ...rest
}) => (
    <div className={className}>
        <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            placeholder={placeholder || label}
            disabled={disabled}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#233480]/20 
                focus:border-[#233480] bg-gray-50 text-sm transition-all
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${error ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            {...rest}
        />
        {error && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
));
InputField.displayName = 'InputField';

const SelectField = React.memo(({
    label, name, required, value, onChange,
    onBlur, error, children, className = ''
}) => (
    <div className={className}>
        <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            name={name}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#233480]/20 
                focus:border-[#233480] bg-gray-50 text-sm transition-all appearance-none
                ${error ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        >
            {children}
        </select>
        {error && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
            </p>
        )}
    </div>
));
SelectField.displayName = 'SelectField';

const SectionHeader = React.memo(({ icon: Icon, title }) => (
    <div className="border-l-4 border-[#233480] pl-3 mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-[#1e2a5a] flex items-center gap-2">
            {Icon && <Icon size={18} className="text-[#233480] hidden sm:block" />}
            {title}
        </h3>
    </div>
));
SectionHeader.displayName = 'SectionHeader';

// ═══════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════

const CreateTraining = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const bannerRef = useRef(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [errors, setErrors] = useState({});

    // Banner
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // Form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        mode: '',
        startDate: '',
        totalSeats: '',
        fees: '',
        isFree: false,
        venueCity: '',
        durationValue: '',
        durationUnit: 'months',
        certificateProvided: false,
        placementAssistance: false,
    });

    // Skills
    const [skillsCovered, setSkillsCovered] = useState([]);
    const [skillInput, setSkillInput] = useState('');

    const categories = [
        { value: 'it_software', label: t('pages.create_training_program.categories.it_software') },
        { value: 'manufacturing', label: t('pages.create_training_program.categories.manufacturing') },
        { value: 'healthcare', label: t('pages.create_training_program.categories.healthcare') },
        { value: 'retail', label: t('pages.create_training_program.categories.retail') },
        { value: 'hospitality', label: t('pages.create_training_program.categories.hospitality') },
        { value: 'construction', label: t('pages.create_training_program.categories.construction') },
        { value: 'agriculture', label: t('pages.create_training_program.categories.agriculture') },
        { value: 'automotive', label: t('pages.create_training_program.categories.automotive') },
        { value: 'textile', label: t('pages.create_training_program.categories.textile') },
        { value: 'banking', label: t('pages.create_training_program.categories.banking') },
        { value: 'education', label: t('pages.create_training_program.categories.education') },
        { value: 'other', label: t('pages.create_training_program.categories.other') },
    ];

    // ═══ HANDLERS ═══

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setErrors(prev => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (!value?.trim()) {
            setErrors(prev => ({ ...prev, [name]: t('pages.create_training_program.errors.required') }));
        }
    }, [t]);

    // Banner handlers
    const handleBannerChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, banner: t('pages.create_training_program.errors.banner_type') }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, banner: t('pages.create_training_program.errors.banner_size') }));
            return;
        }
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
        setErrors(prev => { const n = { ...prev }; delete n.banner; return n; });
    }, [t]);

    const removeBanner = useCallback(() => {
        setBannerFile(null);
        setBannerPreview(null);
        if (bannerRef.current) bannerRef.current.value = '';
    }, []);

    // Skills
    const handleSkillKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const skill = e.target.value.trim().replace(/,/g, '');
            if (skill) {
                setSkillsCovered(prev => prev.includes(skill) ? prev : [...prev, skill]);
                setSkillInput('');
                setErrors(prev => { const n = { ...prev }; delete n.skills; return n; });
            }
        }
    }, []);

    const removeSkill = useCallback((s) => {
        setSkillsCovered(prev => prev.filter(sk => sk !== s));
    }, []);

    // Validate
    const validate = () => {
        const e = {};
        if (!formData.title.trim()) e.title = t('pages.create_training_program.errors.title_required');
        if (!formData.description.trim()) e.description = t('pages.create_training_program.errors.description_required');
        if (!formData.category) e.category = t('pages.create_training_program.errors.category_required');
        if (!formData.mode) e.mode = t('pages.create_training_program.errors.mode_required');
        if (!formData.startDate) e.startDate = t('pages.create_training_program.errors.start_date_required');
        if (!formData.durationValue) e.durationValue = t('pages.create_training_program.errors.duration_required');
        if (skillsCovered.length === 0) e.skills = t('pages.create_training_program.errors.skills_required');
        if (!formData.isFree && !formData.fees) e.fees = t('pages.create_training_program.errors.fees_required');
        if (formData.mode && formData.mode !== 'online' && !formData.venueCity.trim()) {
            e.venueCity = t('pages.create_training_program.errors.city_required');
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // Build payload
    const buildPayload = () => ({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skillsCovered,
        duration: { value: Number(formData.durationValue) || 1, unit: formData.durationUnit },
        startDate: formData.startDate,
        mode: formData.mode,
        venue: formData.mode !== 'online' ? { city: formData.venueCity, state: 'Madhya Pradesh' } : undefined,
        fees: {
            amount: formData.isFree ? 0 : Number(formData.fees) || 0,
            currency: 'INR',
            isFree: formData.isFree,
        },
        totalSeats: Number(formData.totalSeats) || 30,
        certification: { isProvided: formData.certificateProvided },
        placementAssistance: formData.placementAssistance,
        status: 'upcoming'
    });

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess(false);

        if (!validate()) {
            document.querySelector('.border-red-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = buildPayload();
            console.log('Creating training with payload:', payload);
            const res = await trainingsAPI.create(payload);
            console.log('Training created, response:', res.data);

            // Upload banner - Fix: Access training ID from res.data.data._id
            if (bannerFile && res?.data?.data?._id) {
                console.log('Uploading banner for training ID:', res.data.data._id);
                const fd = new FormData();
                fd.append('banner', bannerFile);
                try {
                    const bannerRes = await trainingsAPI.uploadBanner(res.data.data._id, fd);
                    console.log('Banner uploaded successfully:', bannerRes.data);
                } catch (err) {
                    console.error('Banner upload failed:', err);
                    console.error('Error response:', err.response?.data);
                }
            } else {
                console.log('Banner upload skipped. bannerFile:', !!bannerFile, 'trainingId:', res?.data?.data?._id);
            }

            setSubmitSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => navigate('/my-training'), 2000);
        } catch (err) {
            console.error('Training creation error:', err);
            setSubmitError(err.response?.data?.message || t('pages.create_training_program.create_failed'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">

            {/* Page Banner */}
            <div
                className="relative w-full h-24 sm:h-28 md:h-32 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}
            >
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                <h1 className="relative z-10 text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-wider text-center px-4">
                    {t('pages.create_training_program.title')}
                </h1>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 lg:px-6 -mt-4 sm:-mt-6 mb-8 sm:mb-12 relative z-20 flex-1">
                <div className="bg-white border-b-4 border-[#233480] shadow-lg p-4 sm:p-6 md:p-8 rounded-t-lg">

                    {submitSuccess && (
                        <div className="mb-5 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                            <Check size={18} /> {t('pages.create_training_program.create_success')}
                        </div>
                    )}

                    {submitError && (
                        <div className="mb-5 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex justify-between items-start text-sm">
                            <span>{submitError}</span>
                            <button onClick={() => setSubmitError('')} className="hover:bg-red-200 rounded p-0.5">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                        {/* ═══ BANNER UPLOAD ═══ */}
                        <div>
                            <SectionHeader icon={Image} title={t('pages.create_training_program.sections.banner')} />

                            {bannerPreview ? (
                                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                    <img src={bannerPreview} alt="Banner" className="w-full h-40 sm:h-52 object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeBanner}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all"
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] sm:text-xs px-2 py-1 rounded">
                                        {bannerFile?.name}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => bannerRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-6 sm:p-10 text-center cursor-pointer 
                                        hover:border-[#233480] hover:bg-blue-50/30 transition-all
                                        ${errors.banner ? 'border-red-400 bg-red-50/20' : 'border-gray-300'}`}
                                >
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">{t('pages.create_training_program.banner.click_upload')}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{t('pages.create_training_program.banner.hint')}</p>
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
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> {errors.banner}
                                </p>
                            )}
                        </div>

                        {/* ═══ BASIC INFO ═══ */}
                        <div>
                            <SectionHeader icon={BookOpen} title={t('pages.create_training_program.sections.basic_info')} />
                            <div className="space-y-3 sm:space-y-4">
                                <InputField
                                    label={t('pages.create_training_program.fields.title')} name="title" required
                                    placeholder={t('pages.create_training_program.placeholders.title')}
                                    value={formData.title} onChange={handleChange}
                                    onBlur={handleBlur} error={errors.title}
                                />

                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1">
                                        {t('pages.create_training_program.fields.description')} <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        placeholder={t('pages.create_training_program.placeholders.description')}
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg 
                                            focus:outline-none focus:ring-2 focus:ring-[#233480]/20 
                                            focus:border-[#233480] bg-gray-50 text-sm resize-none transition-all
                                            ${errors.description ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
                                        value={formData.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.description}
                                        </p>
                                    )}
                                </div>

                                <SelectField
                                    label={t('pages.create_training_program.fields.category')} name="category" required
                                    value={formData.category} onChange={handleChange}
                                    onBlur={handleBlur} error={errors.category}
                                >
                                    <option value="">{t('pages.create_training_program.placeholders.select_category')}</option>
                                    {categories.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </SelectField>
                            </div>
                        </div>

                        {/* ═══ SKILLS ═══ */}
                        <div>
                            <SectionHeader icon={Award} title={t('pages.create_training_program.sections.skills')} />
                            <div>
                                <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1">
                                    {t('pages.create_training_program.fields.skills')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleSkillKeyDown}
                                    placeholder={t('pages.create_training_program.placeholders.skills')}
                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg 
                                        focus:outline-none focus:ring-2 focus:ring-[#233480]/20 
                                        focus:border-[#233480] bg-gray-50 text-sm transition-all
                                        ${errors.skills ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
                                />
                                {errors.skills && (
                                    <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} /> {errors.skills}
                                    </p>
                                )}
                                {skillsCovered.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5">
                                        {skillsCovered.map((skill, i) => (
                                            <span key={i} className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-[#233480] text-white text-[10px] sm:text-xs font-medium rounded-full">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-white/20 rounded-full p-0.5">
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══ SCHEDULE ═══ */}
                        <div>
                            <SectionHeader icon={Clock} title={t('pages.create_training_program.sections.schedule')} />
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <InputField
                                        label={t('pages.create_training_program.fields.duration')} name="durationValue" type="number" required
                                        placeholder={t('pages.create_training_program.placeholders.duration')} value={formData.durationValue}
                                        onChange={handleChange} onBlur={handleBlur} error={errors.durationValue}
                                    />
                                    <SelectField label={t('pages.create_training_program.fields.unit')} name="durationUnit" value={formData.durationUnit} onChange={handleChange}>
                                        <option value="days">{t('pages.create_training_program.units.days')}</option>
                                        <option value="weeks">{t('pages.create_training_program.units.weeks')}</option>
                                        <option value="months">{t('pages.create_training_program.units.months')}</option>
                                    </SelectField>
                                    <SelectField
                                        label={t('pages.create_training_program.fields.mode')} name="mode" required
                                        value={formData.mode} onChange={handleChange}
                                        onBlur={handleBlur} error={errors.mode}
                                        className="col-span-2 sm:col-span-1"
                                    >
                                        <option value="">{t('pages.create_training_program.placeholders.select_mode')}</option>
                                        <option value="online">{t('pages.create_training_program.modes.online')}</option>
                                        <option value="offline">{t('pages.create_training_program.modes.offline')}</option>
                                        <option value="hybrid">{t('pages.create_training_program.modes.hybrid')}</option>
                                    </SelectField>
                                </div>

                                <InputField
                                    label={t('pages.create_training_program.fields.start_date')} name="startDate" type="date" required
                                    value={formData.startDate} onChange={handleChange}
                                    onBlur={handleBlur} error={errors.startDate}
                                />
                            </div>
                        </div>

                        {/* ═══ VENUE (offline/hybrid only) ═══ */}
                        {formData.mode && formData.mode !== 'online' && (
                            <div>
                                <SectionHeader icon={MapPin} title={t('pages.create_training_program.sections.venue')} />
                                <InputField
                                    label={t('pages.create_training_program.fields.city')} name="venueCity" required
                                    placeholder={t('pages.create_training_program.placeholders.city')}
                                    value={formData.venueCity} onChange={handleChange}
                                    onBlur={handleBlur} error={errors.venueCity}
                                />
                            </div>
                        )}

                        {/* ═══ FEES & SEATS ═══ */}
                        <div>
                            <SectionHeader icon={DollarSign} title={t('pages.create_training_program.sections.fees')} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
                                <InputField
                                    label={t('pages.create_training_program.fields.total_seats')} name="totalSeats" type="number"
                                    placeholder={t('pages.create_training_program.placeholders.total_seats')} value={formData.totalSeats}
                                    onChange={handleChange} error={errors.totalSeats}
                                />

                                <div>
                                    <label className="block text-xs sm:text-sm font-bold text-gray-600 mb-1">
                                        {t('pages.create_training_program.fields.fees')} {!formData.isFree && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="number"
                                        name="fees"
                                        placeholder={t('pages.create_training_program.placeholders.fees')}
                                        disabled={formData.isFree}
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg 
                                            focus:outline-none focus:ring-2 focus:ring-[#233480]/20 
                                            focus:border-[#233480] bg-gray-50 text-sm transition-all
                                            ${formData.isFree ? 'opacity-50 cursor-not-allowed' : ''} 
                                            ${errors.fees ? 'border-red-500 bg-red-50/30' : 'border-gray-300'}`}
                                        value={formData.isFree ? '' : formData.fees}
                                        onChange={handleChange}
                                    />
                                    {errors.fees && (
                                        <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.fees}
                                        </p>
                                    )}
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer pb-2">
                                    <input
                                        type="checkbox" name="isFree"
                                        checked={formData.isFree} onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-[#233480] focus:ring-[#233480]"
                                    />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">{t('pages.create_training_program.fields.free_training')}</span>
                                </label>
                            </div>
                        </div>

                        {/* ═══ ADDITIONAL OPTIONS ═══ */}
                        <div>
                            <SectionHeader icon={Award} title={t('pages.create_training_program.sections.additional')} />
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox" name="certificateProvided"
                                        checked={formData.certificateProvided} onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-[#233480] focus:ring-[#233480]"
                                    />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">{t('pages.create_training_program.fields.certificate_provided')}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox" name="placementAssistance"
                                        checked={formData.placementAssistance} onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-[#233480] focus:ring-[#233480]"
                                    />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">{t('pages.create_training_program.fields.placement_assistance')}</span>
                                </label>
                            </div>
                        </div>

                        {/* ═══ SUBMIT ═══ */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-all text-xs sm:text-sm uppercase tracking-wide active:scale-95"
                            >
                                {t('pages.create_training_program.actions.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full sm:w-auto px-8 sm:px-10 py-2.5 sm:py-3 bg-[#233480] text-white font-bold rounded-lg hover:bg-[#1a2660] transition-all text-xs sm:text-sm uppercase tracking-wide shadow-md ${submitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> {t('pages.create_training_program.actions.creating')}
                                    </span>
                                ) : t('pages.create_training_program.actions.create_training')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CreateTraining;