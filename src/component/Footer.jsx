import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
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

export default function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { label: t('footer.about_us'), href: '/aboutus' },
    { label: t('footer.faq'), href: '/faq' },
    { label: t('footer.privacy_policy'), href: '/privacypolicy' },
    { label: t('footer.terms_conditions'), href: '/termsandcondition' },
    { label: t('footer.contact_us'), href: '/contactus' },
  ];

  const candidateLinks = [
    { label: t('footer.search_jobs'), href: '/search-job' },
    { label: t('header.candidate_login'), href: '/login/candidate' },
    { label: t('footer.candidate_registration'), href: '/register/candidate' },
    { label: t('footer.training_request'), href: '/training-request' },
    { label: t('footer.search_training'), href: '/kaushal-setu' },
  ];

  const institutionLinks = [
    { label: t('header.login'), href: '/login/institution' },
    { label: t('footer.institution_registration'), href: '/register/institution' },
    { label: t('footer.college_university'), href: '/register/institution' },
    { label: t('footer.training_institute'), href: '/register/institution' },
    { label: t('footer.vendor_providers'), href: '/register/institution' },
  ];

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4 text-white">UtkarshUjjain</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('footer.connecting_talent')}
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:scale-110 transition-all active:scale-95"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* For Candidates */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.for_candidates')}</h4>
            <ul className="space-y-2">
              {candidateLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* For Institutions */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white">{t('footer.for_institutions')}</h4>
            <ul className="space-y-2">
              {institutionLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8" />

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center"
        >
          <div className="flex gap-6 mb-4 md:mb-0">
            <a
              href="mailto:info@UtkarshUjjain.com"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors hover:scale-105"
            >
              <Mail size={16} />
              info@UtkarshUjjain.com
            </a>
          </div>

          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} UtkarshUjjain. {t('footer.all_rights_reserved')}
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
