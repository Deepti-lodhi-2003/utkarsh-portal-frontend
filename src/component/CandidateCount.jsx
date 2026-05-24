import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Factory, Laptop, GraduationCap, Building, Loader2 } from 'lucide-react';
import { searchAPI } from '../services/api';

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// ─── Industry Config ──────────────────────────────────────────────────────────
// `searchKey` = value sent as `industry` query param to /search/candidates
// `key`       = i18n key suffix + countMap lookup key

const INDUSTRY_CONFIG = [
  { key: 'manufacturing', searchKey: 'Manufacturing', icon: Factory, textClass: 'text-orange-500', bgClass: 'bg-orange-100' },
  { key: 'it_software', searchKey: 'IT/Software', icon: Laptop, textClass: 'text-gray-800', bgClass: 'bg-gray-100' },
  { key: 'education', searchKey: 'Education', icon: GraduationCap, textClass: 'text-blue-900', bgClass: 'bg-blue-100' },
  { key: 'construction', searchKey: 'Construction', icon: Building, textClass: 'text-orange-600', bgClass: 'bg-orange-50' },
  { key: 'automobile', searchKey: 'Automobile', icon: Factory, textClass: 'text-red-500', bgClass: 'bg-red-100' },
  { key: 'finance', searchKey: 'Finance', icon: Laptop, textClass: 'text-green-600', bgClass: 'bg-green-100' },
  { key: 'healthcare', searchKey: 'Healthcare', icon: GraduationCap, textClass: 'text-purple-600', bgClass: 'bg-purple-100' },
  { key: 'tele_bpo', searchKey: 'Telecom/BPO', icon: Laptop, textClass: 'text-blue-500', bgClass: 'bg-blue-100' },
];

// ─── CandidateCountSection ────────────────────────────────────────────────────

const CandidateCountSection = () => {
  const { t } = useTranslation();

  const [industryData, setIndustryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidateCounts = async () => {
      try {
        setLoading(true);

        // Call the new backend API that returns accurate counts by industry
        const res = await searchAPI.getCandidatesByIndustry();

        // Response shape: { data: [{ industry: "Manufacturing", candidateCount: 5 }, ...] }
        const apiData = res.data?.data || [];

        if (apiData.length === 0) {
          // No data from API, show config with zero counts
          setIndustryData(INDUSTRY_CONFIG.map((cfg) => ({ ...cfg, count: 0 })));
          setLoading(false);
          return;
        }

        // Build a count map from API response
        const countMap = {};
        apiData.forEach((item) => {
          const industry = item.industry?.trim();
          if (industry) {
            countMap[industry] = item.candidateCount || 0;
          }
        });

        // Merge API counts into config, preserving display order
        const merged = INDUSTRY_CONFIG.map((cfg) => ({
          ...cfg,
          count: countMap[cfg.searchKey] ?? 0,
        }));

        setIndustryData(merged);
      } catch (err) {
        console.error('CandidateCountSection fetch error:', err);
        setError('Failed to load candidate data');

        // Graceful fallback: show config with zero counts
        setIndustryData(INDUSTRY_CONFIG.map((cfg) => ({ ...cfg, count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateCounts();
  }, []);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-[260px]">
          <Loader2 size={40} className="text-[#233480] animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="py-16 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {t('home.candidate_count.title')}{' '}
            <span className="text-[#233480]">{t('home.candidate_count.industry')}</span>
          </h2>
          <p className="text-gray-500 text-xs md:text-sm">
            {t('home.candidate_count.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {industryData.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 20px 30px rgba(0,0,0,0.1)' }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:border-[#233480] transition-shadow flex flex-col items-center justify-center text-center border border-gray-100 h-40 cursor-pointer group"
            >
              <div className={`p-3 rounded-full mb-3 mx-auto w-fit ${item.bgClass} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={32} className={item.textClass} strokeWidth={1.5} />
              </div>
              <h3 className="text-gray-800 font-semibold text-xs md:text-sm mb-1">
                {t(`home.candidate_count.industries.${item.key}`, { defaultValue: item.searchKey })}
              </h3>
              <p className="text-gray-500 text-xs font-medium">
                {item.count}{' '}
                {item.count !== 1
                  ? t('home.candidate_count.candidates')
                  : t('home.candidate_count.candidate')}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CandidateCountSection;