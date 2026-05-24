import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, Landmark, Building2, BookOpen, GraduationCap, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Footer from '../component/Footer';

const TrainingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const isHindi = i18n.language === 'hi';

    const trainings = useMemo(() => {
        if (isHindi) {
            return {
                '1': {
                    id: 1,
                    vendorId: 'iti-raisen',
                    title: 'सोलर मैन्युफैक्चरिंग प्लांट – ऑपरेशन एवं मेंटेनेंस (O&M)',
                    institution: 'ITI Raisen',
                    location: 'ITI, Raisen',
                    contactPerson: 'Mr Vivek Mishra',
                    contactNumber: '7974450681',
                    description: 'यह प्रशिक्षण सोलर मैन्युफैक्चरिंग प्लांट की मशीनों एवं सिस्टम के संचालन (Operation) और रखरखाव (Maintenance) से संबंधित कौशल विकसित करने हेतु तैयार किया गया है।',
                    criteria: [
                        '12वीं उत्तीर्ण (अनिवार्य)',
                        'विज्ञान वर्ग (Science Background) के उम्मीदवारों को प्राथमिकता',
                        'प्रशिक्षण से पूर्व प्रवेश परीक्षा ली जाएगी',
                        'परीक्षा में उत्तीर्ण उम्मीदवारों को ही प्रशिक्षण में प्रवेश दिया जाएगा'
                    ],
                    objectives: [
                        'सोलर मैन्युफैक्चरिंग प्लांट की मशीनों का सुरक्षित संचालन',
                        'इलेक्ट्रिकल, मैकेनिकल एवं ऑटोमेशन सिस्टम की समझ विकसित करना',
                        'ब्रेकडाउन कम कर प्लांट अपटाइम बढ़ाना'
                    ],
                    syllabus: [
                        {
                            title: 'इलेक्ट्रिकल सिस्टम',
                            topics: ['AC / DC सिस्टम की मूल जानकारी', 'इन्वर्टर, ट्रांसफॉर्मर एवं ग्राउंडिंग', 'इंडस्ट्रियल पैनल वायरिंग', 'एडवांस फॉल्ट फाइंडिंग एवं ट्रबलशूटिंग']
                        },
                        {
                            title: 'मैकेनिकल एवं हाइड्रोलिक सिस्टम',
                            topics: ['स्ट्रिंगर, लेमिनेटर, फ्रेमिंग मशीन की कार्यप्रणाली', 'मैकेनिकल एवं हाइड्रोलिक फॉल्ट की पहचान']
                        },
                        {
                            title: 'टेस्टिंग एवं मापन उपकरण',
                            topics: ['मल्टीमीटर, मेगर, I-V कर्व ट्रेसर का उपयोग', 'थर्मल इमेजिंग कैमरा द्वारा फॉल्ट डिटेक्शन']
                        },
                        {
                            title: 'ऑटोमेशन एवं कंट्रोल सिस्टम',
                            topics: ['PLC का परिचय एवं बेसिक प्रोग्रामिंग', 'HMI सिस्टम की जानकारी', 'SCADA एवं रिमोट मॉनिटरिंग', 'सेंसर एवं इंस्ट्रूमेंटेशन']
                        },
                        {
                            title: 'मेंटेनेंस मैनेजमेंट',
                            topics: ['CMMS सिस्टम की जानकारी', 'प्रिवेंटिव एवं ब्रेकडाउन मेंटेनेंस', 'Root Cause Analysis (RCA)']
                        },
                        {
                            title: 'सेफ्टी एवं नियम',
                            topics: ['Lockout / Tagout (LOTO) प्रक्रिया', 'PPE का सही उपयोग', 'खतरनाक सामग्री का सुरक्षित हैंडलिंग']
                        },
                        {
                            title: 'सॉफ्ट स्किल्स',
                            topics: ['कम्युनिकेशन एवं टीमवर्क', 'रिपोर्टिंग एवं डॉक्युमेंटेशन', 'नई तकनीकों के साथ अपडेट रहना']
                        }
                    ],
                    keyDetails: {
                        criteria: '12वीं उत्तीर्ण (अनिवार्य) विज्ञान वर्ग (Science Background) के उम्मीदवारों को प्राथमिकता प्रशिक्षण से पूर्व प्रवेश परीक्षा ली जाएगी परीक्षा में उत्तीर्ण उम्मीदवारों को ही प्रशिक्षण में प्रवेश दिया जाएगा',
                        syllabus: 'सोलर मैन्युफैक्चरिंग प्लांट – ऑपरेशन एवं मेंटेनेंस (O&M)'
                    }
                }
            };
        } else {
            return {
                '1': {
                    id: 1,
                    vendorId: 'iti-raisen',
                    title: 'Solar Manufacturing Plant – Operation & Maintenance (O&M)',
                    institution: 'ITI Raisen',
                    location: 'ITI, Raisen',
                    contactPerson: 'Mr Vivek Mishra',
                    contactNumber: '7974450681',
                    description: 'This training is designed to develop skills related to the operation and maintenance of machines and systems in a solar manufacturing plant.',
                    criteria: [
                        '12th Pass (Mandatory)',
                        'Preference to Science Background candidates',
                        'Entrance exam will be conducted before training',
                        'Only candidates passing the exam will be admitted to training'
                    ],
                    objectives: [
                        'Safe operation of solar manufacturing plant machines',
                        'Developing understanding of electrical, mechanical and automation systems',
                        'Reducing breakdown and increasing plant uptime'
                    ],
                    syllabus: [
                        {
                            title: 'Electrical System',
                            topics: ['Basic knowledge of AC / DC systems', 'Inverter, Transformer & Grounding', 'Industrial Panel Wiring', 'Advanced Fault Finding & Troubleshooting']
                        },
                        {
                            title: 'Mechanical & Hydraulic System',
                            topics: ['Working of Stringer, Laminator, Framing Machine', 'Identification of Mechanical & Hydraulic Faults']
                        },
                        {
                            title: 'Testing & Measuring Instruments',
                            topics: ['Use of Multimeter, Megger, I-V Curve Tracer', 'Fault Detection by Thermal Imaging Camera']
                        },
                        {
                            title: 'Automation & Control System',
                            topics: ['Introduction to PLC & Basic Programming', 'HMI System Information', 'SCADA & Remote Monitoring', 'Sensors & Instrumentation']
                        },
                        {
                            title: 'Maintenance Management',
                            topics: ['CMMS System Information', 'Preventive & Breakdown Maintenance', 'Root Cause Analysis (RCA)']
                        },
                        {
                            title: 'Safety & Regulations',
                            topics: ['Lockout / Tagout (LOTO) Procedure', 'Proper Use of PPE', 'Safe Handling of Hazardous Materials']
                        },
                        {
                            title: 'Soft Skills',
                            topics: ['Communication & Teamwork', 'Reporting & Documentation', 'Staying updated with new technologies']
                        }
                    ],
                    keyDetails: {
                        criteria: '12th Pass (Mandatory), Preference to Science Background candidates. Entrance exam will be conducted before training. Only candidates passing the exam will be admitted.',
                        syllabus: 'Solar Manufacturing Plant – Operation & Maintenance (O&M)'
                    }
                }
            };
        }
    }, [isHindi]);

    const training = trainings[id] || trainings['1'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Page Header */}
            <div className="relative w-full h-40 md:h-48 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-4xl font-bold text-white tracking-widest text-center px-4 uppercase">
                    {t('pages.training_details.title')}
                </h1>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-10 md:-mt-12 mb-20 relative z-20">
                <div className="bg-white border-b-4 border-[#233480] overflow-hidden">
                    {/* Training Header Card */}
                    <div className="p-6 md:p-8 border-b border-gray-100">
                        <h2 className="text-xl md:text-2xl font-bold text-[#1e2a5a] mb-4">
                            {training.title}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Landmark size={18} className="text-green-600" />
                                <span className="font-medium text-sm md:text-base">{training.institution}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-green-600" />
                                <span className="font-medium text-sm md:text-base">{training.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={18} className="text-green-600" />
                                <span className="font-medium text-sm md:text-base">{training.contactPerson}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={18} className="text-green-600" />
                                <span className="font-medium text-sm md:text-base">{training.contactNumber}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => navigate(`/kaushal-setu-apply/${id}`)}
                                className="flex items-center justify-center gap-2 px-10 py-2.5 rounded bg-[#233480] text-white font-bold tracking-wide shadow-md hover:bg-[#1a2660] active:scale-95 transition-all"
                            >
                                {t('pages.training_details.apply')}
                            </button>
                            <button
                                onClick={() => navigate(`/vendor-details/${training.vendorId}`, { state: { fromTraining: true } })}
                                className="flex items-center gap-2 px-8 py-2.5 rounded bg-[#00A99D] text-white font-bold tracking-wide hover:bg-[#008c82] transition-all shadow-md active:scale-95"
                            >
                                <Building2 size={18} />
                                {t('pages.training_details.institute_details')}
                            </button>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 md:p-10 space-y-10">
                        {/* Summary */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-[#1e2a5a] border-l-4 border-[#233480] pl-3">
                                {training.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base text-justify">
                                {training.description}
                            </p>
                        </div>

                        {/* Criteria */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <GraduationCap size={20} className="text-[#233480]" />
                                {t('pages.training_details.criteria')}
                            </h4>
                            <ul className="space-y-2">
                                {training.criteria.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm md:text-base">
                                        <span className="text-[#233480] font-bold">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Objective */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <Target size={20} className="text-[#233480]" />
                                {t('pages.training_details.objectives')}
                            </h4>
                            <ul className="space-y-2">
                                {training.objectives.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm md:text-base">
                                        <span className="text-[#233480] font-bold">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Syllabus */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                <BookOpen size={20} className="text-[#233480]" />
                                {t('pages.training_details.syllabus')}
                            </h4>
                            <div className="space-y-6">
                                {training.syllabus.map((section, i) => (
                                    <div key={i} className="space-y-2">
                                        <p className="font-bold text-[#1e2a5a] text-sm md:text-base">{i + 1}. {section.title}</p>
                                        <ul className="grid grid-cols-1 md:grid-cols-1 gap-x-8 gap-y-2 ml-4">
                                            {section.topics.map((topic, j) => (
                                                <li key={j} className="flex items-start gap-3 text-gray-600 text-sm md:text-[15px]">
                                                    <span className="text-[#233480] font-bold">•</span>
                                                    {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Details Card */}
                        <div className="">
                            <div className="px-6 py-3 bg-gray-200 border-l-4 border-[#233480]">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('pages.training_details.key_details')}</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <span className="text-[#233480] font-bold">»</span>
                                    <p className="text-sm md:text-base text-gray-600">
                                        <span className="font-semibold text-gray-700 line-clamp-2 leading-relaxed">
                                            {t('pages.training_details.criteria')}: {training.keyDetails.criteria}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-[#233480] font-bold">»</span>
                                    <p className="text-sm md:text-base text-gray-600">
                                        <span className="font-semibold text-gray-700">Syllabus:</span> {training.keyDetails.syllabus}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TrainingDetails;
