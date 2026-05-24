import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Footer from '../component/Footer';
import LanguageSelector from '../component/LanguageSelector';
import { trainingsAPI } from '../services/api';

const KaushalSetu = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [trainingPrograms, setTrainingPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isHindi = i18n.language === 'hi';

    // Fetch trainings from API
    useEffect(() => {
        const fetchTrainings = async () => {
            try {
                setLoading(true);
                setError('');

                //  Remove status filter - fetch all trainings
                const response = await trainingsAPI.getAll();

                console.log('API Response:', response.data); // Debug log

                if (response.data.success) {
                    const trainings = response.data.data?.trainings || response.data.data || [];
                    console.log('Trainings received:', trainings); // Debug log
                    setTrainingPrograms(trainings);
                }
            } catch (err) {
                console.error('Error fetching trainings:', err);
                setError('Failed to load training programs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTrainings();
    }, []);

    if (loading) {
        return (
            <>
                <div className="relative w-full py-8 md:py-16 pb-15 overflow-hidden flex items-start justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                    <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                    <div className="absolute top-6 right-6 z-10">
                        <LanguageSelector />
                    </div>
                    <div className="relative z-10 text-center">
                        <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-wider uppercase">
                            {t('pages.kaushal_setu.title')}
                        </h1>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-4 -mt-7 relative z-20 pb-12">
                    <div className="bg-white border-b-4 border-[#233480] shadow-xl overflow-hidden p-12 flex items-center justify-center">
                        <Loader2 size={48} className="text-[#233480] animate-spin" />
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div className="relative w-full py-8 md:py-16 pb-15 overflow-hidden flex items-start justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <div className="absolute top-6 right-6 z-10">
                    <LanguageSelector />
                </div>
                <div className="relative z-10 text-center">
                    <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-wider uppercase">
                        {t('pages.kaushal_setu.title')}
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-7 relative z-20 pb-12">
                <div className="bg-white border-b-4 border-[#233480] shadow-xl overflow-hidden">
                    <div className="p-4 md:p-6 space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 flex items-center gap-3 text-red-700">
                                <AlertCircle size={20} />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {!error && trainingPrograms.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <p className="text-lg">{t('pages.kaushal_setu.no_programs')}</p>
                                <p className="text-sm mt-2">{t('pages.kaushal_setu.check_later')}</p>
                            </div>
                        )}

                        {trainingPrograms.map((program) => {
                            // Handle nested institution data
                            const institutionName = program.institution?.organizationName ||
                                program.institution?.name ||
                                program.institutionName ||
                                (isHindi ? 'आईटीआई उज्जैन' : 'ITI Ujjain');

                            // Use training banner instead of institution logo
                            const trainingBanner = program.banner?.url ||
                                program.banner ||
                                'https://utkarshujjain.com/assets/img/banner-10.jpg';

                            const location = program.venue?.address ||
                                program.venue?.city ||
                                program.location ||
                                program.institution?.location ||
                                (isHindi ? 'उज्जैन' : 'Ujjain');

                            // Display title based on language
                            const title = program.title || 'Training Program';

                            return (
                                <div key={program._id || program.id} className="group flex flex-col md:flex-row items-center justify-between p-5 md:p-6 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg hover:border-l-4 hover:border-l-[#233480] relative overflow-hidden">

                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 w-full">
                                        {/* Training Banner */}
                                        <div className="w-20 h-16 md:w-24 md:h-16 flex items-center justify-center overflow-hidden shrink-0 rounded border border-gray-100 bg-gray-50">
                                            <img
                                                src={trainingBanner}
                                                alt={title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://utkarshujjain.com/assets/img/banner-10.jpg';
                                                }}
                                            />
                                        </div>

                                        <div className="flex-1 space-y-2 w-full">
                                            <h3 className="text-base md:text-lg font-medium text-[#1e2a5a] leading-tight hover:text-[#233480] transition-colors">
                                                {title}
                                            </h3>
                                            <div className="flex flex-col gap-1 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={14} className="text-[#233480]" />
                                                    <span>{institutionName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-[#233480]" />
                                                    <span>{location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                            <button
                                                onClick={() => navigate(`/kaushal-setu-apply/${program._id || program.id}`, {
                                                    state: {
                                                        title: title,
                                                        institutionName: institutionName
                                                    }
                                                })}
                                                className="w-full md:w-32 py-2 font-bold text-sm tracking-wide bg-[#233480] text-white rounded hover:bg-[#1a2660] transition-colors shadow-sm"
                                            >
                                                {t('pages.kaushal_setu.apply')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default KaushalSetu;