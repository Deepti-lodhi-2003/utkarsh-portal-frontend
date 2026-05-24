


import React, { useState, useRef } from 'react';
import Footer from '../../component/Footer';
import { Bold, Italic, Underline, List, ListOrdered, X, Loader2 } from 'lucide-react';
import { vendorAPI } from '../../services/api';

const PostServiceRequest = () => {
    const editorRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        skills: '',
        location: '',
        description: ''
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [errors, setErrors] = useState({
        title: '',
        skills: '',
        location: ''
    });

    const [touched, setTouched] = useState({
        title: false,
        skills: false,
        location: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value.trim()) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
        if (!formData[fieldName].trim()) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
            }));
        }
    };

    const formatText = (command) => {
        const editor = editorRef.current;
        if (!editor) return;
        editor.focus();
        document.execCommand(command, false, null);
        setFormData(prev => ({ ...prev, description: editor.innerHTML }));
    };

    const handleEditorInput = () => {
        const editor = editorRef.current;
        if (!editor) return;
        setFormData(prev => ({ ...prev, description: editor.innerHTML }));
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.title.trim()) { newErrors.title = 'Title is required'; isValid = false; }
        if (!formData.skills.trim()) { newErrors.skills = 'Skills is required'; isValid = false; }
        if (!formData.location.trim()) { newErrors.location = 'Location is required'; isValid = false; }

        setErrors(newErrors);
        setTouched({ title: true, skills: true, location: true });
        return isValid;
    };

    // ── Map form → API payload ──
    const buildPayload = () => {
        return {
            businessName: formData.title,
            businessType: 'service_provider',
            businessDescription: formData.description || '',
            services: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
            serviceAreas: [
                {
                    city: formData.location,
                    state: 'Madhya Pradesh'
                }
            ]
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = buildPayload();
            await vendorAPI.updateProfile(payload);

            setShowSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Reset form
            setFormData({ title: '', skills: '', location: '', description: '' });
            setErrors({ title: '', skills: '', location: '' });
            setTouched({ title: false, skills: false, location: false });
            if (editorRef.current) editorRef.current.innerHTML = '';

            setTimeout(() => setShowSuccess(false), 5000);
        } catch (err) {
            console.error('Service request error:', err);
            setSubmitError(err.response?.data?.message || 'Failed to submit service request');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <style>{`
                #description-editor { outline: none; }
                #description-editor:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
                #description-editor b, #description-editor strong { font-weight: bold; }
                #description-editor i, #description-editor em { font-style: italic; }
                #description-editor u { text-decoration: underline; }
                #description-editor ul { list-style-type: disc; padding-left: 20px; margin: 10px 0; }
                #description-editor ol { list-style-type: decimal; padding-left: 20px; margin: 10px 0; }
                #description-editor li { margin: 5px 0; }
            `}</style>

            {/* Banner */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-wider text-center px-4">Post Service / Vendor Request</h1>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20">

                {/* Success */}
                {showSuccess && (
                    <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded relative mb-6 flex items-start animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="mr-3 mt-0.5">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div className="flex-grow">
                            <span className="block sm:inline text-sm font-medium">
                                Your record has been saved. It will be published once verification is complete.
                            </span>
                        </div>
                        <button onClick={() => setShowSuccess(false)} className="absolute top-0 bottom-0 right-0 px-4 py-3 hover:bg-green-200 rounded-r transition-colors">
                            <X size={16} className="text-green-600" />
                        </button>
                    </div>
                )}

                {/* Error */}
                {submitError && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
                        <span>{submitError}</span>
                        <button onClick={() => setSubmitError('')}><X size={16} /></button>
                    </div>
                )}

                <div className="bg-white shadow-sm border-b-4 border-[#233480] overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} onBlur={() => handleBlur('title')} placeholder="Title"
                                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm transition-colors ${touched.title && errors.title
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-[#233480] focus:border-transparent'}`} />
                            {touched.title && errors.title && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Skills */}
                        <div>
                            <label htmlFor="skills" className="block text-sm font-bold text-gray-700 mb-2">
                                Skills <span className="text-red-500">*</span>
                            </label>
                            <input type="text" id="skills" name="skills" value={formData.skills} onChange={handleChange} onBlur={() => handleBlur('skills')} placeholder="Skills"
                                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm transition-colors ${touched.skills && errors.skills
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-[#233480] focus:border-transparent'}`} />
                            {touched.skills && errors.skills && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.skills}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-2">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} onBlur={() => handleBlur('location')} placeholder="Location"
                                className={`w-full px-4 py-2.5 border rounded-md focus:outline-none focus:ring-2 text-sm transition-colors ${touched.location && errors.location
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-[#233480] focus:border-transparent'}`} />
                            {touched.location && errors.location && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.location}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#233480]">
                                <div className="flex items-center gap-1 p-2 border-b border-gray-300 bg-gray-50">
                                    <button type="button" onClick={() => formatText('bold')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Bold"><Bold size={18} /></button>
                                    <button type="button" onClick={() => formatText('italic')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Italic"><Italic size={18} /></button>
                                    <button type="button" onClick={() => formatText('underline')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Underline"><Underline size={18} /></button>
                                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                    <button type="button" onClick={() => formatText('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Bullet List"><List size={18} /></button>
                                    <button type="button" onClick={() => formatText('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded text-gray-700 transition-colors" title="Numbered List"><ListOrdered size={18} /></button>
                                </div>
                                <div ref={editorRef} id="description-editor" contentEditable onInput={handleEditorInput}
                                    className="w-full px-4 py-4 min-h-[200px] max-h-[400px] focus:outline-none text-sm text-gray-700 overflow-y-auto"
                                    data-placeholder="Enter description..." suppressContentEditableWarning={true}></div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-center pt-4">
                            <button type="submit" disabled={submitting}
                                className={`px-10 py-3 bg-[#233480] text-white font-semibold rounded-md hover:bg-[#1a2660] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#233480] shadow-md ${submitting ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}>
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> Submitting...
                                    </span>
                                ) : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PostServiceRequest;