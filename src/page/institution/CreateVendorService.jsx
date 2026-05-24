import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../../component/Footer';
import { X, Plus, Loader2, AlertCircle, Check, Upload ,Trash2} from 'lucide-react';
import { vendorAPI } from '../../services/api';

const CreateVendorService = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // ── Profile Form ──
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        businessDescription: '',
        establishedYear: '',
        annualTurnover: '',
        employeeCount: '',
        isNationwide: false,
        website: '',
        gstNumber: '',
        panNumber: '',
        udyamNumber: '',
        msmeCategory: ''
    });

    // ── Services ──
    const [services, setServices] = useState([]);
    const [serviceInput, setServiceInput] = useState('');

    // ── Industries ──
    const [industries, setIndustries] = useState([]);
    const [industryInput, setIndustryInput] = useState('');

    // ── Specializations ──
    const [specializations, setSpecializations] = useState([]);
    const [specInput, setSpecInput] = useState('');

    // ── Service Areas ──
    const [serviceAreas, setServiceAreas] = useState([{ city: '', district: '', state: 'Madhya Pradesh' }]);

    // ── Products ──
    const [products, setProducts] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '', description: '', category: '', price: '', unit: '', image: null
    });
    const [showProductForm, setShowProductForm] = useState(false);
    const [productSubmitting, setProductSubmitting] = useState(false);

    // ── Errors ──
    const [errors, setErrors] = useState({});

    const businessTypes = [
        { value: 'manufacturer', label: t('pages.create_vendor_service.business_types.manufacturer') },
        { value: 'supplier', label: t('pages.create_vendor_service.business_types.supplier') },
        { value: 'distributor', label: t('pages.create_vendor_service.business_types.distributor') },
        { value: 'service_provider', label: t('pages.create_vendor_service.business_types.service_provider') },
        { value: 'contractor', label: t('pages.create_vendor_service.business_types.contractor') },
        { value: 'consultant', label: t('pages.create_vendor_service.business_types.consultant') },
        { value: 'trader', label: t('pages.create_vendor_service.business_types.trader') },
        { value: 'exporter', label: t('pages.create_vendor_service.business_types.exporter') },
        { value: 'importer', label: t('pages.create_vendor_service.business_types.importer') },
        { value: 'other', label: t('pages.create_vendor_service.business_types.other') },
    ];

    const availableIndustries = [
        'IT/Software', 'Manufacturing', 'Healthcare', 'Education',
        'Construction', 'Retail', 'Hospitality', 'Agriculture',
        'Automotive', 'Textile', 'Banking', 'E-commerce'
    ];

    const getIndustryLabel = (industry) => {
        const industryMap = {
            'IT/Software': t('pages.create_vendor_service.industries.it_software'),
            'Manufacturing': t('pages.create_vendor_service.industries.manufacturing'),
            'Healthcare': t('pages.create_vendor_service.industries.healthcare'),
            'Education': t('pages.create_vendor_service.industries.education'),
            'Construction': t('pages.create_vendor_service.industries.construction'),
            'Retail': t('pages.create_vendor_service.industries.retail'),
            'Hospitality': t('pages.create_vendor_service.industries.hospitality'),
            'Agriculture': t('pages.create_vendor_service.industries.agriculture'),
            'Automotive': t('pages.create_vendor_service.industries.automotive'),
            'Textile': t('pages.create_vendor_service.industries.textile'),
            'Banking': t('pages.create_vendor_service.industries.banking'),
            'E-commerce': t('pages.create_vendor_service.industries.ecommerce')
        };
        return industryMap[industry] || industry;
    };

    // ── Fetch existing profile ──
    useEffect(() => {
        fetchVendorProfile();
    }, []);

    const fetchVendorProfile = async () => {
        try {
            const res = await vendorAPI.getProfile();
            const vendor = res.data.data;

            if (vendor && vendor.businessName) {
                setIsEditMode(true);
                setFormData({
                    businessName: vendor.businessName || '',
                    businessType: vendor.businessType || '',
                    businessDescription: vendor.businessDescription || '',
                    establishedYear: vendor.establishedYear || '',
                    annualTurnover: vendor.annualTurnover || '',
                    employeeCount: vendor.employeeCount || '',
                    isNationwide: vendor.isNationwide || false,
                    website: vendor.website || '',
                    gstNumber: vendor.registrationDetails?.gstNumber || '',
                    panNumber: vendor.registrationDetails?.panNumber || '',
                    udyamNumber: vendor.registrationDetails?.udyamNumber || '',
                    msmeCategory: vendor.registrationDetails?.msmeCategory || ''
                });
                setServices(vendor.services || []);
                setIndustries(vendor.industries || []);
                setSpecializations(vendor.specializations || []);
                setServiceAreas(vendor.serviceAreas?.length > 0
                    ? vendor.serviceAreas
                    : [{ city: '', district: '', state: 'Madhya Pradesh' }]);
                setProducts(vendor.products || []);
            }
        } catch (err) {
            // 404 means no profile yet — that's fine
            if (err.response?.status !== 404) {
                console.error('Fetch vendor profile error:', err);
            }
        }
    };

    // ── Handlers ──
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Tag handlers
    const addTag = (list, setList, input, setInput) => {
        const val = input.trim();
        if (val && !list.includes(val)) {
            setList([...list, val]);
            setInput('');
        }
    };

    const removeTag = (list, setList, item) => {
        setList(list.filter(i => i !== item));
    };

    const handleTagKeyDown = (e, list, setList, input, setInput) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(list, setList, input, setInput);
        }
    };

    // Service Areas
    const addServiceArea = () => {
        setServiceAreas([...serviceAreas, { city: '', district: '', state: 'Madhya Pradesh' }]);
    };

    const updateServiceArea = (index, field, value) => {
        const updated = [...serviceAreas];
        updated[index][field] = value;
        setServiceAreas(updated);
    };

    const removeServiceArea = (index) => {
        if (serviceAreas.length > 1) {
            setServiceAreas(serviceAreas.filter((_, i) => i !== index));
        }
    };

    // ── Build Payload ──
    const buildPayload = () => ({
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessDescription: formData.businessDescription,
        establishedYear: Number(formData.establishedYear) || undefined,
        services,
        industries,
        specializations,
        annualTurnover: formData.annualTurnover,
        employeeCount: formData.employeeCount,
        serviceAreas: serviceAreas.filter(a => a.city.trim()),
        isNationwide: formData.isNationwide,
        registrationDetails: {
            gstNumber: formData.gstNumber,
            panNumber: formData.panNumber,
            udyamNumber: formData.udyamNumber,
            msmeCategory: formData.msmeCategory
        },
                website: formData.website
    });

    // ── Validation ──
    const validate = () => {
        const newErrors = {};
        if (!formData.businessName.trim()) newErrors.businessName = t('pages.create_vendor_service.errors.business_name_required');
        if (!formData.businessType) newErrors.businessType = t('pages.create_vendor_service.errors.business_type_required');
        if (!formData.businessDescription.trim()) newErrors.businessDescription = t('pages.create_vendor_service.errors.description_required');
        if (services.length === 0) newErrors.services = t('pages.create_vendor_service.errors.services_required');
        if (serviceAreas.every(a => !a.city.trim())) newErrors.serviceAreas = t('pages.create_vendor_service.errors.service_areas_required');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Submit Profile ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess(false);

        if (!validate()) {
            const firstError = document.querySelector('.border-red-500');
            if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = buildPayload();
            await vendorAPI.updateProfile(payload);

            setSubmitSuccess(true);
            setIsEditMode(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Vendor profile error:', err);
            setSubmitError(err.response?.data?.message || t('pages.create_vendor_service.save_failed'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Add Product ──
    const handleAddProduct = async () => {
        if (!newProduct.name.trim()) return;

        setProductSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('name', newProduct.name);
            fd.append('description', newProduct.description);
            fd.append('category', newProduct.category);
            fd.append('price', newProduct.price);
            fd.append('unit', newProduct.unit);
            if (newProduct.image) {
                fd.append('avatar', newProduct.image);
            }

            const res = await vendorAPI.addProduct(fd);
            setProducts(res.data.data || []);
            setNewProduct({ name: '', description: '', category: '', price: '', unit: '', image: null });
            setShowProductForm(false);
        } catch (err) {
            console.error('Add product error:', err);
            setSubmitError(err.response?.data?.message || t('pages.create_vendor_service.add_product_failed'));
        } finally {
            setProductSubmitting(false);
        }
    };

    // ── Delete Product ──
    const handleDeleteProduct = async (productId) => {
        try {
            await vendorAPI.deleteProduct(productId);
            setProducts(prev => prev.filter(p => p._id !== productId));
        } catch (err) {
            console.error('Delete product error:', err);
            setSubmitError(err.response?.data?.message || t('pages.create_vendor_service.delete_product_failed'));
        }
    };

    // ── Tag Chips Component ──
    const TagSection = ({ label, required, list, setList, input, setInput, placeholder, error }) => (
        <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => handleTagKeyDown(e, list, setList, input, setInput)}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm mb-2 ${error ? 'border-red-500' : 'border-gray-300'}`} />
            {error && (
                <p className="text-red-500 text-xs mb-2 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>
            )}
            <div className="flex flex-wrap gap-2">
                {list.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-[#233480] text-white text-xs font-medium rounded-full">
                        {item}
                        <button type="button" onClick={() => removeTag(list, setList, item)}><X size={12} /></button>
                    </span>
                ))}
            </div>
        </div>
    );

    // ── Industry Toggle ──
    const IndustrySelector = () => (
        <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">{t('pages.create_vendor_service.fields.industries_served')}</label>
            <div className="flex flex-wrap gap-2">
                {availableIndustries.map(ind => (
                    <button key={ind} type="button"
                        onClick={() => {
                            if (industries.includes(ind)) {
                                setIndustries(industries.filter(i => i !== ind));
                            } else {
                                setIndustries([...industries, ind]);
                            }
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all border ${industries.includes(ind)
                            ? 'bg-green-100 text-green-600 border-green-200'
                            : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                        {industries.includes(ind) && <Check size={12} />}
                        {getIndustryLabel(ind)}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Banner */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-wider text-center px-4">
                    {isEditMode ? t('pages.create_vendor_service.title_edit') : t('pages.create_vendor_service.title_create')}
                </h1>
            </div>

            <div className="max-w-5xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20 flex-1">
                <div className="bg-white border-b-4 border-[#233480] shadow-lg p-6 md:p-8">

                    {/* Success */}
                    {submitSuccess && (
                        <div className="mb-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                            <Check size={18} /> {t('pages.create_vendor_service.save_success')}
                        </div>
                    )}

                    {/* Error */}
                    {submitError && (
                        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded flex justify-between items-center">
                            <span>{submitError}</span>
                            <button onClick={() => setSubmitError('')}><X size={16} /></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* ═══ SECTION 1: Business Info ═══ */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-5">
                                <h3 className="text-lg font-semibold text-[#1e2a5a]">{t('pages.create_vendor_service.sections.business_info')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">
                                        {t('pages.create_vendor_service.fields.business_name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="businessName" placeholder={t('pages.create_vendor_service.placeholders.business_name')}
                                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm ${errors.businessName ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.businessName} onChange={handleChange} />
                                    {errors.businessName && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.businessName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">
                                        {t('pages.create_vendor_service.fields.business_type')} <span className="text-red-500">*</span>
                                    </label>
                                    <select name="businessType"
                                        className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm ${errors.businessType ? 'border-red-500' : 'border-gray-300'}`}
                                        value={formData.businessType} onChange={handleChange}>
                                        <option value="">{t('pages.create_vendor_service.placeholders.select_type')}</option>
                                        {businessTypes.map(bt => (
                                            <option key={bt.value} value={bt.value}>{bt.label}</option>
                                        ))}
                                    </select>
                                    {errors.businessType && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.businessType}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-600 mb-1">
                                    {t('pages.create_vendor_service.fields.business_description')} <span className="text-red-500">*</span>
                                </label>
                                <textarea name="businessDescription" rows="4" placeholder={t('pages.create_vendor_service.placeholders.business_description')}
                                    className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm resize-none ${errors.businessDescription ? 'border-red-500' : 'border-gray-300'}`}
                                    value={formData.businessDescription} onChange={handleChange} />
                                {errors.businessDescription && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.businessDescription}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.established_year')}</label>
                                    <input type="number" name="establishedYear" placeholder={t('pages.create_vendor_service.placeholders.established_year')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                        value={formData.establishedYear} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.annual_turnover')}</label>
                                    <select name="annualTurnover"
                                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                        value={formData.annualTurnover} onChange={handleChange}>
                                        <option value="">{t('pages.create_vendor_service.placeholders.select')}</option>
                                        <option value="Upto 10 Lakhs">{t('pages.create_vendor_service.turnover.upto_10_lakhs')}</option>
                                        <option value="10-50 Lakhs">{t('pages.create_vendor_service.turnover.10_50_lakhs')}</option>
                                        <option value="50 Lakhs - 1 Crore">{t('pages.create_vendor_service.turnover.50_lakhs_1_crore')}</option>
                                        <option value="1-5 Crore">{t('pages.create_vendor_service.turnover.1_5_crore')}</option>
                                        <option value="5+ Crore">{t('pages.create_vendor_service.turnover.5_plus_crore')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.employee_count')}</label>
                                    <select name="employeeCount"
                                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                        value={formData.employeeCount} onChange={handleChange}>
                                        <option value="">{t('pages.create_vendor_service.placeholders.select')}</option>
                                        <option value="1-10">1-10</option>
                                        <option value="11-50">11-50</option>
                                        <option value="51-200">51-200</option>
                                        <option value="201-500">201-500</option>
                                        <option value="500+">500+</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ═══ SECTION 2: Services & Industries ═══ */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-5">
                                <h3 className="text-lg font-semibold text-[#1e2a5a]">{t('pages.create_vendor_service.sections.services_industries')}</h3>
                            </div>

                            <div className="space-y-5">
                                <TagSection
                                    label={t('pages.create_vendor_service.fields.services_offered')} required
                                    list={services} setList={setServices}
                                    input={serviceInput} setInput={setServiceInput}
                                    placeholder={t('pages.create_vendor_service.placeholders.services')}
                                    error={errors.services}
                                />

                                <IndustrySelector />

                                <TagSection
                                    label={t('pages.create_vendor_service.fields.specializations')}
                                    list={specializations} setList={setSpecializations}
                                    input={specInput} setInput={setSpecInput}
                                    placeholder={t('pages.create_vendor_service.placeholders.specializations')}
                                />
                            </div>
                        </div>

                        {/* ═══ SECTION 3: Service Areas ═══ */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#1e2a5a]">{t('pages.create_vendor_service.sections.service_areas')}</h3>
                                <button type="button" onClick={addServiceArea}
                                    className="flex items-center gap-1 text-sm text-[#233480] font-semibold hover:underline">
                                    <Plus size={16} /> {t('pages.create_vendor_service.actions.add_area')}
                                </button>
                            </div>

                            {errors.serviceAreas && (
                                <p className="text-red-500 text-xs mb-3 flex items-center gap-1"><AlertCircle size={12} /> {errors.serviceAreas}</p>
                            )}

                            <div className="space-y-3">
                                {serviceAreas.map((area, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center border border-gray-200 rounded-lg p-3 bg-gray-50 relative">
                                        {serviceAreas.length > 1 && (
                                            <button type="button" onClick={() => removeServiceArea(index)}
                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                                                <X size={14} />
                                            </button>
                                        )}
                                        <input type="text" placeholder={t('pages.create_vendor_service.placeholders.city') + ' *'}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480]"
                                            value={area.city} onChange={(e) => updateServiceArea(index, 'city', e.target.value)} />
                                        <input type="text" placeholder={t('pages.create_vendor_service.placeholders.district')}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480]"
                                            value={area.district} onChange={(e) => updateServiceArea(index, 'district', e.target.value)} />
                                        <input type="text" placeholder={t('pages.create_vendor_service.placeholders.state')}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480]"
                                            value={area.state} onChange={(e) => updateServiceArea(index, 'state', e.target.value)} />
                                    </div>
                                ))}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer mt-3">
                                <input type="checkbox" name="isNationwide" checked={formData.isNationwide} onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 text-[#233480] focus:ring-[#233480]" />
                                <span className="text-sm font-medium text-gray-700">{t('pages.create_vendor_service.fields.nationwide')}</span>
                            </label>
                        </div>

                        {/* ═══ SECTION 4: Registration Details ═══ */}
                        <div>
                            <div className="border-l-4 border-[#233480] pl-3 mb-5">
                                <h3 className="text-lg font-semibold text-[#1e2a5a]">{t('pages.create_vendor_service.sections.registration_details')}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.gst_number')}</label>
                                    <input type="text" name="gstNumber" placeholder={t('pages.create_vendor_service.placeholders.gst_number')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                        value={formData.gstNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.pan_number')}</label>
                                    <input type="text" name="panNumber" placeholder={t('pages.create_vendor_service.placeholders.pan_number')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                        value={formData.panNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.udyam_number')}</label>
                                    <input type="text" name="udyamNumber" placeholder={t('pages.create_vendor_service.placeholders.udyam_number')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                        value={formData.udyamNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.msme_category')}</label>
                                    <select name="msmeCategory"
                                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                        value={formData.msmeCategory} onChange={handleChange}>
                                        <option value="">{t('pages.create_vendor_service.placeholders.select')}</option>
                                        <option value="micro">{t('pages.create_vendor_service.msme.micro')}</option>
                                        <option value="small">{t('pages.create_vendor_service.msme.small')}</option>
                                        <option value="medium">{t('pages.create_vendor_service.msme.medium')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-bold text-gray-600 mb-1">{t('pages.create_vendor_service.fields.website')}</label>
                                <input type="url" name="website" placeholder={t('pages.create_vendor_service.placeholders.website')}
                                    className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-[#233480] bg-gray-50 text-sm"
                                    value={formData.website} onChange={handleChange} />
                            </div>
                        </div>

                        {/* ═══ Save Profile Button ═══ */}
                        <div className="flex justify-center pt-2">
                            <button type="submit" disabled={submitting}
                                className={`px-10 py-3 bg-[#233480] text-white font-bold rounded hover:bg-[#1a2660] transition-all text-sm uppercase tracking-wide shadow-md ${submitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> {t('pages.create_vendor_service.actions.saving')}
                                    </span>
                                ) : isEditMode ? t('pages.create_vendor_service.actions.update_profile') : t('pages.create_vendor_service.actions.create_profile')}
                            </button>
                        </div>
                    </form>

                    {/* ═══ SECTION 5: Products / Services Listing ═══ */}
                    {isEditMode && (
                        <div className="mt-10 border-t pt-8">
                            <div className="border-l-4 border-[#233480] pl-3 mb-5 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-[#1e2a5a]">{t('pages.create_vendor_service.sections.products_services')}</h3>
                                <button type="button" onClick={() => setShowProductForm(!showProductForm)}
                                    className="flex items-center gap-1 text-sm text-[#233480] font-semibold hover:underline">
                                    <Plus size={16} /> {t('pages.create_vendor_service.actions.add_product')}
                                </button>
                            </div>

                            {/* Add Product Form */}
                            {showProductForm && (
                                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 mb-5">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">{t('pages.create_vendor_service.products.new_product')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input type="text" placeholder={t('pages.create_vendor_service.products.placeholders.name')}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480]"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))} />
                                        <input type="text" placeholder={t('pages.create_vendor_service.products.placeholders.category')}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480]"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))} />
                                        <input type="number" placeholder={t('pages.create_vendor_service.products.placeholders.price')}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480]"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))} />
                                        <input type="text" placeholder={t('pages.create_vendor_service.products.placeholders.unit')}
                                            className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480]"
                                            value={newProduct.unit}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))} />
                                    </div>
                                    <textarea placeholder={t('pages.create_vendor_service.products.placeholders.description')} rows="3"
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#233480] resize-none mb-4"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))} />

                                    <div className="mb-4">
                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <Upload size={14} />
                                            <span>{t('pages.create_vendor_service.products.image_label')}</span>
                                            <input type="file" accept="image/*" className="hidden"
                                                onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.files[0] }))} />
                                        </label>
                                        {newProduct.image && (
                                            <span className="text-xs text-green-600 ml-6">{newProduct.image.name}</span>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button type="button" onClick={handleAddProduct} disabled={productSubmitting || !newProduct.name.trim()}
                                            className={`px-6 py-2 bg-[#233480] text-white text-sm font-bold rounded hover:bg-[#1a2660] transition-all ${productSubmitting || !newProduct.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {productSubmitting ? (
                                                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {t('pages.create_vendor_service.products.adding')}</span>
                                            ) : t('pages.create_vendor_service.products.add_product')}
                                        </button>
                                        <button type="button" onClick={() => { setShowProductForm(false); setNewProduct({ name: '', description: '', category: '', price: '', unit: '', image: null }); }}
                                            className="px-6 py-2 border border-gray-300 text-gray-600 text-sm font-bold rounded hover:bg-gray-50">
                                            {t('pages.create_vendor_service.actions.cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Products List */}
                            {products.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    {t('pages.create_vendor_service.products.empty_state')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {products.map((product) => (
                                        <div key={product._id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                                            <div className="flex items-center gap-4 flex-1">
                                                {product.image?.url ? (
                                                    <img src={product.image.url} alt="" className="w-14 h-14 rounded-lg object-cover border" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <Upload size={20} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#1e2a5a]">{product.name}</h4>
                                                    <p className="text-xs text-gray-500">{product.category}</p>
                                                    {product.price > 0 && (
                                                        <p className="text-xs font-semibold text-green-600">
                                                            ₹{Number(product.price).toLocaleString()} {product.unit && `/ ${product.unit}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CreateVendorService;