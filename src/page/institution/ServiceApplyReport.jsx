

import React, { useState, useEffect } from 'react';
import Footer from '../../component/Footer';
import { Search, Loader2, X } from 'lucide-react';
import { vendorAPI } from '../../services/api';

const ServiceApplyReport = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [services, setServices] = useState([]);

    // ── Fetch reports on mount ──
    useEffect(() => {
        fetchReports();
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await vendorAPI.getCategories();
            const cats = res.data.data || [];
            setServices(cats.map(c => c._id));
        } catch (err) {
            console.error('Fetch services error:', err);
        }
    };

    const fetchReports = async (service = '') => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (service) params.service = service;

            const res = await vendorAPI.getAll(params);
            const data = res.data.data;

            const mapped = (data.vendors || []).map(v => ({
                id: v._id,
                vendorName: v.institution?.organizationName || v.businessName || 'N/A',
                serviceTitle: v.services?.[0] || 'N/A',
                appliedDate: new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                status: v.verificationStatus || 'Pending'
            }));

            setReports(mapped);
        } catch (err) {
            console.error('Fetch reports error:', err);
            setError(err.response?.data?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReports(searchTerm);
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Banner */}
            <div className="relative w-full h-32 flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://utkarshujjain.com/assets/img/banner-10.jpg')" }}>
                <div className="absolute inset-0 bg-[#233480]/80 mix-blend-multiply"></div>
                <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-wider text-center px-4">Report</h1>
                <p className="relative z-10 text-white text-sm md:text-base mt-1 font-light">Applied by Vendors</p>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto w-full px-4 -mt-6 mb-12 relative z-20 flex-1">

                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X size={16} /></button>
                    </div>
                )}

                {/* Filter */}
                <div className="bg-white rounded-t-lg shadow-sm p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-4 border-l-4 border-[#233480] pl-3">
                        <h2 className="text-gray-700 font-semibold">Filter</h2>
                    </div>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 w-full">
                            <select value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#233480] focus:border-[#233480] text-sm bg-white">
                                <option value="">Select Service</option>
                                {services.map((s, i) => (
                                    <option key={i} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="bg-[#233480] text-white px-8 py-2 rounded hover:bg-[#1a2660] transition-colors text-sm font-semibold w-full md:w-auto">
                            Search
                        </button>
                    </form>
                </div>

                {/* Results */}
                <div className="bg-white rounded-b-lg shadow-sm min-h-[150px] p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-[#233480]" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reports.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                                No record found
                                            </td>
                                        </tr>
                                    ) : (
                                        reports.map((report) => (
                                            <tr key={report.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.vendorName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.serviceTitle}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.appliedDate}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${report.status === 'verified' ? 'bg-green-100 text-green-700'
                                                        : report.status === 'rejected' ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ServiceApplyReport;