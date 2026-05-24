import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Building2, Briefcase, Info, Key, Loader2, Send, X, Package, CheckCircle } from 'lucide-react';
import Footer from '../component/Footer';
import { jobsAPI, serviceRequestAPI, vendorAPI } from '../services/api';
import { useAuth } from '../dashboard/context/AuthContext';

// ─── ENQUIRY MODAL ───
const EnquiryModal = ({ isOpen, onClose, service, vendorName, products = [], onSubmit, loading }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState({ message: '', budget: '', timeline: '' });
    const [selectedServiceId, setSelectedServiceId] = useState('');

    useEffect(() => {
        if (isOpen) {
            console.log('Modal opened with service:', service);
            setForm({ message: '', budget: '', timeline: '' });
            setSelectedServiceId(service?._id || '');
            console.log('selectedServiceId set to:', service?._id || '');
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
                        <button type="submit" disabled={loading || !form.message.trim() || !selectedServiceId}
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

const IndustryServiceDetails = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const productId = searchParams.get('product');

    const [service, setService] = useState(null);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [enquiryModal, setEnquiryModal] = useState({ open: false, service: null, vendor: null, products: [] });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const isHindi = i18n.language === 'hi';

    // Fetch vendor and product details if productId is present
    useEffect(() => {
        const fetchVendorAndProduct = async () => {
            if (!productId || !id) {
                console.log('Missing productId or id:', { productId, id });
                return;
            }
            
            try {
                setLoading(true);
                const res = await vendorAPI.getById(id);
                console.log('Vendor API Response:', res.data);
                
                if (res.data.success) {
                    const vendorData = res.data.data?.vendor || res.data.data;
                    console.log('Vendor Data:', vendorData);
                    console.log('All Product IDs:', vendorData.products?.map(p => p._id));
                    console.log('Looking for productId:', productId);
                    
                    setVendor(vendorData);
                    
                    // Find the product - case-insensitive comparison
                    const selectedProduct = vendorData.products?.find(p => {
                        console.log('Comparing:', p._id, '===', productId, '→', p._id === productId);
                        return p._id === productId;
                    });
                    
                    console.log('Selected Product Found:', selectedProduct);
                    
                    if (selectedProduct) {
                        const serviceData = {
                            _id: selectedProduct._id,
                            name: selectedProduct.name,
                            description: selectedProduct.description,
                            category: selectedProduct.category,
                            price: selectedProduct.price,
                            unit: selectedProduct.unit,
                            image: selectedProduct.image
                        };
                        console.log('Setting Service:', serviceData);
                        setService(serviceData);

                        // Auto-open enquiry modal with full product data
                        console.log('Opening modal with selectedProduct:', selectedProduct);
                        setEnquiryModal({
                            open: true,
                            service: selectedProduct,
                            vendor: vendorData,
                            products: vendorData.products || []
                        });
                    } else {
                        console.log('Product NOT found in vendor products. Available:', vendorData.products?.map(p => ({ id: p._id, name: p.name })));
                    }
                } else {
                    console.log('Vendor not found');
                }
            } catch (error) {
                console.error('Error fetching vendor details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVendorAndProduct();
    }, [productId, id]);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                setLoading(true);
                const res = await jobsAPI.getById(id);
                if (res.data.status === 'success') {
                    const data = res.data.data.job || res.data.data;

                    const mappedService = {
                        title: data.title || 'Service Title',
                        company: data.institution?.organizationName || data.company?.name || 'Authorized Organization',
                        location: data.location || (data.workLocation ? `${data.workLocation.city}, ${data.workLocation.state}` : 'Ujjain, MP'),
                        description: data.description || 'Detailed information about this service is not available at the moment.',
                        skills: Array.isArray(data.skillsRequired) ? data.skillsRequired.join(', ') : (data.skillsRequired || 'General Industry Skills'),
                        vendorId: data.institution?._id || data.vendor?._id || ''
                    };
                    setService(mappedService);
                }
            } catch (error) {
                console.error('Error fetching service details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id && !productId) {
            fetchServiceDetails();
        }
    }, [id, productId]);

    const handleApply = () => {
        const isLoggedIn = !!localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');

        if (isLoggedIn) {
            if (role === 'institution') {
                navigate('/institution/dashboard');
            } else {
                navigate('/candidate/dashboard');
            }
        } else {
            navigate('/login/institution');
        }
    };

    const handleEnquirySubmit = async (enquiryData) => {
        setSubmitting(true);
        try {
            const res = await serviceRequestAPI.create({
                vendorId: vendor?._id,
                serviceId: enquiryData.serviceId,
                serviceName: enquiryData.serviceName,
                message: enquiryData.message,
                budget: enquiryData.budget,
                timeline: enquiryData.timeline
            });

            console.log('Enquiry created successfully:', res.data);
            setEnquiryModal({ open: false, service: null, vendor: null, products: [] });
            
            const successMessage = t('pages.vendor_details.enquiry_success') || 'Enquiry sent successfully!';
            console.log('Setting success message:', successMessage);
            setSuccessMsg(successMessage);
            
            setTimeout(() => {
                setSuccessMsg('');
                navigate('/my-enquiries');
            }, 2000);
        } catch (err) {
            console.error('Enquiry error:', err);
            alert(err.response?.data?.message || t('pages.vendor_details.enquiry_failed') || 'Failed to send enquiry.');
        } finally {
            setSubmitting(false);
        }
    };

    const openEnquiryModal = () => {
        setEnquiryModal({
            open: true,
            service: service,
            vendor: vendor,
            products: vendor?.products || []
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-[#233480] animate-spin" />
                    <p className="text-gray-600 font-medium">{t('common.loading') || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    // If product ID is present, show ONLY the enquiry modal
    if (productId) {
        return (
            <div>
                {/* Success Message */}
                {successMsg && (
                    <div className="fixed top-4 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-lg flex items-center gap-3 shadow-2xl animate-pulse border-l-4 border-green-700">
                        <CheckCircle size={24} className="flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-base">{successMsg}</p>
                            <p className="text-xs opacity-90 mt-1">Redirecting to your enquiries...</p>
                        </div>
                    </div>
                )}

                {/* Enquiry Modal Only */}
                {user ? (
                    <EnquiryModal
                        isOpen={enquiryModal.open || true}
                        onClose={() => navigate(-1)}
                        service={enquiryModal.service}
                        vendorName={enquiryModal.vendor?.businessName || enquiryModal.vendor?.name || 'Service Provider'}
                        products={enquiryModal.products}
                        onSubmit={handleEnquirySubmit}
                        loading={submitting}
                    />
                ) : (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between p-5 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-[#233480]">Login Required</h3>
                                <button onClick={() => navigate('/login/candidate')} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 text-center space-y-4">
                                <p className="text-gray-600">Please login to send an enquiry to this vendor.</p>
                                <button
                                    onClick={() => navigate('/login/candidate')}
                                    className="w-full bg-[#233480] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1a2660] transition"
                                >
                                    Login as Candidate
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Regular service details page (without product ID)

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white shadow-xl rounded-lg max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Not Found</h2>
                    <p className="text-gray-600 mb-6 text-sm">The service you are looking for does not exist.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-[#233480] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1a2660] transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">
            {/* Banner */}
            <div className="relative w-full h-43 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-wider text-center px-4">{t('pages.industry_service_details.title')}</h1>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-7 sm:-mt-9 md:-mt-10 relative z-20 mb-20">
                <div className="bg-white border-b-4 border-[#1e2a5a] overflow-hidden">
                    {/* Header Info Bar */}
                    <div className="p-1 md:px-6 md:py-3 border-b border-gray-100">
                        <h2 className="text-base md:text-xl font-semibold text-[#1e2a5a] mb-1">
                            {service.title}
                        </h2>
                        <div className="flex flex-wrap gap-x-8 gap-y-3 text-gray-500 font-medium">
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <Briefcase size={18} className="text-green-500" />
                                <span>{service.company}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <MapPin size={18} className="text-green-500" />
                                <span>{service.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 md:px-8 py-3 bg-gray-50/50 flex flex-wrap gap-4">
                        <button
                            onClick={handleApply}
                            className="bg-[#2c3e50] text-white md:text-sm text-xs px-7 py-2 font-medium hover:bg-[#1a252f] transition-colors shadow-sm"
                        >
                            {t('pages.industry_service_details.apply')}
                        </button>
                        <button
                            onClick={openEnquiryModal}
                            className="bg-[#233480] text-white md:text-sm text-xs px-7 py-2 font-medium hover:bg-[#1a2660] transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Send size={16} />
                            {t('pages.vendor_details.send_enquiry') || 'Send Enquiry'}
                        </button>
                        <button
                            onClick={() => navigate(`/vendor-details/${service.vendorId}`, { state: { fromOrg: true } })}
                            className="bg-[#00bfa5] text-white md:text-sm text-xs px-6 py-2 font-medium hover:bg-[#00897b] transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Building2 size={18} />
                            {t('pages.industry_service_details.org_details')}
                        </button>
                    </div>
                </div>

                {/* Detailed Content */}
                <div className="p-6 md:p-8 space-y-5">
                    {/* Description */}
                    <div>
                        <p className="text-gray-500 leading-relaxed text-xs md:text-base">
                            {service.description}
                        </p>
                    </div>

                    {/* Key Skills Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                            <span className="font-semibold text-gray-600 tracking-wide text-xs md:text-base">{t('pages.industry_service_details.key_skills')}</span>
                        </div>
                        <div className="pl-5 pt-2">
                            <p className="text-gray-500 text-xs md:text-base">
                                {service.skills}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Success Message */}
            {successMsg && (
                <div className="fixed top-4 right-4 z-40 bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg">
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Enquiry Modal */}
            {user ? (
                <EnquiryModal
                    isOpen={enquiryModal.open}
                    onClose={() => setEnquiryModal({ open: false, service: null, vendor: null, products: [] })}
                    service={enquiryModal.service}
                    vendorName={vendor?.businessName || vendor?.name || 'Service Provider'}
                    products={enquiryModal.products}
                    onSubmit={handleEnquirySubmit}
                    loading={submitting}
                />
            ) : (
                <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${enquiryModal.open ? '' : 'hidden'}`}>
                    <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-[#233480]">Login Required</h3>
                            <button onClick={() => setEnquiryModal({ open: false, service: null, vendor: null, products: [] })} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 text-center space-y-4">
                            <p className="text-gray-600">Please login to send an enquiry to this vendor.</p>
                            <button
                                onClick={() => navigate('/login/candidate')}
                                className="w-full bg-[#233480] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1a2660] transition"
                            >
                                Login as Candidate
                            </button>
                            <button
                                onClick={() => setEnquiryModal({ open: false, service: null, vendor: null, products: [] })}
                                className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default IndustryServiceDetails;
