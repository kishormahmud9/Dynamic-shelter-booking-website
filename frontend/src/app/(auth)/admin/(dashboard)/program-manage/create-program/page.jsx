"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { ArrowLeft, Plus, Upload, X, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link, ImageIcon, Undo2, Redo2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, create, update, getCurrentUser } from '@/lib/api'
import toast from 'react-hot-toast'

function CreateProgramContent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const programId = searchParams.get('id')
  const isEditMode = !!programId
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [saving, setSaving] = useState(false)

  // Check if current user is super admin
  useEffect(() => {
    const currentUser = getCurrentUser()
    const superAdmin = currentUser?.is_super_admin === true || currentUser?.is_superuser === true || currentUser?.role === 'SUPERUSER'
    setIsSuperAdmin(superAdmin)
  }, [])

  const [formData, setFormData] = useState({
    programName: '',
    shortDescription: '',
    featureImage: null,
    sections: [
      {
        id: 1,
        title: '',
        description: '',
        image: null
      }
    ]
  })
  const [featureImagePreview, setFeatureImagePreview] = useState(null)
  const [sectionImagePreviews, setSectionImagePreviews] = useState({})
  const [isDraggingFeature, setIsDraggingFeature] = useState(false)
  const [draggingSectionId, setDraggingSectionId] = useState(null)
  const [originalFeatureImageUrl, setOriginalFeatureImageUrl] = useState(null)
  const [originalSectionImageUrls, setOriginalSectionImageUrls] = useState({})
  const [originalSectionIds, setOriginalSectionIds] = useState(new Set()) // Track which section IDs came from backend

  // Helper function to compress image
  const compressImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8, maxSizeMB = 1) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve(file)
        return
      }

      // Check initial file size (warn if over 5MB)
      const maxSizeBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxSizeBytes * 5) {
        toast.error(`Image is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Please use an image smaller than ${maxSizeMB * 5}MB.`)
        reject(new Error('Image too large'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width
          let height = img.height

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }

          // Create canvas and compress
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob with quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file) // Fallback to original if compression fails
                return
              }

              // Check if compressed size is acceptable
              if (blob.size <= maxSizeBytes) {
                // Create new File object with compressed blob
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                resolve(compressedFile)
              } else {
                // Try again with lower quality
                if (quality > 0.5) {
                  compressImage(file, maxWidth, maxHeight, quality - 0.1, maxSizeMB)
                    .then(resolve)
                    .catch(() => resolve(file))
                } else {
                  // If still too large, use original but warn user
                  toast(`Image compressed but still large (${(blob.size / 1024 / 1024).toFixed(2)}MB). Consider using a smaller image.`, {
                    icon: '⚠️',
                    duration: 5000,
                  })
                  const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                  })
                  resolve(compressedFile)
                }
              }
            },
            file.type,
            quality
          )
        }
        img.onerror = () => resolve(file) // Fallback to original
        img.src = e.target.result
      }
      reader.onerror = () => resolve(file) // Fallback to original
      reader.readAsDataURL(file)
    })
  }

  // Helper function to convert File to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        // Remove data:image/...;base64, prefix if present, or keep it
        const base64String = reader.result
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Fetch program data if in edit mode
  const { data: programData, isLoading: loadingProgram } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      if (!programId) return null
      return await get(`/api/program/programs/${programId}/`)
    },
    enabled: isEditMode && !!programId,
  })

  // Helper function to get full image URL
  const getImageUrl = (image) => {
    if (!image) return null
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
    return image.startsWith('/') ? `${baseUrl}${image}` : `${baseUrl}/${image}`
  }

  // Populate form when program data is loaded
  useEffect(() => {
    if (programData && isEditMode) {
      // Check both 'sections' and 'program_sections' keys (backend might use either)
      const backendSections = programData.sections || programData.program_sections || []

      console.log('Loading program data:', {
        backendSectionsCount: backendSections.length,
        backendSections: backendSections,
        programDataKeys: Object.keys(programData)
      })

      const mappedSections = backendSections.length > 0
        ? backendSections.map((section, index) => {
          // Preserve the exact ID from backend, or use index+1 as fallback
          // Important: Keep the ID type exactly as backend provides it
          const sectionId = section.id !== undefined && section.id !== null
            ? section.id
            : index + 1

          return {
            id: sectionId,
            title: section.title || '',
            description: section.description || '',
            image: null // Don't set file, just preview
          }
        })
        : [] // Don't add default section in edit mode if backend has no sections

      // Track which section IDs actually came from the backend (not our fallback)
      // Store both the ID value and its type to match exactly
      const backendSectionIds = new Set()
      backendSections.forEach((section, index) => {
        if (section.id !== undefined && section.id !== null) {
          // Store the ID exactly as it came from backend (preserve type)
          backendSectionIds.add(section.id)
          console.log(`Backend section ${index + 1} ID:`, section.id, typeof section.id)
        }
      })
      setOriginalSectionIds(backendSectionIds)

      console.log('Mapped sections:', mappedSections)
      console.log('Original backend section IDs:', Array.from(backendSectionIds))

      setFormData({
        programName: programData.name || '',
        shortDescription: programData.short_description || '',
        featureImage: null, // Don't set file, just preview
        sections: mappedSections
      })

      // Set image previews and store original URLs
      if (programData.feature_image) {
        const featureImageUrl = getImageUrl(programData.feature_image)
        setFeatureImagePreview(featureImageUrl)
        setOriginalFeatureImageUrl(programData.feature_image) // Store original URL/path
      }

      // Set section image previews and store original URLs
      if (backendSections.length > 0) {
        const previews = {}
        const originalUrls = {}
        backendSections.forEach((section, index) => {
          const sectionId = mappedSections[index]?.id || section.id || index + 1
          if (section.image) {
            previews[sectionId] = getImageUrl(section.image)
            originalUrls[sectionId] = section.image // Store original URL/path
          }
        })
        setSectionImagePreviews(previews)
        setOriginalSectionImageUrls(originalUrls)
      }
    }
  }, [programData, isEditMode])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const processFeatureImage = async (file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Compress image before processing
        const compressedFile = await compressImage(file, 1920, 1920, 0.8, 1)

        setFormData(prev => ({
          ...prev,
          featureImage: compressedFile
        }))

        const reader = new FileReader()
        reader.onloadend = () => {
          setFeatureImagePreview(reader.result)
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('Error processing feature image:', error)
        toast.error('Failed to process image. Please try again.')
      }
    }
  }

  const handleFeatureImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      processFeatureImage(file)
    }
  }

  const handleFeatureImageDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFeature(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      processFeatureImage(file)
    }
  }

  const handleFeatureImageDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFeature(true)
  }

  const handleFeatureImageDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFeature(false)
  }

  const handleSectionChange = (sectionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, [field]: value }
          : section
      )
    }))
  }

  const processSectionImage = async (sectionId, file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Compress image before processing
        const compressedFile = await compressImage(file, 1920, 1920, 0.8, 1)

        handleSectionChange(sectionId, 'image', compressedFile)

        const reader = new FileReader()
        reader.onloadend = () => {
          setSectionImagePreviews(prev => ({
            ...prev,
            [sectionId]: reader.result
          }))
        }
        reader.readAsDataURL(compressedFile)
      } catch (error) {
        console.error('Error processing section image:', error)
        toast.error('Failed to process image. Please try again.')
      }
    }
  }

  const handleSectionImageChange = (sectionId, e) => {
    const file = e.target.files[0]
    if (file) {
      processSectionImage(sectionId, file)
    }
  }

  const handleSectionImageDrop = (sectionId, e) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingSectionId(null)
    const file = e.dataTransfer.files[0]
    if (file) {
      processSectionImage(sectionId, file)
    }
  }

  const handleSectionImageDragOver = (sectionId, e) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingSectionId(sectionId)
  }

  const handleSectionImageDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingSectionId(null)
  }

  const addMoreSection = () => {
    // Generate a unique ID for the new section
    // If sections have numeric IDs, use the max + 1
    // Otherwise, use a timestamp-based ID
    const existingIds = formData.sections.map(s => {
      const id = typeof s.id === 'number' ? s.id : parseInt(s.id) || 0
      return id
    })
    const maxNumericId = existingIds.length > 0 ? Math.max(...existingIds) : 0
    const newId = maxNumericId + 1

    setFormData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: newId,
          title: '',
          description: '',
          image: null
        }
      ]
    }))
  }

  const removeSection = (sectionId) => {
    if (formData.sections.length > 1) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== sectionId)
      }))
      setSectionImagePreviews(prev => {
        const newPreviews = { ...prev }
        delete newPreviews[sectionId]
        return newPreviews
      })
      setOriginalSectionImageUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[sectionId]
        return newUrls
      })
    }
  }

  // Create program mutation
  const createMutation = useMutation({
    mutationFn: async (formDataToSend) => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Sending FormData:', {
            entries: Array.from(formDataToSend.entries()).map(([key, value]) => [
              key,
              value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
            ])
          })
        }
        return await create('/api/program/programs/', formDataToSend)
      } catch (error) {
        console.error('Create program mutation error:', error)
        // Re-throw with more context
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      toast.success('Program created successfully')
      router.push('/admin/program-manage')
    },
    onError: (err) => {
      console.error('Create program error:', err)
      let errorMessage = err.message || 'Failed to create program. Please try again.'

      // Handle 413 Request Entity Too Large error
      if (errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('Request Entity Too Large')) {
        errorMessage = 'Upload size too large. Images have been compressed, but the total size is still too big. Please use smaller images or fewer images.'
      }

      toast.error(errorMessage, {
        duration: 8000,
      })
      setSaving(false) // Ensure saving state is reset
    },
  })

  // Update program mutation
  const updateMutation = useMutation({
    mutationFn: async ({ programId, formDataToSend }) => {
      try {
        return await update(`/api/program/programs/${programId}/`, formDataToSend)
      } catch (error) {
        console.error('Update program mutation error:', error)
        // Re-throw with more context
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      queryClient.invalidateQueries({ queryKey: ['program', programId] })
      toast.success('Program updated successfully')
      router.push('/admin/program-manage')
    },
    onError: (err) => {
      console.error('Update program error:', err)
      let errorMessage = err.message || 'Failed to update program. Please try again.'

      // Handle 413 Request Entity Too Large error
      if (errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('Request Entity Too Large')) {
        errorMessage = 'Upload size too large. Images have been compressed, but the total size is still too big. Please use smaller images or fewer images.'
      }

      toast.error(errorMessage, {
        duration: 8000,
      })
      setSaving(false) // Ensure saving state is reset
    },
  })

  const handleSave = async () => {
    // Prevent non-super admins from saving
    if (!isSuperAdmin) {
      toast.error('Only super admins can create or edit programs')
      router.push('/admin/program-manage')
      return
    }

    // Validation
    if (!formData.programName || !formData.shortDescription) {
      toast.error('Please fill in program name and short description')
      return
    }

    if (formData.sections.length === 0) {
      toast.error('Please add at least one section')
      return
    }

    // Validate sections
    for (let i = 0; i < formData.sections.length; i++) {
      const section = formData.sections[i]
      if (!section.title || !section.description) {
        toast.error(`Section ${i + 1}: Please fill in title and description`)
        return
      }
    }

    try {
      setSaving(true)

      // Create FormData according to API structure
      const formDataToSend = new FormData()

      // Basic program fields
      formDataToSend.append('name', formData.programName)
      formDataToSend.append('short_description', formData.shortDescription)

      // Feature image - only append if it's a new File
      if (formData.featureImage instanceof File) {
        formDataToSend.append('feature_image', formData.featureImage)
      } else if (isEditMode && originalFeatureImageUrl && !formData.featureImage) {
        // In edit mode, if no new file selected, we might need to handle existing image
        // This depends on backend - some backends accept URL strings for updates
        // For now, we'll only send if it's a new file
      }

      // Prepare program_sections array - each object contains title, description, and image_key (if image exists)
      // Section images are also sent as separate File fields (section_image_1, section_image_2, etc.)
      const programSections = formData.sections.map((section, index) => {
        const sectionData = {
          title: section.title,
          description: section.description
        }

        // In edit mode, always include section ID if it exists and is valid
        // This tells the backend to UPDATE the section instead of creating a new one
        // Backend will update if ID exists, or create new if ID doesn't exist in backend
        if (isEditMode && section.id !== undefined && section.id !== null) {
          // Include ID if it's a number (likely from backend) or if it's in our tracked original IDs
          const isValidId = typeof section.id === 'number' ||
            (typeof section.id === 'string' && section.id.match(/^\d+$/)) ||
            originalSectionIds.has(section.id)

          if (isValidId) {
            sectionData.id = section.id
          }
        }
        // If no valid ID (new section added during edit), backend will create it as new

        // Debug: Log section image state (dev only)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Section ${index + 1} image:`, {
            image: section.image,
            isFile: section.image instanceof File,
            originalUrl: isEditMode ? originalSectionImageUrls[section.id] : null,
            sectionId: section.id
          })
        }

        // Add image_key only when there's a NEW file being uploaded
        // In edit mode, if no new file is selected, don't include image_key (backend will keep existing image)
        const imageKey = `section_image_${index + 1}`

        if (section.image && section.image instanceof File) {
          // New file selected - include image_key (file will be sent separately)
          sectionData.image_key = imageKey
        }
        // If no new file selected, don't include image_key
        // Backend will keep existing image if image_key is not present

        return sectionData
      })

      // Log program_sections before stringifying (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.log('Program sections before stringify:', programSections)
        console.log('Edit mode:', isEditMode)
        console.log('Original section IDs from backend:', Array.from(originalSectionIds))
        console.log('Sections being sent with IDs:', programSections.filter(s => s.id).map(s => ({ id: s.id, title: s.title })))
      }

      // Append program_sections as JSON stringified string
      const programSectionsJson = JSON.stringify(programSections)
      if (process.env.NODE_ENV === 'development') {
        console.log('Program sections JSON string:', programSectionsJson)
      }
      formDataToSend.append('program_sections', programSectionsJson)

      // Append section images as separate File fields (section_image_1, section_image_2, etc.)
      formData.sections.forEach((section, index) => {
        const imageKey = `section_image_${index + 1}`

        if (section.image && section.image instanceof File) {
          // New file selected, append as File
          if (process.env.NODE_ENV === 'development') {
            console.log(`Appending ${imageKey} as File:`, section.image.name, section.image)
          }
          formDataToSend.append(imageKey, section.image)
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(`No file for ${imageKey}, skipping File append`)
          }
        }

      })

      // Calculate total file size
      let totalSize = 0
      const fileEntries = []
      formDataToSend.forEach((value, key) => {
        if (value instanceof File) {
          totalSize += value.size
          fileEntries.push({ key, name: value.name, size: value.size })
        }
      })

      const totalSizeMB = totalSize / 1024 / 1024

      // Log FormData before sending (dev only)
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending FormData:', {
          entries: Array.from(formDataToSend.entries()).map(([key, value]) => [
            key,
            value instanceof File ? `File: ${value.name} (${(value.size / 1024 / 1024).toFixed(2)}MB)` : value
          ]),
          totalSize: `${totalSizeMB.toFixed(2)}MB`,
          fileCount: fileEntries.length,
          url: isEditMode
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/program/programs/${programId}/`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/program/programs/`
        })
      }

      // Warn if total size is too large (over 1.5MB)
      if (totalSizeMB > 1.5) {
        toast(`Total upload size is ${totalSizeMB.toFixed(2)}MB. This may cause upload issues. Consider using smaller images.`, {
          duration: 6000,
          icon: '⚠️',
        })
      }

      if (isEditMode && programId) {
        // Update existing program
        updateMutation.mutate({ programId: parseInt(programId), formDataToSend })
      } else {
        // Create new program
        createMutation.mutate(formDataToSend)
      }
    } catch (err) {
      console.error('Error saving program:', err)
      toast.error(err.message || 'Failed to save program. Please try again.', {
        duration: 6000,
      })
      setSaving(false)
    }
    // Note: Don't set saving to false here if using mutations, as they handle it in onError
  }

  const isSaving = createMutation.isPending || updateMutation.isPending || saving

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold">{isEditMode ? 'Edit Program' : 'Add Program'}</h1>
      </div>

      {/* Loading State */}
      {loadingProgram && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFA100]" />
          <span className="ml-2 text-gray-600">Loading program data...</span>
        </div>
      )}

      {/* Access Denied Message */}
      {!isSuperAdmin && !loadingProgram && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <p className="font-semibold">Access Denied</p>
          <p className="mt-1">Only super admins can create or edit programs.</p>
          <Button
            onClick={() => router.push('/admin/program-manage')}
            variant="outline"
            className="mt-3 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
          >
            Go Back to Program List
          </Button>
        </div>
      )}

      {/* Form */}
      {!loadingProgram && isSuperAdmin && (
        <div className="space-y-6">
          {/* Program Name */}
          <div>
            <label htmlFor="programName" className="block text-sm font-medium text-gray-700 mb-2">
              Program Name
            </label>
            <Input
              id="programName"
              name="programName"
              type="text"
              placeholder="Enter name"
              value={formData.programName}
              onChange={handleInputChange}
              className="w-full border-gray-300"
            />
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <Input
              id="shortDescription"
              name="shortDescription"
              type="text"
              placeholder="Enter description"
              value={formData.shortDescription}
              onChange={handleInputChange}
              className="w-full border-gray-300"
            />
          </div>

          {/* Feature Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feature Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFeatureImageChange}
                className="hidden"
                id="feature-image-upload"
              />
              <label
                htmlFor="feature-image-upload"
                onDrop={handleFeatureImageDrop}
                onDragOver={handleFeatureImageDragOver}
                onDragLeave={handleFeatureImageDragLeave}
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors ${isDraggingFeature ? 'border-gray-500 bg-gray-200' : ''}`}
              >
                {featureImagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={featureImagePreview}
                      alt="Feature preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setFeatureImagePreview(null)
                        setOriginalFeatureImageUrl(null)
                        setFormData(prev => ({ ...prev, featureImage: null }))
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Upload Image Here Or{' '}
                      <span className="text-gray-700 font-medium">Browse</span>
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Sections */}
          {formData.sections.map((section, index) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Section {index + 1}
                </h3>
                {formData.sections.length > 1 && (
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Section Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Tittle
                </label>
                <Input
                  type="text"
                  placeholder="Enter title"
                  value={section.title}
                  onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                  className="w-full border-gray-300"
                />
              </div>

              {/* Section Description - Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">

                  {/* Textarea */}
                  <textarea
                    placeholder="Type Description"
                    value={section.description}
                    onChange={(e) => handleSectionChange(section.id, 'description', e.target.value)}
                    className="w-full min-h-[200px] p-4 resize-none focus:outline-none   "
                    rows={8}
                  />
                </div>
              </div>

              {/* Section Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSectionImageChange(section.id, e)}
                    className="hidden"
                    id={`section-image-upload-${section.id}`}
                  />
                  <label
                    htmlFor={`section-image-upload-${section.id}`}
                    onDrop={(e) => handleSectionImageDrop(section.id, e)}
                    onDragOver={(e) => handleSectionImageDragOver(section.id, e)}
                    onDragLeave={handleSectionImageDragLeave}
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors ${draggingSectionId === section.id ? 'border-gray-500 bg-gray-200' : ''}`}
                  >
                    {sectionImagePreviews[section.id] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={sectionImagePreviews[section.id]}
                          alt="Section preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSectionImagePreviews(prev => {
                              const newPreviews = { ...prev }
                              delete newPreviews[section.id]
                              return newPreviews
                            })
                            setOriginalSectionImageUrls(prev => {
                              const newUrls = { ...prev }
                              delete newUrls[section.id]
                              return newUrls
                            })
                            handleSectionChange(section.id, 'image', null)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Upload Image Here Or{' '}
                          <span className="text-gray-700 font-medium">Browse</span>
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          ))}

          {/* Add More Section Button */}
          <button
            onClick={addMoreSection}
            className="flex items-center gap-2 text-[#FFA100] hover:text-[#FFA100]/80 font-medium cursor-pointer transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="w-5 h-5" />
            Add More Section
          </button>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-[#FFA100] text-[#FFA100] hover:bg-orange-50 cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#FFA100] hover:bg-[#FFA100]/90 text-white cursor-pointer disabled:opacity-50 w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                isEditMode ? 'Update Program' : 'Save Program'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateProgram() {
  return (
    <Suspense fallback={
      <div className="w-full bg-white rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFA100]" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <CreateProgramContent />
    </Suspense>
  )
}
