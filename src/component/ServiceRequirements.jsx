import React, { useState, useEffect } from 'react';
import { MapPin, Send, Package, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { vendorAPI } from '../services/api';


const ServiceRequirements = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const isHindi = i18n.language === 'hi';
    const defaultImage = 'https://utkarshujjain.com/assets/img/default-logo.png';

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await vendorAPI.getAll();
                console.log('API Response:', res.data);

                if (res.data.success && res.data.data.vendors) {
                    console.log('Vendors fetched:', res.data.data.vendors);
                    setVendors(res.data.data.vendors);
                }
            } catch (error) {
                console.error('Failed to fetch vendors:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, [i18n.language, isHindi]);

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#233480] mb-4">
                        {t('home.service_req.title') || 'Service Requirements'}
                    </h2>
                    <Link to="/industry-service" className="inline-flex items-center gap-2 text-[#233480] font-semibold hover:text-[#1a2660] transition-colors">
                        {t('home.service_req.view_all') || 'View All'}
                        <ArrowRight size={18} />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse flex flex-col md:flex-row items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-lg">
                                <div className="w-24 h-20 bg-gray-200 rounded"></div>
                                <div className="flex-1 space-y-2 w-full">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        No services available.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {vendors.flatMap((vendor) => 
                            vendor.products && vendor.products.length > 0 
                                ? vendor.products.map((product, idx) => (
                                    <div key={product._id || `${vendor._id}-${idx}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
                                            {/* Product Image */}
                                            <div className="w-full sm:w-28 sm:h-28 md:w-32 md:h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                                                {product.image?.url ? (
                                                    <img
                                                        src={product.image.url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.src = defaultImage;
                                                            e.target.className = 'w-full h-full object-contain p-4';
                                                        }}
                                                    />
                                                ) : (
                                                    <Package size={40} className="text-gray-400" />
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0 w-full">
                                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#233480] mb-1 line-clamp-2">{product.name}</h3>
                                                {product.description && (
                                                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                                )}
                                                
                                                <div className="flex gap-2 mb-2 flex-wrap">
                                                    {product.category && (
                                                        <span className="bg-blue-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium text-[#233480]">
                                                            {product.category}
                                                        </span>
                                                    )}
                                                    {product.price && product.price > 0 && (
                                                        <span className="bg-green-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-green-600">
                                                            ₹{Number(product.price).toLocaleString()}
                                                            {product.unit ? `/${product.unit}` : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    <p className="font-medium text-gray-700 line-clamp-1">{vendor.businessName}</p>
                                                    <p className="flex items-center gap-1 text-gray-500 line-clamp-1"><MapPin size={12} className="flex-shrink-0" /> {vendor.address?.city || vendor.institution?.address?.city || 'Madhya Pradesh'}</p>
                                                </div>
                                            </div>

                                            {/* Enquiry Button */}
                                            <button
                                                onClick={() => navigate(`/vendor-detail/${vendor._id}?product=${product._id}`)}
                                                className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 font-bold text-xs sm:text-sm bg-[#233480] text-white rounded-lg hover:bg-[#1a2660] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
                                            >
                                                <Send size={14} className="hidden sm:block" />
                                                <Send size={12} className="sm:hidden" />
                                                <span className="hidden sm:inline">{t('pages.vendor_details.send_enquiry') || 'Enquiry'}</span>
                                                <span className="sm:hidden">{t('pages.vendor_details.send_enquiry') || 'Enquiry'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                                : []
                        ).slice(0, 4)}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ServiceRequirements;
