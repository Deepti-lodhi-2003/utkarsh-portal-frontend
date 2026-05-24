import React, { useState, useEffect } from 'react';
import { FileText, Check, X, Paperclip, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const CandidateResume = () => {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentResume, setCurrentResume] = useState(null);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(true);

    // ─── FETCH CURRENT RESUME ───
    useEffect(() => {
        fetchResume();
    }, []);

    const fetchResume = async () => {
        try {
            const res = await api.get('/candidates/profile');
            const profile = res.data.data;
            if (profile.resume?.url) {
                setCurrentResume(profile.resume);
            }
        } catch (error) {
            console.error('Failed to load resume:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (3MB)
            if (file.size > 3 * 1024 * 1024) {
                setError('File size exceeds 3MB limit');
                return;
            }

            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            if (!allowedTypes.includes(file.type)) {
                setError('Only PDF, DOC, DOCX files are allowed');
                return;
            }

            setSelectedFile(file);
            setError('');
            setShowSuccessAlert(false);
        }
    };

    // ─── UPLOAD RESUME (API) ───
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError(t('pages.candidate_resume.choose_resume'));
            setShowSuccessAlert(false);
            return;
        }

        try {
            setIsUpdating(true);
            setError('');

            const formData = new FormData();
            formData.append('resume', selectedFile);

            const res = await api.post('/candidates/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setCurrentResume(res.data.data);
            setShowSuccessAlert(true);
            setSelectedFile(null);

            // Reset file input
            const fileInput = document.getElementById('resume-upload-field');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Upload failed:', error);
            setError(error.response?.data?.message || t('pages.candidate_resume.upload_failed'));
        } finally {
            setIsUpdating(false);
        }
    };

    // ─── VIEW / DOWNLOAD RESUME ───
    const handleDownload = () => {
        if (currentResume?.url) {
            window.open(currentResume.url, '_blank');
        }
    };

    // ─── DELETE RESUME (API) ───
    const handleDeleteResume = async () => {
        try {
            await api.delete('/candidates/resume');
            setCurrentResume(null);
            setShowSuccessAlert(true);
        } catch (error) {
            setError(error.response?.data?.message || t('pages.candidate_resume.delete_failed'));
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
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto py-4">
            {/* Success Alert */}
            {showSuccessAlert && (
                <div className="mb-6 flex items-center justify-between bg-[#d4edda] border border-[#c3e6cb] text-[#155724] px-4 py-3 rounded-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-[14px]">
                        <Check size={16} className="text-[#155724] stroke-[3px]" />
                        {t('pages.candidate_resume.update_success')}
                    </div>
                    <button onClick={() => setShowSuccessAlert(false)} className="text-[#155724] hover:opacity-70 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="flex flex-col items-center gap-6">
                {/* View Resume Link */}
                {currentResume?.url ? (
                    <div className="flex items-center gap-4">
                        <button onClick={handleDownload}
                            className="flex items-center gap-2 text-[#233480] hover:text-[#1a2660] transition-colors text-sm font-medium">
                            <FileText size={18} />
                            {t('pages.candidate_resume.view_resume')}
                        </button>
                        <button onClick={handleDeleteResume}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors text-xs font-medium">
                            <X size={14} />
                            {t('pages.candidate_resume.remove')}
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">{t('pages.candidate_resume.no_resume')}</p>
                )}

                {/* Current resume file name */}
                {currentResume?.filename && (
                    <p className="text-xs text-gray-500">
                        {t('pages.candidate_resume.current')}: <span className="font-medium">{currentResume.filename}</span>
                    </p>
                )}

                <div className="w-full">
                    <h2 className="text-xl font-bold text-[#1e2a5a] mb-2">{t('pages.candidate_resume.upload_title')}</h2>

                    {error && (
                        <p className="text-red-500 text-sm mb-4 animate-in fade-in duration-300">{error}</p>
                    )}

                    <form onSubmit={handleUpdate} className="flex flex-row items-center justify-center gap-0 mt-4 max-w-md mx-auto">
                        <div className="relative flex-shrink-0">
                            <input type="file" id="resume-upload-field" className="hidden"
                                accept=".pdf,.doc,.docx" onChange={handleFileChange} />

                            <label htmlFor="resume-upload-field"
                                className="flex items-center gap-2 px-3 py-2 md:py-3 bg-white border border-gray-200 rounded-l-md text-gray-400 cursor-pointer hover:bg-gray-50 transition-all text-sm w-[200px] border-r-0">
                                <Paperclip size={16} className="rotate-45" />
                                <span className="truncate max-w-[160px] inline-block align-middle">
                                    {selectedFile ? (
                                        <span className="text-red-500 font-medium">
                                            {t('pages.candidate_resume.choose_file')} <span className="text-xs text-gray-600">{selectedFile.name}</span>
                                        </span>
                                    ) : t('pages.candidate_resume.choose_file')}
                                </span>
                            </label>
                        </div>

                        <button type="submit" disabled={isUpdating}
                            className={`px-4 md:px-8 py-3 bg-[#233480] text-white font-bold rounded-r-md hover:bg-[#1a2660] transition-all text-[10px] md:text-sm uppercase tracking-wide shadow-md flex-shrink-0 ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {isUpdating ? (
                                <span className="flex items-center gap-1">
                                    <Loader2 size={14} className="animate-spin" /> {t('pages.candidate_resume.updating')}
                                </span>
                            ) : t('pages.candidate_resume.update')}
                        </button>
                    </form>

                    <p className="text-[11px] text-gray-500 font-medium mt-6 tracking-wide">
                        {t('pages.candidate_resume.file_info')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CandidateResume;