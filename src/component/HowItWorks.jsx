import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

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

export default function HowItWorks() {
  const { t } = useTranslation();

  const stepsData = t('home.how_it_works.steps', { returnObjects: true }) || [];
  const images = [
    'https://utkarshujjain.com/assets/img/step-1.png',
    'https://utkarshujjain.com/assets/img/step-2.png',
    'https://utkarshujjain.com/assets/img/step-3.png'
  ];

  const steps = stepsData.map((step, index) => ({
    ...step,
    number: `0${index + 1}`,
    image: images[index]
  }));

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="py-20 bg-gradient-to-b from-white to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={itemVariants}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('home.how_it_works.title')}
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -10,
                boxShadow: '0 30px 50px rgba(37, 99, 235, 0.2)',
              }}
              className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100"
            >
              {/* Step Number */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#233480] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mt-8 p-4 bg-blue-100 rounded-full mb-4 hover:scale-110 transition-transform duration-300">
                <img src={step.image} alt={step.title} className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-110" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
