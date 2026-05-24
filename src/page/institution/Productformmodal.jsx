import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Loader2, Package, Tag, DollarSign, FileText } from 'lucide-react';

const ProductFormModal = ({ isOpen, onClose, onSubmit, product = null, loading = false }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        unit: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                price: product.price || '',
                unit: product.unit || ''
            });
            setImagePreview(product.image?.url || null);
        } else {
            resetForm();
        }
    }, [product, isOpen]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            price: '',
            unit: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setErrors({});
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, image: t('product_form.image_type_error') });
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: t('product_form.image_size_error') });
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setErrors({ ...errors, image: null });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t('product_form.error_name');
        if (!formData.category.trim()) newErrors.category = t('product_form.error_category');
        if (!product && !imageFile) newErrors.image = t('product_form.error_image');
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('category', formData.category);
        submitData.append('price', formData.price);
        submitData.append('unit', formData.unit);

        if (imageFile) {
            submitData.append('avatar', imageFile);
        }

        await onSubmit(submitData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1e2a5a] flex items-center gap-2">
                        <Package size={20} />
                        {product ? t('product_form.edit_title') : t('product_form.add_title')}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('product_form.image_label')} *
                        </label>
                        <div className="flex items-start gap-4">
                            {/* Preview */}
                            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Upload className="text-gray-400" size={32} />
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#233480] text-white text-sm font-semibold rounded hover:bg-[#1a2660] transition-colors">
                                    <Upload size={16} />
                                    {imagePreview ? t('product_form.change_image') : t('product_form.upload_image')}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={loading}
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-2">
                                    {t('product_form.image_hint')}
                                </p>
                                {errors.image && (
                                    <p className="text-xs text-red-500 mt-1">{errors.image}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('product_form.name_label')} *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('product_form.name_placeholder')}
                            className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-[#233480] focus:border-transparent text-sm`}
                            disabled={loading}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('product_form.category_label')} *
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder={t('product_form.category_placeholder')}
                                className={`w-full pl-10 pr-4 py-2.5 border ${errors.category ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-[#233480] focus:border-transparent text-sm`}
                                disabled={loading}
                            />
                        </div>
                        {errors.category && (
                            <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                        )}
                    </div>

                    {/* Price & Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('product_form.price_label')}
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233480] focus:border-transparent text-sm"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {t('product_form.unit_label')}
                            </label>
                            <input
                                type="text"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder={t('product_form.unit_placeholder')}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233480] focus:border-transparent text-sm"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('product_form.description_label')}
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder={t('product_form.description_placeholder')}
                                rows={4}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#233480] focus:border-transparent text-sm resize-none"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            {t('product_form.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-[#233480] text-white font-semibold rounded-lg hover:bg-[#1a2660] disabled:opacity-50 flex items-center gap-2 transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {product ? t('product_form.updating') : t('product_form.adding')}
                                </>
                            ) : (
                                <>{product ? t('product_form.update_button') : t('product_form.add_button')}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;




