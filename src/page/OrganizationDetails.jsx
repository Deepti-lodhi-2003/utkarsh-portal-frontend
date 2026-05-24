import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, Briefcase, Mail, Phone, ChevronRight, Globe, MapPin, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { institutionsAPI } from '../services/api'; // Adjust path as needed
import Footer from '../component/Footer';

const OrganizationDetails = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check navigation context
    const fromOrg = location.state?.fromOrg || false;
    const fromTraining = location.state?.fromTraining || false;

    // Determine what to show
    const showSkillsAndSpec = fromOrg || fromTraining;
    const showViewAllJobs = fromOrg && !fromTraining;

    useEffect(() => {
        fetchOrganizationDetails();
    }, [id]);

    const fetchOrganizationDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await institutionsAPI.getById(id);

            if (response.data.success) {
                setOrganization(response.data.data.institution);
            }
        } catch (error) {
            console.error('Error fetching organization details:', error);
            setError(error.response?.data?.message || 'Failed to load organization details');
        } finally {
            setLoading(false);
        }
    };

    // Format address from object
    const formatAddress = (address) => {
        if (!address) return t('org_details.address_na');
        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.district && address.district !== address.city) parts.push(address.district);
        if (address.state) parts.push(address.state);
        if (address.pincode) parts.push(address.pincode);
        return parts.join(', ') || t('org_details.address_na');
    };

    // Get contact person details
    const getContactPerson = () => {
        if (organization?.contactPerson) {
            return {
                name: organization.contactPerson.name || 'N/A',
                designation: organization.contactPerson.designation || 'Contact Person',
                email: organization.contactPerson.email || organization.email || 'N/A',
                phone: organization.contactPerson.phone || organization.phone || 'N/A'
            };
        }
        if (organization?.hrContact) {
            return {
                name: organization.hrContact.name || 'N/A',
                designation: organization.hrContact.designation || 'HR Contact',
                email: organization.hrContact.email || organization.email || 'N/A',
                phone: organization.hrContact.phone || organization.phone || 'N/A'
            };
        }
        if (organization?.primaryContact) {
            return {
                name: organization.primaryContact.name || 'N/A',
                designation: organization.primaryContact.designation || 'Primary Contact',
                email: organization.primaryContact.email || organization.email || 'N/A',
                phone: organization.primaryContact.phone || organization.phone || 'N/A'
            };
        }
        return {
            name: organization?.representativeName || organization?.user?.name || 'N/A',
            designation: organization?.representativeDesignation || 'Representative',
            email: organization?.email || 'N/A',
            phone: organization?.phone || 'N/A'
        };
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#233480] mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('org_details.loading')}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !organization) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-red-800 mb-2">{t('org_details.error_title')}</h3>
                        <p className="text-red-600 mb-4">{error || t('org_details.error_not_found')}</p>
                        <button
                            onClick={() => navigate('/organizations')}
                            className="bg-[#233480] text-white px-6 py-2 rounded hover:bg-[#1a2660] transition-colors"
                        >
                            {t('org_details.back_to_orgs')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const contactPerson = getContactPerson();

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen">
            {/* Banner with Logo Overlay */}
            <div className="relative w-full h-[130px] bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply border-b border-gray-100"></div>

                {/* Logo Container */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-30">
                    <div className="w-32 h-32 md:w-36 md:h-36 bg-white border border-gray-100 shadow-lg flex items-center justify-center p-3 rounded-sm">
                        {organization.logo?.url ? (
                            <img
                                src={organization.logo.url}
                                alt={organization.organizationName}
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <Building2 className="text-gray-300" size={64} />
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto w-full px-4 pt-20 md:pt-28 pb-20 relative z-20 md:-mt-35 -mt-28">
                <div className="bg-white border-b border-[#233480] shadow-xl overflow-hidden rounded">

                    {/* Header Info Bar */}
                    <div className="p-6 md:px-12 border-b border-gray-100 md:pt-25 pt-28">
                        <h2 className="text-lg md:text-[23px] font-bold text-[#44528c] mb-2">
                            {organization.organizationName}
                        </h2>

                        {/* Organization Type Badge */}
                        {organization.institutionType && (
                            <div className="mb-4 flex gap-2 flex-wrap">
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                    {organization.institutionType}
                                </span>
                                {organization.isVerified && (
                                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                        {t('org_details.verified')}
                                    </span>
                                )}
                                {organization.isFeatured && (
                                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                        {t('org_details.featured')}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            {/* Left Column */}
                            <div className="space-y-1 flex flex-col justify-start">
                                <div className="flex items-center gap-4">
                                    <User size={18} className="text-green-600 shrink-0" />
                                    <span className='text-gray-500 font-medium'>{contactPerson.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Mail size={18} className="text-green-600 shrink-0" />
                                    <span className='text-gray-500 font-medium'>{contactPerson.email}</span>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-1 flex flex-col justify-start">
                                <div className="flex items-center gap-4">
                                    <Briefcase size={18} className="text-green-600 shrink-0" />
                                    <span className='text-gray-500 font-medium'>{contactPerson.designation}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone size={18} className="text-green-600 shrink-0" />
                                    <span className='text-gray-500 font-medium'>{contactPerson.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* View All Jobs Button - Only when showViewAllJobs is true */}
                        {showViewAllJobs && (
                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex items-center gap-4 mb-4">
                                    {organization.totalJobsPosted > 0 && (
                                        <div className="text-sm">
                                            <span className="font-semibold text-[#233480]">{organization.totalJobsPosted}</span>
                                            <span className="text-gray-600"> {t('org_details.jobs_posted')}</span>
                                        </div>
                                    )}
                                    {organization.totalHires > 0 && (
                                        <div className="text-sm">
                                            <span className="font-semibold text-green-600">{organization.totalHires}</span>
                                            <span className="text-gray-600"> {t('org_details.hires')}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate(`/company-jobs/${id}`)}
                                    className="bg-[#233480] text-white px-8 py-2 font-semibold hover:bg-[#1a2660] transition-colors rounded shadow-md text-sm"
                                >
                                    {t('org_details.view_all_jobs')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Detailed Content */}
                    <div className="p-6 md:p-12 space-y-6">
                        {/* Description */}
                        {organization.description && (
                            <div>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-[15px] font-normal text-justify">
                                    {organization.description}
                                </p>
                            </div>
                        )}

                        {/* Service Section / Skills Section Conditional */}
                        {(organization.services || organization.requiredSkills || organization.offeringIndustries) && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {showSkillsAndSpec ? t('org_details.skills_and_spec') : t('org_details.services_offered')}
                                    </span>
                                </div>
                                <div className="pl-6 pt-1">
                                    {showSkillsAndSpec ? (
                                        // Show skills/specialization
                                        <div className="flex flex-wrap gap-2">
                                            {organization.requiredSkills && organization.requiredSkills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {organization.offeringIndustries && organization.offeringIndustries.map((industry, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                                                >
                                                    {industry}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        // Show services
                                        <div>
                                            {organization.services && organization.services.length > 0 ? (
                                                <p className="text-gray-600 text-sm md:text-[15px] font-normal">
                                                    {Array.isArray(organization.services)
                                                        ? organization.services.join(', ')
                                                        : organization.services
                                                    }
                                                </p>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">{t('org_details.no_services')}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Industry Type / Departments */}
                        {organization.industryType && organization.industryType.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {t('org_details.industry_type')}
                                    </span>
                                </div>
                                <div className="pl-6 pt-1">
                                    <div className="flex flex-wrap gap-2">
                                        {organization.industryType.map((type, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                            >
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products */}
                        {organization.products && organization.products.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {t('org_details.products')}
                                    </span>
                                </div>
                                <div className="pl-6 pt-1">
                                    <div className="flex flex-wrap gap-2">
                                        {organization.products.map((product, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                                            >
                                                {product.name || product}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {organization.documents && organization.documents.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {t('org_details.documents')}
                                    </span>
                                </div>
                                <div className="pl-6 pt-1">
                                    <div className="space-y-2">
                                        {organization.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">{doc.name}</p>
                                                        <p className="text-xs text-gray-500">{doc.type}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    {t('org_details.doc_view')}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Facilities */}
                        {organization.facilities && organization.facilities.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {t('org_details.facilities')}
                                    </span>
                                </div>
                                <div className="pl-6 pt-1">
                                    <div className="flex flex-wrap gap-2">
                                        {organization.facilities.map((facility, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                                            >
                                                {facility}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Accreditations */}
                        {organization.accreditations && organization.accreditations.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                                    <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                        {t('org_details.accreditations')}
                                    </span>
                                </div>
                                <div className="pl-6 pt-1">
                                    <div className="flex flex-wrap gap-2">
                                        {organization.accreditations.map((acc, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                                            >
                                                {acc}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact Details Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-[#1e2a5a] pl-4 py-2 bg-gray-100">
                                <span className="font-semibold text-gray-700 tracking-wide text-sm">
                                    {t('org_details.contact_details')}
                                </span>
                            </div>
                            <div className="pl-6 space-y-4">
                                {/* Institution Type */}
                                {organization.institutionType && (
                                    <div className="flex items-start gap-4 text-sm md:text-[15px] text-gray-600">
                                        <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                        <p className="font-normal">
                                            <span className="font-medium text-gray-700">{t('org_details.type')}</span> {organization.institutionType}
                                        </p>
                                    </div>
                                )}

                                {/* Industry Type */}
                                {organization.industryType && organization.industryType.length > 0 && (
                                    <div className="flex items-start gap-4 text-sm md:text-[15px] text-gray-600">
                                        <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                        <p className="font-normal">
                                            <span className="font-medium text-gray-700">
                                                {t('org_details.industries')}
                                            </span> {organization.industryType.join(', ')}
                                        </p>
                                    </div>
                                )}

                                {/* Offering Industries */}
                                {organization.offeringIndustries && organization.offeringIndustries.length > 0 && (
                                    <div className="flex items-start gap-4 text-sm md:text-[15px] text-gray-600">
                                        <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                        <p className="font-normal">
                                            <span className="font-medium text-gray-700">
                                                {t('org_details.offering_industries')}
                                            </span> {organization.offeringIndustries.join(', ')}
                                        </p>
                                    </div>
                                )}

                                {/* Address */}
                                <div className="flex items-start gap-4 text-sm md:text-[15px] text-gray-600">
                                    <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                    <p className="font-normal">
                                        <span className="font-medium text-gray-700">
                                            {t('org_details.office_address')}
                                        </span> {formatAddress(organization.address)}
                                    </p>
                                </div>

                                {/* Website */}
                                {organization.website && (
                                    <div className="flex items-start gap-4 text-sm md:text-[15px] text-gray-600">
                                        <ChevronRight size={18} className="text-[#233480] shrink-0 mt-0.5" />
                                        <p className="font-normal">
                                            <span className="font-medium text-gray-700">
                                                {t('org_details.website')}
                                            </span>{' '}
                                            <a
                                                href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {organization.website}
                                            </a>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default OrganizationDetails;
