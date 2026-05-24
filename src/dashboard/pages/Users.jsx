import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usersAPI, authAPI } from '../../services/api'
import {
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineBan,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineX,
  HiOutlineFilter,
  HiOutlinePlus
} from 'react-icons/hi'

const Users = () => {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'candidate'
  })

  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    mobile: '',
    role: '',
    isActive: true
  })

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.isActive = statusFilter
      if (search) params.q = search

      const res = await usersAPI.getAll(params)
      setUsers(res.data.data.users)
      setPagination(res.data.data.pagination)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      alert(t('users_management.messages.fetch_error'))
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const viewUserDetails = async (userId) => {
    try {
      const res = await usersAPI.getById(userId)
      setSelectedUser(res.data.data)
      setShowViewModal(true)
    } catch (error) {
      alert(t('users_management.messages.details_error'))
    }
  }

  const openCreateModal = () => {
    setCreateForm({
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'candidate'
    })
    setShowCreateModal(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await usersAPI.create(createForm)
      alert(t('users_management.messages.create_success'))
      setShowCreateModal(false)
      setCreateForm({
        name: '',
        email: '',
        mobile: '',
        password: '',
        role: 'candidate'
      })
      fetchUsers()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || t('common.create_failed'))
    }
    setActionLoading(false)
  }

  const openEditModal = (user) => {
    setEditForm({
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await usersAPI.update(editForm.id, {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        role: editForm.role,
        isActive: editForm.isActive
      })
      alert(t('users_management.messages.update_success'))
      setShowEditModal(false)
      fetchUsers()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || t('common.update_failed'))
    }
    setActionLoading(false)
  }

  const toggleStatus = async (userId, currentStatus) => {
    setActionLoading(true)
    try {
      await usersAPI.updateStatus(userId, !currentStatus)
      alert(t(!currentStatus ? 'users_management.messages.status_activated' : 'users_management.messages.status_deactivated'))
      fetchUsers()
    } catch (error) {
      alert(t('users_management.messages.status_error'))
    }
    setActionLoading(false)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await usersAPI.delete(selectedUser._id)
      alert(t('users_management.messages.delete_success'))
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      alert(t('users_management.messages.delete_error'))
    }
    setActionLoading(false)
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
    setPage(1)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('users_management.title')}</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{t('users_management.description')}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#233480] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium justify-center sm:justify-start shadow-lg hover:shadow-xl"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>{t('users_management.create_user')}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('users_management.search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="">{t('users_management.filters.all_roles')}</option>
              <option value="candidate">{t('header.candidate')}</option>
              <option value="institution">{t('header.institution')}</option>
              <option value="admin">{t('admin_dashboard.admin')}</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
            >
              <option value="">{t('users_management.filters.all_status')}</option>
              <option value="true">{t('common.active')}</option>
              <option value="false">{t('common.inactive')}</option>
            </select>

            {(search || roleFilter || statusFilter) && (
              <button
                onClick={clearFilters}
                className="col-span-2 sm:col-span-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <HiOutlineX className="w-5 h-5" />
                {t('users_management.filters.clear')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('users_management.table.user')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('users_management.table.mobile')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('users_management.table.role')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('users_management.table.status')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('users_management.table.joined')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">{t('users_management.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#233480]"></div>
                      <p className="text-gray-500 text-sm">{t('users_management.table.loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <HiOutlineFilter className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">{t('users_management.table.no_users')}</p>
                      <p className="text-gray-400 text-sm">{t('users_management.table.try_filters')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-white shadow-sm
                          ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                          ${user.role === 'candidate' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                          ${user.role === 'institution' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                        `}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 font-mono text-sm">{user.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}
                        ${user.role === 'candidate' ? 'bg-blue-100 text-blue-700' : ''}
                        ${user.role === 'institution' ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {user.role === 'admin' ? t('admin_dashboard.admin') : user.role === 'candidate' ? t('header.candidate') : t('header.institution')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                        ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        {user.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</p>
                        <p className="text-gray-400 text-xs">{new Date(user.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewUserDetails(user._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.view_details')}
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title={t('users_management.modals.edit_title')}
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => toggleStatus(user._id, user.isActive)}
                          disabled={actionLoading}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${user.isActive
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                            }`}
                          title={user.isActive ? t('common.deactivate') : t('common.activate')}
                        >
                          {user.isActive ? <HiOutlineBan className="w-5 h-5" /> : <HiOutlineCheck className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={t('users_management.modals.delete_title')}
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
              {t('users_management.pagination.showing')} <span className="font-medium">{((page - 1) * 10) + 1}</span> {t('users_management.pagination.to')} <span className="font-medium">{Math.min(page * 10, pagination.total)}</span> {t('users_management.pagination.of')} <span className="font-medium">{pagination.total}</span> {t('users_management.pagination.users')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                {t('users_management.pagination.previous')}
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${page === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                {t('users_management.pagination.next')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 text-sm">{t('users_management.table.loading')}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 bg-white rounded-xl border border-gray-200">
            <HiOutlineFilter className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500">{t('users_management.table.no_users')}</p>
            <p className="text-gray-400 text-sm">{t('users_management.table.try_filters')}</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white shadow-sm flex-shrink-0
                  ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : ''}
                  ${user.role === 'candidate' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                  ${user.role === 'institution' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                `}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{user.mobile}</p>
                </div>
                <div className="flex gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}
                    ${user.role === 'candidate' ? 'bg-blue-100 text-blue-700' : ''}
                    ${user.role === 'institution' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {user.role === 'admin' ? t('admin_dashboard.admin') : user.role === 'candidate' ? t('header.candidate') : t('header.institution')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold
                  ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  {user.isActive ? t('common.active') : t('common.inactive')}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => viewUserDetails(user._id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <HiOutlineEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleStatus(user._id, user.isActive)}
                    disabled={actionLoading}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${user.isActive
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                      }`}
                  >
                    {user.isActive ? <HiOutlineBan className="w-5 h-5" /> : <HiOutlineCheck className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openDeleteModal(user)}
                    disabled={actionLoading}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm font-medium"
            >
              {t('users_management.pagination.previous')}
            </button>
            <span className="text-sm text-gray-600">
              {t('users_management.pagination.page')} {page} {t('users_management.pagination.of')} {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm font-medium"
            >
              {t('users_management.pagination.next')}
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">{t('users_management.modals.create_title')}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.full_name')} *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.email')} *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.mobile')} *</label>
                <input
                  type="tel"
                  value={createForm.mobile}
                  onChange={(e) => setCreateForm({ ...createForm, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.password')} *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">{t('users_management.form.password_tip')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.role')} *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="candidate">{t('header.candidate')}</option>
                  <option value="institution">{t('header.institution')}</option>
                  <option value="admin">{t('admin_dashboard.admin')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={actionLoading}
                >
                  {t('users_management.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {actionLoading ? t('users_management.form.creating') : t('users_management.form.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-2xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">{t('users_management.modals.edit_title')}</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.full_name')}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.email')}</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.mobile')}</label>
                <input
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.role')}</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="candidate">{t('header.candidate')}</option>
                  <option value="institution">{t('header.institution')}</option>
                  <option value="admin">{t('admin_dashboard.admin')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('users_management.form.status')}</label>
                <select
                  value={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="true">{t('common.active')}</option>
                  <option value="false">{t('common.inactive')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={actionLoading}
                >
                  {t('users_management.form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"

                >
                  {actionLoading ? t('users_management.form.updating') : t('users_management.form.update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-0 sm:p-4">
          <div className="bg-white rounded-none sm:rounded-2xl w-full sm:max-w-2xl px-4 h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-800">{t('users_management.modals.details_title')}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <HiOutlineX className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedUser.user?.name}</h3>
                  <p className="text-gray-600">{selectedUser.user?.email}</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold
                    ${selectedUser.user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : ''}
                    ${selectedUser.user?.role === 'candidate' ? 'bg-blue-100 text-blue-700' : ''}
                    ${selectedUser.user?.role === 'institution' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {selectedUser.user?.role === 'admin' ? t('admin_dashboard.admin') : selectedUser.user?.role === 'candidate' ? t('header.candidate') : t('header.institution')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium">{t('users_management.details.mobile')}</p>
                  <p className="text-gray-800 font-semibold mt-1">{selectedUser.user?.mobile}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium">{t('users_management.details.status')}</p>
                  <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-semibold
                    ${selectedUser.user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                  `}>
                    <span className={`w-2 h-2 rounded-full ${selectedUser.user?.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {selectedUser.user?.isActive ? t('common.active') : t('common.inactive')}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium">{t('users_management.details.verified')}</p>
                  <p className="text-gray-800 font-semibold mt-1">
                    {selectedUser.user?.isMobileVerified ? '✓ ' + t('common.yes') : '✗ ' + t('common.no')}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 font-medium">{t('users_management.details.joined')}</p>
                  <p className="text-gray-800 font-semibold mt-1">
                    {new Date(selectedUser.user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

            </div>

            {selectedUser.activity && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('users_management.details.activity')}</h3>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">{t('users_management.details.requests_made')} ({selectedUser.activity.outgoingRequests?.length || 0})</h4>
                  {selectedUser.activity.outgoingRequests?.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {selectedUser.activity.outgoingRequests.map(req => (
                        <div key={req._id} className="text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                          <p className="font-medium">{req.serviceName}</p>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{t('users_management.details.vendor_info')}: {req.vendor?.businessName || 'Unknown'}</span>
                            <span className={`px-2 py-0.5 rounded-full capitalize 
                              ${req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-600'}`}>{t(`common.${req.status}`)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400 italic">{t('users_management.details.no_requests')}</p>}
                </div>

                {selectedUser.user?.role === 'candidate' && (
                  <div className="space-y-6">

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('users_management.details.applications')} ({selectedUser.activity.applications?.length || 0})</h4>
                      {selectedUser.activity.applications?.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                          {selectedUser.activity.applications.map(app => (
                            <div key={app._id} className="text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                              <p className="font-medium">{app.job?.title || 'Unknown Job'}</p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{app.job?.location}</span>
                                <span className={`px-2 py-0.5 rounded-full ${app.status === 'applied' ? 'bg-blue-100 text-blue-700' :
                                  app.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>{t(`common.${app.status}`)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-400 italic">{t('users_management.details.no_applications')}</p>}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('users_management.details.enrollments')} ({selectedUser.activity.enrollments?.length || 0})</h4>
                      {selectedUser.activity.enrollments?.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                          {selectedUser.activity.enrollments.map(en => (
                            <div key={en._id} className="text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                              <p className="font-medium">{en.training?.title || 'Unknown Training'}</p>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{en.training?.startDate ? new Date(en.training.startDate).toLocaleDateString() : ''}</span>
                                <span className="capitalize">{t(`common.${en.status}`)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-400 italic">{t('users_management.details.no_enrollments')}</p>}
                    </div>

                  </div>
                )}

                {selectedUser.user?.role === 'institution' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('users_management.details.jobs_posted')} ({selectedUser.activity.jobs?.length || 0})</h4>
                      {selectedUser.activity.jobs?.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                          {selectedUser.activity.jobs.map(job => (
                            <div key={job._id} className="text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                              <div className="flex justify-between">
                                <span className="font-medium">{job.title}</span>
                                <span className="text-gray-500 text-xs">{new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex gap-2 text-xs mt-1">
                                <span className={`px-2 py-0.5 rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {t(`common.${job.status}`)}
                                </span>
                                <span className="text-gray-500">{job.applicationsCount} {t('users_management.details.applications')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-400 italic">{t('users_management.details.no_jobs')}</p>}
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{t('users_management.details.trainings_created')} ({selectedUser.activity.trainings?.length || 0})</h4>
                      {selectedUser.activity.trainings?.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                          {selectedUser.activity.trainings.map(tr => (
                            <div key={tr._id} className="text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                              <div className="flex justify-between">
                                <span className="font-medium">{tr.title}</span>
                                <span className="text-gray-500 text-xs">{tr.startDate ? new Date(tr.startDate).toLocaleDateString() : t('common.no_date')}</span>
                              </div>
                              <div className="flex gap-2 text-xs mt-1">
                                <span className="capitalize">{t(`common.${tr.status}`)}</span>
                                <span className="text-gray-500">{tr.enrollmentCount} {t('users_management.details.enrollments')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-400 italic">{t('users_management.details.no_trainings')}</p>}
                    </div>

                    {selectedUser.activity.vendor && (
                      <>
                        <div className="border-t border-gray-200 pt-4 mt-2">
                          <h4 className="font-semibold text-gray-800 mb-2">{t('users_management.details.vendor_info')}</h4>
                          <p className="text-sm text-gray-600">{t('users_management.details.business_name')}: <span className="font-medium">{selectedUser.activity.vendor.businessName}</span></p>
                          <p className="text-sm text-gray-600">{t('users_management.details.business_type')}: <span className="capitalize">{selectedUser.activity.vendor.businessType}</span></p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 mt-4">{t('users_management.details.incoming_requests')} ({selectedUser.activity.incomingRequests?.length || 0})</h4>
                          {selectedUser.activity.incomingRequests?.length > 0 ? (
                            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                              {selectedUser.activity.incomingRequests.map(req => (
                                <div key={req._id} className="text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                  <p className="font-medium">{req.serviceName}</p>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{t('common.from')}: {req.requesterName || t('common.user')}</span>
                                    <span className={`px-2 py-0.5 rounded-full capitalize 
                                      ${req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-600'}`}>{t(`common.${req.status}`)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-sm text-gray-400 italic">{t('users_management.details.no_requests')}</p>}
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )
      }

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineTrash className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">{t('users_management.modals.delete_title')}</h2>
              <p className="text-gray-600 text-center mb-6">
                {t('users_management.modals.delete_confirm')} <span className="font-semibold text-gray-900">{selectedUser.name}</span>?
                <br />
                <span className="text-sm text-red-500 mt-1 block">{t('users_management.modals.delete_warning')}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  {t('users_management.form.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      {t('users_management.form.deleting')}
                    </>
                  ) : t('users_management.form.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}

export default Users