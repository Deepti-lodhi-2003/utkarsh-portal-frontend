import { useState, useEffect } from 'react'
import { institutionsAPI } from '../../../src/services/api'
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineFilter,
  HiOutlinePlus
} from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

const Institutions = () => {
  const { t } = useTranslation()
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedInstitution, setSelectedInstitution] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [formData, setFormData] = useState({
    organizationName: '',
    institutionType: 'industry',
    contactPerson: { name: '', designation: '', email: '', phone: '' },
    address: { city: '', state: 'Madhya Pradesh', street: '', pincode: '' },
    about: '',
    website: '',
    officePhone: '',
    officeMobile: ''
  })



  useEffect(() => {
    fetchInstitutions()
  }, [page, tab])

  const fetchInstitutions = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      const res = tab === 'pending'
        ? await institutionsAPI.getPending(params)
        : await institutionsAPI.getAll(params)

      setInstitutions(res.data.data.institutions)
      setPagination(res.data.data.pagination)
    } catch (error) {
      console.error('Failed to fetch institutions:', error)
      alert(t('institutions_management.alerts.fetch_error'))
    }
    setLoading(false)
  }

  const viewInstitutionDetails = async (id) => {
    try {
      const res = await institutionsAPI.getById(id)
      setSelectedInstitution(res.data.data.institution)
      setShowDetailsModal(true)
    } catch (error) {
      alert(t('institutions_management.alerts.details_error'))
    }
  }



  const openEditModal = (institution) => {
    setSelectedInstitution(institution)
    setFormData({
      organizationName: institution.organizationName || '',
      institutionType: institution.institutionType || 'industry',
      contactPerson: institution.contactPerson || { name: '', designation: '', email: '', phone: '' },
      address: institution.address || { city: '', state: 'Madhya Pradesh', street: '', pincode: '' },
      about: institution.about || '',
      website: institution.website || '',
      officePhone: institution.officePhone || '',
      officeMobile: institution.officeMobile || ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const updateData = {
        organizationName: formData.organizationName,
        institutionType: formData.institutionType,
        address: formData.address,
        website: formData.website,
        about: formData.about
      }
      await institutionsAPI.adminUpdate(selectedInstitution._id, updateData)
      alert(t('institutions_management.alerts.update_success'))
      setShowEditModal(false)
      fetchInstitutions()
    } catch (error) {
      alert(error.response?.data?.message || t('institutions_management.alerts.update_error'))
    }
    setActionLoading(false)
  }

  const verifyInstitution = async (id) => {
    setActionLoading(true)
    try {
      await institutionsAPI.verify(id)
      alert(t('institutions_management.alerts.verify_success'))
      fetchInstitutions()
    } catch (error) {
      alert(t('institutions_management.alerts.verify_error'))
    }
    setActionLoading(false)
  }

  const rejectInstitution = async (id) => {
    const reason = prompt(t('institutions_management.alerts.reject_prompt'))
    if (!reason) return

    setActionLoading(true)
    try {
      await institutionsAPI.reject(id, reason)
      alert(t('institutions_management.alerts.reject_success'))
      fetchInstitutions()
    } catch (error) {
      alert(t('institutions_management.alerts.reject_error'))
    }
    setActionLoading(false)
  }

  const openDeleteModal = (institution) => {
    setSelectedInstitution(institution)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await institutionsAPI.delete(selectedInstitution._id)
      alert(t('institutions_management.alerts.delete_success'))
      setShowDeleteModal(false)
      setSelectedInstitution(null)
      fetchInstitutions()
    } catch (error) {
      alert(t('institutions_management.alerts.delete_error'))
    }
    setActionLoading(false)
  }

  const typeColors = {
    industry: 'bg-blue-100 text-blue-700',
    university: 'bg-purple-100 text-purple-700',
    training_institute: 'bg-green-100 text-green-700',
    vendor: 'bg-orange-100 text-orange-700'
  }

  return (
    <div className="p-4 sm:p-6 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('institutions_management.title')}</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{t('institutions_management.subtitle')}</p>
        </div>
      </div>


      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setTab('pending'); setPage(1) }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'pending' ? 'bg-[#233480] text-white' : 'bg-gray-100 text-gray-600'
            }`}
        >
          {t('institutions_management.tabs.pending')}
        </button>
        <button
          onClick={() => { setTab('all'); setPage(1) }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'all' ? 'bg-[#233480] text-white' : 'bg-gray-100 text-gray-600'
            }`}
        >
          {t('institutions_management.tabs.all')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('institutions_management.table.organization')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('institutions_management.table.type')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('institutions_management.table.location')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('institutions_management.table.contact')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('institutions_management.table.status')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">{t('institutions_management.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500 text-sm">{t('institutions_management.table.loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <HiOutlineFilter className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">{t('institutions_management.table.no_data')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => (
                  <tr key={inst._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {inst.logo?.url ? (
                          <img src={inst.logo.url} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-lg">
                              {inst.organizationName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{inst.organizationName}</p>
                          {inst.totalJobsPosted > 0 && (
                            <p className="text-xs text-gray-500">{inst.totalJobsPosted} {t('institutions_management.table.jobs_posted')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[inst.institutionType] || 'bg-gray-100 text-gray-700'}`}>
                        {t(`institutions_management.types.${inst.institutionType}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {inst.address?.city || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="text-sm">
                        <p className="truncate">{inst.user?.email || inst.contactPerson?.email || '-'}</p>
                        <p className="text-xs text-gray-400">{inst.user?.mobile || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${inst.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inst.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {inst.isVerified ? t('institutions_management.status.verified') : t('institutions_management.status.pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {tab === 'pending' && !inst.isVerified && (
                          <>
                            <button
                              onClick={() => verifyInstitution(inst._id)}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t('institutions_management.buttons.verify')}
                            >
                              <HiOutlineCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => rejectInstitution(inst._id)}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t('institutions_management.buttons.reject')}
                            >
                              <HiOutlineX className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => viewInstitutionDetails(inst._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('institutions_management.buttons.view')}
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(inst)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title={t('institutions_management.buttons.edit')}
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(inst)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={t('institutions_management.buttons.delete')}
                        >
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


        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-600">{t('users_management.pagination.page')} {page} {t('users_management.pagination.of')} {pagination.pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                {t('users_management.pagination.previous')}
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                {t('users_management.pagination.next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {
        showEditModal && selectedInstitution && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-gray-800">{t('institutions_management.modals.edit_title')}</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('institutions_management.modals.org_name')} *</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('institutions_management.modals.type')}</label>
                  <select
                    value={formData.institutionType}
                    onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="industry">{t('institutions_management.types.industry')}</option>
                    <option value="university">{t('institutions_management.types.university')}</option>
                    <option value="training_institute">{t('institutions_management.types.training_institute')}</option>
                    <option value="vendor">{t('institutions_management.types.vendor')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('institutions_management.modals.city')} *</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('institutions_management.modals.pincode')}</label>
                    <input
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('institutions_management.modals.website')}</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('institutions_management.modals.about')}</label>
                  <textarea
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={actionLoading}
                  >
                    {t('institutions_management.buttons.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading ? t('institutions_management.buttons.updating') : t('institutions_management.buttons.update')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }


      {
        showDetailsModal && selectedInstitution && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-gray-800">{selectedInstitution.organizationName}</h2>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {selectedInstitution.logo?.url && (
                  <div className="flex justify-center">
                    <img src={selectedInstitution.logo.url} alt="Logo" className="w-32 h-32 object-contain rounded-lg border border-gray-200" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('institutions_management.modals.type')}</p>
                    <p className="font-medium text-gray-800 capitalize">{t(`institutions_management.types.${selectedInstitution.institutionType}`)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('institutions_management.table.location')}</p>
                    <p className="font-medium text-gray-800">{selectedInstitution.address?.city}, {selectedInstitution.address?.state}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('institutions_management.modals.contact_person')}</p>
                    <p className="font-medium text-gray-800">{selectedInstitution.contactPerson?.name || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('institutions_management.modals.email')}</p>
                    <p className="font-medium text-gray-800 text-sm">{selectedInstitution.email || selectedInstitution.contactPerson?.email || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('institutions_management.modals.website')}</p>
                    {selectedInstitution.website ? (
                      <a href={selectedInstitution.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline text-sm">
                        {t('institutions_management.buttons.visit_website')}
                      </a>
                    ) : <p className="text-gray-400">-</p>}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('institutions_management.modals.jobs_posted')}</p>
                    <p className="font-medium text-gray-800">{selectedInstitution.totalJobsPosted || 0}</p>
                  </div>
                </div>

                {selectedInstitution.about && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t('institutions_management.modals.about')}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedInstitution.about}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {
        showDeleteModal && selectedInstitution && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineTrash className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{t('institutions_management.modals.delete_title')}</h2>
                <p className="text-gray-600 text-center mb-6">
                  {t('institutions_management.modals.delete_confirmation')} <span className="font-semibold">{selectedInstitution.organizationName}</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('institutions_management.buttons.cancel')}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading ? t('institutions_management.buttons.deleting') : t('institutions_management.buttons.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

export default Institutions