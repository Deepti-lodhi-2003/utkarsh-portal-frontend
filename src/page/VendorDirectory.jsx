import React, { useState, useEffect } from 'react';
import { User, Briefcase, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';
import { vendorAPI } from '../services/api';

const defaultImage = 'https://utkarshujjain.com/assets/img/default-logo.png';

const resolveLogo = (vendor) => {
    // 1. Top-level vendor logo (if backend ever adds one)
    if (vendor?.logo?.url) return vendor.logo.url;

    // 2. Institution logo — institution is already a populated object in the response
    if (vendor?.institution?.logo?.url) return vendor.institution.logo.url;

    // 3. Nothing found
    return defaultImage;
};

// ─── Map raw API vendor → display-ready object ────────────────────────────────
const mapVendor = (vendor) => {
    const institution = vendor.institution && typeof vendor.institution === 'object'
        ? vendor.institution
        : null;

    const name = vendor.businessName
        || institution?.organizationName
        || 'Vendor Name';

    const manager = vendor.contactPerson?.name
        || institution?.contactPerson?.name
        || '—';

    const services = Array.isArray(vendor.services) && vendor.services.length > 0
        ? vendor.services.join(', ')
        : vendor.businessType
            ? vendor.businessType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : 'Services';

    const location = vendor.address?.city
        || institution?.address?.city
        || (typeof vendor.serviceAreas?.[0] === 'object'
            ? vendor.serviceAreas[0].city
            : vendor.serviceAreas?.[0])
        || '—';

    const logo = resolveLogo(vendor);

    return { id: vendor._id, name, manager, services, location, logo };
};

// ─── VendorDirectory ──────────────────────────────────────────────────────────

const VendorDirectory = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                setLoading(true);
                setError('');

                const res = await vendorAPI.getAll();

                if (res.data.success || res.data.status === 'success') {
                    const raw = res.data.data?.vendors || res.data.data || [];
                    // mapVendor is synchronous — no more Promise.all / extra API calls
                    setVendors(raw.map(mapVendor));
                } else {
                    setError('Failed to fetch vendors');
                }
            } catch (err) {
                console.error('Fetch vendors error:', err);
                setError('Failed to load vendors');
            } finally {
                setLoading(false);
            }
        };

        fetchVendors();
    }, []);

    // ── Banner shared between loading & loaded states ─────────────────────────
    const Banner = () => (
        <div
            className="relative w-full h-43 flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}
        >
            <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply" />
            <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white tracking-wider text-center px-4 uppercase">
                {t('pages.vendor_directory.title')}
            </h1>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-gray-50 flex flex-col min-h-screen">
                <Banner />
                <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-20 w-full">
                    <div className="bg-white border-b-4 border-[#233480] shadow-xl p-12 flex items-center justify-center">
                        <Loader2 size={48} className="text-[#233480] animate-spin" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">
            <Banner />

            <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-20 w-full">
                <div className="bg-white border-b-4 border-[#233480] shadow-xl p-4 md:p-6 space-y-4">

                    {/* Error state */}
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!error && vendors.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p className="text-lg">No vendors found.</p>
                        </div>
                    )}

                    {/* Vendor cards */}
                    {vendors.map((vendor) => (
                        <div
                            key={vendor.id}
                            className="group flex flex-col md:flex-row items-center justify-between p-5 md:p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg hover:border-l-4 hover:border-l-[#233480] relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8 w-full">
                                {/* Logo */}
                                <div className="w-24 h-24 flex items-center justify-center overflow-hidden shrink-0 p-2 bg-gray-50 rounded border border-gray-100">
                                    <img
                                        src={vendor.logo}
                                        alt={vendor.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            // Prevent infinite error loop if defaultImage also fails
                                            if (e.target.src !== defaultImage) {
                                                e.target.src = defaultImage;
                                            }
                                        }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-1.5 w-full">
                                    <h3 className="text-lg md:text-xl font-semibold text-[#233480] leading-tight group-hover:text-[#1a2660] transition-colors">
                                        {vendor.name}
                                    </h3>
                                    <div className="flex flex-col gap-1 text-[13px] text-gray-500 font-medium">
                                        {vendor.manager !== '—' && (
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-400" />
                                                <span>{vendor.manager}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Briefcase size={16} className="text-gray-400" />
                                            <span className="line-clamp-1">{vendor.services}</span>
                                        </div>
                                        {vendor.location !== '—' && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span>{vendor.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                    <button
                                        onClick={() => navigate(`/vendor-details/${vendor.id}`)}
                                        className="w-full md:px-8 py-2.5 font-bold text-sm bg-[#233480] text-white rounded hover:bg-[#1a2660] transition-all shadow-md active:scale-95"
                                    >
                                        {t('pages.vendor_directory.view_details')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VendorDirectory;