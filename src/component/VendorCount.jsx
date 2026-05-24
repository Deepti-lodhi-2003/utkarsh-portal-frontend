import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Factory, Laptop, Building2, Building, Zap,
  ShoppingCart, Landmark, GraduationCap, ArrowRight, Loader2
} from 'lucide-react';
import { vendorAPI } from '../services/api';

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
// Maps industry name (as it comes from API) → display config
// The `key` must match whatever string your backend stores in vendor.industries[]

const INDUSTRY_CONFIG = [
  { key: 'Manufacturing',  icon: Factory,       textClass: 'text-orange-500', bgClass: 'bg-orange-100' },
  { key: 'IT/Software',    icon: Laptop,        textClass: 'text-gray-800',   bgClass: 'bg-gray-100'   },
  { key: 'Hospitality',    icon: Building2,     textClass: 'text-blue-600',   bgClass: 'bg-blue-100'   },
  { key: 'Construction',   icon: Building,      textClass: 'text-orange-600', bgClass: 'bg-orange-100' },
  { key: 'Electrical',     icon: Zap,           textClass: 'text-yellow-500', bgClass: 'bg-yellow-100' },
  { key: 'Retail',         icon: ShoppingCart,  textClass: 'text-red-600',    bgClass: 'bg-red-100'    },
  { key: 'Architecture',   icon: Landmark,      textClass: 'text-purple-600', bgClass: 'bg-purple-100' },
  { key: 'Education',      icon: GraduationCap, textClass: 'text-blue-900',   bgClass: 'bg-blue-100'   },
];

// ─── VendorCard ───────────────────────────────────────────────────────────────

const VendorCard = ({ icon: Icon, title, count, textClass, bgClass }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: '0 20px 30px rgba(0,0,0,0.1)' }}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:border-[#233480] transition-shadow flex flex-col items-center justify-center text-center border border-gray-100 h-40 cursor-pointer group"
    >
      <div className={`p-3 rounded-full mb-3 ${bgClass} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={32} className={textClass} strokeWidth={1.5} />
      </div>
      <h3 className="text-gray-800 font-semibold text-xs md:text-sm mb-1">{title}</h3>
      <p className="text-gray-500 text-xs font-medium">
        {count}{' '}
        {count !== 1
          ? t('home.vendor_count.vendors')
          : t('home.vendor_count.vendor')}
      </p>
    </motion.div>
  );
};

// ─── VendorCount ──────────────────────────────────────────────────────────────

const VendorCount = () => {
  const { t } = useTranslation();

  const [industryData, setIndustryData] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);

        // Fetch a large page so we can count client-side.
        // If your backend supports an /vendors/industry-stats endpoint,
        // prefer that instead and map the response directly.
        const res = await vendorAPI.getAll({ limit: 500, status: 'active' });

        const vendors =
          res.data?.data?.vendors ||
          res.data?.data ||
          [];

        // Count vendors per industry by tallying each industry tag
        const countMap = {};
        vendors.forEach((vendor) => {
          const industries = vendor.industries || [];
          industries.forEach((ind) => {
            countMap[ind] = (countMap[ind] || 0) + 1;
          });
        });

        // Merge counts into the static config, keeping display order
        const merged = INDUSTRY_CONFIG.map((cfg) => ({
          ...cfg,
          count: countMap[cfg.key] ?? 0,
          // Translate title via i18n key derived from industry key
          titleKey: `home.vendor_count.industries.${cfg.key
            .toLowerCase()
            .replace(/\//g, '_')
            .replace(/ /g, '_')}`,
        }));

        setIndustryData(merged);
      } catch (err) {
        console.error('VendorCount fetch error:', err);
        setError('Failed to load vendor data');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
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

  // ── Error / empty — fall back to static zeros rather than hiding the section
  if (error) {
    console.warn('VendorCount: showing static fallback due to error');
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
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {t('home.vendor_count.title')}{' '}
            <span className="text-[#233480]">{t('home.vendor_count.industry')}</span>
          </h2>
          <Link
            to="/vendor-directory"
            className="inline-flex items-center text-[#233480] font-medium text-xs transition-colors hover:translate-x-1"
          >
            {t('common.view_all')} <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {industryData.map((item, index) => (
            <VendorCard
              key={index}
              icon={item.icon}
              title={t(item.titleKey, { defaultValue: item.key })}
              count={item.count}
              textClass={item.textClass}
              bgClass={item.bgClass}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default VendorCount;