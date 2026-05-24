import { useState, useEffect } from 'react'
import { jobsAPI, institutionsAPI } from '../../../src/services/api'
import {
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineStar,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineBan,
  HiOutlineRefresh
} from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

const Jobs = () => {
  const { t } = useTranslation()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [isAdmin, setIsAdmin] = useState(false)
  const [institutions, setInstitutions] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    status: 'pending',
    institution: '',
    jobType: 'full-time',
    workMode: 'onsite',
    experienceLevel: 'entry',
    location: { city: '', state: 'Madhya Pradesh' },
    salary: { min: '', max: '' },
    requirements: [],
    skills: []
  })

  useEffect(() => {
    const role = localStorage.getItem('role')
    setIsAdmin(role === 'admin')

    if (role === 'admin') {
      fetchInstitutions()
    }

    fetchJobs()
  }, [page, tab, statusFilter])

  const fetchInstitutions = async () => {
    try {
      const res = await institutionsAPI.getAll({ limit: 100 })
      console.log(' Institutions fetched:', res.data.data.institutions)
      setInstitutions(res.data.data.institutions)
    } catch (error) {
      console.error('Failed to fetch institutions', error)
    }
  }

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }

      if (statusFilter) {
        params.status = statusFilter
      }

      if (search) params.q = search

      console.log('Sending params:', params)

      const res = tab === 'pending'
        ? await jobsAPI.getPending(params)
        : await jobsAPI.getAll(params)

      console.log('Received jobs:', res.data.data.jobs)
      console.log('Total jobs:', res.data.data.pagination.total)

      setJobs(res.data.data.jobs)
      setPagination(res.data.data.pagination)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      alert('Failed to fetch jobs')
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  const viewJobDetails = async (jobId) => {
    try {
      const res = await jobsAPI.getById(jobId)
      setSelectedJob(res.data.data.job)
      setShowDetailsModal(true)
    } catch (error) {
      alert('Failed to fetch job details')
    }
  }

  const openCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      industry: '',
      status: 'pending',
      jobType: 'full-time',
      workMode: 'onsite',
      experienceLevel: 'entry',
      location: { city: '', state: 'Madhya Pradesh' },
      salary: { min: '', max: '' },
      requirements: [],
      skills: [],
      institution: ''
    })
    setShowCreateModal(true)
  }

  const openEditModal = (job) => {
    setSelectedJob(job)
    setFormData({
      title: job.title || '',
      description: job.description || '',
      industry: job.industry || '',
      status: job.status || 'pending',
      jobType: job.jobType || 'full-time',
      workMode: job.workMode || 'onsite',
      experienceLevel: job.experienceLevel || 'entry',
      location: job.location || { city: '', state: 'Madhya Pradesh' },
      salary: job.salary || { min: '', max: '' },
      requirements: job.requirements || [],
      skills: job.skills || [],
      institution: job.institution?._id || ''
    })
    setShowEditModal(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    if (isAdmin && !formData.institution) {
      alert(t('jobs_management.alerts.select_institution'))
      return
    }

    console.log(' Creating job with data:', formData)

    setActionLoading(true)
    try {
      await jobsAPI.create(formData)
      alert(t('jobs_management.alerts.create_success'))
      setShowCreateModal(false)
      fetchJobs()
    } catch (error) {
      alert(error.response?.data?.message || t('jobs_management.alerts.create_failed'))
    }
    setActionLoading(false)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await jobsAPI.update(selectedJob._id, formData)
      alert(t('jobs_management.alerts.update_success'))
      setShowEditModal(false)
      fetchJobs()
    } catch (error) {
      alert(error.response?.data?.message || t('jobs_management.alerts.update_failed'))
    }
    setActionLoading(false)
  }

  const approveJob = async (jobId) => {
    setActionLoading(true)
    try {
      await jobsAPI.approve(jobId)
      alert(t('jobs_management.alerts.approve_success'))
      fetchJobs()
    } catch (error) {
      alert(t('jobs_management.alerts.approve_failed'))
    }
    setActionLoading(false)
  }

  const rejectJob = async (jobId) => {
    const reason = prompt(t('jobs_management.alerts.reject_prompt'))
    if (!reason) return

    setActionLoading(true)
    try {
      await jobsAPI.reject(jobId, reason)
      alert(t('jobs_management.alerts.reject_success'))
      fetchJobs()
    } catch (error) {
      alert(t('jobs_management.alerts.reject_failed'))
    }
    setActionLoading(false)
  }

  const toggleJobStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active'
    if (!window.confirm(t('jobs_management.alerts.status_confirm', { status: newStatus }))) return

    setActionLoading(true)
    try {
      await jobsAPI.changeStatus(job._id, { status: newStatus })
      alert(t('jobs_management.alerts.status_success', { status: newStatus }))
      fetchJobs()
    } catch (error) {
      alert(error.response?.data?.message || t('jobs_management.alerts.status_failed'))
    }
    setActionLoading(false)
  }

  const toggleFeature = async (jobId, isFeatured) => {
    setActionLoading(true)
    try {
      await jobsAPI.feature(jobId, {
        isFeatured: !isFeatured,
        featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      alert(t('jobs_management.alerts.feature_success', { status: !isFeatured ? 'featured' : 'unfeatured' }))
      fetchJobs()
    } catch (error) {
      alert(t('jobs_management.alerts.feature_failed'))
    }
    setActionLoading(false)
  }

  const openDeleteModal = (job) => {
    setSelectedJob(job)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await jobsAPI.delete(selectedJob._id)
      alert(t('jobs_management.alerts.delete_success'))
      setShowDeleteModal(false)
      setSelectedJob(null)
      fetchJobs()
    } catch (error) {
      alert(t('jobs_management.alerts.delete_failed'))
    }
    setActionLoading(false)
  }

  const getStatusBadge = (status, isApproved) => {
    if (status === 'active' && isApproved) return 'bg-green-100 text-green-700'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
    if (status === 'rejected') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('jobs_management.title')}</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">{t('jobs_management.subtitle')}</p>
          </div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#233480] text-white rounded-lg hover:bg-[#34479e] transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <HiOutlinePlus className="w-5 h-5" />
            {t('jobs_management.create_job')}
          </button>
        </div>


        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 sm:gap-4 overflow-x-auto">
              <button
                onClick={() => { setTab('all'); setPage(1) }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${tab === 'all' ? 'bg-[#233480] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {t('jobs_management.all_jobs')}
              </button>
              <button
                onClick={() => { setTab('pending'); setPage(1) }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${tab === 'pending' ? 'bg-[#233480] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {t('jobs_management.pending_approval')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('jobs_management.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </form>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">{t('jobs_management.all_status')}</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('jobs_management.table.job')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('jobs_management.table.company')}</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('jobs_management.table.location')}</th>
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('jobs_management.table.status')}</th> */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{t('jobs_management.table.applications')}</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">{t('jobs_management.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 text-sm">{t('jobs_management.table.loading')}</p>
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <HiOutlineFilter className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">{t('jobs_management.table.no_jobs')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{job.title}</p>
                          <p className="text-sm text-gray-500">{t(`jobs_management.options.${job.jobType}`)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {job.institution?.organizationName || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {job.location?.city || '-'}
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status, job.isApproved)}`}>
                            {t(`jobs_management.options.${job.status}`)}
                          </span>
                          {job.isFeatured && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              {t('jobs_management.table.featured')}
                            </span>
                          )}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 text-gray-600">
                        {job.applicationsCount || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(tab === 'pending' || job.status === 'pending') ? (
                            <>
                              <button
                                onClick={() => approveJob(job._id)}
                                disabled={actionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <HiOutlineCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => rejectJob(job._id)}
                                disabled={actionLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <HiOutlineX className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => toggleJobStatus(job)}
                              disabled={actionLoading}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${job.status === 'active'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-green-500 hover:bg-green-50'
                                }`}
                              title={job.status === 'active' ? t('jobs_management.buttons.deactivate') : t('jobs_management.buttons.activate')}
                            >
                              {job.status === 'active' ? (
                                <HiOutlineBan className="w-5 h-5" />
                              ) : (
                                <HiOutlineRefresh className="w-5 h-5" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => toggleFeature(job._id, job.isFeatured)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${job.isFeatured
                              ? 'text-yellow-600 hover:bg-yellow-50'
                              : 'text-gray-400 hover:bg-gray-50'
                              }`}
                            title={job.isFeatured ? t('jobs_management.buttons.unfeature') : t('jobs_management.buttons.feature')}
                          >
                            <HiOutlineStar className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => viewJobDetails(job._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('jobs_management.buttons.view')}
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={t('jobs_management.buttons.edit')}
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(job)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title={t('jobs_management.buttons.delete')}
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
              <p className="text-sm text-gray-600">
                Page {page} of {pagination.pages} ({pagination.total} jobs)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('jobs_management.buttons.previous')}
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  {t('jobs_management.buttons.next')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm">{t('jobs_management.table.loading')}</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col items-center gap-2">
                <HiOutlineFilter className="w-12 h-12 text-gray-300" />
                <p className="text-gray-500">{t('jobs_management.table.no_jobs')}</p>
              </div>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{job.institution?.organizationName || '-'}</p>
                  </div>
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status, job.isApproved)}`}>
                      {t(`jobs_management.options.${job.status}`)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">{t('jobs_management.table.type')}</p>
                    <p className="font-medium text-gray-800">{t(`jobs_management.options.${job.jobType}`)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('jobs_management.table.location')}</p>
                    <p className="font-medium text-gray-800">{job.location?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('jobs_management.table.applications')}</p>
                    <p className="font-medium text-gray-800">{job.applicationsCount || 0}</p>
                  </div>
                  {job.isFeatured && (
                    <div className="col-span-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 inline-flex items-center gap-1">
                        <HiOutlineStar className="w-3 h-3" />
                        {t('jobs_management.table.featured')}
                      </span>
                    </div>
                  )}
                </div>


                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  {(tab === 'pending' || job.status === 'pending') ? (
                    <>
                      <button
                        onClick={() => approveJob(job._id)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <HiOutlineCheck className="w-4 h-4" />
                        {t('jobs_management.buttons.approve')}
                      </button>
                      <button
                        onClick={() => rejectJob(job._id)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <HiOutlineX className="w-4 h-4" />
                        {t('jobs_management.buttons.reject')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleJobStatus(job)}
                      disabled={actionLoading}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 ${job.status === 'active'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                    >
                      {job.status === 'active' ? (
                        <>
                          <HiOutlineBan className="w-4 h-4" />
                          {t('jobs_management.buttons.deactivate')}
                        </>
                      ) : (
                        <>
                          <HiOutlineRefresh className="w-4 h-4" />
                          {t('jobs_management.buttons.activate')}
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => toggleFeature(job._id, job.isFeatured)}
                    disabled={actionLoading}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 ${job.isFeatured
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <HiOutlineStar className="w-4 h-4" />
                    {job.isFeatured ? t('jobs_management.buttons.unfeature') : t('jobs_management.buttons.feature')}
                  </button>
                  <button
                    onClick={() => viewJobDetails(job._id)}
                    className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                    {t('jobs_management.buttons.view')}
                  </button>
                  <button
                    onClick={() => openEditModal(job)}
                    className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                    {t('jobs_management.buttons.edit')}
                  </button>
                  <button
                    onClick={() => openDeleteModal(job)}
                    disabled={actionLoading}
                    className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                    {t('jobs_management.buttons.delete')}
                  </button>
                </div>
              </div>
            ))
          )}

          {pagination.pages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 text-center mb-3">
                Page {page} of {pagination.pages} ({pagination.total} jobs)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  {t('jobs_management.buttons.previous')}
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  {t('jobs_management.buttons.next')}
                </button>
              </div>
            </div>
          )}
        </div>

        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {showCreateModal ? t('jobs_management.modals.create_title') : t('jobs_management.modals.edit_title')}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.job_title_label')} *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.institution_label')} *</label>
                    <select
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">{t('jobs_management.modals.select_institution')}</option>
                      {institutions.map(inst => (
                        <option key={inst._id} value={inst._id}>
                          {inst.organizationName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.description_label')} *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.industry_label')} *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">{t('jobs_management.modals.select_industry')}</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="IT/Software">IT/Software</option>
                    <option value="Education">Education</option>
                    <option value="Construction">Construction</option>
                    <option value="Automobile">Automobile</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Telecom/BPO">Telecom/BPO</option>
                    <option value="Food Processing">Food Processing</option>
                    <option value="Textile">Textile</option>
                    <option value="Pharmaceutical">Pharmaceutical</option>
                    <option value="Retail">Retail</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.status_label')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="pending">{t('jobs_management.options.pending')}</option>
                    <option value="active">{t('jobs_management.options.active')}</option>
                    <option value="closed">{t('jobs_management.options.closed')}</option>
                    <option value="paused">{t('jobs_management.options.paused')}</option>
                    <option value="draft">{t('jobs_management.options.draft')}</option>
                    <option value="rejected">{t('jobs_management.options.rejected')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.job_type_label')}</label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="full-time">{t('jobs_management.options.full_time')}</option>
                      <option value="part-time">{t('jobs_management.options.part_time')}</option>
                      <option value="contract">{t('jobs_management.options.contract')}</option>
                      <option value="internship">{t('jobs_management.options.internship')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.work_mode_label')}</label>
                    <select
                      value={formData.workMode}
                      onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="onsite">{t('jobs_management.options.onsite')}</option>
                      <option value="remote">{t('jobs_management.options.remote')}</option>
                      <option value="hybrid">{t('jobs_management.options.hybrid')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.experience_level_label')}</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="fresher">{t('jobs_management.options.fresher')}</option>
                    <option value="entry">{t('jobs_management.options.entry')}</option>
                    <option value="mid">{t('jobs_management.options.mid')}</option>
                    <option value="senior">{t('jobs_management.options.senior')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.location_label')} *</label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.min_salary_placeholder')}</label>
                    <input
                      type="number"
                      value={formData.salary.min}
                      onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, min: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('jobs_management.modals.max_salary_placeholder')}</label>
                    <input
                      type="number"
                      value={formData.salary.max}
                      onChange={(e) => setFormData({ ...formData, salary: { ...formData.salary, max: e.target.value } })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowEditModal(false)
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={actionLoading}
                  >
                    {t('jobs_management.modals.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {showCreateModal ? t('jobs_management.modals.creating') : t('jobs_management.modals.updating')}
                      </>
                    ) : (showCreateModal ? t('jobs_management.modals.create') : t('jobs_management.modals.update'))}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailsModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 line-clamp-2">{selectedJob.title}</h2>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('jobs_management.details.company')}</p>
                    <p className="font-medium text-gray-800 mt-1">{selectedJob.institution?.organizationName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('jobs_management.details.industry')}</p>
                    <p className="font-medium text-gray-800 mt-1">{selectedJob.industry}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('jobs_management.details.location')}</p>
                    <p className="font-medium text-gray-800 mt-1">{selectedJob.location?.city}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('jobs_management.details.job_type')}</p>
                    <p className="font-medium text-gray-800 mt-1">{t(`jobs_management.options.${selectedJob.jobType}`)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('jobs_management.details.work_mode')}</p>
                    <p className="font-medium text-gray-800 mt-1">{t(`jobs_management.options.${selectedJob.workMode}`)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('jobs_management.details.experience')}</p>
                    <p className="font-medium text-gray-800 mt-1">{t(`jobs_management.options.${selectedJob.experienceLevel}`)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{t('jobs_management.details.salary')}</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedJob.salary?.min && selectedJob.salary?.max
                        ? `₹${selectedJob.salary.min.toLocaleString()} - ₹${selectedJob.salary.max.toLocaleString()}`
                        : t('jobs_management.details.not_disclosed')
                      }
                    </p>
                  </div>
                </div>

                {selectedJob.description && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t('jobs_management.details.description')}</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                )}

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t('jobs_management.details.requirements')}</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">{t('jobs_management.details.skills_required')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineTrash className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{t('jobs_management.delete_modal.title')}</h2>
                <p className="text-gray-600 text-center mb-6">
                  {t('jobs_management.delete_modal.confirmation')} <span className="font-semibold">{selectedJob.title}</span>?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t('jobs_management.delete_modal.cancel')}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading ? t('jobs_management.delete_modal.deleting') : t('jobs_management.delete_modal.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Jobs






