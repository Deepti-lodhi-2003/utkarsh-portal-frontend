import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';
import LanguageSelector from '../component/LanguageSelector';

const VisionPage = () => {
    const { t } = useTranslation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Page Header */}
           <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
               
                <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white tracking-wider text-center px-4">{t('home.vision_page.header')}</h1>
            </div>

            {/* Main Content */}
            
            <div className="max-w-7xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20 ">
                <div className="bg-white shadow-sm border-b-4 border-[#233480] overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row gap-9 items-start mb-10">
                            {/* Image Column */}
                            <div className="w-full md:w-1/5 border border-gray-200">
                                <div className="aspect-[3/2] overflow-hidden shadow-md ">
                                    <img
                                        src="https://res.cloudinary.com/dc2geexnf/image/upload/v1771572928/Screenshot_2026-02-20_130334_si4qix.png"
                                        alt="Dr. Mohan Yadav"
                                        className="w-full h-full object-cover object-top"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/400x500?text=CM+Yadav';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Identity Column */}
                            <div className="w-full md:w-2/3">
                                <div>
                                  
                                    <p className="text-sm md:text-base text-gray-600  pt-2">
                                    {t('home.vision_page.desc1')}
                                    </p>
                                </div>

                                <div className=" text-gray-600 leading-relaxed text-sm md:text-base text-justify mt-4">
                                    <p>
                                      {t('home.vision_page.desc2')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Rest of the Text */}
                        <div className="space-y-6 text-gray-600 leading-relaxed text-sm md:text-base text-justify">
                            <p>
                               {t('home.vision_page.desc3')}
                            </p>

                            <p>
                                {t('home.vision_page.desc4')}
                            </p>

                            <p>
                               {t('home.vision_page.desc5')}
                            </p>

                            <p className="font-medium text-gray-800">
                              {t('home.vision_page.desc6')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Footer/>
        </>
    );
};

export default VisionPage;
