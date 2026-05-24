// src/page/VendorDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    User, Briefcase, Mail, Phone, ChevronRight, Loader2,
    AlertCircle, Package, Tag, IndianRupee, Star, Send,
    X, CheckCircle, MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../dashboard/context/AuthContext';
import Footer from '../component/Footer';
import { vendorAPI, institutionsAPI, serviceRequestAPI } from '../services/api';

// ─── ENQUIRY MODAL ───
const EnquiryModal = ({ isOpen, onClose, service, vendorName, products = [], onSubmit, loading }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState({ message: '', budget: '', timeline: '' });
    const [selectedServiceId, setSelectedServiceId] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm({ message: '', budget: '', timeline: '' });
            setSelectedServiceId(service?._id || '');
        }
    }, [isOpen, service]);

    if (!isOpen) return null;

    const selectedProduct = products.find(p => p._id === selectedServiceId) || service;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b">
                    <div>
                        <h3 className="text-lg font-bold text-[#1e2a5a]">{t('pages.vendor_details.send_enquiry')}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {t('pages.vendor_details.to')} {vendorName}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!form.message.trim()) return;
                    if (!selectedServiceId) {
                        alert(t('pages.vendor_details.select_service_alert'));
                        return;
                    }
                    onSubmit({
                        ...form,
                        serviceId: selectedServiceId,
                        serviceName: selectedProduct?.name || 'Service'
                    });
                }} className="p-5 space-y-4">

                    {/* Service Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t('pages.vendor_details.interested_in')} <span className="text-red-500">*</span>
                        </label>
                        {service ? (
                            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3 border border-blue-100">
                                <Package size={18} className="text-[#233480]" />
                                <div>
                                    <p className="text-sm font-bold text-[#1e2a5a]">{service.name}</p>
                                    {service.price > 0 && (
                                        <p className="text-xs text-green-600 font-medium">
                                            ₹{Number(service.price).toLocaleString()}
                                            {service.unit && ` / ${service.unit}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <select
                                value={selectedServiceId}
                                onChange={(e) => setSelectedServiceId(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-[#233480] bg-white"
                            >
                                <option value="">{t('pages.vendor_details.select_service')}</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t('pages.vendor_details.your_requirement')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.message}
                            onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                            rows={4} required
                            placeholder={t('pages.vendor_details.requirement_placeholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-[#233480] resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {t('pages.vendor_details.budget')}
                            </label>
                            <input type="number" value={form.budget}
                                onChange={(e) => setForm(p => ({ ...p, budget: e.target.value }))}
                                placeholder="e.g. 50000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-[#233480]" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {t('pages.vendor_details.timeline')}
                            </label>
                            <select value={form.timeline}
                                onChange={(e) => setForm(p => ({ ...p, timeline: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-[#233480] bg-white">
                                <option value="">{t('pages.vendor_details.select')}</option>
                                <option value="Urgent (1-3 days)">{t('pages.vendor_details.timeline_urgent')}</option>
                                <option value="Within 1 Week">{t('pages.vendor_details.timeline_1week')}</option>
                                <option value="Within 2 Weeks">{t('pages.vendor_details.timeline_2weeks')}</option>
                                <option value="Within 1 Month">{t('pages.vendor_details.timeline_1month')}</option>
                                <option value="Flexible">{t('pages.vendor_details.timeline_flexible')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm 
                                       font-semibold text-gray-600 hover:bg-gray-50">
                            {t('pages.vendor_details.cancel')}
                        </button>
                        <button type="submit" disabled={loading || !form.message.trim() || (!service && !selectedServiceId)}
                            className="flex-1 px-4 py-2.5 bg-[#233480] text-white rounded-md text-sm 
                                       font-semibold hover:bg-[#1a2660] disabled:opacity-50 
                                       flex items-center justify-center gap-2">
                            {loading
                                ? <><Loader2 size={14} className="animate-spin" /> {t('pages.vendor_details.sending')}</>
                                : <><Send size={14} /> {t('pages.vendor_details.send_enquiry')}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── REVIEW MODAL ───
const ReviewModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');

    useEffect(() => {
        if (isOpen) { setRating(0); setHover(0); setReview(''); }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-lg font-bold text-[#1e2a5a]">{t('pages.vendor_details.write_review')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!rating) return;
                    onSubmit({ rating, review });
                }} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('pages.vendor_details.rating')} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button key={n} type="button"
                                    onClick={() => setRating(n)}
                                    onMouseEnter={() => setHover(n)}
                                    onMouseLeave={() => setHover(0)}>
                                    <Star size={28} className={`transition-colors ${n <= (hover || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                        }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t('pages.vendor_details.your_review')}
                        </label>
                        <textarea value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={3} placeholder={t('pages.vendor_details.review_placeholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-[#233480] resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm 
                                       font-semibold text-gray-600 hover:bg-gray-50">{t('pages.vendor_details.cancel')}</button>
                        <button type="submit" disabled={loading || !rating}
                            className="flex-1 px-4 py-2.5 bg-[#233480] text-white rounded-md text-sm 
                                       font-semibold hover:bg-[#1a2660] disabled:opacity-50 
                                       flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                            {loading ? t('pages.vendor_details.submitting') : t('pages.vendor_details.submit_review')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════
//  MAIN VENDOR DETAILS COMPONENT
// ═══════════════════════════════════════
const VendorDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [enquiryModal, setEnquiryModal] = useState({ open: false, service: null });
    const [reviewModal, setReviewModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const fromOrg = location.state?.fromOrg || false;
    const fromTraining = location.state?.fromTraining || false;
    const showSkillsAndSpec = fromOrg || fromTraining;
    const showViewAllJobs = fromOrg && !fromTraining;
    const defaultImage = 'https://utkarshujjain.com/assets/img/default-logo.png';

    useEffect(() => {
        if (id) fetchVendorDetails();
    }, [id]);

    const fetchVendorDetails = async () => {
        try {
            setLoading(true);
            setError('');

            // GET /vendors/:id
            const res = await vendorAPI.getById(id);

            if (res.data.success || res.data.status === 'success') {
                const data = res.data.data?.vendor || res.data.data;
                const institution = typeof data.institution === 'object' ? data.institution : null;
                const institutionId = institution?._id || data.institution;
                const contactPerson = institution?.contactPerson || {};
                const address = institution?.address || {};

                // Logo
                let logo = defaultImage;
                if (data.logo?.url) {
                    logo = data.logo.url;
                } else if (institution?.logo?.url) {
                    logo = institution.logo.url;
                } else if (institutionId && typeof institutionId === 'string') {
                    try {
                        const instRes = await institutionsAPI.getById(institutionId);
                        const instData = instRes.data.data?.institution || instRes.data.data;
                        if (instData?.logo?.url) logo = instData.logo.url;
                    } catch (e) { /* ignore */ }
                }

                let fullAddress = t('pages.vendor_details.default_address');
                if (address.city) {
                    fullAddress = [address.street, address.city, address.state || 'MP', address.pincode]
                        .filter(Boolean).join(', ');
                }

                let services = data.services?.length > 0
                    ? data.services.join(', ')
                    : data.businessType
                        ? data.businessType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                        : t('pages.vendor_details.default_services');

                let skillsAndSpecialization = data.specializations?.length > 0
                    ? data.specializations.join(', ')
                    : data.services?.length > 0
                        ? data.services.join(', ')
                        : t('pages.vendor_details.not_available_short');

                setVendor({
                    id: data._id,
                    name: data.businessName || institution?.organizationName || t('pages.vendor_details.default_vendor_name'),
                    manager: contactPerson.name || t('pages.vendor_details.default_manager'),
                    designation: contactPerson.designation || t('pages.vendor_details.default_staff'),
                    email: contactPerson.email || t('pages.vendor_details.not_available_short'),
                    phone: contactPerson.phone || t('pages.vendor_details.not_available_short'),
                    logo,
                    description: data.businessDescription || t('pages.vendor_details.no_description'),
                    services,
                    skillsAndSpecialization,
                    industries: data.industries?.join(', ') || t('pages.vendor_details.default_industry'),
                    address: fullAddress,
                    website: data.website || t('pages.vendor_details.not_available_short'),
                    isVerified: data.isVerified,
                    businessType: data.businessType,
                    serviceAreas: data.serviceAreas || [],
                    averageRating: data.averageRating || data.rating?.average || 0,
                    totalReviews: data.totalReviews || data.rating?.count || 0
                });

                setProducts(data.products || []);
                setReviews(data.reviews || []);
            } else {
                setError(t('pages.vendor_details.load_failed'));
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError(t('pages.vendor_details.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    // ── Enquiry → serviceRequestAPI (Real Backend) ──
    const handleEnquirySubmit = async (enquiryData) => {
        setSubmitting(true);
        try {
            await serviceRequestAPI.create({
                vendorId: vendor.id,
                serviceId: enquiryData.serviceId,
                serviceName: enquiryData.serviceName,
                message: enquiryData.message,
                budget: enquiryData.budget,
                timeline: enquiryData.timeline
            });

            setEnquiryModal({ open: false, service: null });
            setSuccessMsg(t('pages.vendor_details.enquiry_success'));
            setTimeout(() => {
                setSuccessMsg('');
                navigate('/my-enquiries');
            }, 1500);
        } catch (err) {
            console.error('Enquiry error:', err);
            alert(err.response?.data?.message || t('pages.vendor_details.enquiry_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Review → POST /vendors/:id/reviews ──
    const handleReviewSubmit = async (reviewData) => {
        setSubmitting(true);
        try {
            await vendorAPI.addReview(id, reviewData);
            setReviewModal(false);
            setSuccessMsg(t('pages.vendor_details.review_success'));
            setTimeout(() => setSuccessMsg(''), 4000);
            fetchVendorDetails();
        } catch (err) {
            setError(err.response?.data?.message || t('pages.vendor_details.review_failed'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={48} className="text-[#233480] animate-spin" />
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {error || t('pages.vendor_details.not_found')}
                    </h2>
                    <button onClick={() => navigate(-1)}
                        className="bg-[#233480] text-white px-6 py-2 rounded font-semibold">
                        {t('pages.vendor_details.go_back')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">
            <EnquiryModal isOpen={enquiryModal.open}
                onClose={() => setEnquiryModal({ open: false, service: null })}
                service={enquiryModal.service} vendorName={vendor.name}
                products={products}
                onSubmit={handleEnquirySubmit} loading={submitting} />

            <ReviewModal isOpen={reviewModal}
                onClose={() => setReviewModal(false)}
                onSubmit={handleReviewSubmit} loading={submitting} />

            {/* Banner + Logo */}
            <div className="relative w-full h-[130px] bg-cover bg-center"
                style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30">
                    <div className="w-32 h-32 md:w-36 md:h-36 bg-white border border-gray-100 
                                    shadow-lg flex items-center justify-center p-3 rounded-sm">
                        <img src={vendor.logo} alt={vendor.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => e.target.src = defaultImage} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 pt-20 md:pt-28 pb-20 relative z-20 
                            md:-mt-35 -mt-28">

                {/* Success */}
                {successMsg && (
                    <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 
                                    rounded-lg mb-4 flex items-center gap-2 text-sm">
                        <CheckCircle size={18} />
                        <span className="flex-1">{successMsg}</span>
                        <button onClick={() => setSuccessMsg('')}><X size={16} /></button>
                    </div>
                )}

                <div className="bg-white border-b border-[#233480] shadow-xl overflow-hidden rounded">

                    {/* Header Section */}
                    <div className="p-6 md:px-12 border-b border-gray-100 md:pt-25 pt-28">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h2 className="text-lg md:text-[23px] font-bold text-[#44528c] mb-1">
                                    {vendor.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    {vendor.isVerified && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 
                                                       rounded-full text-xs font-bold">✓ {t('pages.vendor_details.verified')}</span>
                                    )}
                                    {vendor.businessType && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 
                                                       rounded-full text-xs font-bold">
                                            {vendor.businessType.split('_')
                                                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                                .join(' ')}
                                        </span>
                                    )}
                                    {vendor.averageRating > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-gray-600">
                                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                                            {vendor.averageRating.toFixed(1)}
                                            <span className="text-gray-400">
                                                ({vendor.totalReviews})
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => {
                                    if (!user) return navigate('/login/candidate');
                                    setEnquiryModal({ open: true, service: null });
                                }} className="px-5 py-2 bg-[#233480] text-white text-sm font-semibold 
                                               rounded hover:bg-[#1a2660] flex items-center gap-2">
                                    <Send size={14} /> {t('pages.vendor_details.send_enquiry')}
                                </button>
                                {user && (
                                    <button onClick={() => setReviewModal(true)}
                                        className="px-5 py-2 border-2 border-[#233480] text-[#233480] 
                                                   text-sm font-semibold rounded hover:bg-blue-50 
                                                   flex items-center gap-2">
                                        <Star size={14} /> {t('pages.vendor_details.write_review_btn')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Contact Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 mt-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-4">
                                    <User size={18} className="text-green-600 shrink-0" />
                                    <span className="text-gray-500 font-medium">{vendor.manager}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail size={18} className="text-green-600 shrink-0" />
                                    <span className="text-gray-500 font-medium">{vendor.email}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-4">
                                    <Briefcase size={18} className="text-green-600 shrink-0" />
                                    <span className="text-gray-500 font-medium">{vendor.designation}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone size={18} className="text-green-600 shrink-0" />
                                    <span className="text-gray-500 font-medium">{vendor.phone}</span>
                                </div>
                            </div>
                        </div>

                        {showViewAllJobs && (
                            <div className="border-t border-gray-100 pt-4">
                                <button onClick={() => navigate(`/company-jobs/${id}`)}
                                    className="bg-[#233480] text-white px-8 py-2 font-semibold 
                                               hover:bg-[#1a2660] rounded shadow-md text-sm">
                                    {t('pages.vendor_details.view_all_jobs')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Body Section */}
                    <div className="p-6 md:p-12 space-y-6">

                        {/* Description */}
                        <p className="text-gray-600 leading-relaxed text-sm md:text-[15px] text-justify">
                            {vendor.description}
                        </p>

                        {/* Services / Skills */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] 
                                            pl-4 py-2 bg-gray-100">
                                <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                    {showSkillsAndSpec
                                        ? t('pages.vendor_details.skills_spec')
                                        : t('pages.vendor_details.services')}
                                </span>
                            </div>
                            <div className="pl-6 pt-1">
                                <p className="text-gray-600 text-sm md:text-[15px]">
                                    {showSkillsAndSpec
                                        ? vendor.skillsAndSpecialization
                                        : vendor.services}
                                </p>
                            </div>
                        </div>

                        {/* ═══ PRODUCTS & SERVICES ═══ */}
                        {products.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] 
                                                pl-4 py-2 bg-gray-100">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {t('pages.vendor_details.products_services')} ({products.length})
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    {products.map(product => (
                                        <div key={product._id}
                                            className="border border-gray-200 rounded-lg p-4 
                                                       hover:shadow-md hover:border-gray-300 
                                                       transition-all group">
                                            <div className="flex items-start gap-3">
                                                {product.image?.url ? (
                                                    <img src={product.image.url} alt={product.name}
                                                        className="w-16 h-16 rounded-lg object-cover 
                                                                   border flex-shrink-0" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-blue-50 
                                                                    flex items-center justify-center 
                                                                    flex-shrink-0">
                                                        <Package size={24} className="text-[#233480]" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-[#1e2a5a] truncate">
                                                        {product.name}
                                                    </h4>
                                                    {product.category && (
                                                        <span className="inline-flex items-center gap-1 
                                                                       text-[10px] px-2 py-0.5 bg-gray-100 
                                                                       text-gray-500 rounded mt-1">
                                                            <Tag size={10} /> {product.category}
                                                        </span>
                                                    )}
                                                    {product.price > 0 && (
                                                        <p className="text-sm font-semibold text-green-600 
                                                                      mt-1 flex items-center gap-0.5">
                                                            <IndianRupee size={13} />
                                                            {Number(product.price).toLocaleString()}
                                                            {product.unit && (
                                                                <span className="text-gray-400 font-normal 
                                                                               text-xs">
                                                                    / {product.unit}
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}
                                                    {product.description && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Enquiry Button on each product */}
                                            <button
                                                onClick={() => {
                                                    if (!user) return navigate('/login/candidate');
                                                    setEnquiryModal({ open: true, service: product });
                                                }}
                                                className="w-full mt-3 px-3 py-2 bg-[#233480] text-white 
                                                           text-xs font-semibold rounded hover:bg-[#1a2660] 
                                                           flex items-center justify-center gap-1.5 
                                                           opacity-0 group-hover:opacity-100 
                                                           transition-opacity"
                                            >
                                                <Send size={12} /> {t('pages.vendor_details.send_enquiry_service')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ═══ CONTACT DETAILS ═══ */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] 
                                            pl-4 py-2 bg-gray-100">
                                <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                    {t('pages.vendor_details.contact_details')}
                                </span>
                            </div>
                            <div className="pl-6 space-y-4">
                                <div className="flex items-start gap-4 text-sm text-gray-600">
                                    <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                    <p>
                                        <span className="font-medium text-gray-700">
                                            {t('pages.vendor_details.offering_industries')}:
                                        </span> {vendor.industries}
                                    </p>
                                </div>
                                <div className="flex items-start gap-4 text-sm text-gray-600">
                                    <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                    <p>
                                        <span className="font-medium text-gray-700">
                                            {t('pages.vendor_details.office_address')}:
                                        </span> {vendor.address}
                                    </p>
                                </div>
                                <div className="flex items-start gap-4 text-sm text-gray-600">
                                    <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                    <p>
                                        <span className="font-medium text-gray-700">
                                            {t('pages.vendor_details.website')}:
                                        </span> {vendor.website}
                                    </p>
                                </div>
                                {vendor.serviceAreas?.length > 0 && (
                                    <div className="flex items-start gap-4 text-sm text-gray-600">
                                        <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                        <p>
                                            <span className="font-medium text-gray-700">{t('pages.vendor_details.service_areas')}:</span>{' '}
                                            {vendor.serviceAreas.map(a => a.city).filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ═══ REVIEWS ═══ */}
                        {reviews.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] 
                                                pl-4 py-2 bg-gray-100 flex-1">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {t('pages.vendor_details.reviews')} ({reviews.length})
                                    </span>
                                </div>
                                <div className="space-y-3 pt-2">
                                    {reviews.slice(0, 10).map((rev, i) => (
                                        <div key={i} className="border border-gray-100 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <Star key={n} size={14}
                                                            className={n <= rev.rating
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-200'} />
                                                    ))}
                                                </div>
                                                {rev.user?.name && (
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {rev.user.name}
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">
                                                    {rev.createdAt && new Date(rev.createdAt)
                                                        .toLocaleDateString('en-IN', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                </span>
                                            </div>
                                            {rev.review && (
                                                <p className="text-sm text-gray-600">{rev.review}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Write Review CTA */}
                                {user && (
                                    <div className="text-center pt-2">
                                        <button onClick={() => setReviewModal(true)}
                                            className="text-sm text-[#233480] font-semibold hover:underline 
                                                       flex items-center gap-1 mx-auto">
                                            <Star size={14} /> {t('pages.vendor_details.write_a_review')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No Reviews - Show CTA */}
                        {reviews.length === 0 && user && (
                            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Star size={24} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-400 mb-2">{t('pages.vendor_details.no_reviews')}</p>
                                <button onClick={() => setReviewModal(true)}
                                    className="text-sm text-[#233480] font-semibold hover:underline">
                                    {t('pages.vendor_details.be_first_review')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VendorDetails;