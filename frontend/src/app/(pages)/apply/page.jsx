'use client'

import { Suspense } from 'react'
import PreScreenWizard from '@/components/PreScreen/PreScreenWizard'

export default function ApplyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PreScreenWizard mode="apply" />
        </Suspense>
    )
}