import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPin, Sun, Cog, BookOpen, Loader2 } from 'lucide-react';
import { trainingsAPI } from '../services/api';

const KaushalSetu = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [trainings, setTrainings] = useState([]);
    const [loading, setLoading] = useState(true);

    const isHindi = i18n.language === 'hi';

    const icons = [Sun, Cog, BookOpen];

    // Fetch trainings from API - same as KaushalSetu.jsx
    useEffect(() => {
        const fetchTrainings = async () => {
            try {
                setLoading(true);
                // Same API call as KaushalSetu.jsx
                const response = await trainingsAPI.getAll();

                console.log('Home API Response:', response.data);

                if (response.data.success) {
                    const allTrainings = response.data.data?.trainings || response.data.data || [];
                    console.log('Home Trainings received:', allTrainings);
                    // Show only first 3 trainings on home page
                    setTrainings(allTrainings.slice(0, 3));
                }
            } catch (err) {
                console.error('Error fetching trainings:', err);
                setTrainings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrainings();
    }, []);

    if (loading) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#1e2a5a] mb-2">
                            {t('home.kaushal_setu.title')}
                        </h2>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={40} className="text-[#233480] animate-spin" />
                    </div>
                </div>
            </section>
        );
    }

    if (trainings.length === 0) {
        return null; // Don't show section if no trainings
    }

    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#1e2a5a] mb-2">
                        {t('home.kaushal_setu.title')}
                    </h2>
                    <Link to="/kaushal-setu" className="text-[#233480] text-sm font-medium hover:underline">
                        {t('home.kaushal_setu.view_all')} &rarr;
                    </Link>
                </div>

                <div className="flex flex-col gap-4 max-w-7xl mx-auto">
                    {trainings.map((program, index) => {
                        //  SAME LOGIC as KaushalSetu.jsx for consistency
                        const institutionName = program.institution?.organizationName ||
                            program.institution?.name ||
                            program.institutionName ||
                            (isHindi ? 'आईटीआई उज्जैन' : 'ITI Ujjain');

                        // Use training banner instead of institution logo
                        const trainingBanner = program.banner?.url ||
                            program.banner ||
                            'https://utkarshujjain.com/assets/img/banner-10.jpg'; // Default training banner

                        const location = program.venue?.address ||
                            program.venue?.city ||
                            program.location ||
                            program.institution?.location ||
                            (isHindi ? 'उज्जैन' : 'Ujjain');

                        const title = program.title || 'Training Program';
                        const Icon = icons[index] || icons[0];
                        const trainingId = program._id || program.id;

                        console.log(`Training ${index}:`, { title, trainingBanner, institutionName }); // Debug log

                        return (
                            <motion.div
                                key={trainingId}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border border-gray-100 rounded-lg p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md hover:border-l-4 hover:border-l-[#233480] transition-all group"
                            >
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-20 h-16 md:w-24 md:h-16 overflow-hidden shrink-0 rounded border border-gray-100 bg-gray-50">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <img
                                                src={trainingBanner}
                                                alt={title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    console.log('Banner load failed, using fallback');
                                                    e.target.src = 'https://utkarshujjain.com/assets/img/banner-10.jpg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-semibold text-[#233480] group-hover:text-blue-800 transition-colors mb-1">
                                            {title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                                            <MapPin size={14} />
                                            <span>{location}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/kaushal-setu-apply/${trainingId}`, {
                                        state: {
                                            title: title,
                                            institutionName: institutionName
                                        }
                                    })}
                                    className="w-full md:w-auto px-6 py-2 bg-[#233480] text-white font-medium text-sm rounded hover:bg-[#1a2560] transition-colors shadow-sm whitespace-nowrap"
                                >
                                    {t('pages.kaushal_setu.apply') || 'Apply'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default KaushalSetu;