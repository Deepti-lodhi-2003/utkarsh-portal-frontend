import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail } from 'lucide-react';
import Footer from '../component/Footer';

const ContactUs = () => {
    const { t } = useTranslation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Page Header */}
            <div className="relative w-full h-40 md:h-48 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-widest text-center px-4 uppercase">
                    {t('pages.contact.title')}
                </h1>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-10 md:-mt-12 mb-20 relative z-20">
                <div className="bg-white border-b-4 border-[#233480] overflow-hidden shadow-lg p-12 md:p-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

                        {/* Office Address Section */}
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                <MapPin className="text-[#233480]" size={28} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-gray-700">{t('pages.contact.office_address')}</h2>
                                <div className="text-gray-500 text-sm md:text-base leading-relaxed space-y-1">
                                    <p>{t('pages.contact.address.line1')}</p>
                                    <p>{t('pages.contact.address.line2')}</p>
                                    <p>{t('pages.contact.address.line3')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Person Section */}
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm">
                                <Mail className="text-[#233480]" size={28} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-bold text-gray-700">{t('common.manager_name', 'Mr. Vinay Singh Tomar')}</h2>
                                <div className="text-gray-400 text-[13px] font-medium tracking-tight">
                                    {t('pages.contact.manager_title')}
                                </div>
                                <div className="pt-2 text-[#233480] text-sm md:text-base font-medium">
                                    <a href="mailto:ed.roujn@mpidc.co.in" className="hover:underline">
                                        ed.roujn@mpidc.co.in
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ContactUs;
