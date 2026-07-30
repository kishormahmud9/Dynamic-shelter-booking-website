"use client"

import React, { useState, useMemo } from 'react'
import { ArrowLeft, Plus, Search, Pencil, Trash2, Upload, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { get, create, update, del, getCurrentUser } from '@/lib/api'
import Swal from 'sweetalert2'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Query keys
const ADMIN_QUERY_KEYS = {
    all: ['administrators'],
    lists: () => [...ADMIN_QUERY_KEYS.all, 'list'],
    list: () => [...ADMIN_QUERY_KEYS.lists()],
}

export default function Administrator() {
    const queryClient = useQueryClient()
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)   
    const [searchQuery, setSearchQuery] = useState('')
    const [editingAdminId, setEditingAdminId] = useState(null)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        number: '',
        password: '',
        passwordConfirm: '',
        avatar: null
    })
    const [avatarPreview, setAvatarPreview] = useState(null)

    // Check if current user is super admin
    useEffect(() => {
        const currentUser = getCurrentUser()
        const superAdmin = currentUser?.is_super_admin === true || currentUser?.is_superuser === true || currentUser?.role === 'SUPERUSER'
        setIsSuperAdmin(superAdmin)
    }, [])

    // Helper function to get full image URL
    const getImageUrl = (image) => {
        if (!image) return null
        // If it's already a full URL, return as is
        if (image.startsWith('http://') || image.startsWith('https://')) {
            return image
        }
        // If it's a relative URL, prepend the base URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
        return image.startsWith('/') ? `${baseUrl}${image}` : `${baseUrl}/${image}`
    }

    // Fetch administrators using TanStack Query
    const { data: adminsData, isLoading: loading, error, refetch } = useQuery({
        queryKey: ADMIN_QUERY_KEYS.list(),
        queryFn: async () => {
            const data = await get('/api/auth/admins/')
            // Map API response to component format
            return data.map((admin) => ({
                id: admin.id,
                slNo: `#${admin.id}`,
                name: admin.full_name,
                email: admin.email,
                contactNumber: admin.contact_number,
                hasAccessTo: admin.role_display || admin.role || 'Admin',
                avatar: getImageUrl(admin.image),
                // Keep original API data for reference
                originalData: admin
            }))
        },
    })

    const administrators = adminsData || []

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                avatar: file
            }))
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Create admin mutation    
    const createMutation = useMutation({
        mutationFn: async (formDataToSend) => {
            return await create('/api/auth/admins/create/', formDataToSend)
        },
        onSuccess: () => {
            // Invalidate and refetch administrators list
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.list() })
            resetForm()
            setIsModalOpen(false)
            toast.success('Administrator created successfully')
        },
        onError: (err) => {
            // Display detailed error message from API
            const errorMessage = err.message || 'Failed to create administrator. Please try again.'
            console.error('Create admin error:', err)
            toast.error(errorMessage, {
                duration: 5000, // Show for 5 seconds to read longer error messages
            })
        },
    })

    // Update admin mutation
    const updateMutation = useMutation({
        mutationFn: async ({ adminId, formDataToSend }) => {
            return await update(`/api/auth/admins/${adminId}/update/`, formDataToSend)
        },
        onSuccess: () => {
            // Invalidate and refetch administrators list
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.list() })
            resetForm()
            setIsModalOpen(false)
            toast.success('Administrator updated successfully')
        },
        onError: (err) => {
            // Display detailed error message from API
            const errorMessage = err.message || 'Failed to update administrator. Please try again.'
            console.error('Update admin error:', err)
            toast.error(errorMessage, {
                duration: 5000, // Show for 5 seconds to read longer error messages
            })
        },
    })

    const handleSaveAdmin = async () => {
        // Prevent non-super admins from creating new admins
        if (!editingAdminId && !isSuperAdmin) {
            toast.error('Only super admins can create new administrators')
            setIsModalOpen(false)
            resetForm()
            return
        }

        // Validation
        if (!formData.name || !formData.number) {
            toast.error('Please fill in all required fields')
            return
        }

        // For create mode, validate email and passwords
        if (!editingAdminId) {
            if (!formData.email) {
                toast.error('Please enter email')
                return
            }
            if (!formData.password || !formData.passwordConfirm) {
                toast.error('Please enter password and confirm password')
                return
            }
            if (formData.password !== formData.passwordConfirm) {
                toast.error('Passwords do not match')
                return
            }
        }

        const formDataToSend = new FormData()
        formDataToSend.append('full_name', formData.name)
        formDataToSend.append('contact_number', formData.number)

        if (!editingAdminId) {
            // Create mode - include email and passwords (exactly as API expects)
            formDataToSend.append('email', formData.email)
            formDataToSend.append('password', formData.password)
            formDataToSend.append('password_confirm', formData.passwordConfirm)
        }

        // Add image if a new file was selected (optional field)
        if (formData.avatar instanceof File) {
            formDataToSend.append('image', formData.avatar)
        }

        if (editingAdminId) {
            // Update existing admin
            updateMutation.mutate({ adminId: editingAdminId, formDataToSend })
        } else {
            // Create new admin
            createMutation.mutate(formDataToSend)
        }
    }

    const saving = createMutation.isPending || updateMutation.isPending

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            number: '',
            password: '',
            passwordConfirm: '',
            avatar: null
        })
        setAvatarPreview(null)
        setEditingAdminId(null)
    }

    const handleEdit = (admin) => {
        setEditingAdminId(admin.id)
        setFormData({
            name: admin.name,
            email: admin.email,
            number: admin.contactNumber,
            password: '',
            passwordConfirm: '',
            avatar: null // Don't set avatar file, just preview
        })
        setAvatarPreview(admin.avatar)
        setIsModalOpen(true)
    }

    // Delete admin mutation
    const deleteMutation = useMutation({
        mutationFn: async (adminId) => {
            return await del(`/api/auth/admins/${adminId}/delete/`)
        },
        onSuccess: (_, adminId) => {
            // Optimistically update the cache
            queryClient.setQueryData(ADMIN_QUERY_KEYS.list(), (oldData) => {
                return oldData ? oldData.filter(admin => admin.id !== adminId) : []
            })
            // Invalidate to ensure consistency
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.list() })
        },
        onError: (err) => {
            // Refetch on error to ensure consistency
            queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.list() })
        },
    })

    const handleDelete = async (id) => {
        // Find the admin to get their name for the confirmation message
        const adminToDelete = administrators.find(admin => admin.id === id)
        const adminName = adminToDelete?.name || 'this administrator'

        // Show SweetAlert2 confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${adminName}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626', // red-600
            cancelButtonColor: '#6b7280', // gray-500
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        })

        if (result.isConfirmed) {
            // Show loading state
            Swal.fire({
                title: 'Deleting...',
                text: 'Please wait while we delete the administrator.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            // Call delete mutation
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Deleted!',
                        text: `${adminName} has been deleted successfully.`,
                        icon: 'success',
                        confirmButtonColor: '#FFA100',
                        timer: 2000,
                        timerProgressBar: true,
                    })
                },
                onError: (err) => {
                    Swal.fire({
                        title: 'Error!',
                        text: err.message || 'Failed to delete administrator. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#dc2626',
                    })
                },
            })
        }
    }

    // Memoized filtered administrators for performance
    const filteredAdministrators = useMemo(() => {
        if (!searchQuery.trim()) return administrators

        const query = searchQuery.toLowerCase()
        return administrators.filter(admin =>
            admin.name.toLowerCase().includes(query) ||
            admin.email.toLowerCase().includes(query) ||
            admin.contactNumber.includes(searchQuery)
        )
    }, [administrators, searchQuery])

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="w-full bg-white rounded-lg p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-semibold">Administrator</h1>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search here..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="pl-10 w-full sm:w-64 border-purple-200 focus:border-purple-400"
                    />
                </div>
            </div>

            {/* New Button - Only show for super admin */}
            {isSuperAdmin && (
                <div className="mb-6">
                    <Button
                        onClick={() => {
                            resetForm()
                            setIsModalOpen(true)
                        }}
                        className="bg-[#FFA100] hover:bg-[#FFA100]/90 text-white rounded-md px-4 py-2 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        New
                    </Button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#FFA100]" />
                    <span className="ml-2 text-gray-600">Loading administrators...</span>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                    <p>Error: {error.message || 'Failed to fetch administrators'}</p>
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
                <>
                    {/* Desktop/Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">SL no.</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Contact Number</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Has Access to</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdministrators.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500">
                                            No administrators found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAdministrators.map((admin) => (
                                        <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4 text-gray-600">{admin.slNo}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        {admin.avatar ? (
                                                            <AvatarImage src={admin.avatar} alt={admin.name} />
                                                        ) : null}
                                                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                                            {getInitials(admin.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-gray-800">{admin.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">{admin.email}</td>
                                            <td className="py-4 px-4 text-gray-600">{admin.contactNumber}</td>
                                            <td className="py-4 px-4 text-gray-600">{admin.hasAccessTo}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(admin)}
                                                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin.id)}
                                                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-3">
                        {filteredAdministrators.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">
                                No administrators found
                            </div>
                        ) : (
                            filteredAdministrators.map((admin) => (
                                <div
                                    key={admin.id}
                                    className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="w-10 h-10 flex-shrink-0">
                                                {admin.avatar ? (
                                                    <AvatarImage src={admin.avatar} alt={admin.name} />
                                                ) : null}
                                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                                    {getInitials(admin.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">
                                                    {admin.name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {admin.slNo}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEdit(admin)}
                                                className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center transition-colors"
                                                aria-label="Edit admin"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors"
                                                aria-label="Delete admin"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm text-gray-700 break-words">
                                                {admin.email || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Contact</p>
                                                <p className="text-sm text-gray-700 break-words">
                                                    {admin.contactNumber || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Access</p>
                                                <p className="text-sm text-gray-700 break-words">
                                                    {admin.hasAccessTo || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Add/Edit Admin Modal */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                // Prevent opening create modal if not super admin
                if (open && !editingAdminId && !isSuperAdmin) {
                    toast.error('Only super admins can create new administrators')
                    return
                }
                setIsModalOpen(open)
                if (!open) {
                    resetForm()
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingAdminId ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col sm:flex-row gap-6 py-4">
                        {/* Avatar Upload Section */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                                <Avatar className="w-24 h-24">
                                    {avatarPreview ? (
                                        <AvatarImage src={avatarPreview} alt="Preview" />
                                    ) : (
                                        <AvatarFallback className="bg-gray-200 text-gray-400">
                                            <Upload className="w-8 h-8" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-gray-700 hover:bg-gray-800 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                            </div>

                            {!editingAdminId && (
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            <div>
                                <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Number
                                </label>
                                <Input
                                    id="number"
                                    name="number"
                                    type="tel"
                                    placeholder="Enter number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                            </div>

                            {!editingAdminId && (
                                <>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Enter password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password
                                        </label>
                                        <Input
                                            id="passwordConfirm"
                                            name="passwordConfirm"
                                            type="password"
                                            placeholder="Confirm password"
                                            value={formData.passwordConfirm}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex-row gap-2 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false)
                                resetForm()
                            }}
                            disabled={saving}
                            className="border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveAdmin}
                            disabled={saving}
                            className="bg-[#FFA100] hover:bg-[#FFA100]/90 text-white disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                editingAdminId ? 'Update Admin' : 'Save Admin'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
