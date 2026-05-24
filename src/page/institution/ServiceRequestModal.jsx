// src/page/institution/services/ServiceRequestModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

const ServiceRequestModal = ({ isOpen, onClose, onSubmit, service, loading }) => {
    const { t } = useTranslation();
    const fileRef = useRef(null);
    const [form, setForm] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        unit: ''
    });
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (service) {
            setForm({
                name: service.name || '',
                category: service.category || '',
                description: service.description || '',
                price: service.price || '',
                unit: service.unit || ''
            });
            setPreview(service.image?.url || null);
            setImageFile(null);
        } else {
            setForm({ name: '', category: '', description: '', price: '', unit: '' });
            setPreview(null);
            setImageFile(null);
        }
        setErrors({});
    }, [service, isOpen]);

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = t('service_request_modal.error_name');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: t('service_request_modal.error_image_size') }));
            return;
        }

        setImageFile(file);
        setPreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, image: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const formData = new FormData();
        formData.append('name', form.name.trim());
        if (form.category) formData.append('category', form.category);
        if (form.description) formData.append('description', form.description.trim());
        if (form.price) formData.append('price', form.price);
        if (form.unit) formData.append('unit', form.unit);
        if (imageFile) formData.append('image', imageFile);

        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-[#1e2a5a]">
                        {service ? t('service_request_modal.edit_title') : t('service_request_modal.add_title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t('service_request_modal.name_label')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.name}
                            onChange={(e) => {
                                setForm(p => ({ ...p, name: e.target.value }));
                                if (errors.name) setErrors(p => ({ ...p, name: '' }));
                            }}
                            placeholder={t('service_request_modal.name_placeholder')}
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none 
                                       focus:ring-2 focus:ring-[#233480] ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t('service_request_modal.category_label')}
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-[#233480] bg-white"
                        >
                            <option value="">{t('service_request_modal.select_category')}</option>
                            <option value="IT Services">IT Services</option>
                            <option value="Construction">Construction</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Security">Security</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Catering">Catering</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Price & Unit */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {t('service_request_modal.price_label')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.price}
                                onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-[#233480]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                {t('service_request_modal.unit_label')}
                            </label>
                            <select
                                value={form.unit}
                                onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                           focus:outline-none focus:ring-2 focus:ring-[#233480] bg-white"
                            >
                                <option value="">{t('service_request_modal.select_unit')}</option>
                                <option value="per hour">Per Hour</option>
                                <option value="per day">Per Day</option>
                                <option value="per project">Per Project</option>
                                <option value="per unit">Per Unit</option>
                                <option value="per month">Per Month</option>
                                <option value="per year">Per Year</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t('service_request_modal.description_label')}
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                            placeholder={t('service_request_modal.description_placeholder')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
                                       focus:outline-none focus:ring-2 focus:ring-[#233480] resize-none"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {t('service_request_modal.image_label')}
                        </label>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {preview ? (
                            <div className="relative w-full h-32 rounded-lg border overflow-hidden">
                                <img src={preview} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreview(null);
                                        setImageFile(null);
                                        if (fileRef.current) fileRef.current.value = '';
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 
                                               rounded-full hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg 
                                           text-gray-400 hover:border-[#233480] hover:text-[#233480] 
                                           transition-colors flex flex-col items-center gap-1"
                            >
                                <Upload size={20} />
                                <span className="text-xs">{t('service_request_modal.upload_text')}</span>
                            </button>
                        )}
                        {errors.image && (
                            <p className="text-xs text-red-500 mt-1">{errors.image}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm 
                                       font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            {t('service_request_modal.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.name.trim()}
                            className="flex-1 px-4 py-2.5 bg-[#233480] text-white rounded-md text-sm 
                                       font-semibold hover:bg-[#1a2660] disabled:opacity-50 
                                       flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={14} className="animate-spin" /> {t('service_request_modal.saving')}</>
                            ) : (
                                service ? t('service_request_modal.update_button') : t('service_request_modal.add_button')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceRequestModal;