import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';

const TermsAndConditions = () => {
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
                    {t('pages.terms_conditions')}
                </h1>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-10 md:-mt-12 mb-20 relative z-20">
                <div className="bg-white border-b-4 border-[#233480] overflow-hidden shadow-lg p-8 md:p-12">
                    <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
                        <p>{t('pages.terms.desc1')}</p>
                        <p>{t('pages.terms.desc2')}</p>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.acceptance_title')}</h2>
                            <p>{t('pages.terms.acceptance_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.nature_title')}</h2>
                            <p className="mb-4">{t('pages.terms.nature_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {t('pages.terms.nature_list', { returnObjects: true }).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                            <p className="mt-4">{t('pages.terms.nature_footer')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.eligibility_title')}</h2>
                            <p className="mb-4">{t('pages.terms.eligibility_desc')}</p>
                            <ul className="list-disc pl-6 space-y-1">
                                {t('pages.terms.eligibility_list', { returnObjects: true }).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                            <p className="mt-4">{t('pages.terms.eligibility_footer')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.resp_title')}</h2>
                            <p className="mb-4">{t('pages.terms.resp_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {t('pages.terms.resp_list', { returnObjects: true }).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                            <p className="mt-4">{t('pages.terms.resp_footer')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.content_title')}</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                {t('pages.terms.content_list', { returnObjects: true }).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.guarantee_title')}</h2>
                            <p className="mb-4">{t('pages.terms.guarantee_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {t('pages.terms.guarantee_list', { returnObjects: true }).map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                            <p className="mt-4">{t('pages.terms.guarantee_footer')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.privacy_title')}</h2>
                            <p className="mb-4">{t('pages.terms.privacy_desc1')}</p>
                            <p>{t('pages.terms.privacy_desc2')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.intellectual_title')}</h2>
                            <p>{t('pages.terms.intellectual_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.modification_title')}</h2>
                            <p>{t('pages.terms.modification_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.limitation_title')}</h2>
                            <p>{t('pages.terms.limitation_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.law_title')}</h2>
                            <p>{t('pages.terms.law_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2">{t('pages.terms.contact_title')}</h2>
                            <p>{t('pages.terms.contact_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsAndConditions;
