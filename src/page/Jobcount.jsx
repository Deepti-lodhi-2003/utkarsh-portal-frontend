import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Factory, Laptop, Utensils, Leaf, Zap, GraduationCap,
  HardHat, BarChart3, ArrowRight, Briefcase, Stethoscope,
  Truck, ShoppingBag
} from 'lucide-react';
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

// ─── Colour Palette ───────────────────────────────────────────────────────────

const colorPalette = [
  { textClass: 'text-orange-500', bgClass: 'bg-orange-100' },
  { textClass: 'text-gray-800', bgClass: 'bg-gray-100' },
  { textClass: 'text-amber-600', bgClass: 'bg-amber-100' },
  { textClass: 'text-green-600', bgClass: 'bg-green-100' },
  { textClass: 'text-yellow-500', bgClass: 'bg-yellow-100' },
  { textClass: 'text-blue-900', bgClass: 'bg-blue-100' },
  { textClass: 'text-orange-600', bgClass: 'bg-orange-100' },
  { textClass: 'text-blue-600', bgClass: 'bg-blue-100' },
  { textClass: 'text-purple-600', bgClass: 'bg-purple-100' },
  { textClass: 'text-red-500', bgClass: 'bg-red-100' },
  { textClass: 'text-teal-600', bgClass: 'bg-teal-100' },
  { textClass: 'text-pink-600', bgClass: 'bg-pink-100' },
];

// ─── Icon Resolver ────────────────────────────────────────────────────────────

const getIconForCategory = (category = '') => {
  const lower = category.toLowerCase();
  // Industry / sector names
  if (lower.includes('manufactur') || lower.includes('product')) return Factory;
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cook')) return Utensils;
  if (lower.includes('environment') || lower.includes('agricult') || lower.includes('green')) return Leaf;
  if (lower.includes('electric') || lower.includes('power')) return Zap;
  if (lower.includes('education') || lower.includes('teach') || lower.includes('school') || lower.includes('student')) return GraduationCap;
  if (lower.includes('construct') || lower.includes('civil') || lower.includes('build')) return HardHat;
  if (lower.includes('account') || lower.includes('financ') || lower.includes('bank')) return BarChart3;
  if (lower.includes('medic') || lower.includes('health') || lower.includes('doctor') || lower.includes('nurs')) return Stethoscope;
  if (lower.includes('transport') || lower.includes('logis') || lower.includes('driv')) return Truck;
  if (lower.includes('retail') || lower.includes('sales') || lower.includes('shop')) return ShoppingBag;
  // Skill / tech names (from getPopularCategories response)
  if (lower.includes('html') || lower.includes('css') || lower.includes('javascript') || lower.includes('js') ||
    lower.includes('react') || lower.includes('node') || lower.includes('python') || lower.includes('java') ||
    lower.includes('php') || lower.includes('sql') || lower.includes('web') || lower.includes('flutter') ||
    lower.includes('android') || lower.includes('ios') || lower.includes('swift') || lower.includes('kotlin') ||
    lower.includes('it') || lower.includes('soft') || lower.includes('computer') || lower.includes('tech')) return Laptop;
  return Briefcase;
};

// ─── Static fallback (shown when API returns empty or fails) ─────────────────
// Keeps the section meaningful even before real data accumulates in the DB.

const FALLBACK_INDUSTRIES = [
  { key: 'manufacturing', icon: Factory, textClass: 'text-orange-500', bgClass: 'bg-orange-100' },
  { key: 'it_software', icon: Laptop, textClass: 'text-gray-800', bgClass: 'bg-gray-100' },
  { key: 'food', icon: Utensils, textClass: 'text-amber-600', bgClass: 'bg-amber-100' },
  { key: 'environment', icon: Leaf, textClass: 'text-green-600', bgClass: 'bg-green-100' },
  { key: 'electrical', icon: Zap, textClass: 'text-yellow-500', bgClass: 'bg-yellow-100' },
  { key: 'education', icon: GraduationCap, textClass: 'text-blue-900', bgClass: 'bg-blue-100' },
  { key: 'construction', icon: HardHat, textClass: 'text-orange-600', bgClass: 'bg-orange-100' },
  { key: 'finance', icon: BarChart3, textClass: 'text-blue-600', bgClass: 'bg-blue-100' },
];

// ─── JobCard ──────────────────────────────────────────────────────────────────

const JobCard = ({ icon: Icon, title, count, textClass, bgClass }) => {
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
      <h3 className="text-gray-800 font-semibold text-xs md:text-sm mb-1 line-clamp-2">{title}</h3>
      <p className="text-gray-500 text-xs font-medium">
        {count}{' '}
        {count !== 1 ? t('common.jobs') : t('common.job')}
      </p>
    </motion.div>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 h-40 flex flex-col items-center justify-center animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-full mb-3" />
    <div className="h-4 bg-gray-200 w-24 mb-2 rounded" />
    <div className="h-3 bg-gray-200 w-12 rounded" />
  </div>
);

// ─── Jobcount ─────────────────────────────────────────────────────────────────

const Jobcount = () => {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Call the new backend API that returns job counts by industry
        const res = await searchAPI.getJobsByIndustry();

        const ok = res.data?.success || res.data?.status === 'success';
        if (!ok) throw new Error('API returned non-success status');

        // Response shape: { data: [{ industry: "Manufacturing", jobCount: 2 }, ...] }
        const rawData = Array.isArray(res.data?.data) ? res.data.data : [];

        if (rawData.length === 0) {
          setUseFallback(true);
          return;
        }

        const mapped = rawData.map((item, index) => {
          const name = item.industry || null;
          const count = parseInt(item.jobCount || item.count || 0, 10);

          if (!name) return null;

          const style = colorPalette[index % colorPalette.length];
          return {
            title: name,
            count,
            icon: getIconForCategory(name),
            textClass: style.textClass,
            bgClass: style.bgClass,
          };
        }).filter(Boolean);

        if (mapped.length === 0) {
          setUseFallback(true);
        } else {
          setCategories(mapped);
        }

      } catch (err) {
        console.error('Jobcount: failed to fetch categories:', err);
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Build fallback display data using i18n keys (defined here so t() is in scope)
  const fallbackDisplay = FALLBACK_INDUSTRIES.map((item) => ({
    ...item,
    title: t(`home.job_count.industries.${item.key}`, { defaultValue: item.key }),
    count: 0,
  }));

  // FIX 4: simple, readable display-data decision
  const displayData = loading ? [] : (categories.length > 0 ? categories : fallbackDisplay);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="py-16 bg-gradient-to-b from-white to-gray-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {t('home.job_count.title')}{' '}
            <span className="text-[#233480]">{t('home.job_count.industry')}</span>
          </h2>
          <Link
            to="/search-job"
            className="inline-flex items-center text-[#233480] font-medium text-xs transition-colors hover:translate-x-1"
          >
            {t('common.view_all')} <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {loading
            ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
            : displayData.map((item, index) => (
              <JobCard
                key={index}
                icon={item.icon}
                title={item.title}
                count={item.count}
                textClass={item.textClass}
                bgClass={item.bgClass}
              />
            ))
          }
        </motion.div>

        {/* Show a subtle note when falling back to static data */}
        {!loading && useFallback && (
          <p className="text-center text-gray-400 text-xs mt-6">
            {t('home.job_count.no_data', { defaultValue: 'Job data coming soon.' })}
          </p>
        )}
      </div>
    </motion.section>
  );
};

export default Jobcount;