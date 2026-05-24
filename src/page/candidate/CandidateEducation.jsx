import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Check, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const CandidateEducation = () => {
    const { t } = useTranslation();
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        type: '',
        institute: '',
        course: '',
        stream: '',
        passOutYear: new Date().getFullYear().toString(),
        result: ''
    });

    // ─── FETCH EDUCATION ───
    useEffect(() => {
        fetchEducation();
    }, []);

    const fetchEducation = async () => {
        try {
            setLoading(true);
            const res = await api.get('/candidates/profile');
            const profile = res.data.data;
            setEducations(profile.education || []);
        } catch (error) {
            console.error('Failed to load education:', error);
            setErrorMsg(t('pages.candidate_education.load_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ─── MAP TYPE TO DEGREE ───
    const mapTypeToDegree = (type) => {
        const map = {
            'Graduation': 'B.Tech',
            'Post Graduation': 'M.Tech',
            '12th / Diploma': '12th',
            '10th': '10th'
        };
        return map[type] || type;
    };

    // ─── MAP DEGREE TO TRANSLATION KEY (for table display) ───
    const getDegreeTypeKey = (degree) => {
        if (!degree) return 'na';
        const d = degree.toLowerCase();
        if (d.includes('10th') || d === '10th') return 'option_10th';
        if (d.includes('12th') || d.includes('diploma')) return 'option_12th_diploma';
        if (d.includes('m.tech') || d.includes('mba') || d.includes('m.sc') || d.includes('post')) return 'option_post_graduation';
        return 'option_graduation';
    };

    // ─── ADD EDUCATION (API) ───
    const handleAdd = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.type || !formData.institute) {
            setErrorMsg(t('pages.candidate_education.fill_required'));
            return;
        }

        try {
            setSaving(true);
            const payload = {
                degree: mapTypeToDegree(formData.type),
                field: formData.stream || formData.course || '',
                institution: formData.institute,
                board: '',
                percentage: formData.result ? parseFloat(formData.result) : undefined,
                passingYear: parseInt(formData.passOutYear),
                isCurrent: false
            };

            const res = await api.post('/candidates/education', payload);

            // API returns updated education array
            setEducations(res.data.data);

            setSuccessMsg(t('pages.candidate_education.add_success'));
            setShowSuccessAlert(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Reset form
            setFormData(prev => ({
                ...prev,
                type: '',
                institute: '',
                course: '',
                stream: '',
                result: ''
            }));
        } catch (error) {
            console.error('Add education failed:', error);
            setErrorMsg(error.response?.data?.message || t('pages.candidate_education.add_failed'));
        } finally {
            setSaving(false);
        }
    };

    // ─── DELETE EDUCATION (API) ───
    const handleDelete = async (id) => {
        try {
            setDeletingId(id);
            await api.delete(`/candidates/education/${id}`);

            setEducations(prev => prev.filter(edu => edu._id !== id));
            setSuccessMsg(t('pages.candidate_education.delete_success'));
            setShowSuccessAlert(true);
        } catch (error) {
            console.error('Delete failed:', error);
            setErrorMsg(error.response?.data?.message || t('pages.candidate_education.delete_failed'));
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#233480]" size={40} />
            </div>
        );
    }

    return (
        <div className="text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-md">
                    <div className="flex items-center gap-2 text-[14px]">
                        <Check size={16} className="text-[#155724] stroke-[3px]" />
                        {successMsg}
                    </div>
                    <button onClick={() => setShowSuccessAlert(false)} className="text-[#155724] hover:opacity-70 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
                <div className="mb-6 flex items-center justify-between bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-md">
                    <div className="text-[14px]">{errorMsg}</div>
                    <button onClick={() => setErrorMsg('')} className="text-[#721c24] hover:opacity-70">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Education Table */}
            <div className="overflow-x-auto mb-8 border border-gray-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#233480] text-white uppercase text-[10px] md:text-[12px] tracking-wider">
                        <tr>
                            <th className="px-1 md:px-6 py-3 md:py-4 font-bold">{t('pages.candidate_education.table_type')}</th>
                            <th className="px-1 md:px-6 py-3 md:py-4 font-bold">{t('pages.candidate_education.table_institute')}</th>
                            <th className="px-1 md:px-6 py-3 md:py-4 font-bold hidden md:table-cell">{t('pages.candidate_education.table_course')}</th>
                            <th className="px-1 md:px-6 py-3 md:py-4 font-bold hidden lg:table-cell">{t('pages.candidate_education.table_stream')}</th>
                            <th className="px-1 md:px-6 py-3 md:py-4 font-bold">{t('pages.candidate_education.table_pass_out')}</th>
                            <th className="px-1 md:px-6 py-3 md:py-4 font-bold hidden sm:table-cell">{t('pages.candidate_education.table_result')}</th>
                            <th className="px-1 md:px-6 py-3 md:py-4 font-bold text-center">{t('pages.candidate_education.table_action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {educations.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                                    {t('pages.candidate_education.no_education')}
                                </td>
                            </tr>
                        ) : (
                            educations.map((edu) => (
                                <tr key={edu._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-1 md:px-6 py-3 md:py-4 text-gray-600 font-medium text-[12px] md:text-sm">
                                        {t('pages.candidate_education.' + getDegreeTypeKey(edu.degree))}
                                    </td>
                                    <td className="px-1 md:px-6 py-3 md:py-4 text-gray-600 text-[12px] md:text-sm">
                                        {edu.institution || t('pages.candidate_education.na')}
                                    </td>
                                    <td className="px-1 md:px-6 py-3 md:py-4 text-gray-600 text-[12px] md:text-sm hidden md:table-cell">
                                        {edu.degree || t('pages.candidate_education.na')}
                                    </td>
                                    <td className="px-1 md:px-6 py-3 md:py-4 text-gray-600 text-[12px] md:text-sm hidden lg:table-cell">
                                        {edu.field || t('pages.candidate_education.na')}
                                    </td>
                                    <td className="px-1 md:px-6 py-3 md:py-4 text-gray-600 text-[12px] md:text-sm">
                                        {edu.passingYear || t('pages.candidate_education.na')}
                                    </td>
                                    <td className="px-1 md:px-6 py-3 md:py-4 text-gray-600 text-[12px] md:text-sm hidden sm:table-cell">
                                        {edu.percentage || edu.cgpa || t('pages.candidate_education.na')}
                                    </td>
                                    <td className="px-1 md:px-6 py-3 md:py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(edu._id)}
                                            disabled={deletingId === edu._id}
                                            className="text-red-500 hover:text-red-700 transition-colors inline-block disabled:opacity-50"
                                        >
                                            {deletingId === edu._id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Education Form */}
            <form onSubmit={handleAdd} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_education.label_type')} <span className="text-red-500">*</span></label>
                        <select name="type" value={formData.type} onChange={handleInputChange}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors appearance-none">
                            <option value="">{t('pages.candidate_education.select_education')}</option>
                            <option value="Graduation">{t('pages.candidate_education.option_graduation')}</option>
                            <option value="Post Graduation">{t('pages.candidate_education.option_post_graduation')}</option>
                            <option value="12th / Diploma">{t('pages.candidate_education.option_12th_diploma')}</option>
                            <option value="10th">{t('pages.candidate_education.option_10th')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_education.label_institute')} <span className="text-red-500">*</span></label>
                        <input type="text" name="institute" placeholder={t('pages.candidate_education.placeholder_institute')} value={formData.institute} onChange={handleInputChange}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                    </div>
                    <div>
                        <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_education.label_course')}</label>
                        <input type="text" name="course" placeholder={t('pages.candidate_education.placeholder_course')} value={formData.course} onChange={handleInputChange}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                    </div>
                    <div>
                        <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_education.label_stream')}</label>
                        <input type="text" name="stream" placeholder={t('pages.candidate_education.placeholder_stream')} value={formData.stream} onChange={handleInputChange}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                    </div>
                    <div>
                        <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_education.label_passout_year')}</label>
                        <div className="flex">
                            <div className="bg-[#233480] text-white px-2 md:px-4 py-2 md:py-2.5 rounded-l font-bold text-[10px] md:text-sm flex items-center">{t('pages.candidate_education.year')}</div>
                            <input type="text" name="passOutYear" value={formData.passOutYear} onChange={handleInputChange}
                                className="w-full px-2 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-r text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[12px] md:text-sm font-bold text-[#1e2a5a] mb-1.5 md:mb-2">{t('pages.candidate_education.label_result')}</label>
                        <input type="text" name="result" placeholder={t('pages.candidate_education.placeholder_result')} value={formData.result} onChange={handleInputChange}
                            className="w-full px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded text-gray-600 text-sm focus:outline-none focus:border-[#233480] transition-colors" />
                    </div>
                </div>

                <div className="flex justify-center pb-20 pt-10 mt-6">
                    <button type="submit" disabled={saving}
                        className={`w-full md:w-auto bg-[#233480] hover:bg-[#1e2a5a] text-white font-bold py-4 md:py-3 px-10 rounded shadow-xl transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        {saving ? t('pages.candidate_education.adding') : t('pages.candidate_education.add_education')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CandidateEducation;