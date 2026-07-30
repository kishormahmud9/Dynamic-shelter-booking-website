'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { get } from '@/lib/api'

export default function ProgramDetails() {
    const params = useParams()
    const router = useRouter()
    const programId = params?.id

    const [program, setProgram] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const baseUrl = useMemo(() => {
        const url = (process.env.NEXT_PUBLIC_API_URL || '').trim()
        return url.endsWith('/') ? url.slice(0, -1) : url
    }, [])

    const getImageUrl = (image) => {
        if (!image) return ''
        if (image.startsWith('http://') || image.startsWith('https://')) return image
        if (!baseUrl) return image
        return image.startsWith('/') ? `${baseUrl}${image}` : `${baseUrl}/${image}`
    }

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                setLoading(true)
                setError('')
                const data = await get(`/api/program/public/programs/${programId}/`)
                setProgram(data)
            } catch (e) {
                setError(e?.message || 'Failed to load program')
            } finally {
                setLoading(false)
            }
        }

        if (programId) fetchProgram()
    }, [programId])

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#FFA100]" />
                <span className="ml-2 text-gray-600">Loading program...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4 text-center text-red-600">
                {error}
            </div>
        )
    }

    if (!program) return null

    const sections = program.sections || program.program_sections || []

    return (
        <main className="min-h-screen bg-white pt-20">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {program.name || 'Program Details'}
                    </h1>
                </div>

                {/* Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
                    <div className="rounded-2xl overflow-hidden border border-gray-200">
                        <img
                            src={getImageUrl(program.feature_image) || '/assets/images/about-1.jpeg'}
                            alt={program.name || 'Program'}
                            className="w-full h-[240px] sm:h-[320px] lg:h-[420px] object-cover"
                        />
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            {program.short_description || '—'}
                        </p>
                    </div>
                </div>

                {/* Sections */}
                {Array.isArray(sections) && sections.length > 0 && (
                    <div className="mt-10 sm:mt-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
                            Program Details
                        </h2>
                        <div className="space-y-6">
                            {sections.map((s, idx) => (
                                <div
                                    key={s.id || idx}
                                    className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-white"
                                >
                                    {s.image ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-10 items-start">
                                            {/* Image (alternating left/right on desktop) */}
                                            <div
                                                className={[
                                                    "rounded-xl overflow-hidden border border-gray-200",
                                                    idx % 2 === 0 ? "lg:order-1" : "lg:order-2",
                                                ].join(" ")}
                                            >
                                                <img
                                                    src={getImageUrl(s.image)}
                                                    alt={s.title || 'Section image'}
                                                    className="w-full h-56 sm:h-72 lg:h-72 object-cover"
                                                />
                                            </div>

                                            {/* Text */}
                                            <div className={idx % 2 === 0 ? "lg:order-2" : "lg:order-1"}>
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                                    {s.title || `Section ${idx + 1}`}
                                                </h3>
                                                <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                                                    {s.description || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                                {s.title || `Section ${idx + 1}`}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">
                                                {s.description || '—'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

