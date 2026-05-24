import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';

const AboutUs = () => {
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
                    {t('pages.about_us')}
                </h1>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-10 md:-mt-12 mb-20 relative z-20">
                <div className="bg-white border-b-4 border-[#233480] overflow-hidden shadow-lg">
                    <div className="p-8 md:p-12 space-y-4 text-gray-700 leading-relaxed">
                        <p className="text-sm md:text-base">
                            <span className="font-bold text-[#233480]">UtkarshUjjain.com</span> {t('pages.about.desc1')}
                        </p>

                        <p className="text-sm md:text-base">
                            {t('pages.about.desc2')}
                        </p>

                        <p className="text-sm md:text-base">
                            {t('pages.about.desc3')}
                        </p>

                        <div className="pt-3">
                            <h2 className="text-base md:text-lg font-bold text-[#233480] mb-4">{t('pages.about.vision_title')}</h2>
                            <p className="text-sm md:text-base mb-3">
                                {t('pages.about.vision_desc')}
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-sm md:text-base text-gray-600">
                                {t('pages.about.vision_list', { returnObjects: true }).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <p className=" text-sm md:text-base font-medium text-gray-600 border-t border-gray-100 pt-5">
                            {t('pages.about.footer')}
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AboutUs;
