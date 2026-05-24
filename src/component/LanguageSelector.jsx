import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative inline-flex items-center group">
            <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 transition-all cursor-pointer shadow-sm">
                <Globe className="w-4 h-4 text-[#233480]" />
                <select
                    onChange={(e) => changeLanguage(e.target.value)}
                    value={i18n.language}
                    className="bg-transparent text-[#1e2a5a] text-[13px] font-bold outline-none cursor-pointer appearance-none pr-4 uppercase tracking-wide"
                    style={{ backgroundImage: 'none' }}
                >
                    <option value="en" className="text-gray-800">English</option>
                    <option value="hi" className="text-gray-800">हिन्दी</option>
                </select>
                <div className="absolute right-3 pointer-events-none">
                    <svg className="w-3 h-3 text-[#233480]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelector;
