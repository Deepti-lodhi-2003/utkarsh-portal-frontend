import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Vision = () => {
  const { t } = useTranslation();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -50, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="py-16 bg-gradient-to-b from-gray-50/50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">

          {/* Image Section */}
          <motion.div
            variants={imageVariants}
            className="w-full md:w-1/3 flex justify-center"
          >
            <motion.div
              whileHover={{ y: -10, boxShadow: '0 30px 50px rgba(0,0,0,0.15)' }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white w-full max-w-sm"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dc2geexnf/image/upload/v1771572928/Screenshot_2026-02-20_130334_si4qix.png"
                  alt={t('home.vision.cm_name')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/300?text=CM+Yadav';
                  }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 text-center bg-white border-t border-gray-100 animate-fadeIn animation-delay-300"
              >
                <h3 className="text-lg font-bold text-gray-800">
                  {t('home.utkarsh_vision.portal_name')}
                </h3>
                <p className="text-blue-600 font-medium text-sm mt-1">
                  {t('home.utkarsh_vision.tagline')}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Text Section */}
          <motion.div variants={itemVariants} className="w-full md:w-2/3">
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-3xl font-bold text-[#233480] mb-6 uppercase"
            >
              {t('home.utkarsh_vision.title')}
            </motion.h2>

            <motion.div
              variants={containerVariants}
              className="text-gray-700 space-y-4 md:space-y-5 text-base md:text-lg leading-relaxed"
            >
              <motion.p variants={itemVariants} className="text-justify">
                {t('home.utkarsh_vision.p1')}
              </motion.p>

              <motion.p variants={itemVariants} className="text-justify">
                {t('home.utkarsh_vision.p2')}
              </motion.p>

              <Link
                to="/vision"
                className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors mt-4"
              >
                {t('home.utkarsh_vision.read_more')} <span className="ml-2">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default Vision;
