



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../component/Footer';
import {
    FileText, MapPin, Clock, Building2, Eye, Edit, Trash2, Loader2, X
} from 'lucide-react';
import { vendorAPI } from '../../services/api';

const ViewServiceRequest = () => {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch vendor profile/services on mount ──
    useEffect(() => {
        fetchServiceRequests();
    }, []);

    const fetchServiceRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await vendorAPI.getProfile();
            const vendor = res.data.data;

            // If vendor has products/services, map them as requests
            // The vendor profile contains the service info
            if (vendor && vendor.businessName) {
                // Map vendor products as service requests
                const products = vendor.products || [];
                const mapped = products.map(product => ({
                    id: product._id,
                    title: product.name || 'N/A',
                    skills: product.category || '',
                    location: vendor.serviceAreas?.[0]?.city || vendor.institution?.address?.city || 'N/A',
                    status: vendor.isVerified ? 'Active' : 'Pending',
                    postedDate: product.createdAt || vendor.createdAt,
                    applicants: 0,
                    description: product.description || ''
                }));

                // If no products, show vendor itself as a service listing
                if (mapped.length === 0 && vendor.services?.length > 0) {
                    mapped.push({
                        id: vendor._id,
                        title: vendor.businessName || 'Service Request',
                        skills: vendor.services?.join(', ') || '',
                        location: vendor.serviceAreas?.[0]?.city || 'N/A',
                        status: vendor.isVerified ? 'Active' : 'Pending',
                        postedDate: vendor.createdAt,
                        applicants: 0,
                        description: vendor.businessDescription || ''
                    });
                }

                setRequests(mapped);
            }
        } catch (err) {
            console.error('Fetch service requests error:', err);
            // If 404, vendor profile doesn't exist yet — show empty state
            if (err.response?.status === 404) {
                setRequests([]);
            } else {
                setError(err.response?.data?.message || 'Failed to load service requests');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewRequest = (id) => {
        navigate(`/vendors/${id}`);
    };

    const handleEditRequest = (id) => {
        navigate(`/institution/post-service-request`);
    };

    const handleDeleteRequest = async (id) => {
        setDeleting(true);
        try {
            await vendorAPI.deleteProduct(id);
            setRequests(prev => prev.filter(r => r.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.response?.data?.message || 'Failed to delete service request');
        } finally {
            setDeleting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'active': return 'text-green-600 bg-green-50';
            case 'closed': return 'text-red-600 bg-red-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#233480]" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Banner */}
            <div className="relative w-full h-32 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-wider text-center px-4">Industry Service Requirements</h1>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20 flex-1">

                {/* Error */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X size={16} /></button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-[#1e2a5a] mb-2">Delete Service Request?</h3>
                            <p className="text-gray-600 mb-4">Are you sure you want to delete this service request? This action cannot be undone.</p>
                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onClick={() => handleDeleteRequest(deleteConfirm)} disabled={deleting}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2">
                                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    {deleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {requests.length === 0 ? (
                    <div className="bg-white border-b-4 border-[#233480] shadow-xl flex items-center justify-center min-h-[200px]">
                        <div className="w-full max-w-md mx-auto text-center p-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <FileText size={40} className="text-gray-400 md:w-12 md:h-12" />
                            </div>
                            <p className="text-sm md:text-base text-gray-400 text-center">No record found</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-[#1e2a5a]">
                                {requests.length} Request{requests.length !== 1 ? 's' : ''} Posted
                            </h2>
                        </div>

                        {requests.map((request) => (
                            <div key={request.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        {/* Left Section */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 rounded-lg border-2 border-gray-100 flex items-center justify-center bg-blue-50 flex-shrink-0">
                                                    <FileText size={32} className="text-[#233480]" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-[#1e2a5a] mb-1">
                                                        {request.title}
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 mt-2">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Building2 size={14} className="text-[#233480]" />
                                                            <span className="truncate">{request.skills}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <MapPin size={14} className="text-[#233480]" />
                                                            <span>{request.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} />
                                                            <span>Posted on {new Date(request.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        </div>
                                                        {request.applicants !== undefined && (
                                                            <div className="flex items-center gap-1">
                                                                <Eye size={12} />
                                                                <span>{request.applicants} Views</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex flex-col gap-2 md:min-w-[180px]">
                                            <button onClick={() => handleViewRequest(request.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#233480] text-white text-sm font-semibold rounded hover:bg-[#1a2660] transition-colors">
                                                <Eye size={16} /> View Details
                                            </button>
                                            <button onClick={() => handleEditRequest(request.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-blue-500 text-blue-500 text-sm font-semibold rounded hover:bg-blue-50 transition-colors">
                                                <Edit size={16} /> Edit
                                            </button>
                                            <button onClick={() => setDeleteConfirm(request.id)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-red-500 text-red-500 text-sm font-semibold rounded hover:bg-red-50 transition-colors">
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ViewServiceRequest;
