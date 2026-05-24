import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Get list translations
    const purposeList = t('pages.privacy.purpose_list', { returnObjects: true }) || [];
    const personalList = t('pages.privacy.info_personal_list', { returnObjects: true }) || [];
    const orgList = t('pages.privacy.info_org_list', { returnObjects: true }) || [];
    const techList = t('pages.privacy.info_tech_list', { returnObjects: true }) || [];
    const useList = t('pages.privacy.use_list', { returnObjects: true }) || [];
    const shareList = t('pages.privacy.share_list', { returnObjects: true }) || [];
    const userRespList = t('pages.privacy.user_resp_list', { returnObjects: true }) || [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Page Header */}
            <div className="relative w-full h-40 md:h-48 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-widest text-center px-4 uppercase">
                    {t('pages.privacy_policy')}
                </h1>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-10 md:-mt-12 mb-20 relative z-20">
                <div className="bg-white border-b-4 border-[#233480] overflow-hidden shadow-lg p-8 md:p-12">
                    <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
                        <p>{t('pages.privacy.desc1')}</p>
                        <p>{t('pages.privacy.desc2')}</p>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.purpose_title')}</h2>
                            <p className="mb-4">{t('pages.privacy.purpose_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {purposeList.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>

                        <p className="font-medium">{t('pages.privacy.no_sell')}</p>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.info_title')}</h2>
                            <p className="mb-4">{t('pages.privacy.info_desc')}</p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold underline mb-2">{t('pages.privacy.info_personal_title')}</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {personalList.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold underline mb-2">{t('pages.privacy.info_org_title')}</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {orgList.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold underline mb-2">{t('pages.privacy.info_tech_title')}</h3>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {techList.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.use_title')}</h2>
                            <p className="mb-4">{t('pages.privacy.use_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {useList.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                            <p className="mt-4">{t('pages.privacy.use_footer')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.share_title')}</h2>
                            <p className="mb-4">{t('pages.privacy.share_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {shareList.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                            <p className="mt-4 font-medium">{t('pages.privacy.share_footer')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.security_title')}</h2>
                            <p className="mb-4 italic">{t('pages.privacy.security_desc1')}</p>
                            <p>{t('pages.privacy.security_desc2')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.user_resp_title')}</h2>
                            <p className="mb-4">{t('pages.privacy.user_resp_desc')}</p>
                            <ul className="list-disc pl-6 space-y-2">
                                {userRespList.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                            <p className="mt-4">{t('pages.privacy.user_resp_footer')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.retention_title')}</h2>
                            <p>{t('pages.privacy.retention_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.cookies_title')}</h2>
                            <p>{t('pages.privacy.cookies_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.changes_title')}</h2>
                            <p>{t('pages.privacy.changes_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.law_title')}</h2>
                            <p>{t('pages.privacy.law_desc')}</p>
                        </div>

                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">{t('pages.privacy.contact_title')}</h2>
                            <p>{t('pages.privacy.contact_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
