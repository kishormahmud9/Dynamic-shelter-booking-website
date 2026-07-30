'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Loader2, ArrowLeft } from 'lucide-react';
import { get } from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function ApplicationDetails() {
    const params = useParams();
    const router = useRouter();
    const applicationId = params.id;

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await get(`/api/application/${applicationId}/`);
                setApplication(data);
            } catch (err) {
                console.error('Error fetching application:', err);
                setError(err.message || 'Failed to load application details');
                toast.error('Failed to load application details');
            } finally {
                setLoading(false);
            }
        };

        if (applicationId) {
            fetchApplication();
        }
    }, [applicationId]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Format boolean to Yes/No
    const formatBoolean = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return value ? 'Yes' : 'No';
    };

    // Format array to string
    const formatArray = (arr) => {
        if (!arr || !Array.isArray(arr)) return 'N/A';
        return arr.join(', ').replace(/_/g, ' ');
    };

    // Format enum values (replace underscores with spaces and capitalize)
    const formatEnum = (value) => {
        if (!value) return 'N/A';
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FFA100] mx-auto mb-4" />
                    <p className="text-gray-600">Loading application details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error: {error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                        >
                            Go Back
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-[#FFA100] hover:bg-[#FF8C00] text-white"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-600">Application not found</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 rounded-lg p-6 sm:p-6">
            <div className="px-1 lg:px-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Application Information</h1>
                    </div>
                    
                </div>

                {/* Application Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* 1. Personal Information */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Full Name</label>
                                <p className="text-base text-gray-800 mt-1">{application.full_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Number</label>
                                <p className="text-base text-gray-800 mt-1">{application.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Email</label>
                                <p className="text-base text-gray-800 mt-1">{application.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Birth of Date</label>
                                <p className="text-base text-gray-800 mt-1">{formatDate(application.date_of_birth)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Current Housing Situation */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Current Housing Situation</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Current living situation</label>
                                <p className="text-base text-gray-800 mt-1">{formatEnum(application.living_situation)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">How soon do you need housing?</label>
                                <p className="text-base text-gray-800 mt-1">{formatEnum(application.need_housing_when)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Have you lived in shared housing before?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.lived_in_shared_before)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Program Eligibility */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Program Eligibility</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Are you a U.S. Veteran?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.us_veteran)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Are you currently transitioning from another program (incarceration, rehab, housing program)?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.transitioning)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 4. Income & Financial Information */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Income & Financial Information</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Current living situation</label>
                                <p className="text-base text-gray-800 mt-1">{formatArray(application.income_sources)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Is this income consistent and recurring monthly?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.income_consistent)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Are you able to provide documentation of income?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.can_provide_income_docs)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 5. Shared Housing & Household Guidelines */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Shared Housing & Household Guidelines</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Are you comfortable living in a shared home environment?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.comfortable_shared)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Have you ever been asked to leave a housing program or had a lease terminated?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.asked_to_leave_before)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 6. Support & Services */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Support & Services</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Do you currently have a case manager, social worker, or VA coordinator?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.has_case_manager)}</p>
                            </div>
                            {application.has_case_manager && (
                                <>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                                        <p className="text-base text-gray-800 mt-1">{application.case_manager_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Contact Information</label>
                                        <p className="text-base text-gray-800 mt-1">{application.case_manager_contact || 'N/A'}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 7. Shared Housing & Household Guidelines (Background Check) */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Shared Housing & Household Guidelines</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Are you willing to undergo a background check if required?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.willing_to_undergo_background_check)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Do you have any upcoming court dates or legal obligations that may affect your stay?</label>
                                <p className="text-base text-gray-800 mt-1">{formatBoolean(application.upcoming_court_dates)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 8. Additional Information */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Please share anything else you would like us to know</label>
                            <p className="text-base text-gray-800 mt-1 whitespace-pre-wrap">{application.additional_info || 'N/A'}</p>
                        </div>
                    </div>

                    {/* 9. Acknowledgment & Consent */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Acknowledgment & Consent</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Applicant Signature</label>
                                <p className="text-base text-gray-800 mt-1">{application.signature_name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Date</label>
                                <p className="text-base text-gray-800 mt-1">{formatDate(application.signature_date)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Referral Information (if application_type is REFER) */}
                    {application.application_type === 'REFER' && (
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:col-span-2 lg:col-span-3">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Referral Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Referral Full Name</label>
                                    <p className="text-base text-gray-800 mt-1">{application.referral_full_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Referral Email</label>
                                    <p className="text-base text-gray-800 mt-1">{application.referral_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Referral Phone</label>
                                    <p className="text-base text-gray-800 mt-1">{application.referral_phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
