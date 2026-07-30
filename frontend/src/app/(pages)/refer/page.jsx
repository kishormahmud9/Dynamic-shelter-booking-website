'use client'

import { Suspense } from 'react'
import PreScreenWizard from '@/components/PreScreen/PreScreenWizard'

export default function ReferPage() {
    return (
        <Suspense fallback={
            <div className="w-full bg-gray-50 min-h-screen pt-32 pb-16 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        }>
            <PreScreenWizard mode="refer" />
        </Suspense>
    )
}

