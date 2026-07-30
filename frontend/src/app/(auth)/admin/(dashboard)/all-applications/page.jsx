"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Eye, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { get, update } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function AllApplications() {
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('UNARCHIVE');
    const [archivingIds, setArchivingIds] = useState(new Set());

    // Fetch applications data
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                setError(null);

                const firstResponse = await get('/api/application/list/', { page: 1 });

                console.log(firstResponse)

                // Handle different response formats
                if (firstResponse.results) {
                    const firstPageResults = Array.isArray(firstResponse.results) ? firstResponse.results : [];
                    const inferredTotalPages = firstResponse.total_pages || (
                        firstResponse.count && firstPageResults.length
                            ? Math.ceil(firstResponse.count / firstPageResults.length)
                            : 1
                    );

                    if (inferredTotalPages <= 1) {
                        setApplications(firstPageResults);
                    } else {
                        const remainingResponses = await Promise.all(
                            Array.from({ length: inferredTotalPages - 1 }, (_, index) =>
                                get('/api/application/list/', { page: index + 2 })
                            )
                        );

                        const allApplications = [
                            ...firstPageResults,
                            ...remainingResponses.flatMap(response =>
                                Array.isArray(response?.results) ? response.results : []
                            ),
                        ];

                        setApplications(allApplications);
                    }
                } else if (Array.isArray(firstResponse)) {
                    // Simple array response
                    setApplications(firstResponse);
                } else {
                    setApplications([]);
                }
            } catch (err) {
                console.error('Error fetching applications:', err);

                // Provide more user-friendly error messages
                let errorMessage = 'Failed to load applications';
                if (err.message?.includes('404')) {
                    errorMessage = 'Applications endpoint not found. Please check the API configuration.';
                } else if (err.message?.includes('HTML instead of JSON')) {
                    errorMessage = 'Server returned an error page. The endpoint may not exist or there was a server error.';
                } else if (err.message) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleViewApplication = (applicationId) => {
        router.push(`/admin/all-applications/${applicationId}`);
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return 'N/A';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };


    const filteredApplications = applications
        .filter(app => {
            if (activeTab === 'REFERRAL') {
                return app.application_type === 'REFER' || !!app.referral_email;
            }
            const status = (app.status || 'unarchive').toString().toLowerCase();
            return activeTab === 'UNARCHIVE' ? status !== 'archive' : status === 'archive';
        })
        .filter(app => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                app.full_name?.toLowerCase().includes(query) ||
                app.email?.toLowerCase().includes(query) ||
                app.phone_number?.includes(query) ||
                app.contact_number?.includes(query)
            );
        });

    const pageSize = 10;
    const totalCount = filteredApplications.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const visibleApplications = filteredApplications.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const handleArchive = async (application) => {
        if (!application?.id) return;
        try {
            setArchivingIds(prev => new Set(prev).add(application.id));
            const full_name = application.full_name || application.name || '';
            const email = application.email || '';
            await update(`/api/application/${application.id}/update`, {
                full_name,
                email,
                status: 'archive'
            });
            toast.success('Application archived');
            setApplications(prev =>
                prev.map(a => (a.id === application.id ? { ...a, status: 'archive' } : a))
            );
        } catch (err) {
            toast.error(err?.message || 'Failed to archive');
        } finally {
            setArchivingIds(prev => {
                const next = new Set(prev);
                next.delete(application.id);
                return next;
            });
        }
    };

    return (
        <div className="w-full bg-white rounded-lg p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800">Applications</h1>
                </div>

                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search here..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-12 pr-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
                <Button
                    onClick={() => { setActiveTab('UNARCHIVE'); setCurrentPage(1); }}
                    className={`${activeTab === 'UNARCHIVE' ? 'bg-[#FFA100] text-white' : 'bg-yellow-100 text-gray-700 hover:bg-yellow-200'}`}
                >
                    All Applications
                </Button>
                <Button
                    onClick={() => { setActiveTab('ARCHIVE'); setCurrentPage(1); }}
                    className={`${activeTab === 'ARCHIVE' ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-purple-100 text-gray-700 hover:bg-purple-200'}`}
                >
                    Archive Applications
                </Button>
                <Button
                    onClick={() => { setActiveTab('REFERRAL'); setCurrentPage(1); }}
                    className={`${activeTab === 'REFERRAL' ? 'bg-green-400 text-white hover:bg-green-500' : 'bg-green-200 text-gray-700 hover:bg-green-200'}`}
                >
                    Referral
                </Button>
                <div className="ml-auto text-sm text-gray-600">
                    Total: {totalCount}
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FFA100] mr-2" />
                    <span className="text-gray-600">Loading applications...</span>
                </div>
            )}

            {error && !loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Error: {error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-[#FFA100] hover:bg-[#FF8C00] text-white"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">SL no.</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Full Name</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Phone Number</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date of Birth</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Action</th>
                                    {(activeTab === 'UNARCHIVE' || activeTab === 'REFERRAL') && (
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Archive</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleApplications.length > 0 ? (
                                    visibleApplications.map((application, index) => {
                                        const serialNumber = (currentPage - 1) * 10 + index + 1;
                                        return (
                                            <tr
                                                key={application.id || index}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-4 text-sm text-gray-700">
                                                    #{serialNumber}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-800 font-medium">
                                                    {application.full_name || application.name || 'N/A'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-700">
                                                    {application.email || 'N/A'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-700">
                                                    {formatPhoneNumber(application.phone_number || application.phone)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-700">
                                                    {application.date_of_birth || 'N/A'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button
                                                        onClick={() => handleViewApplication(application.id)}
                                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5 text-gray-600 hover:text-[#FFA100]" />
                                                    </button>
                                                </td>
                                                {(activeTab === 'UNARCHIVE' || activeTab === 'REFERRAL') && (
                                                    <td className="py-4 px-4">
                                                        {(application.status || 'unarchive').toString().toLowerCase() !== 'archive' && (
                                                            <button
                                                                onClick={() => handleArchive(application)}
                                                                disabled={archivingIds.has(application.id)}
                                                                className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                                                                title="Archive"
                                                            >
                                                                <Check className="w-5 h-5 text-gray-600 hover:text-[#16a34a]" />
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'UNARCHIVE' ? 7 : 6} className="py-12 text-center text-gray-500">
                                            No applications found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden space-y-3">
                        {visibleApplications.length > 0 ? (
                            visibleApplications.map((application, index) => {
                                const serialNumber = (currentPage - 1) * 10 + index + 1;
                                return (
                                    <div
                                        key={application.id || index}
                                        className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs text-gray-500 mb-1">SL no.</p>
                                                <p className="text-sm font-semibold text-gray-800">#{serialNumber}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewApplication(application.id)}
                                                    className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5 text-gray-700" />
                                                </button>
                                                {activeTab === 'UNARCHIVE' && (
                                                    <button
                                                        onClick={() => handleArchive(application)}
                                                        disabled={archivingIds.has(application.id)}
                                                        className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0 disabled:opacity-50"
                                                        title="Archive"
                                                    >
                                                        <Check className="w-5 h-5 text-gray-700" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-1 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Full Name</p>
                                                <p className="text-sm font-medium text-gray-800 break-words">
                                                    {application.full_name || application.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-sm text-gray-700 break-words">
                                                    {application.email || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">Phone</p>
                                                    <p className="text-sm text-gray-700">
                                                        {formatPhoneNumber(application.phone_number || application.contact_number)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Gender</p>
                                                    <p className="text-sm text-gray-700">
                                                        {application.gender || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                No applications found
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                            <Button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="bg-[#FFA100] hover:bg-[#FF8C00] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                &lt; Prev
                            </Button>

                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`${currentPage === pageNum
                                                ? 'bg-[#FFA100] text-white'
                                                : 'bg-yellow-100 text-gray-700 hover:bg-yellow-200'
                                                } min-w-[40px]`}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="bg-[#FFA100] hover:bg-[#FF8C00] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next &gt;
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
