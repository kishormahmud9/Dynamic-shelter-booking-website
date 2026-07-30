"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { get, del, getCurrentUser } from '@/lib/api'
import Swal from 'sweetalert2'

export default function ProgramManage() {
    const router = useRouter()
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)

    // Check if current user is super admin
    useEffect(() => {
        const currentUser = getCurrentUser()
        const superAdmin = currentUser?.is_super_admin === true || currentUser?.is_superuser === true || currentUser?.role === 'SUPERUSER'
        setIsSuperAdmin(superAdmin)
    }, [])

    // Fetch programs using TanStack Query (all admins can view)
    const { data: programsData, isLoading: loading, error, refetch } = useQuery({
        queryKey: ['programs'],
        queryFn: async () => {
            const data = await get('/api/program/programs/')
            // Map API response to component format
            return data.map((program, index) => ({
                id: program.id,
                srNo: index + 1,
                programName: program.name,
                subHeading: program.short_description || '',
                programId: `#${program.id}`,
                // Keep original API data for reference
                originalData: program
            }))
        },
    })

    const programs = programsData || []

    const handleAddProgram = () => {
        if (!isSuperAdmin) {
            return
        }
        router.push('/admin/program-manage/create-program')
    }

    const handleEdit = (id) => {
        if (!isSuperAdmin) {
            return
        }
        router.push(`/admin/program-manage/create-program?id=${id}`)
    }

    const handleDelete = async (id) => {
        if (!isSuperAdmin) {
            return
        }

        // Find the program to get its name for the confirmation message
        const programToDelete = programs.find(program => program.id === id)
        const programName = programToDelete?.programName || 'this program'

        // Show SweetAlert2 confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${programName}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626', // red-600
            cancelButtonColor: '#6b7280', // gray-500
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        })

        if (result.isConfirmed) {
            try {
                // Show loading state
                Swal.fire({
                    title: 'Deleting...',
                    text: 'Please wait while we delete the program.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })

                // Call delete API
                await del(`/api/program/programs/${id}/`)

                // Show success message
                await Swal.fire({
                    title: 'Deleted!',
                    text: `${programName} has been deleted successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#FFA100',
                    timer: 2000,
                    timerProgressBar: true,
                })

                // Refresh the programs list
                refetch()
            } catch (err) {
                console.error('Error deleting program:', err)
                // Show error message
                await Swal.fire({
                    title: 'Error!',
                    text: err.message || 'Failed to delete program. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#dc2626',
                })
            }
        }
    }


    return (
        <div className="w-full bg-white rounded-lg p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-semibold">Program Manage</h1>
                </div>
                {isSuperAdmin && (
                    <div>
                        <Button
                            onClick={handleAddProgram}
                            className="bg-[#FFA100] hover:bg-[#FFA100]/90 text-white rounded-md px-4 py-2 flex items-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Add Program
                        </Button>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FFA100]" />
                    <span className="ml-2 text-gray-600">Loading programs...</span>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    <p>Error: {error.message || 'Failed to fetch programs'}</p>
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        className="mt-2 cursor-pointer"
                        size="sm"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">SR-No</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Program Name</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Sub-Heading</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Program ID</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No programs found
                                    </td>
                                </tr>
                            ) : (
                                programs.map((program) => (
                                    <tr key={program.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-4 text-gray-600">{program.srNo}</td>
                                        <td className="py-4 px-4 text-gray-800 font-medium">{program.programName}</td>
                                        <td className="py-4 px-4 text-gray-600">{program.subHeading}</td>
                                        <td className="py-4 px-4 text-gray-600">{program.programId}</td>
                                        <td className="py-4 px-4">
                                            {isSuperAdmin ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(program.id)}
                                                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(program.id)}
                                                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No access</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
