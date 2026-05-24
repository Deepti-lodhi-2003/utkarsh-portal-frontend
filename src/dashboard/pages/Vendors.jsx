import { useState, useEffect } from 'react'
import { vendorAPI } from '../../../src/services/api'
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineEyeOff
} from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

const Vendors = () => {
  const { t } = useTranslation()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    businessDescription: '',
    website: '',
    establishedYear: new Date().getFullYear()
  })

  useEffect(() => {
    fetchVendors()
  }, [page, tab, search])

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      
      if (search) params.search = search

      let res
      if (tab === 'pending') {
        res = await vendorAPI.adminGetPending(params)
      } else if (tab === 'verified') {
        res = await vendorAPI.adminGetVerified(params)
      } else {
        res = await vendorAPI.adminGetAll(params)
      }

      setVendors(res.data.data.vendors)
      
      // Handle pagination structure
      const paginationData = res.data.data.pagination
      setPagination({
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        skip: paginationData.skip || 0,
        pages: paginationData.pages || 1,
        total: paginationData.total || res.data.data.vendors.length
      })
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
      alert('Failed to fetch vendors')
    }
    setLoading(false)
  }

  const viewVendorDetails = async (id) => {
    try {
      const res = await vendorAPI.adminGetById(id)
      setSelectedVendor(res.data.data.vendor)
      setShowDetailsModal(true)
    } catch (error) {
      alert('Failed to fetch vendor details')
    }
  }

  const openEditModal = (vendor) => {
    setSelectedVendor(vendor)
    setFormData({
      businessName: vendor.businessName || '',
      businessType: vendor.businessType || '',
      businessDescription: vendor.businessDescription || '',
      website: vendor.website || '',
      establishedYear: vendor.establishedYear || new Date().getFullYear()
    })
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const updateData = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessDescription: formData.businessDescription,
        website: formData.website,
        establishedYear: formData.establishedYear
      }
      await vendorAPI.adminUpdate(selectedVendor._id, updateData)
      alert('Vendor updated successfully')
      setShowEditModal(false)
      fetchVendors()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update vendor')
    }
    setActionLoading(false)
  }

  const verifyVendor = async (id) => {
    setActionLoading(true)
    try {
      await vendorAPI.adminVerify(id)
      alert('Vendor verified successfully')
      fetchVendors()
    } catch (error) {
      alert('Failed to verify vendor')
    }
    setActionLoading(false)
  }

  const rejectVendor = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    setActionLoading(true)
    try {
      await vendorAPI.adminReject(id, { reason })
      alert('Vendor rejected successfully')
      fetchVendors()
    } catch (error) {
      alert('Failed to reject vendor')
    }
    setActionLoading(false)
  }

  const toggleVendorStatus = async (id, currentStatus) => {
    setActionLoading(true)
    try {
      await vendorAPI.adminToggleStatus(id)
      alert(`Vendor ${currentStatus ? 'deactivated' : 'activated'} successfully`)
      fetchVendors()
    } catch (error) {
      alert('Failed to update vendor status')
    }
    setActionLoading(false)
  }

  const openDeleteModal = (vendor) => {
    setSelectedVendor(vendor)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await vendorAPI.adminDelete(selectedVendor._id)
      alert('Vendor deleted successfully')
      setShowDeleteModal(false)
      setSelectedVendor(null)
      fetchVendors()
    } catch (error) {
      alert('Failed to delete vendor')
    }
    setActionLoading(false)
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchVendors()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vendor Management</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Verify and manage vendor profiles</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 sm:gap-6 border-b border-gray-200 px-4 overflow-x-auto">
              <button
                onClick={() => { setTab('all'); setPage(1) }}
                className={`py-3 font-medium transition-colors whitespace-nowrap ${tab === 'all' 
                  ? 'text-[#233480] border-b-2 border-[#233480] -mb-[2px]' 
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All Vendors
              </button>
              <button
                onClick={() => { setTab('pending'); setPage(1) }}
                className={`py-3 font-medium transition-colors whitespace-nowrap ${tab === 'pending' 
                  ? 'text-[#233480] border-b-2 border-[#233480] -mb-[2px]' 
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Pending Verification
              </button>
              <button
                onClick={() => { setTab('verified'); setPage(1) }}
                className={`py-3 font-medium transition-colors whitespace-nowrap ${tab === 'verified' 
                  ? 'text-[#233480] border-b-2 border-[#233480] -mb-[2px]' 
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Verified
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 p-4 pt-0">
              <input
                type="text"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#233480] text-white rounded-lg hover:bg-[#34479e] transition-colors font-medium"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Business Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Employees</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 text-sm">Loading vendors...</p>
                      </div>
                    </td>
                  </tr>
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <HiOutlineFilter className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No vendors found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{vendor.businessName}</p>
                          <p className="text-sm text-gray-500">{vendor.businessType}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {vendor.businessType}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[vendor.verificationStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {vendor.verificationStatus?.charAt(0).toUpperCase() + vendor.verificationStatus?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {vendor.employeeCount || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {(tab === 'pending' || vendor.verificationStatus === 'pending') ? (
                            <>
                              <button
                                onClick={() => verifyVendor(vendor._id)}
                                disabled={actionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Verify"
                              >
                                <HiOutlineCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => rejectVendor(vendor._id)}
                                disabled={actionLoading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <HiOutlineX className="w-5 h-5" />
                              </button>
                            </>
                          ) : null}
                          <button
                            onClick={() => viewVendorDetails(vendor._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(vendor)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => toggleVendorStatus(vendor._id, vendor.isActive)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              vendor.isActive
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            } disabled:opacity-50`}
                            title={vendor.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {vendor.isActive ? (
                              <HiOutlineEyeOff className="w-5 h-5" />
                            ) : (
                              <HiOutlineEye className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteModal(vendor)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
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
                Page {page} of {pagination.pages} ({pagination.total} vendors)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm">Loading vendors...</p>
              </div>
            </div>
          ) : vendors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col items-center gap-2">
                <HiOutlineFilter className="w-12 h-12 text-gray-300" />
                <p className="text-gray-500">No vendors found</p>
              </div>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{vendor.businessName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{vendor.businessType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[vendor.verificationStatus] || 'bg-gray-100 text-gray-700'}`}>
                    {vendor.verificationStatus?.charAt(0).toUpperCase() + vendor.verificationStatus?.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Employees</p>
                    <p className="font-medium text-gray-800">{vendor.employeeCount || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Turnover</p>
                    <p className="font-medium text-gray-800">{vendor.annualTurnover || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Est. Year</p>
                    <p className="font-medium text-gray-800">{vendor.establishedYear || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rating</p>
                    <p className="font-medium text-gray-800">{vendor.rating?.average || '0'} ⭐</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  {(tab === 'pending' || vendor.verificationStatus === 'pending') ? (
                    <>
                      <button
                        onClick={() => verifyVendor(vendor._id)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <HiOutlineCheck className="w-4 h-4" />
                        Verify
                      </button>
                      <button
                        onClick={() => rejectVendor(vendor._id)}
                        disabled={actionLoading}
                        className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <HiOutlineX className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  ) : null}
                  <button
                    onClick={() => viewVendorDetails(vendor._id)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <HiOutlineEye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => openEditModal(vendor)}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleVendorStatus(vendor._id, vendor.isActive)}
                    disabled={actionLoading}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 ${
                      vendor.isActive
                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {vendor.isActive ? (
                      <HiOutlineEyeOff className="w-4 h-4" />
                    ) : (
                      <HiOutlineEye className="w-4 h-4" />
                    )}
                    {vendor.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openDeleteModal(vendor)}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {pagination.pages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 text-center mb-3">
                Page {page} of {pagination.pages} ({pagination.total} vendors)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{selectedVendor.businessName}</h2>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-semibold text-gray-800 mt-1">{selectedVendor.businessType}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800 mt-1">{selectedVendor.verificationStatus?.charAt(0).toUpperCase() + selectedVendor.verificationStatus?.slice(1)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Employees</p>
                    <p className="font-semibold text-gray-800 mt-1">{selectedVendor.employeeCount || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Established Year</p>
                    <p className="font-semibold text-gray-800 mt-1">{selectedVendor.establishedYear || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="font-semibold text-blue-600 mt-1 truncate">{selectedVendor.website || '-'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Annual Turnover</p>
                    <p className="font-semibold text-gray-800 mt-1">{selectedVendor.annualTurnover || '-'}</p>
                  </div>
                </div>

                {selectedVendor.businessDescription && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedVendor.businessDescription}</p>
                  </div>
                )}

                {selectedVendor.industries && selectedVendor.industries.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.industries.map((ind, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVendor.specializations && selectedVendor.specializations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.specializations.map((spec, i) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Edit Vendor</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                  <input
                    type="text"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                  <input
                    type="number"
                    value={formData.establishedYear}
                    onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineTrash className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Vendor?</h2>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete <span className="font-semibold">{selectedVendor.businessName}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete'}
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

export default Vendors
