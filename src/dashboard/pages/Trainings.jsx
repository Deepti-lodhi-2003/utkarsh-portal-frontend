import { useState, useEffect } from 'react'
import { trainingsAPI, institutionsAPI } from '../../../src/services/api'
import {
    HiOutlineCheck,
    HiOutlineEye,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineFilter,
    HiOutlineX,
    HiOutlinePhotograph,
    HiOutlineRefresh,
    HiOutlineUpload,
    HiOutlineSearch
} from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

const Trainings = () => {
    const { t } = useTranslation()
    const [trainings, setTrainings] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({})
    const [selectedTraining, setSelectedTraining] = useState(null)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [bannerFile, setBannerFile] = useState(null)
    const [bannerPreview, setBannerPreview] = useState(null)
    const [statusFilter, setStatusFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [newStatus, setNewStatus] = useState('')
    const [uploadingBanner, setUploadingBanner] = useState(false)

    const [isAdmin, setIsAdmin] = useState(false)
    const [institutions, setInstitutions] = useState([])

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        institution: '',
        category: 'it_software',
        mode: 'offline',
        duration: { value: '', unit: 'days' },
        startDate: '',
        totalSeats: '',
        fees: { amount: '', isFree: false },
        venue: { city: '', state: 'Madhya Pradesh' }
    })

    useEffect(() => {
        const role = localStorage.getItem('role')
        setIsAdmin(role === 'admin')
        if (role === 'admin') {
            fetchInstitutions()
        }
        fetchTrainings()
    }, [page, statusFilter])

    const fetchInstitutions = async () => {
        try {
            const res = await institutionsAPI.getAll({ limit: 100 })
            setInstitutions(res.data.data.institutions)
        } catch (error) {
            console.error('Failed to fetch institutions', error)
        }
    }

    const fetchTrainings = async () => {
        setLoading(true)
        try {
            const params = { page, limit: 10 }
            if (statusFilter) params.status = statusFilter
            if (searchQuery.trim()) params.q = searchQuery.trim()
            const res = await trainingsAPI.adminGetAll(params)
            setTrainings(res.data.data.trainings)
            setPagination(res.data.data.pagination)
        } catch (error) {
            console.error('Fetch error:', error)
            alert(t('trainings_management.alerts.fetch_error'))
        }
        setLoading(false)
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPage(1)
        fetchTrainings()
    }

    const viewTrainingDetails = async (id) => {
        try {
            const res = await trainingsAPI.adminGetById(id)
            setSelectedTraining(res.data.data.training)
            setShowDetailsModal(true)
        } catch (error) {
            alert(t('trainings_management.alerts.details_error'))
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            institution: '',
            category: 'it_software',
            mode: 'offline',
            duration: { value: '', unit: 'days' },
            startDate: '',
            totalSeats: '',
            fees: { amount: '', isFree: false },
            venue: { city: '', state: 'Madhya Pradesh' }
        })
        setBannerFile(null)
        setBannerPreview(null)
    }

    const openCreateModal = () => {
        resetForm()
        setShowCreateModal(true)
    }

    const openEditModal = (training) => {
        setSelectedTraining(training)
        setFormData({
            title: training.title || '',
            description: training.description || '',
            institution: training.institution?._id || '',
            category: training.category || 'it_software',
            mode: training.mode || 'offline',
            duration: training.duration || { value: '', unit: 'days' },
            startDate: training.startDate ? training.startDate.split('T')[0] : '',
            totalSeats: training.totalSeats || '',
            fees: training.fees || { amount: '', isFree: false },
            venue: training.venue || { city: '', state: 'Madhya Pradesh' }
        })
        setBannerFile(null)
        setBannerPreview(training.banner?.url || null)
        setShowEditModal(true)
    }

    const openStatusModal = (training) => {
        setSelectedTraining(training)
        setNewStatus('')
        setShowStatusModal(true)
    }

    const handleBannerChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                alert(t('trainings_management.alerts.banner_size_error'))
                return
            }
            if (!file.type.startsWith('image/')) {
                alert(t('trainings_management.alerts.banner_type_error'))
                return
            }
            setBannerFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setBannerPreview(reader.result)
            reader.readAsDataURL(file)
        }
    }

    const removeBanner = () => {
        setBannerFile(null)
        setBannerPreview(null)
    }

    const uploadBanner = async (trainingId) => {
        if (!bannerFile) return true
        setUploadingBanner(true)
        try {
            const fd = new FormData()
            fd.append('banner', bannerFile)
            await trainingsAPI.adminUploadBanner(trainingId, fd)
            return true
        } catch (error) {
            console.error('Banner upload error:', error.response?.data)
            alert(t('trainings_management.alerts.banner_upload_error') + ': ' + (error.response?.data?.message || t('trainings_management.alerts.unknown_error')))
            return false
        } finally {
            setUploadingBanner(false)
        }
    }

    const preparePayload = () => ({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        mode: formData.mode,
        duration: {
            value: Number(formData.duration.value) || 0,
            unit: formData.duration.unit
        },
        startDate: formData.startDate,
        totalSeats: Number(formData.totalSeats) || 0,
        fees: {
            amount: formData.fees.isFree ? 0 : (Number(formData.fees.amount) || 0),
            isFree: formData.fees.isFree
        },
        venue: {
            city: formData.venue.city,
            state: formData.venue.state
        },
        institution: formData.institution
    })

    const handleCreate = async (e) => {
        e.preventDefault()
        setActionLoading(true)
        try {
            const payload = preparePayload()
            const res = await trainingsAPI.adminCreate(payload)
            const newTraining = res.data.data.training

            if (bannerFile && newTraining._id) {
                await uploadBanner(newTraining._id)
            }

            alert(t('trainings_management.alerts.create_success'))
            setShowCreateModal(false)
            resetForm()
            fetchTrainings()
        } catch (error) {
            console.error('Create error:', error.response?.data)
            alert(error.response?.data?.message || t('trainings_management.alerts.create_error'))
        }
        setActionLoading(false)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setActionLoading(true)
        try {
            const payload = preparePayload()
            await trainingsAPI.adminUpdate(selectedTraining._id, payload)

            if (bannerFile) {
                await uploadBanner(selectedTraining._id)
            }

            alert(t('trainings_management.alerts.update_success'))
            setShowEditModal(false)
            resetForm()
            fetchTrainings()
        } catch (error) {
            console.error('Update error:', error.response?.data)
            alert(error.response?.data?.message || t('trainings_management.alerts.update_error'))
        }
        setActionLoading(false)
    }

    const handleStatusUpdate = async () => {
        if (!newStatus) {
            alert(t('trainings_management.alerts.select_status'))
            return
        }
        setActionLoading(true)
        try {
            await trainingsAPI.updateStatus(selectedTraining._id, newStatus)
            alert(t('trainings_management.alerts.status_success'))
            setShowStatusModal(false)
            fetchTrainings()
        } catch (error) {
            alert(error.response?.data?.message || t('trainings_management.alerts.status_error'))
        }
        setActionLoading(false)
    }

    const handleApprove = async (id) => {
        setActionLoading(true)
        try {
            await trainingsAPI.approve(id)
            alert(t('trainings_management.alerts.approve_success'))
            fetchTrainings()
        } catch (error) {
            alert(error.response?.data?.message || t('trainings_management.alerts.approve_error'))
        }
        setActionLoading(false)
    }

    const openDeleteModal = (training) => {
        setSelectedTraining(training)
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        setActionLoading(true)
        try {
            await trainingsAPI.adminDelete(selectedTraining._id)
            alert(t('trainings_management.alerts.delete_success'))
            setShowDeleteModal(false)
            setSelectedTraining(null)
            fetchTrainings()
        } catch (error) {
            alert(error.response?.data?.message || t('trainings_management.alerts.delete_error'))
        }
        setActionLoading(false)
    }

    const statusColors = {
        upcoming: 'bg-blue-100 text-blue-700',
        ongoing: 'bg-green-100 text-green-700',
        completed: 'bg-gray-100 text-gray-700',
        cancelled: 'bg-red-100 text-red-700'
    }

    const allowedTransitions = {
        upcoming: ['ongoing', 'cancelled'],
        ongoing: ['completed', 'cancelled'],
        completed: [],
        cancelled: ['upcoming']
    }

    return (
        <div className="min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('trainings_management.title')}</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">{t('trainings_management.subtitle')}</p>
                </div>
                <button onClick={openCreateModal} className="px-4 py-2.5 bg-[#233480] text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium w-full sm:w-auto">
                    <HiOutlinePlus className="w-5 h-5" />
                    {t('trainings_management.create_training')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('trainings_management.search_placeholder')}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                    </form>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm w-full sm:w-44"
                    >
                        <option value="">{t('trainings_management.filters.all_status')}</option>
                        <option value="upcoming">{t('trainings_management.filters.upcoming')}</option>
                        <option value="ongoing">{t('trainings_management.filters.ongoing')}</option>
                        <option value="completed">{t('trainings_management.filters.completed')}</option>
                        <option value="cancelled">{t('trainings_management.filters.cancelled')}</option>
                    </select>
                    <button onClick={fetchTrainings} className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                        title={t('trainings_management.filters.refresh')}>
                        <HiOutlineRefresh className="w-4 h-4" />
                        <span className="sm:hidden">{t('trainings_management.filters.refresh')}</span>
                    </button>
                </div>
            </div>

            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('trainings_management.table.training')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('trainings_management.table.institution')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('trainings_management.table.category')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('trainings_management.table.status')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('trainings_management.table.enrollments')}</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">{t('trainings_management.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                            <p className="text-gray-500 text-sm">{t('trainings_management.table.loading')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : trainings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <HiOutlineFilter className="w-12 h-12 text-gray-300" />
                                            <p className="text-gray-500">{t('trainings_management.table.no_data')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                trainings.map((training) => (
                                    <tr key={training._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {(training.banner?.url || training.banner) ? (
                                                    <img src={training.banner?.url || training.banner} alt="" className="w-12 h-12 rounded-lg object-cover border flex-shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                        <HiOutlinePhotograph className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">{training.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {training.startDate ? new Date(training.startDate).toLocaleDateString() : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {training.institution?.organizationName || <span className="text-gray-400 italic">{t('trainings_management.table.admin_user')}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 capitalize text-sm">
                                            {training.category?.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <button onClick={() => openStatusModal(training)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 w-fit ${statusColors[training.status] || 'bg-gray-100'}`}
                                                    title={t('trainings_management.status.change_tooltip')}>
                                                    {t(`trainings_management.filters.${training.status}`) || training.status} ✎
                                                </button>
                                                {!training.isApproved && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 w-fit">
                                                        {t('trainings_management.status.pending')}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">
                                            {training.enrollmentCount || 0} / {training.totalSeats || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {!training.isApproved && (
                                                    <button onClick={() => handleApprove(training._id)} disabled={actionLoading}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50" title={t('trainings_management.buttons.approve')}>
                                                        <HiOutlineCheck className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button onClick={() => viewTrainingDetails(training._id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title={t('trainings_management.buttons.view')}>
                                                    <HiOutlineEye className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => openEditModal(training)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title={t('trainings_management.buttons.edit')}>
                                                    <HiOutlinePencil className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => openDeleteModal(training)} disabled={actionLoading}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" title={t('trainings_management.buttons.delete')}>
                                                    <HiOutlineTrash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="lg:hidden space-y-3">
                {loading ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">{t('trainings_management.table.loading')}</p>
                    </div>
                ) : trainings.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                        <HiOutlineFilter className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">{t('trainings_management.table.no_data')}</p>
                    </div>
                ) : (
                    trainings.map((training) => (
                        <div key={training._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                            <div className="relative">
                                {(training.banner?.url || training.banner) ? (
                                    <img src={training.banner?.url || training.banner} alt="" className="w-full h-32 object-cover" />
                                ) : (
                                    <div className="w-full h-20 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                                        <HiOutlinePhotograph className="w-8 h-8 text-blue-300" />
                                    </div>
                                )}

                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button onClick={() => openStatusModal(training)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[training.status] || 'bg-gray-100'} shadow-sm`}>
                                        {t(`trainings_management.filters.${training.status}`) || training.status} ✎
                                    </button>
                                </div>
                                {!training.isApproved && (
                                    <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 shadow-sm">
                                        {t('trainings_management.status.pending')}
                                    </span>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-2">
                                    {training.title}
                                </h3>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded capitalize">
                                        {training.category?.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded capitalize">
                                        {t(`trainings_management.options.${training.mode}`) || training.mode}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('trainings_management.table.institution')}</p>
                                        <p className="text-gray-700 font-medium truncate">
                                            {training.institution?.organizationName || t('trainings_management.table.admin_user')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('trainings_management.modals.start_date_label')}</p>
                                        <p className="text-gray-700 font-medium">
                                            {training.startDate ? new Date(training.startDate).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('trainings_management.table.enrollments')}</p>
                                        <p className="text-gray-700 font-medium">
                                            {training.enrollmentCount || 0} / {training.totalSeats || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">{t('trainings_management.table.fees')}</p>
                                        <p className="text-gray-700 font-medium">
                                            {training.fees?.isFree ? t('trainings_management.options.free') : `₹${training.fees?.amount?.toLocaleString() || 0}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    {!training.isApproved && (
                                        <button onClick={() => handleApprove(training._id)} disabled={actionLoading}
                                            className="flex-1 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-1">
                                            <HiOutlineCheck className="w-4 h-4" /> {t('trainings_management.buttons.approve')}
                                        </button>
                                    )}
                                    <button onClick={() => viewTrainingDetails(training._id)}
                                        className="flex-1 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium flex items-center justify-center gap-1">
                                        <HiOutlineEye className="w-4 h-4" /> {t('trainings_management.buttons.view')}
                                    </button>
                                    <button onClick={() => openEditModal(training)}
                                        className="flex-1 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium flex items-center justify-center gap-1">
                                        <HiOutlinePencil className="w-4 h-4" /> {t('trainings_management.buttons.edit')}
                                    </button>
                                    <button onClick={() => openDeleteModal(training)} disabled={actionLoading}
                                        className="py-2 px-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 flex items-center justify-center">
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {pagination.pages > 1 && (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-sm text-gray-600">
                        {t('common.pagination_info', { page, pages: pagination.pages, total: pagination.total })}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="flex-1 sm:flex-none px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 text-sm">
                            {t('trainings_management.buttons.previous')}
                        </button>
                        <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                            className="flex-1 sm:flex-none px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 text-sm">
                            {t('trainings_management.buttons.next')}
                        </button>
                    </div>
                </div>
            )}

            {showStatusModal && selectedTraining && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-5 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{t('trainings_management.modals.status_title')}</h2>
                            <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <HiOutlineX className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        <div className="p-5 sm:p-6">
                            <p className="text-gray-600 mb-4 text-sm sm:text-base">
                                <span className="font-semibold text-gray-800">{selectedTraining.title}</span>
                            </p>
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">{t('trainings_management.modals.current_status')}</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedTraining.status] || 'bg-gray-100'}`}>
                                    {t(`trainings_management.filters.${selectedTraining.status}`) || selectedTraining.status}
                                </span>
                            </div>
                            <div className="mb-6">
                                <p className="text-sm font-medium text-gray-700 mb-2">{t('trainings_management.modals.change_to')}</p>
                                {(allowedTransitions[selectedTraining.status] || []).length === 0 ? (
                                    <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                        {t('trainings_management.modals.no_transitions')} '{selectedTraining.status}'
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {(allowedTransitions[selectedTraining.status] || []).map((s) => (
                                            <button key={s} onClick={() => setNewStatus(s)}
                                                className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium capitalize transition-all flex-1 min-w-[120px] ${newStatus === s
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}>
                                                {t(`trainings_management.filters.${s}`) || s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowStatusModal(false)} disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">{t('trainings_management.buttons.cancel')}</button>
                                <button onClick={handleStatusUpdate}
                                    disabled={actionLoading || !newStatus || (allowedTransitions[selectedTraining.status] || []).length === 0}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 text-sm">
                                    {actionLoading ? t('trainings_management.buttons.updating') : t('trainings_management.buttons.update_status')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-200 flex justify-between items-center z-10">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                                {showCreateModal ? t('trainings_management.modals.create_title') : t('trainings_management.modals.edit_title')}
                            </h2>
                            <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm() }}
                                className="p-2 hover:bg-gray-100 rounded-lg">
                                <HiOutlineX className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-5 sm:p-6 space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('trainings_management.modals.banner_label')}</label>
                                {bannerPreview ? (
                                    <div className="relative">
                                        <img src={bannerPreview} alt="Preview"
                                            className="w-full h-36 sm:h-48 object-cover rounded-xl border-2 border-gray-200" />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <label className="p-2 bg-white/90 hover:bg-white rounded-lg cursor-pointer shadow-sm" title={t('trainings_management.modals.change')}>
                                                <HiOutlineUpload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                                            </label>
                                            <button type="button" onClick={removeBanner}
                                                className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm" title={t('trainings_management.modals.remove')}>
                                                <HiOutlineX className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                                            </button>
                                        </div>
                                        {bannerFile && (
                                            <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                                                ✓ {t('trainings_management.modals.new_file')}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <label className="w-full h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <HiOutlinePhotograph className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500 font-medium">{t('trainings_management.modals.upload_tip')}</span>
                                        <span className="text-xs text-gray-400 mt-1">{t('trainings_management.modals.upload_hint')}</span>
                                        <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {isAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.institution_label')} *</label>
                                    <select
                                        value={formData.institution}
                                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        required
                                    >
                                        <option value="">{t('trainings_management.modals.select_institution')}</option>
                                        {institutions.map(inst => (
                                            <option key={inst._id} value={inst._id}>
                                                {inst.organizationName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.title_label')} *</label>
                                <input type="text" value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder={t('trainings_management.modals.title_placeholder')} required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.description_label')} *</label>
                                <textarea value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3} className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder={t('trainings_management.modals.description_placeholder')} required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.category_label')}</label>
                                    <select value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                        <option value="it_software">{t('trainings_management.options.it_software')}</option>
                                        <option value="manufacturing">{t('trainings_management.options.manufacturing')}</option>
                                        <option value="healthcare">{t('trainings_management.options.healthcare')}</option>
                                        <option value="retail">{t('trainings_management.options.retail')}</option>
                                        <option value="hospitality">{t('trainings_management.options.hospitality')}</option>
                                        <option value="construction">{t('trainings_management.options.construction')}</option>
                                        <option value="agriculture">{t('trainings_management.options.agriculture')}</option>
                                        <option value="other">{t('trainings_management.options.other')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.mode_label')}</label>
                                    <select value={formData.mode}
                                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                        <option value="online">{t('trainings_management.options.online')}</option>
                                        <option value="offline">{t('trainings_management.options.offline')}</option>
                                        <option value="hybrid">{t('trainings_management.options.hybrid')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.start_date_label')} *</label>
                                    <input type="date" value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.total_seats_label')} *</label>
                                    <input type="number" value={formData.totalSeats}
                                        onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="50" min="1" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.duration_value_label')}</label>
                                    <input type="number" value={formData.duration.value}
                                        onChange={(e) => setFormData({ ...formData, duration: { ...formData.duration, value: e.target.value } })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="30" min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.duration_unit_label')}</label>
                                    <select value={formData.duration.unit}
                                        onChange={(e) => setFormData({ ...formData, duration: { ...formData.duration, unit: e.target.value } })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                        <option value="hours">{t('trainings_management.options.hours')}</option>
                                        <option value="days">{t('trainings_management.options.days')}</option>
                                        <option value="weeks">{t('trainings_management.options.weeks')}</option>
                                        <option value="months">{t('trainings_management.options.months')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.fees_label')}</label>
                                    <input type="number" value={formData.fees.amount}
                                        onChange={(e) => setFormData({ ...formData, fees: { ...formData.fees, amount: e.target.value } })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="5000" disabled={formData.fees.isFree} min="0" />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.fees.isFree}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                fees: { ...formData.fees, isFree: e.target.checked, amount: e.target.checked ? 0 : formData.fees.amount }
                                            })}
                                            className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm font-medium text-gray-700">{t('trainings_management.modals.is_free_label')}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.city_label')} *</label>
                                    <input type="text" value={formData.venue.city}
                                        onChange={(e) => setFormData({ ...formData, venue: { ...formData.venue, city: e.target.value } })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="Ujjain" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('trainings_management.modals.state_label')}</label>
                                    <input type="text" value={formData.venue.state}
                                        onChange={(e) => setFormData({ ...formData, venue: { ...formData.venue, state: e.target.value } })}
                                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button type="button" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm() }}
                                    disabled={actionLoading || uploadingBanner}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">
                                    {t('trainings_management.buttons.cancel')}
                                </button>
                                <button type="submit" disabled={actionLoading || uploadingBanner}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 text-sm">
                                    {actionLoading || uploadingBanner
                                        ? (uploadingBanner ? 'Uploading Banner...' : (showCreateModal ? 'Creating...' : t('trainings_management.buttons.updating')))
                                        : (showCreateModal ? t('trainings_management.create_training') : 'Update Training')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedTraining && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white p-5 sm:p-6 border-b border-gray-200 flex justify-between items-center z-10">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 pr-4 line-clamp-1">{selectedTraining.title}</h2>
                            <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
                                <HiOutlineX className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                        <div className="p-5 sm:p-6 space-y-5">
                            {(selectedTraining.banner?.url || selectedTraining.banner) ? (
                                <img src={selectedTraining.banner?.url || selectedTraining.banner} alt={selectedTraining.title}
                                    className="w-full h-40 sm:h-52 object-cover rounded-xl" />
                            ) : (
                                <div className="w-full h-24 sm:h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center">
                                    <HiOutlinePhotograph className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300" />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {[
                                    [t('trainings_management.modals.institution_label'), selectedTraining.institution?.organizationName || t('trainings_management.modals.admin_created')],
                                    [t('trainings_management.modals.category_label'), selectedTraining.category?.replace('_', ' ')],
                                    [t('trainings_management.modals.mode_label'), t(`trainings_management.options.${selectedTraining.mode}`) || selectedTraining.mode],
                                    [t('trainings_management.modals.duration_value_label'), `${selectedTraining.duration?.value || '-'} ${t(`trainings_management.options.${selectedTraining.duration?.unit}`) || selectedTraining.duration?.unit || ''}`],
                                    [t('trainings_management.modals.start_date_label'), selectedTraining.startDate ? new Date(selectedTraining.startDate).toLocaleDateString() : '-'],
                                    [t('trainings_management.modals.fees_label'), selectedTraining.fees?.isFree ? t('trainings_management.modals.free_training') : `₹${selectedTraining.fees?.amount?.toLocaleString()}`],
                                    [t('trainings_management.modals.total_seats_label'), `${selectedTraining.enrollmentCount || 0} / ${selectedTraining.totalSeats}`],
                                    [t('trainings_management.modals.location_label'), `${selectedTraining.venue?.city || '-'}${selectedTraining.venue?.state ? ', ' + selectedTraining.venue.state : ''}`],
                                    [t('trainings_management.modals.status_label'), t(`trainings_management.filters.${selectedTraining.status}`) || selectedTraining.status],
                                    [t('trainings_management.modals.approved_label'), selectedTraining.isApproved ? t('trainings_management.options.yes') : t('trainings_management.options.pending')]
                                ].map(([label, value]) => (
                                    <div key={label} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                                        <p className="text-xs text-gray-500">{label}</p>
                                        <p className="font-medium text-gray-800 capitalize text-sm sm:text-base">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {selectedTraining.description && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{t('trainings_management.modals.description_label')}</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">{selectedTraining.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedTraining && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full">
                        <div className="p-5 sm:p-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HiOutlineTrash className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-2">{t('trainings_management.modals.delete_title')}</h2>
                            <p className="text-gray-600 text-center mb-6 text-sm">
                                {t('trainings_management.modals.delete_prefix')} <span className="font-semibold">"{selectedTraining.title}"</span>? {t('trainings_management.modals.delete_suffix')}
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)} disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm">{t('trainings_management.buttons.cancel')}</button>
                                <button onClick={handleDelete} disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 text-sm">
                                    {actionLoading ? t('trainings_management.buttons.deleting') : t('trainings_management.buttons.delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Trainings